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
                // 内存保护：超过 200 条自动淘汰最早消息，防低端设备 OOM
                if (this.messages.length > 200) {
                    this.messages = this.messages.slice(-200)
                }
            }
        },
        setHistory(logs) {
            this.messages = logs
        },
        updateMessageId(oldId, newId) {
            const index = this.messages.findIndex(m => m._id === oldId)
            if (index !== -1) {
                this.messages[index]._id = newId
            }
        },
        updateMessageStatus(id, newContent, isBlocked) {
            const index = this.messages.findIndex(m => m._id === id)
            if (index !== -1) {
                this.messages[index].content = newContent
                this.messages[index].is_blocked = !!isBlocked
            }
        },
        clearMessages() {
            this.messages = []
        }
    }
})
