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

    // 2. 扫描处于"进行中(active)"且超过打卡截止时间的生死局 → 淘汰未打卡成员
    const expiredActiveRes = await roomsCollection.where({
        type: 'death_match',
        status: 'active',
        expiryTime: dbCmd.lt(now)
    }).limit(100).get()

    const activeRooms = expiredActiveRes.data
    for (const room of activeRooms) {
        processedCount++
        console.log(`[打卡裁决] 检查 active 生死局 [${room.name}] (ID: ${room._id})`)

        // 获取该房间的所有当前成员
        const members = room.members || []
        const eliminatedList = [] // 本轮被淘汰的成员
        const survivorList = []   // 本轮幸存的成员

        for (const memberId of members) {
            // 检查该成员在本打卡周期内是否有打卡记录
            const checkinRes = await db.collection('chat-messages').where({
                room_id: room._id,
                sender_id: memberId,
                type: 'checkin',
                created_date: dbCmd.gt(room.expiryTime - 24 * 60 * 60 * 1000) // 上个周期开始
            }).limit(1).get()

            if (checkinRes.data.length === 0) {
                // 未打卡 → 淘汰
                eliminatedList.push(memberId)
                console.log(`  → 成员 ${memberId} 未打卡，判决淘汰`)
            } else {
                survivorList.push(memberId)
            }
        }

        if (survivorList.length >= 2) {
            // 还有足够成员 → 推进到下个打卡周期
            const nextDeadline = now + 24 * 60 * 60 * 1000
            await roomsCollection.doc(room._id).update({
                members: survivorList,
                member_count: survivorList.length,
                expiryTime: nextDeadline,
                updated_at: now
            })

            // 广播淘汰通知
            if (eliminatedList.length > 0) {
                await db.collection('chat-messages').add({
                    room_id: room._id,
                    content: `【系统宣判】本轮打卡审判结束，${eliminatedList.length} 名成员因未打卡被强制淘汰。剩余 ${survivorList.length} 人继续征战。`,
                    is_broadcast: true,
                    nickname: '战区主控台',
                    created_date: now
                })
            }
        } else {
            // 不足 2 人 → 生死局结束，退还幸存者押金
            await roomsCollection.doc(room._id).update({
                status: 'completed',
                updated_at: now
            })

            const stake = room.stakeAmount || 0
            for (const survivorId of survivorList) {
                if (stake > 0) {
                    await usersCollection.where({ _id: survivorId }).update({
                        neuro_coins: dbCmd.inc(stake)
                    })
                    await txLogCollection.add({
                        user_id: survivorId,
                        type: 'earn',
                        amount: stake,
                        reason: `生死局 [${room.name}] 结算，幸存者退还押金`,
                        created_at: now
                    })
                }
            }

            await db.collection('chat-messages').add({
                room_id: room._id,
                content: `【系统宣判】生死局已结束！幸存成员 ${survivorList.length} 人，押金已退还。`,
                is_broadcast: true,
                nickname: '战区主控台',
                created_date: now
            })
            console.log(` → 生死局结束，${survivorList.length} 人幸存，押金已退还`)
        }
    }

    // 3. 扫描注销冷静期已满 7 天的用户 → 执行物理删除
    let deletedCount = 0
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000
    const pendingDeleteRes = await usersCollection.where({
        status: 'pending_delete',
        delete_requested_at: dbCmd.lt(sevenDaysAgo)
    }).limit(50).get()

    for (const user of pendingDeleteRes.data) {
        try {
            // 物理删除用户记录
            await usersCollection.doc(user._id).remove()
            // 记录删除日志
            await txLogCollection.add({
                user_id: user._id,
                type: 'system',
                amount: 0,
                reason: '7天注销冷静期已满，账号已被物理删除',
                created_at: now
            })
            deletedCount++
            console.log(`[注销清理] 用户 ${user._id} 冷静期已满，已执行物理删除`)
        } catch (e) {
            console.error(`[注销清理] 删除用户 ${user._id} 失败:`, e)
        }
    }

    // 4. 扫荡完毕
    console.log(`[战区大清洗] 本次调度执行完毕，共清算判定 ${processedCount} 个超期异常节点，物理删除 ${deletedCount} 个注销账号。`)
    return {
        code: 0,
        msg: '大清洗判定结束',
        processed: processedCount,
        deleted: deletedCount
    }
};
