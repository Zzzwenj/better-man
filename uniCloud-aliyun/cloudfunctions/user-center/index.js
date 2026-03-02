'use strict';
const db = uniCloud.database()
const dbCmd = db.command

exports.main = async (event, context) => {
    // 简单的鉴权拦截，实际项目中应使用 uniID 封装的方法
    const { token, action, payload } = event

    if (!token || !token.startsWith('fake_token_for_dev_')) {
        return { code: 401, msg: '未授权或 Token 已过期' }
    }
    // 由于是测试/个人项目，我们用 token 模拟一个唯一的用户 ID，实际应从 token 中解析 uid
    const uid = token.split('_').pop()

    const usersCollection = db.collection('uni-id-users')

    switch (action) {
        case 'syncBaseline':
            // 同步/插入问卷基线数据
            return await syncBaseline(usersCollection, uid, payload)
        case 'updateNeuroTimer':
            // 更新重塑起点时间 (打卡/重置)
            return await updateNeuroTimer(usersCollection, uid, payload)
        case 'getUserProfile':
            // 获取用户最新状态
            return await getUserProfile(usersCollection, uid)
        case 'updateProfile':
            // 更新个人档案与称号
            return await updateProfile(usersCollection, uid, payload)
        case 'getLibraryList':
            // 获取知识库/视频库列表
            return await getLibraryList(db, payload)
        case 'getArticleDetail':
            // 获取文章详细内容
            return await getArticleDetail(db, payload)
        case 'syncAssets':
            // 同步神经币和拥有的装扮资产
            return await syncAssets(usersCollection, uid, payload)
        case 'getRankings':
            // 获取天梯榜单 (通过离线计算防抖版)
            return await getRankings(db, uid)
        case 'initLibraryData':
            // 初始化内置的精选正向数据（仅用作系统种子数据，开发者调用）
            return await initLibraryData(db)
        default:
            return { code: 400, msg: 'Unknown action' }
    }
};

async function getRankings(db, uid) {
    const cacheCollection = db.collection('system_cache')

    // 我们从系统缓存表里拿跑批好的唯一记录，避免实时 join 计算几万用户
    const res = await cacheCollection.where({ key: 'global_resonance_rankings' }).get()

    if (res.data.length > 0) {
        return { code: 0, data: res.data[0].value }
    } else {
        // 如果云端还没有跑批记录，返回一个前端可以直接渲染的安全全量假数据作为冷启动
        return {
            code: 0, data: {
                localRankings: [
                    { id: uid, nickname: '探索者_' + uid.substring(uid.length - 4), avatarChar: '探', title: 'Phase I: 启程', titleColor: '#a1a1aa', days: 1, isMe: true }
                ],
                roomRankings: [
                    { roomId: '01', online: 1, totalHours: '0', isMyRoom: true }
                ]
            }
        }
    }
}

async function syncAssets(collection, uid, payload) {
    const { neuroCoins, ownedItems, equipped } = payload

    // 采用合并更新
    const updateData = {}
    if (neuroCoins !== undefined) updateData.neuro_coins = neuroCoins
    if (ownedItems !== undefined) updateData.owned_items = ownedItems
    if (equipped !== undefined) updateData.equipped = equipped

    if (Object.keys(updateData).length > 0) {
        updateData.updated_at = Date.now()
        await collection.doc(uid).update(updateData)
    }

    return { code: 0, msg: '资产链已同步' }
}

async function syncBaseline(collection, uid, payload) {
    const { neuro_baseline } = payload

    // 检查用户是否存在，不存在则伪造创建一个（配合我们的免密登录体验）
    const userRes = await collection.where({ _id: uid }).get()

    if (userRes.data.length === 0) {
        await collection.add({
            _id: uid,
            username: 'Explorer_' + uid.substring(uid.length - 4),
            neuro_baseline,
            register_date: Date.now()
        })
    } else {
        await collection.doc(uid).update({
            neuro_baseline
        })
    }

    return { code: 0, msg: '基线数据同步成功' }
}

async function updateNeuroTimer(collection, uid, payload) {
    const { start_timestamp } = payload

    const userRes = await collection.where({ _id: uid }).get()
    if (userRes.data.length > 0) {
        await collection.doc(uid).update({
            neuro_start_date: start_timestamp
        })

        // 此处可拓展记录 logs
        const logsCollection = db.collection('intervention_logs')
        await logsCollection.add({
            user_id: uid,
            action_type: 'timer_reset',
            created_at: Date.now()
        })
    }

    return { code: 0, msg: '时间锚点已更新' }
}

