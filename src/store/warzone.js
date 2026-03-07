import { defineStore } from 'pinia'
import { useUserStore } from './user.js'
import { serverTime } from '@/utils/serverTime.js'

/**
 * 生死局默认名称池（共 30 个，按最大人数分档）
 * - duo   (2人): 10 个  - 双人决斗、你死我活
 * - squad (3-5人): 10 个 - 小队博弈
 * - battalion (8-10人): 10 个 - 大规模集结
 */
const ROOM_NAMES = {
    duo: [
        '双峰对决', '一触即发', '宿命之战', '刀尖博弈',
        '巅峰之约', '影子决斗', '浴火双生', '极限切磋',
        '生死二重奏', '沙漠之鹰'
    ],
    squad: [
        '小队净化令', '五虎聚义', '约法三章', '破晓特攻队',
        '突破阵线', '收割者联盟', '碳基觉醒营', '誓死不退小队',
        '禁欲死士团', '逃离多巴胺'
    ],
    battalion: [
        '觉醒者大集结', '神经重塑战团', '百人禁断营地',
        '铁血戒断军团', '意志长城计划', '巨蟒行动集群',
        '末日审判联盟', '钢铁意志兵团', '清醒者大联盟',
        '深渊突围战团'
    ]
}

/**
 * 根据最大人数随机生成房间名称
 * @param {number} maxUsers
 * @returns {string}
 */
function genRoomName(maxUsers) {
    let pool
    if (maxUsers <= 2) {
        pool = ROOM_NAMES.duo
    } else if (maxUsers <= 5) {
        pool = ROOM_NAMES.squad
    } else {
        pool = ROOM_NAMES.battalion
    }
    return pool[Math.floor(Math.random() * pool.length)]
}


