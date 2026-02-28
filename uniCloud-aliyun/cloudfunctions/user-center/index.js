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
        default:
            return { code: 400, msg: 'Unknown action' }
    }
};

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
