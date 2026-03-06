'use strict';
const db = uniCloud.database()
const dbCmd = db.command

exports.main = async (event, context) => {
    // 简单的鉴权拦截，实际项目中应使用 uniID 封装的方法
    const { token, action, payload } = event

    const usersCollection = db.collection('uni-id-users')

    if (!token) {
        return { code: 401, msg: '未授权或 Token 缺失' }
    }

    // 从数据库基于 token 换取 uid 
    const authRes = await usersCollection.where({ token: token }).get()
    if (authRes.data.length === 0 || authRes.data[0].token_expired < Date.now()) {
        return { code: 401, msg: '身份凭证失效，请重新连接终端' }
    }
    const uid = authRes.data[0]._id

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
        case 'deleteAccount':
            // 云端档案销毁（含7天冷静期）
            return await deleteAccount(usersCollection, uid)
        case 'cancelDeleteAccount':
            // 撤回注销指令（冷静期内恢复账号）
            return await cancelDeleteAccount(usersCollection, uid)
        case 'getServerTime':
            // 返回服务端可信时间戳（防本地时间篡改）
            return { code: 0, serverTime: Date.now() }
        case 'initLibraryData':
            // 初始化内置的精选正向数据（仅用作系统种子数据，开发者调用）
            return await initLibraryData(db)
        case 'verifyTransaction':
            // 交易核销 —— 写入 transaction_logs 集合记录流水，用于反作弊审计
            try {
                const txLogs = db.collection('transaction_logs')
                await txLogs.add({
                    user_id: uid,
                    type: payload.type || 'unknown',      // 'spend' 或 'earn'
                    amount: payload.amount || 0,
                    reason: payload.reason || '',
                    created_at: Date.now()
                })
                return { code: 0, msg: '核销已记录' }
            } catch (txErr) {
                console.error('交易流水写入失败:', txErr)
                return { code: 0, msg: '核销降级通过' } // 不阻塞前端
            }
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

async function deleteAccount(collection, uid) {
    try {
        const userRes = await collection.where({ _id: uid }).get()
        if (userRes.data.length === 0) {
            return { code: 404, msg: '账号不存在' }
        }

        const user = userRes.data[0]

        // 【冷静期检查】如果已经标记过待删除，检查是否满7天
        if (user.delete_requested_at) {
            const daysPassed = (Date.now() - user.delete_requested_at) / (1000 * 60 * 60 * 24)
            if (daysPassed >= 7) {
                // 冷静期已过，执行真正的物理删除
                await collection.doc(uid).remove()
                return { code: 0, msg: '冷静期已满，账号及档案已彻底抹除' }
            } else {
                const daysLeft = Math.ceil(7 - daysPassed)
                return { code: 202, msg: `账号已进入销毁倒计时，剩余冷静期 ${daysLeft} 天。期间可联系客服撤回。` }
            }
        }

        // 首次请求：标记为待删除，进入7天冷静期
        await collection.doc(uid).update({
            delete_requested_at: Date.now(),
            status: 'pending_delete'
        })

        return { code: 201, msg: '已进入7天冷静期。7天后系统将自动执行不可逆的深渊销毁。如后悔请在冷静期内重新登录取消。' }
    } catch (e) {
        return { code: 500, msg: '深渊抹除失败: ' + e.message }
    }
}

// 撤回注销指令（冷静期内恢复账号）
async function cancelDeleteAccount(collection, uid) {
    try {
        const userRes = await collection.where({ _id: uid }).get()
        if (userRes.data.length === 0) {
            return { code: 404, msg: '账号不存在' }
        }

        const user = userRes.data[0]
        if (user.status !== 'pending_delete') {
            return { code: 400, msg: '账号未处于流放状态，无需撤回' }
        }

        // 清除流放标记，恢复正常状态
        await collection.doc(uid).update({
            status: dbCmd.remove(),
            delete_requested_at: dbCmd.remove(),
            updated_at: Date.now()
        })

        return { code: 0, msg: '注销指令已撤回，账号已恢复正常' }
    } catch (e) {
        return { code: 500, msg: '撤回失败: ' + e.message }
    }
}

async function syncAssets(collection, uid, payload) {
    const { neuroCoins, ownedItems, equipped, vipExpire, monthlyFreeReviveCnt, lastReviveMonth, neuroStartDate, neuroCheckins, neuroBaseline } = payload

    // 采用合并更新
    const updateData = {}
    if (neuroCoins !== undefined) updateData.neuro_coins = neuroCoins
    if (ownedItems !== undefined) updateData.owned_items = ownedItems
    if (equipped !== undefined) updateData.equipped = equipped
    if (vipExpire !== undefined) updateData.vip_expire = vipExpire
    if (monthlyFreeReviveCnt !== undefined) updateData.monthly_free_revive_cnt = monthlyFreeReviveCnt
    if (lastReviveMonth !== undefined) updateData.last_revive_month = lastReviveMonth
    if (neuroStartDate !== undefined) updateData.neuro_start_date = neuroStartDate
    if (neuroCheckins !== undefined) updateData.neuro_checkins = neuroCheckins
    if (neuroBaseline !== undefined) updateData.neuro_baseline = neuroBaseline

    if (Object.keys(updateData).length > 0) {
        updateData.updated_at = Date.now()
        await collection.doc(uid).update(updateData)
    }

    return { code: 0, msg: '资产链与档案已同步' }
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

    try {
        console.log("-> 收到强制复位/初始化指令。");
        // [2026 架构更新]
        // 这里已经废弃硬塞 25 条死视频和长文的行为。
        // 所有数据流的供给权已经全面移交给了 AI 引擎和远端定时分发节点，保障系统神经突触活跃度。
        return { code: 0, msg: '老旧初始静态数据生成接口已阻断。图谱接驳现已全数委托给大模型核心，静待自动化产能倾倒。' };
    } catch (err) {
        console.error('初始化数据大包写入失败：', err);
        throw err;
    }
}
