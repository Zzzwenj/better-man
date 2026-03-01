import { defineStore } from 'pinia'

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
                    this.publicRooms = res.result.data.publicRooms.map(r => ({
                        ...r,
                        onlineCount: r.member_count || 1 // 适配前端变量名
                    }))
                    this.deathMatches = res.result.data.deathMatches.map(r => ({
                        ...r,
                        onlineCount: r.member_count || 1
                    }))
                }
            } catch (error) {
                console.error('拉取大厅数据失败:', error)
            }
        },
        async createDeathMatch(matchData) {
            try {
                const token = uni.getStorageSync('uni_id_token')
                const res = await uniCloud.callFunction({
                    name: 'chat-hub',
                    data: {
                        action: 'createDeathMatch',
                        token,
                        payload: matchData
                    }
                })

                if (res.result.code === 0) {
                    // 立即切过去
                    const newRoom = res.result.data
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
