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
        case 'getRooms':
            // 获取大厅分类房间列表
            return await getRooms()
        case 'createDeathMatch':
            // 创建生死局血契
            return await createDeathMatch(uid, payload)
        case 'getHistoryLogs':
            // 获取当前聊天室的历史消息
            return await getHistoryLogs(uid, payload)
        default:
            return { code: 400, msg: 'Unknown action' }
    }
};

async function getRooms() {
    const roomsCollection = db.collection('chat_rooms')

    // 拉取活跃的公共房间
    let publicRooms = await roomsCollection.where({
        type: 'public',
        status: 'active'
    }).orderBy('created_date', 'asc').get()

    // 🔥【开发阶段/冷启动增强】如果数据库是空的，自动注入初始房间数据以便验证
    if (publicRooms.data.length === 0) {
        const defaultPublicRooms = [
            {
                room_id: 'room_global_1', id: 'global_1', type: 'public', name: '全球突触连接枢纽',
                description: '全境探员公共通讯频道，连接全球抵抗军。', member_count: 520, maxUsers: null, prizePool: 0, status: 'active', created_date: Date.now()
            },
            {
                room_id: 'room_noob_1', id: 'noob_1', type: 'public', name: '新手挣脱互助站',
                description: 'Phase I 阶段探员专区，请保持友善交流。', member_count: 128, maxUsers: null, prizePool: 0, status: 'active', created_date: Date.now()
            }
        ]

        const defaultDeathMatches = [
            {
                room_id: 'dm_X7B9K2', id: 'X7B9K2', type: 'death-match', name: '硬核90天净化挑战',
                description: '无情模式，任何一次破戒直接判定清零没收保密金。', member_count: 4, maxUsers: 5, prizePool: 2000, status: 'waiting', created_date: Date.now()
            },
            {
                room_id: 'dm_A9F3R1', id: 'A9F3R1', type: 'death-match', name: '边缘重设 30周日',
                description: '专攻多巴胺戒断，赢下那些本该属于你的东西。', member_count: 10, maxUsers: 10, prizePool: 5000, status: 'active', created_date: Date.now()
            }
        ]

        // 批量插入初始数据
        await roomsCollection.add([...defaultPublicRooms, ...defaultDeathMatches])
        // 重新拉取
        publicRooms = await roomsCollection.where({ type: 'public', status: 'active' }).orderBy('created_date', 'asc').get()
    }

    // 拉取活跃或等待中的生死局 (展示最新的 20 个即可)
    const deathMatches = await roomsCollection.where({
        type: 'death-match',
        status: dbCmd.in(['active', 'waiting'])
    }).orderBy('created_date', 'desc').limit(20).get()

    return {
        code: 0,
        data: {
            publicRooms: publicRooms.data,
            deathMatches: deathMatches.data
        }
    }
}

async function createDeathMatch(uid, payload) {
    const { name, days, maxUsers, deposit } = payload
    const roomsCollection = db.collection('chat_rooms')
    const usersCollection = db.collection('uni-id-users')

    // 检查用户是否已在其他房间 (这里简化处理，允许创建并自动切过去)
    const shortId = Math.random().toString(36).substring(2, 8).toUpperCase()
    const roomId = `dm_${shortId}`

    const newRoom = {
        room_id: roomId, // 唯一通道ID
        id: shortId, // 展示ID
        type: 'death-match',
        name: name,
        description: `目标 ${days} 天绝代风华。`,
        onlineCount: 1, // 创建者本身
        member_count: 1,
        maxUsers: maxUsers,
        prizePool: deposit,
        status: 'waiting', // 先进入等待组排阶段
        created_date: Date.now(),
        creator_id: uid
    }

    await roomsCollection.add(newRoom)

    // 强行把用户塞进去
    await usersCollection.doc(uid).update({ current_room_id: roomId })

    return {
        code: 0,
        msg: '生死血契已建立',
        data: newRoom
    }
}

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
    const {
        room_id,
        content,
        nickname,
        avatar,
        is_vanguard,
        equipped_title,
        equipped_avatar,
        is_broadcast,
        is_emp
    } = payload

    if (!content || !room_id) return { code: 400, msg: '空信道' }

    // [简易过滤] - 此处应接入阿里云内容安全 API
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
        nickname: nickname || '匿名特工',
        avatar: avatar || '',
        is_vanguard: !!is_vanguard,
        equipped_title: equipped_title || null,
        equipped_avatar: equipped_avatar || null,
        is_broadcast: !!is_broadcast,
        is_emp: !!is_emp,
        type: 'user',
        is_blocked: isBlocked,
        created_date: Date.now()
    }

    const insertRes = await messagesCollection.add(newMsg)
    // 修复发送消息只有一条显示的Bug: 将生成的唯一ID返回，否则前端Pinia由于去重逻辑会判定同一会话多次发出的_id相同的消息为重复消息
    newMsg._id = insertRes.id || insertRes._id

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

    // 下发最后 20 条安全战区记录以节约 RU
    const logs = await messagesCollection.where({
        room_id: room_id,
        is_blocked: false
    }).orderBy('created_date', 'desc').limit(20).get()

    return { code: 0, data: logs.data.reverse() }
}
