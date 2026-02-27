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