async function getUserProfile(collection, uid) {
    const userRes = await collection.where({ _id: uid }).get()

    if (userRes.data.length > 0) {
        return {
            code: 0,
            data: userRes.data[0]
        }
    }
    return { code: 404, msg: '用户信息未找到' }
}

// --- 违禁词、敏感词拦截字典 (可根据业务扩充) ---
const BANNED_WORDS = [
    // 涉政/违禁类
    /政府|国家领导人|中共|共产党|反党|暴乱|新疆独|藏独|台独|法轮功|邪教/,
    // 淫秽/低俗类
    /AV|色情|嫖娼|找小姐|鸡|鸭|迷药|春药|乱伦|强奸|操|嫩模|丝足|外围|约炮|裸聊|黄网|色网|黄片/,
    // 黑灰产/涉毒涉赌类
    /赌场|六合彩|博彩|冰毒|海洛因|大麻|麻古|买卖枪支|代开票|洗钱|套现|刷单|卖血|窃听器/,
    // 谩骂侮辱类
    /傻逼|他妈|日你|草泥马|脑残|狗娘|死全家|废物/
]

function containsBannedWords(text) {
    if (!text) return false;
    for (let i = 0; i < BANNED_WORDS.length; i++) {
        if (BANNED_WORDS[i].test(text)) {
            return true;
        }
    }
    return false;
}

async function updateProfile(collection, uid, payload) {
    const { nickname, avatar, signature } = payload
    const now = Date.now()

    // 1. 全局违禁词防御
    if (containsBannedWords(nickname) || containsBannedWords(signature)) {
        return { code: 403, msg: '[安全指令拦截] 检测到敏感或违禁字符，操作终止。' }
    }

    const userRes = await collection.where({ _id: uid }).get()

    if (userRes.data.length > 0) {
        const user = userRes.data[0]
        const lastUpdate = user.nickname_updated_at || user.register_date || 0
        const daysSinceLastUpdate = (now - lastUpdate) / (1000 * 60 * 60 * 24)

        let updateData = {
            avatar,
            signature,
            updated_at: now
        }

        // 2. 昵称 30 天防篡改规则 (如果是修改昵称的情况)
        if (nickname && nickname !== user.nickname) {
            // 校验是否满足 30 天 (第一次修改默认允许，所以要求有老名字时才卡)
            if (user.nickname && Object.keys(user).includes('nickname_updated_at') && daysSinceLastUpdate < 30) {
                const daysLeft = Math.ceil(30 - daysSinceLastUpdate)
                return { code: 403, msg: `[冷却期锁定] 协议要求每 30 天仅限篡改代号一次。剩余等待：${daysLeft} 天` }
            }
            updateData.nickname = nickname
            updateData.nickname_updated_at = now
        }

        await collection.doc(uid).update(updateData)
    } else {
        await collection.add({
            _id: uid,
            nickname,
            avatar,
            signature,
            register_date: now,
            updated_at: now,
            nickname_updated_at: now
        })
    }

    return { code: 0, msg: '神经连接档案已加密并同步至总控制台' }
}

async function getLibraryList(db, payload) {
    const { type, page = 1, pageSize = 15 } = payload // 'video' or 'article' or 'habits'
    const col = db.collection('better-articles')

    try {
        // 按发布时间倒序，仅拉取已上架的数据
        let query = { status: 1 }
        if (type) {
            query.type = type
        }

        const skipCount = (page - 1) * pageSize

        const res = await col.where(query).orderBy('publish_date', 'desc').skip(skipCount).limit(pageSize).field({
            textContent: false // 列表不返回正文以节省带宽
        }).get()

        return {
            code: 0,
            data: res.data,
            msg: '获取图谱成功'
        }
    } catch (err) {
        if (err.message && err.message.includes('resource exhausted')) {
            return {
                code: 503,
                msg: '阿里云免费版服务触发流控防刷保护，数据库正在冷却，请您耐心等待 1-2 分钟后再试~'
            }
        }
        return {
            code: 500,
            msg: '系统极客数据库错误: ' + err.message
        }
    }
}

async function getArticleDetail(db, payload) {
    const { id } = payload
    const col = db.collection('better-articles')
    const res = await col.doc(id).get()

    if (res.data.length > 0) {
        return { code: 0, data: res.data[0] }
    }
    return { code: 404, msg: '突触连接断开，未找到该文档' }
}

