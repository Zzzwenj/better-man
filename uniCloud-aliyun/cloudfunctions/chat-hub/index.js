'use strict';
const db = uniCloud.database()
const dbCmd = db.command

exports.main = async (event, context) => {
    const { token, action, payload } = event

    if (!token || !token.startsWith('fake_token_for_dev_')) {
        return { code: 401, msg: '未授权或 Token 已过期' }
    }
    const uid = token.split('_').pop()

    switch (action) {
        case 'assignRoom':
            // 给用户自动分配 500 人不满的战区
            return await assignRoom(uid)
        case 'sendMessage':
            // 纯文本过滤并落库，推流
            return await sendMessage(uid, payload)
        case 'getHistoryLogs':
            // 获取当前聊天室的历史消息
            return await getHistoryLogs(uid, payload)
        default:
            return { code: 400, msg: 'Unknown action' }
    }
};

async function assignRoom(uid) {
    const usersCollection = db.collection('uni-id-users')
    const roomsCollection = db.collection('chat_rooms')

    // 1. 先查用户是否已有房间
    const userRes = await usersCollection.doc(uid).get()
    if (userRes.data && userRes.data.length > 0 && userRes.data[0].current_room_id) {
        return {
            code: 0,
            roomId: userRes.data[0].current_room_id,
            msg: '已恢复战区挂载'
        }
    }

    // 2. 寻找 active 且人数少于 500 的房间
    const availableRooms = await roomsCollection.where({
        status: 'active',
        member_count: dbCmd.lt(500)
    }).limit(1).get()

    let targetRoomId = ''

    if (availableRooms.data.length > 0) {
        // 编入现有房间
        targetRoomId = availableRooms.data[0].room_id
        await roomsCollection.doc(availableRooms.data[0]._id).update({
            member_count: dbCmd.inc(1)
        })
    } else {
        // 全满或者没有房间，开辟新战区
        const totalRooms = await roomsCollection.count()
        const newRoomNum = totalRooms.total + 1
        // 格式化例如 room_005
        targetRoomId = `room_${newRoomNum.toString().padStart(3, '0')}`

        await roomsCollection.add({
            room_id: targetRoomId,
            name: `第 ${newRoomNum.toString().padStart(3, '0')} 战区`,
            status: 'active',
            member_count: 1,
            created_date: Date.now()
        })
    }

    // 3. 将用户编入对应组
    // 为了容错，如果用户记录不存在，在 assignRoom 时不抛错，强行新建
    if (userRes.data && userRes.data.length > 0) {
        await usersCollection.doc(uid).update({ current_room_id: targetRoomId })
    } else {
        await usersCollection.add({ _id: uid, current_room_id: targetRoomId })
    }

    return { code: 0, roomId: targetRoomId, msg: '新兵已编入战区' }
}

async function sendMessage(uid, payload) {
    const { room_id, content } = payload

    if (!content || !room_id) return { code: 400, msg: '空信道' }

    // [简易过滤] - 此处应接入阿里云内容安全 API，由于无法配置秘钥，先做简易违禁词替换
    const blockWords = ['色情', '敏感', '/v/']
    let safeContent = content
    let isBlocked = false

    for (let word of blockWords) {
        if (content.includes(word)) {
            safeContent = '***[通讯屏蔽]***'
            isBlocked = true
            break;
        }
    }

    const messagesCollection = db.collection('chat_messages')
    const newMsg = {
        room_id,
        user_id: uid,
        content: safeContent,
        type: 'user',
        is_blocked: isBlocked,
        created_date: Date.now()
    }

    await messagesCollection.add(newMsg)

    // 如果消息严重违规，直接拦截，不推送给其他人
    if (isBlocked) {
        return { code: 403, msg: '侦测到神经递质异常', data: newMsg }
    }

    // ======= 核心：调用 uni-push 2.0 免费透传广播 =======
    // 注意：前提是已经在 manifest.json 里配置并开通了 unipush
    try {
        const uniPush = uniCloud.getPushManager({ appId: context.APPID })
        // 推送给房间对应的标签(Tags)的所有人，即 [room_id]
        await uniPush.sendMessage({
            push_clientid: [], // 推送目标用户，此处为空代表全根据 tag 推
            title: "战区频道",
            content: "你有新的战区通讯",
            // payload 才是 App 真正提取渲染的数据
            payload: newMsg,
            force_notification: false, // false 表示透传，不引起系统层面掉下拉框通知
            request_id: Date.now().toString(),
            options: {
                // HOS, MI, APNs 等厂商配置此处略
                HW: { "/message/android/notification/badge/class": "" }
            },
            // 定向推送目标标签
            target: {
                tag: [room_id]
            }
        })
    } catch (pushErr) {
        console.error('uni-push 推送流失败, 此异常可忽略，因为本地未真机运行', pushErr)
    }

    return { code: 0, msg: '发送成功', data: newMsg }
}

async function getHistoryLogs(uid, payload) {
    const { room_id } = payload
    const messagesCollection = db.collection('chat_messages')

    // 下发最后 50 条安全战区记录
    const logs = await messagesCollection.where({
        room_id: room_id,
        is_blocked: false
    }).orderBy('created_date', 'desc').limit(50).get()

    return { code: 0, data: logs.data.reverse() }
}
