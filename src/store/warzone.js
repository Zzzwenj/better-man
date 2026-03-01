import { defineStore } from 'pinia'

export const useWarzoneStore = defineStore('warzone', {
    state: () => ({
        activePublicRoomId: uni.getStorageSync('neuro_active_public_room') || '',
        activeDeathMatchId: uni.getStorageSync('neuro_active_dm_room') || '',
        publicRooms: [
            {
                id: 'room_global_1',
                type: 'public',
                name: '全球突触连接枢纽',
                description: '全境探员公共通讯频道，连接全球抵抗军。',
                onlineCount: 520,
                maxUsers: null,
                prizePool: 0,
                status: 'active'
            },
            {
                id: 'room_noob_1',
                type: 'public',
                name: '新手挣脱互助站',
                description: 'Phase I 阶段探员专区，请保持友善交流。',
                onlineCount: 128,
                maxUsers: null,
                prizePool: 0,
                status: 'active'
            }
        ],
        deathMatches: [
            {
                id: 'X7B9K2',
                type: 'death-match',
                name: '硬核90天净化挑战',
                description: '无情模式，任何一次破戒直接判定清零没收保密金。',
                onlineCount: 4,
                maxUsers: 5,
                prizePool: 2000,
                status: 'waiting'
            },
            {
                id: 'A9F3R1',
                type: 'death-match',
                name: '边缘重设 30周日',
                description: '专攻多巴胺戒断，赢下那些本该属于你的东西。',
                onlineCount: 10,
                maxUsers: 10,
                prizePool: 5000,
                status: 'active'
            }
        ]
    }),
    actions: {
        createDeathMatch(matchData) {
            const shortId = Math.random().toString(36).substring(2, 8).toUpperCase()
            this.deathMatches.unshift({
                id: shortId,
                type: 'death-match',
                name: matchData.name,
                description: `目标 ${matchData.days} 天绝代风华。`,
                onlineCount: 1,
                maxUsers: matchData.maxUsers,
                prizePool: matchData.deposit,
                status: 'waiting'
            })
            // 原逻辑保持不变
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