export const useWarzoneStore = defineStore('warzone', {
    state: () => ({
        activePublicRoomId: uni.getStorageSync('neuro_active_public_room') || '',
        activeDeathMatchId: uni.getStorageSync('neuro_active_dm_room') || '',
        publicRooms: [],
        deathMatches: []
    }),
    actions: {
        async fetchRooms() {
            try {
                const token = uni.getStorageSync('uni_id_token')
                if (!token) return

                const res = await uniCloud.callFunction({
                    name: 'chat-hub',
                    data: { action: 'getRooms', token }
                })

                if (res.result.code === 0) {
                    // 读取本地缓存的宣言（key: neuro_slogans，格式：{ roomId: slogan }）
                    let sloganCache = {}
                    try {
                        sloganCache = JSON.parse(uni.getStorageSync('neuro_slogans') || '{}')
                    } catch (e) { }

                    this.publicRooms = res.result.data.publicRooms.map(r => ({
                        ...r,
                        onlineCount: r.member_count || 1,
                        // 若本地有覆写过的宣言，优先用本地值
                        slogan: sloganCache[r.id] || r.slogan || ''
                    }))
                    this.deathMatches = res.result.data.deathMatches.map(r => ({
                        ...r,
                        onlineCount: r.member_count || 1,
                        slogan: sloganCache[r.id] || r.slogan || ''
                    }))
                }
            } catch (error) {
                console.error('拉取大厅数据失败:', error)
            }
        },
        /**
         * 持久化宣言到本地 Storage，并同步更新内存中的 deathMatches
         * @param {string} roomId - 房间 ID
         * @param {string} slogan - 新的宣言内容
         */
        saveSlogan(roomId, slogan) {
            // 1. 更新内存
            const match = this.deathMatches.find(m => m.id === roomId)
            if (match) match.slogan = slogan

            // 2. 写入 Storage 持久化，格式：{ roomId: slogan }
            let sloganCache = {}
            try {
                sloganCache = JSON.parse(uni.getStorageSync('neuro_slogans') || '{}')
            } catch (e) { }
            sloganCache[roomId] = slogan
            uni.setStorageSync('neuro_slogans', JSON.stringify(sloganCache))
        },

        async createDeathMatch(matchData) {
            try {
                const token = uni.getStorageSync('uni_id_token')
                // 按人数自动生成默认名称，注入 payload
                const autoName = genRoomName(matchData.maxUsers || 2)
                const res = await uniCloud.callFunction({
                    name: 'chat-hub',
                    data: {
                        action: 'createDeathMatch',
                        token,
                        payload: { ...matchData, name: autoName }
                    }
                })

                if (res.result.code === 0) {
                    // 计算过期时间戳 (当前服务器/本地时间 + 截止小时数)
                    const expiryTime = serverTime.now() + (matchData.recruitDeadline || 6) * 3600 * 1000

                    const newRoom = {
                        ...res.result.data,
                        expiryTime // 前端持久化模拟，后端实际也会存
                    }
                    this.deathMatches.unshift({
                        ...newRoom,
                        onlineCount: newRoom.member_count || 1
                    })
                    this.setActiveDeathMatch(newRoom.id)
                    return newRoom
                } else {
                    uni.showToast({ title: res.result.msg, icon: 'none' })
                    return false
                }
            } catch (error) {
                console.error('建立血契失败:', error)
                return false
            }
        },

        async createPublicRoom(payload) {
            try {
                const token = uni.getStorageSync('uni_id_token')
                const res = await uniCloud.callFunction({
                    name: 'chat-hub',
                    data: {
                        action: 'createPublicRoom',
                        token,
                        payload
                    }
                })

                if (res.result.code === 0) {
                    const newRoom = {
                        ...res.result.data,
                        onlineCount: res.result.data.member_count || 1
                    }
                    this.publicRooms.unshift(newRoom)
                    this.setActivePublicRoom(newRoom.id)
                    return newRoom
                } else {
                    uni.showToast({ title: res.result.msg, icon: 'none' })
                    return false
                }
            } catch (error) {
                console.error('建立大厅失败:', error)
                return false
            }
        },
        setActivePublicRoom(id) {
            this.activePublicRoomId = id
            uni.setStorageSync('neuro_active_public_room', id)
        },
        clearActivePublicRoom() {
            this.activePublicRoomId = ''
            uni.removeStorageSync('neuro_active_public_room')
        },
        setActiveDeathMatch(id) {
            this.activeDeathMatchId = id
            uni.setStorageSync('neuro_active_dm_room', id)
        },
        clearActiveDeathMatch() {
            this.activeDeathMatchId = ''
            uni.removeStorageSync('neuro_active_dm_room')
        },
        async leaveRoomAction(roomId, isDeathMatch = false) {
            try {
                const token = uni.getStorageSync('uni_id_token')
                if (!token) return false

                uni.showLoading({ title: '断开脑机连接...' })

                // --- 1. 执行连坐惩罚核算 (仅针对生死局斯巴达小队) ---
                if (isDeathMatch) {
                    const userStore = useUserStore()
                    // 【字典兼容修复】ownedItems 已从数组迁移为字典结构 { id: expireTimestamp }
                    const shieldExp = userStore.ownedItems['shield_01']
                    const hasShield = shieldExp && shieldExp > serverTime.now()

                    if (hasShield) {
                        // 消耗防线崩溃金牌 (静音退群，不扣进度)
                        uni.showToast({ title: '🛡️ 防御罩已抵消本次反噬', icon: 'none', duration: 3000 })
                        delete userStore.ownedItems['shield_01']
                        uni.setStorageSync('neuro_owned_items', userStore.ownedItems)
                        userStore.syncAssetsToCloud()
                    } else {
                        // 无防护罩：触发 20% 倒退连坐反噬
                        uni.vibrateLong()
                        const startTimestamp = uni.getStorageSync('neuro_start_date') || serverTime.now()
                        const diffDays = Math.max(1, (serverTime.now() - startTimestamp) / (1000 * 60 * 60 * 24))
                        const lostDays = Math.ceil(diffDays * 0.2) // 扣减 20%

                        // 写回新的“倒退起点时间”
                        const newStart = startTimestamp + (lostDays * 24 * 60 * 60 * 1000)
                        uni.setStorageSync('neuro_start_date', newStart)

                        uni.showToast({ title: `🩸 神经反噬！已抹除 ${lostDays} 天突触记录...`, icon: 'none', duration: 4000 })

                        // 发送世界广播警告全队
                        const baselineStr = uni.getStorageSync('neuro_baseline')
                        const profile = baselineStr ? JSON.parse(baselineStr) : {}
                        const nickname = profile.nickname || '匿名特工'

                        uniCloud.callFunction({
                            name: 'chat-hub',
                            data: {
                                token,
                                action: 'sendMessage',
                                payload: {
                                    room_id: roomId,
                                    content: `[连坐反噬] 探员 ${nickname} 防线崩溃并叛逃！全队连带受罚机制已触发。`,
                                    is_broadcast: true,
                                    nickname: '系统仲裁者'
                                }
                            }
                        })
                    }
                }

                // --- 2. 正常剥离云端记录 ---
                const res = await uniCloud.callFunction({
                    name: 'chat-hub',
                    data: {
                        action: 'leaveRoom',
                        token,
                        payload: { room_id: roomId }
                    }
                })
                uni.hideLoading()

                if (res.result.code === 0) {
                    if (!isDeathMatch) uni.showToast({ title: res.result.msg || '已撤离', icon: 'none' })
                    // 【修复】只清除对应类型的活跃 ID，不误伤另一侧
                    if (isDeathMatch) {
                        this.clearActiveDeathMatch()
                    } else {
                        this.clearActivePublicRoom()
                    }
                    return true
                } else {
                    uni.showToast({ title: res.result.msg || '撤离失败', icon: 'none' })
                    return false
                }
            } catch (error) {
                uni.hideLoading()
                console.error('撤离战区失败:', error)
                uni.showToast({ title: '神经递质断开异常', icon: 'none' })
                return false
            }
        },
        async fetchRoomMembers(roomId) {
            try {
                const token = uni.getStorageSync('uni_id_token')
                if (!token) return []
                const res = await uniCloud.callFunction({
                    name: 'chat-hub',
                    data: {
                        action: 'getRoomMembers',
                        token,
                        payload: { room_id: roomId }
                    }
                })
                if (res.result.code === 0) {
                    return res.result.data || []
                }
                return []
            } catch (e) {
                console.error('拉取成员名单失败:', e)
                return []
            }
        }
    }
})
