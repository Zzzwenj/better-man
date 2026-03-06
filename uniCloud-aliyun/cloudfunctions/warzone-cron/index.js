'use strict';
const db = uniCloud.database()
const dbCmd = db.command

exports.main = async (event, context) => {
    console.log('[战区大清洗] Cron Job 调度唤醒，开始扫描全域死局...')
    const now = Date.now() // 云函数的 Date.now() 即真实可信服务器时间
    const roomsCollection = db.collection('chat-rooms')
    const usersCollection = db.collection('uni-id-users')
    const txLogCollection = db.collection('transaction_logs')
    let processedCount = 0

    // 1. 扫描处于“招募中(recruiting)”且已经过了“招募截止时间(expiryTime)”的生死局
    const expiredRecruitingRes = await roomsCollection.where({
        type: 'death_match',
        status: 'recruiting',
        expiryTime: dbCmd.lt(now)
    }).limit(100).get()

    const expiredRooms = expiredRecruitingRes.data

    for (const room of expiredRooms) {
        processedCount++
        console.log(`[战区大清洗] 发现已逾期生死局 [${room.name}] (ID: ${room._id})`)

        if (room.member_count >= 2) {
            // [成局] 打卡生死契约达成，状态跃迁为 'active'
            // 并立刻为所有成员下发首日的打卡硬性生死线 (假设 24 小时)
            const nextDeadline = now + 24 * 60 * 60 * 1000
            await roomsCollection.doc(room._id).update({
                status: 'active',
                expiryTime: nextDeadline,
                updated_at: now
            })
            console.log(` -> 人数达标 (${room.member_count}人), 状态跃迁 [Active]`)

            // 附送一条广播消息给 chat-messages
            await db.collection('chat-messages').add({
                room_id: room._id,
                content: `【系统宣判】生死局已达生效人数，契约正式确立！首个生死打卡倒计时开始。`,
                is_broadcast: true,
                nickname: '战区主控台',
                created_date: now
            })

        } else {
            // [流产] 招募失败，状态变更为 'failed'，退还发起者押金
            await roomsCollection.doc(room._id).update({
                status: 'failed',
                updated_at: now
            })

            const creatorId = room.creator_id
            const stake = room.stakeAmount || 0

            if (stake > 0) {
                // 退款操作 (直接增发神经币并记录流水)
                await usersCollection.where({ _id: creatorId }).update({
                    neuro_coins: dbCmd.inc(stake)
                })
                await txLogCollection.add({
                    user_id: creatorId,
                    type: 'earn',
                    amount: stake,
                    reason: `生死局 [${room.name}] 未满编解散，全额退还押金流转`,
                    created_at: now
                })
            }
            console.log(` -> 人数不足流产, 房间废弃并退回押金 ${stake} 币`)
        }
    }

    // 2. 扫荡完毕
    console.log(`[战区大清洗] 本次调度执行完毕，共清算判定 ${processedCount} 个超期异常节点。`)
    return {
        code: 0,
        msg: '大清洗判定结束',
        processed: processedCount
    }
};
