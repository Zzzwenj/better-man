import { defineStore } from 'pinia'

export const useChatStore = defineStore('chat', {
    state: () => ({
        roomId: '',
        messages: [],
        isInitializing: false
    }),
    actions: {
        setRoomId(id) {
            this.roomId = id
        },
        pushMessage(msg) {
            // 避免重复推送同一条记录
            const exists = this.messages.find(m => m._id === msg._id)
            if (!exists) {
                this.messages.push(msg)
            }
        },
        setHistory(logs) {
            this.messages = logs
        },
        clearMessages() {
            this.messages = []
        }
    }
})
