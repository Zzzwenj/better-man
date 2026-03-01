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
            // 神经币余额
            neuroCoins: Number(uni.getStorageSync('neuro_coins')) || 0,

            // --- 平台对赌契约状态 ---
            // 契约启动时间段 (如果是 0 代表未开启)
            contractStartTime: Number(uni.getStorageSync('neuro_contract_start')) || 0,
            // 赢来的最高荣耀 (黑金桂冠)
            hasBlackGoldCrown: uni.getStorageSync('neuro_black_gold') === 'true',

            // --- 短期体验权限 ---
            // 是否领取过一次性的 24 小时广告越权体验药剂
            hasUsedTrial: uni.getStorageSync('neuro_has_used_trial') === 'true',

            // --- 暗网黑市购买与装备状态 ---
            // 采用 Dict { 'f_01': 1735689600000 } 记录每个物品的过期时间戳
            ownedItems: (() => {
                const stored = uni.getStorageSync('neuro_owned_items')
                // 兼容老版本数组数据结构，将数组转为具有 30 天试用期的字典
                if (Array.isArray(stored)) {
                    const newObj = {}
                    const defaultExp = Date.now() + 30 * 24 * 60 * 60 * 1000
                    stored.forEach(id => { newObj[id] = defaultExp })
                    uni.setStorageSync('neuro_owned_items', newObj)
                    return newObj
                }
                return stored || {}
            })(),
            equipped: uni.getStorageSync('neuro_equipped') || {
                avatarFrame: null, // 当前装备的头像框ID
                title: null,       // 当前装备的战区称号ID
                empActive: false   // EMP 脉冲是否激活(单次消耗)
            }
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
        // 购买黑市商品
        purchaseItem(item) {
            if (this.spendCoins(item.price, `购买黑市商品: ${item.title}`)) {
                // 如果是消耗品（例如EMP喇叭 w_01），不记录永久拥有，直接激活效果
                if (item.id === 'w_01') {
                    this.equipped.empActive = true
                    uni.showToast({ title: '全频 EMP 脉冲已加载', icon: 'none' })
                }
                // 盲盒逻辑预留（直接消耗币，这里不处理抽取结果）
                else if (item.id === 'b_01') {
                    // blind box logic
                }
                // 期限装扮类 (30 天为例)
                else {
                    const now = Date.now()
                    const durationMs = 30 * 24 * 60 * 60 * 1000 // 默认给 30 天
                    let exp = this.ownedItems[item.id]

                    if (exp && exp > now) {
                        // 已经拥有且未过期，累加时长
                        this.ownedItems[item.id] = exp + durationMs
                    } else {
                        // 首次获得或已过期重新获得
                        this.ownedItems[item.id] = now + durationMs
                        // 自动装备刚买的东西
                        this.equipItem(item.id)
                    }
                    uni.setStorageSync('neuro_owned_items', this.ownedItems)
                    uni.showToast({ title: '权限已授权并记录时效', icon: 'none' })
                }
                return true
            }
            return false
        },

        // 穿戴/卸下 装备
        equipItem(itemId) {
            const exp = this.ownedItems[itemId]
            if (!exp || exp < Date.now()) {
                uni.showToast({ title: '该数据资产已过期或未获取', icon: 'none' })
                return
            }

            // 头像框类
            if (itemId.startsWith('f_')) {
                this.equipped.avatarFrame = this.equipped.avatarFrame === itemId ? null : itemId
            }
            // 称号类
            else if (itemId.startsWith('t_')) {
                this.equipped.title = this.equipped.title === itemId ? null : itemId
            }
            // 彩蛋特效类
            else if (itemId.startsWith('e_')) {
                // TODO
            }

            uni.setStorageSync('neuro_equipped', this.equipped)
            uni.showToast({ title: '物理特征已更新', icon: 'none' })
        },

        // 在系统关键节点（例如每次打开战区）检验是否过期并自动扒下过期衣服
        verifyEquipmentExpiry() {
            let changed = false
            const now = Date.now()
            const frames = ['avatarFrame', 'title']

            frames.forEach(key => {
                const itemId = this.equipped[key]
                if (itemId) {
                    const exp = this.ownedItems[itemId]
                    if (!exp || exp < now) {
                        // 发现过期装备，强行卸下
                        this.equipped[key] = null
                        // 从所有物清理
                        if (exp && exp < now) {
                            delete this.ownedItems[itemId]
                        }
                        changed = true
                    }
                }
            })

            if (changed) {
                uni.setStorageSync('neuro_equipped', this.equipped)
                uni.setStorageSync('neuro_owned_items', this.ownedItems)
            }
        },

        // 消耗一次 EMP 喇叭（发送消息后调用）
        consumeEMP() {
            if (this.equipped.empActive) {
                this.equipped.empActive = false
                uni.setStorageSync('neuro_equipped', this.equipped)
            }
        },

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
        },

        // 领取一次性 24 小时越权体验 (看广告后调用)
        claimTrialPermission() {
            this.hasUsedTrial = true
            uni.setStorageSync('neuro_has_used_trial', 'true')
            console.log('[Store] 已发放一次性临时越权体验。')
        },

        // 从云端恢复资产 (登录或启动时调用)
        initAssetsFromCloud(profileData) {
            if (profileData) {
                if (profileData.neuro_coins !== undefined) {
                    this.neuroCoins = profileData.neuro_coins
                    uni.setStorageSync('neuro_coins', this.neuroCoins)
                }
                if (profileData.owned_items) {
                    this.ownedItems = profileData.owned_items
                    uni.setStorageSync('neuro_owned_items', this.ownedItems)
                }
                if (profileData.equipped) {
                    this.equipped = { ...this.equipped, ...profileData.equipped }
                    uni.setStorageSync('neuro_equipped', this.equipped)
                }
                if (profileData.has_used_trial !== undefined) {
                    // 同步云端，如果云端有这个标记
                    this.hasUsedTrial = profileData.has_used_trial
                    uni.setStorageSync('neuro_has_used_trial', Boolean(this.hasUsedTrial).toString())
                }
            }
        },

        // 将当前资产静默同步到云端
        async syncAssetsToCloud() {
            try {
                const token = uni.getStorageSync('uni_id_token')
                if (!token) return

                await uniCloud.callFunction({
                    name: 'user-center',
                    data: {
                        action: 'syncAssets',
                        token,
                        payload: {
                            neuroCoins: this.neuroCoins,
                            ownedItems: this.ownedItems,
                            equipped: this.equipped
                        }
                    }
                })
            } catch (err) {
                console.error('[Store] 云端资产对账失败', err)
            }
        }
    }
})