async function initLibraryData(db) {
    const col = db.collection('better-articles')
    const now = Date.now()
    const seedData = []

    // 生成 25 条高质量视频资源
    const videoTitles = [
        "斯坦福公开课：你的多巴胺基线与痛苦重置", "神经可塑性：大脑是如何被物理重连的",
        "成瘾的神经学机制与戒断的绝对生理学解药", "深度睡眠与额叶皮层的废物清洗机制",
        "如何通过视觉收束训练快速锁死心流状态", "意志力耗竭的生物化学基础探究",
        "压力不是敌人：心理预期如何改变皮质醇毒性", "在拖延症患者的大脑里到底发生了什么",
        "睡眠是你的超能力：修剪无用突触", "打破坏习惯的简单神经回路机制",
        "当你看高刺激内容时大脑的不可逆边缘损伤", "被廉价多巴胺彻底劫持的边缘系统",
        "行为通路是如何从土路变成高速公路的", "大脑奖赏回路 (Reward Circuit) 高清 3D 动画",
        "内啡肽的正确生成路径与延迟满足", "斯坦福 NSDR：10分钟非睡眠深度休息协议",
        "极速强行降心率：海豹突击队箱式呼吸法", "用高级复利递质去对抗低级阈值欲望",
        "觉醒时代：在算法牢笼中夺回你的注意力", "基于动作电位的突触重塑与刻意练习",
        "摆脱慢性疲劳：早晨阳光照射与节律荷尔蒙密码", "信息过载引发大脑脑雾与执行功能瘫痪",
        "用物理隔层方法重置被打乱的昼夜节律", "强制禁欲与受体 D2 重新上调的硬核复原周期",
        "科技巨头行为上瘾的设计逻辑及反向破局", "手机屏幕蓝光如何精准摧毁你的松果体与褪黑素分泌"
    ];
    const videoAuths = ['Huberman Lab', 'Neuroscience 3D', 'TED经典解析', 'Kurzgesagt', '底层认知研习社', '前额叶自救指南'];

    // 采用稳定可播放的高清公网视频源作为替身，确保点击能播且不完全一样
    const realVideoUrls = [
        'http://vjs.zencdn.net/v/oceans.mp4',
        'https://media.w3.org/2010/05/sintel/trailer.mp4',
        'http://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4',
        'https://www.w3schools.com/html/mov_bbb.mp4',
        'https://www.w3schools.com/html/horse.mp4'
    ];

    const videoCovers = [
        'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=500&auto=format', // Brain
        'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=500&auto=format', // Lab
        'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&auto=format', // Cyber 1
        'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format', // Chip
        'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=500&auto=format', // Robot
        'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=500&auto=format'  // Dark 1
    ];

    videoTitles.forEach((t, i) => {
        seedData.push({
            type: 'video', icon: '🎥', title: t,
            desc: `时长 ${(Math.random() * 10 + 5).toFixed(0)} 分钟 · 硬核神经科学原理解析。`,
            cover: videoCovers[i % videoCovers.length],
            author: videoAuths[i % videoAuths.length], readTime: '实录视频流',
            contentUrl: realVideoUrls[i % realVideoUrls.length],
            status: 1, publish_date: now - i * 10000
        })
    })

    // 为 20 篇长文额外配备的截然不同、具备可操作性的【实验佐证指南】
    const guides = [
        "在这个瞬间，去体会多巴胺下落时的轻微焦躁，不要逃避，仅仅去观察这股微弱的生理潮汐。",
        "当你迫不及待想滑向下一个娱乐漩涡时，试着在屏幕上方悬停手指 10 秒钟，观察大脑急扯乞求的姿态。",
        "检查你周围的环境：是否充斥着各种视觉诱饵？把惹眼的图标换成黑白，就是对成瘾引擎的一次物理断电。",
        "下一次当你感到情绪失控前，监测心率变化。在边缘系统完全接管前，进行 4 次深长呼吸即可重新唤醒前额叶皮层。",
        "打开屏幕时间统计，找出占用时间前三的应用。尝试在这个周末的其中半天完全切断这三个应用的数据流。",
        "当戒断反应如潮水般涌来时，试着去大马路上快走流汗。只有内啡肽可以平滑安抚因为多巴胺短缺而哀嚎的细胞。",
        "如果某个习惯极难改正，试着把它触发的场景打破。比如，如果你总在睡前玩手机，就把充电器移到卧室门外。",
        "当你发现自己正要开始无意识浏览时，立刻大喊一声“停”！这种物理发声能瞬间中断默认神经网络的下意识导航。",
        "给自己设定一个必须完成的高难度微小任务，比如立刻做一个波比跳。用高级的、艰难的执行任务立刻抢夺带宽。",
        "写下那个每次都会诱发你堕落的导火索情境，然后用笔在纸上标一个巨大的差号，在物理潜意识层面宣告它失去控制力。",
        "对镜子里的自己说：即使刚才搞砸了，我也依然具有掌控下一次选择的权利。关闭内耗，把注意力转向当下的呼吸。",
        "试着在面对诱惑物时倒数 5-4-3-2-1。在数到 1 的瞬间物理离开那个房间，不给理性脑编织反悔借口的机会。",
        "去找一个现实中的人产生具体的对话。面对面语言沟通所释放的催产素，可以有效安抚受损的奖赏系统。",
        "体验一次极端的无聊。坐在椅子上什么都不做，忍受那种急切想要找点乐子的痒感，把它当作是一场抗体实验。",
        "在你最想放弃的时候，只做最微小的一步。只要突破那最初的冰冷物理阻力区域，沉睡的网络就会被小幅度唤醒。",
        "想象你的某些突触正在因为你克制不去做某事而加速枯萎。这是一场看不见的细胞膜争夺战，只要不激活，它就会消亡。",
        "将你的某个枯燥工作随机设定完成奖励（例如抛硬币决定）。引入不确定性，能让耗竭的受体重新燃起火花。",
        "晚上 9 点准时让你的物理空间进入暗色调。剥夺高色温蓝光，是在保护你仅剩的一点能量储备不在深夜崩溃。",
        "把一切能够触手可及的即时反馈统统延后 10 分钟。在这 10 分钟里去接一杯水，让处于狂飙状态的大脑完成硬着陆缓冲。",
        "闭上眼睛，花 3 分钟时间扫描你身体各部分的感受。正念不仅让人平静，本质上它是物理重塑神经韧带。"
    ];

    // 生成 20 条深度好文拆解资源 (彻底独立文本)
    const articlesData = [
        { t: "《多巴胺国家的囚徒》精华终极拆解", c: "安娜·伦布克博士在《多巴胺国度》中揭示了一个残酷真相：人类的大脑本不是为了应对如此丰饶的世界而进化的。当我们暴露在高度成瘾的数字毒品下时，大脑会通过减少受体来维持平衡，导致平时的『快感缺失』。唯一的解药是主动拥抱一定的痛苦与匮乏，重置多巴胺基线。" },
        { t: "在充斥诱惑的世界为什么现代人越来越痛苦", c: "原始大脑执行着寻找高刺激事物的古老指令。现代商业恰巧制造了无限量的'超常刺激'（Supernormal Stimuli）。当你不停刷短视频时，大脑误以为你在生存上取得巨大成功，于是切断对普通事物的动力。这就导致现实生活显得索然无味，陷入深深的空虚。" },
        { t: "《欲罢不能》核心书评：警惕产品成瘾设计", c: "没有停止提示的无限滚动、游戏化的进度条、薛定谔的红点——科技巨头的成瘾生意并非巧合。识别这些心理陷阱是防守第一步。你需要为自己设定物理屏障，例如屏幕时间锁或将设备放置在视线之外，坚决夺回下意识的行为控制权。" },
        { t: "《自控力》万字笔记：斯坦福行为心理学", c: "自控力像肌肉一样，使用过度会疲劳，但也能够通过锻炼变强。关键不在于责备自己，而在于理解'我想要'的神经学基础。通过监测每次失控前的情绪状态，增加心率变异度（如深呼吸法），我们能有效增强前额叶皮层对冲动边缘系统的物理压制。" },
        { t: "数字极简主义操作指南与 10 条断舍离红线", c: "卡尔·纽波特主张科技应服务于核心价值观。实操第一步：卸载一切带有无限加载功能的媒体APP。第二步：规定每天只能在固定的时段内批量处理信息。第三步：将多出来的大段完整时间投入到高深度的现实活动中。只有主动留白，思想才能重新汇聚。" },
        { t: "多巴胺排毒 24 小时绝对刺激剥夺实操计划", c: "这是一项重启大脑的高阶操作：在24小时内，完全断绝屏幕、高糖与音乐。起初的几个小时你会感到极其烦躁和无聊（撤药反应），但这正是大脑在疯狂修复受损的多巴胺受体。熬过这个阶段，你会发现原本枯燥的工作，也重新具象出了吸引力。" },
        { t: "原子习惯的反向定律：消灭启动力线索", c: "改掉坏习惯最有效的方法不是靠死扛，而是'让它变得不可见、变得困难'。如果你想少看手机，就把手机锁进抽屉。物理距离仅仅增加了一点点摩擦力，但在你下意识想要伸手的那0.5秒，这股微小阻力足以让理性脑重新上线并拦截动作。" },
        { t: "构建你的注意力不可逾越护城边界", c: "注意力是这个时代唯一通货。被打断一次，大脑需要长达23分钟才能回到心流。建立护城河：关闭非必要通知，使用专注模式，清空桌面诱惑。将物理环境打造成一个只允许单一任务执行的绝对'手术室'，你的认知效率将呈现指数级增长。" },
        { t: "如何熬过戒断极早期的脑雾与焦躁反应", c: "切断高刺激源的前三天，不可避免会经历'脑雾'：暴躁、无法集中甚至极度无聊。这是生理性的神经递质低谷。请接纳这是一种物理戒断症状而非你的性格缺陷；使用剧烈有氧运动代替内啡肽分泌，用白噪音帮助大脑平滑度过这个无聊的真空期。" },
        { t: "习惯的 线索-惯常-奖赏 原始脑回路重构模型", c: "查尔斯·杜希格指出，习惯由'线索、惯常、奖赏'组成。要改变坏习惯，不能硬压，必须替换'惯常行为'。如果每次感到压力（线索）就想吃甜食以获得平复感（奖赏），那么下次有压力时，尝试做俯卧撑。保持线索和奖赏闭环，植入全新行为代码。" },
        { t: "写给每一次失控后陷入自我厌恶的你", c: "每一次破戒失控后，紧随其后的往往是深深的自我厌恶。但请记住：自我道德审判不仅无济于事，反而会引发新一轮皮质醇压力，促使你再次寻求成瘾刺激以逃避痛苦。打破死循环的方法是'自我同情'。像除虫一样记录失败数据，不再内耗。" },
        { t: "5秒法则强行切断边缘系统的自动下意识导航", c: "梅尔·罗宾斯的5秒法则极其暴力：当你有行动直觉时，必须在5秒内动作，否则大脑防御机制就会劝退你。5-4-3-2-1，这个倒数直接打断了借口生成回路，强行激活前额叶皮层。它将犹豫过程压缩为零，直接物理带入执行阶段，是打败拖延的利器。" },
        { t: "催产素与内啡肽：利用运动与连接重获稳定", c: "多巴胺给人无尽的渴望，但无法带来持久的平静。真正的稳定来自另外两种递质：催产素（连接感）和内啡肽（来自运动的痛苦补偿）。当你感到匮乏时，去进行一次长跑，或者与真实世界深入交谈。用高级长效的神经递质对接廉价的快速消耗。" },
        { t: "受体 D2 阈值不断拔高的硬底子生理灾难", c: "为什么以前看图文就很开心，现在必须刷短片才不无聊？这是因为你的D2受体被过量的多巴胺洪流'淹没'并开始自毁下调。继续追求更高刺激只能饮鸩止渴。唯一的解药是彻底停摆，忍受一段时间的绝对无聊空虚，让细胞膜重新长出多巴胺受体。" },
        { t: "打破习得性无助与微小阻力胜利滚雪球法则", c: "频繁放弃会引发'习得性无助'。要打破它，必须建立绝对能做到的微小胜利。比如：今天只做1个深蹲，只看1页书。这看似可笑，但每一次无痛执行都在物理上重建你的自我效能神经环路。一旦基石确立，胜利就像雪球越滚越大。" },
        { t: "神经可塑性与 21 天突触实质性修剪实验", c: "赫布定律：'一起激发的神经元连接在一起'。你越频繁重复动作，该回路就越粗壮。反之，21到90天不使用某个冲动回路，突触就会被大脑原生物理'修剪'掉。这意味着你过去的恶习在生理层面对你并非永久烙印，用新行为刻下新的沟壑就能彻底复写它。" },
        { t: "奖励预测误差 (RPE)：为什么苦尽甘来是真的", c: "神经科学中的RPE（Reward Prediction Error）指出：多巴胺更在于'预期之外的惊喜'。如果一件事情太容易预期，多巴胺分泌就会骤降。我们可以反向利用这点，给日常枯燥的任务加上'不确定性'的随机奖励，以此重新激活大脑对该任务的中枢渴望。" },
        { t: "夜间人造光源对前额叶克制防御的致命削弱", c: "晚上10点以后暴露在屏幕蓝光下，不仅阻断褪黑素，更可怕的是直接抑制前额叶理性功能。到了深夜，系统2能量耗竭，蓝光给了原始边缘系统无上权力。这就是为何晚上容易报复性熬夜。最佳策略是：晚上8点后物理断网隔离手机。" },
        { t: "用系统 2 压制系统 1，让理性接管行动中枢", c: "系统1是直觉冲动的；系统2是理性耗能深思熟虑的。我们常成为系统1的奴隶，顺应基因本能做出堕落选择。要扭转局面，必须在刺激和反应之间创造'物理暂停'。一次深呼吸，就能为系统2争取到上线接管手腕动作的宝贵零点几秒缓冲时间。" },
        { t: "冥想时你的大脑皮层究竟发生了怎样的物理形变", c: "fMRI扫描显示，正念会导致大脑结构实质改变：掌管理的'前额叶皮层'灰质变厚，而掌管恐惧和冲动的'杏仁核'体积变小。冥想不是玄学，它是针对大脑灰质的重量训练。每天专注呼吸其实就是在宏观层面上物理重塑你的神经韧带与抗击打能力。" }
    ];

    const articleCovers = [
        'https://images.unsplash.com/photo-1518331191131-75a730d85197?w=500&auto=format', // Focus
        'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=500&auto=format', // Code
        'https://images.unsplash.com/photo-1484417894907-623942c8ee29?w=500&auto=format', // Laptop
        'https://images.unsplash.com/photo-1453928582365-b6ad33cbcf64?w=500&auto=format', // Work
        'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=500&auto=format', // Abstract 1
        'https://images.unsplash.com/photo-1614850523296-e84e09ad8dc7?w=500&auto=format'  // Dark 2
    ];

    const resolvedArticles = [];
    for (let i = 0; i < articlesData.length; i++) {
        const item = articlesData[i];
        const htmlContent = `<div style="color:#d4d4d8; font-size:16px; line-height: 1.8; letter-spacing: 0.5px;">
                <p style="font-weight:bold; font-size: 18px; color:#fff; border-bottom: 1px solid #3f3f46; padding-bottom: 8px; margin-bottom: 15px;">核心思想推演</p>
                <p style="margin-bottom: 15px; text-indent: 2em; color: #f4f4f5;">${item.c}</p>
                <p style="margin-bottom: 15px; background: rgba(59, 130, 246, 0.1); padding: 12px; border-radius: 8px; border-left: 3px solid #3b82f6;">实验佐证指南：${guides[i]}</p>
                <div style="font-size:12px; color:#52525b; text-align:center; margin-top: 40px; border-top:1px dashed #27272a; padding-top:10px;">—— 系统快照时间序列：${new Date(now).toISOString()} / DATA-NO.${i + 1}</div>
            </div>`;

        try {
            const buffer = Buffer.from(htmlContent, 'utf-8');
            const uploadRes = await uniCloud.uploadFile({
                cloudPath: `better_articles/doc_${now}_${i}.txt`,
                fileContent: buffer,
                fileBuffer: buffer // 兼容被底层的特殊本地拦截器验证
            });

            resolvedArticles.push({
                type: 'article', icon: '📖', title: item.t,
                desc: '长篇深度干货，建议在绝对隔离干扰的状态下阅读。',
                cover: articleCovers[i % articleCovers.length],
                author: '控制系统归档局', readTime: `${(Math.random() * 4 + 4).toFixed(0)} 分钟深度内视`,
                contentUrl: uploadRes.fileID, // 仅保留外链
                status: 1, publish_date: now - i * 15000 - 200000,
                version: 1 // 增加版本号用于前端本地缓存比对
            });
        } catch (e) {
            console.error(`上传第 ${i} 篇文章失败:`, e);
            throw new Error(`文件上传失败: ${e.message}`);
        }
    }

    try {
        seedData.push(...resolvedArticles);


        // 先清理存量旧数据，确保新 Schema 的覆盖图能正确落库（开发者清理逻辑）
        await col.where({ status: dbCmd.exists(true) }).remove();

        // 将仅含 URL（无长文本）的安全小体积文档一次性批量写入数据库
        await col.add(seedData);
        return { code: 0, msg: '资源矩阵已完全云存储化并完成初始化落库！' }
    } catch (err) {
        console.error('初始化数据大包写入失败：', err);
        throw err;
    }
}
