import { defineStore } from 'pinia'

// 判定平台服务费押金契约是否生效
const checkContractActive = (timestamp) => {
    if (!timestamp) return false
    const now = Date.now()
    const diffDays = (now - timestamp) / (1000 * 60 * 60 * 24)
    return diffDays < 30
}

export const useUserStore = defineStore('user', {
    state: () => {
        return {
            // 用户唯一标识或通行证 (与旧版兼容)
            uuid: uni.getStorageSync('neuro_uuid') || '8972',
            // 神经币余额 (初始测试资金 500)
            neuroCoins: Number(uni.getStorageSync('neuro_coins')) || 500,

            // --- 平台对赌契约状态 ---
            // 契约启动时间段 (如果是 0 代表未开启)
            contractStartTime: Number(uni.getStorageSync('neuro_contract_start')) || 0,
            // 赢来的最高荣耀 (黑金桂冠)
            hasBlackGoldCrown: uni.getStorageSync('neuro_black_gold') === 'true'
        }
    },
    getters: {
        // 当前是否有对赌 50 元保护期生效
        isProActive: (state) => {
            return checkContractActive(state.contractStartTime)
        },
        // 距离 30 天契约解禁还有多少天
        contractDaysLeft: (state) => {
            if (!state.contractStartTime) return 0
            const now = Date.now()
            const diffDays = (now - state.contractStartTime) / (1000 * 60 * 60 * 24)
            const left = 30 - Math.floor(diffDays)
            return left > 0 ? left : 0
        },
        // 获取带格式的货币显示
        formattedCoins: (state) => {
            return state.neuroCoins.toLocaleString()
        }
    },
    actions: {
        // 花费神经币
        spendCoins(amount, reason = '') {
            if (this.neuroCoins >= amount) {
                this.neuroCoins -= amount
                uni.setStorageSync('neuro_coins', this.neuroCoins)
                console.log(`[Store] 消费了 ${amount} 币, 理由: ${reason}`)
                return true
            }
            return false
        },
        // 赚取/奖励神经币
        earnCoins(amount, reason = '') {
            this.neuroCoins += amount
            uni.setStorageSync('neuro_coins', this.neuroCoins)
            console.log(`[Store] 赚取了 ${amount} 币, 理由: ${reason}`)
        },

        // 开启 30 天平台对赌契约！ (扣取 50 元/这里通过弹窗模拟)
        startPlatformContract() {
            const now = Date.now()
            this.contractStartTime = now
            uni.setStorageSync('neuro_contract_start', now)
            // 模拟赠送鼓励启动金 100 币
            this.earnCoins(100, '签下生死状启动金')
        },

        // 契约失败 (破戒销毁押金与天数)
        failContract() {
            this.contractStartTime = 0
            uni.setStorageSync('neuro_contract_start', 0)
            // 暂时剥夺黑金桂冠？或者保留曾经的辉煌？此处暂定为失败不回收永久桂冠，但清空当前进度
        },

        // 契约成功结算 (30天期满)
        finishContractSuccess() {
            this.contractStartTime = 0
            uni.setStorageSync('neuro_contract_start', 0)

            this.hasBlackGoldCrown = true
            uni.setStorageSync('neuro_black_gold', 'true')

            this.earnCoins(10000, '平台对赌胜利：30天退还押金并奖励神币')
            console.log('[Store] 王者之路，契约圆满。')
        }
    }
})
