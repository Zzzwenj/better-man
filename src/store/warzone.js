import { defineStore } from 'pinia'

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
                    const expiryTime = Date.now() + (matchData.recruitDeadline || 6) * 3600 * 1000

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
        }
    }
})
