import { defineStore } from 'pinia'
import { getRealTime } from '@/utils/timeGuard.js'
import { debouncedSetStorage } from '@/utils/storageDebounce.js'

// 判定黑金通行证 (VIP) 是否生效
// 使用校准后的服务端时间判定 VIP 状态，防本地时间篡改
const checkVipActive = (expireTimestamp) => {
    if (!expireTimestamp) return false
    return getRealTime() < expireTimestamp
}

export const useUserStore = defineStore('user', {
    state: () => {
        return {
            // 用户唯一标识或通行证 (与旧版兼容)
            uuid: uni.getStorageSync('neuro_uuid') || '8972',
            // 神经币余额
            neuroCoins: Number(uni.getStorageSync('neuro_coins')) || 0,

            // --- 黑金通行证 (VIP) 状态 ---
            // 订阅到期时间戳 (如果是 0 代表未开通或已过期)
            vipExpireTime: Number(uni.getStorageSync('neuro_vip_expire')) || 0,
            // 记录最后一次领取每日 VIP 50 币赠礼的时间戳，用于防止重复领取
            lastVipGiftTime: Number(uni.getStorageSync('neuro_vip_last_gift')) || 0,

            // --- 隐私深网锁 (计算器伪装) ---
            privacyLock: uni.getStorageSync('neuro_privacy_lock') || {
                enabled: false,
                pin: '8972' // 初始暗门密码
            },

            // --- 紧急除颤 (复活) 相关 ---
            // 当月已经使用的特权免单（免广告/免币）除颤次数，黑金每月有 3 次
            monthlyFreeReviveCount: Number(uni.getStorageSync('neuro_free_revive_cnt')) || 0,
            // 记录月份，用于每月重置免单次数 (形如 '2026-03')
            lastReviveMonth: uni.getStorageSync('neuro_last_revive_month') || '',

            // --- 短期体验权限 ---
            // 是否领取过一次性的 24 小时越权体验药剂
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
            },

            // --- 信号拦截(广告)统计 ---
            lastAdTime: uni.getStorageSync('neuro_last_ad_time') || 0,
            dailyAdCount: Number(uni.getStorageSync('neuro_daily_ad_count')) || 0
        }
    },
    getters: {
        // 当前是否拥有生效的黑金通行证
        isVipActive: (state) => {
            return checkVipActive(state.vipExpireTime)
        },
        // profile 页所用别名（与 isVipActive 等价，防 prop 哑火）
        isProActive: (state) => {
            return checkVipActive(state.vipExpireTime)
        },
        // 本月是否还有剩余的【免单除颤】特权 (仅黑金会员拥有)
        hasFreeRevive: (state) => {
            if (!checkVipActive(state.vipExpireTime)) return false

            // 检查跨月重置
            const currentMonth = new Date().toISOString().slice(0, 7)
            if (state.lastReviveMonth !== currentMonth) return true // 跨月未用过，自然有剩

            return state.monthlyFreeReviveCount < 3
        },
        // 距离 VIP 到期还有多少天 (保留 1 位小数)
        vipDaysLeft: (state) => {
            if (!state.vipExpireTime) return 0
            const now = getRealTime() // 校准时间
            if (now >= state.vipExpireTime) return 0

            const diffDays = (state.vipExpireTime - now) / (1000 * 60 * 60 * 24)
            return Number(diffDays.toFixed(1))
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
                    // 奖池定义
                    const pool = [
                        { id: 'f_01', type: 'frame', name: '深空等离子', duration: 15, prob: 0.15 },
                        { id: 'f_02', type: 'frame', name: '故障干扰线', duration: 15, prob: 0.15 },
                        { id: 't_01', type: 'title', name: '深渊行者', duration: 15, prob: 0.10 },
                        { id: 't_02', type: 'title', name: '绝命赌徒', duration: 15, prob: 0.10 },
                        { id: 't_03', type: 'title', name: '赛博精神病', duration: 15, prob: 0.05 },
                        { id: 'w_01', type: 'emp', name: '全频 EMP', duration: 0, prob: 0.20 }, // 单次消耗
                        { id: 'coin', type: 'currency', name: '神经币碎片 (x200)', amount: 200, prob: 0.25 }
                    ]

                    // 轮盘抽奖
                    const rand = Math.random()
                    let sum = 0
                    let wonItem = null
                    for (const prize of pool) {
                        sum += prize.prob
                        if (rand <= sum) {
                            wonItem = prize
                            break
                        }
                    }

                    if (wonItem) {
                        if (wonItem.type === 'currency') {
                            this.earnCoins(wonItem.amount, '盲盒中奖')
                            uni.showToast({ title: `恭喜抽中 ${wonItem.name}`, icon: 'none' })
                        } else if (wonItem.type === 'emp') {
                            this.equipped.empActive = true
                            uni.showToast({ title: `恭喜抽中 ${wonItem.name}`, icon: 'none' })
                        } else {
                            const now = getRealTime()
                            const durationMs = wonItem.duration * 24 * 60 * 60 * 1000
                            const exp = this.ownedItems[wonItem.id]

                            if (exp && exp > now) {
                                this.ownedItems[wonItem.id] = exp + durationMs
                            } else {
                                this.ownedItems[wonItem.id] = now + durationMs
                                // 自动装备
                                this.equipItem(wonItem.id, true) // 传入 true 以略过 toast
                            }
                            uni.showToast({ title: `恭喜获得 [${wonItem.name}]`, icon: 'none' })
                        }
                        uni.setStorageSync('neuro_owned_items', this.ownedItems)
                        uni.setStorageSync('neuro_equipped', this.equipped)
                    }
                }
                // 彩蛋等特效 / 期限装扮类 (30 天为例)
                else {
                    const now = getRealTime()
                    // 默认时效，如果是从商城来，通常 item.durationDays 会有值，没有则默认 30 天
                    const days = item.durationDays || 30
                    const durationMs = days * 24 * 60 * 60 * 1000
                    let exp = this.ownedItems[item.id]

                    if (exp && exp > now) {
                        // 已经拥有且未过期，累加时长
                        this.ownedItems[item.id] = exp + durationMs
                    } else {
                        // 首次获得或已过期重新获得
                        this.ownedItems[item.id] = now + durationMs
                        // 自动装备刚买的东西
                        this.equipItem(item.id, true)
                    }
                    uni.setStorageSync('neuro_owned_items', this.ownedItems)
                    uni.showToast({ title: '实体部署成功，权限已授权', icon: 'none' })
                }

                // 每次发生交易或者资产变化，防抖式向云端静默结印
                this.syncAssetsToCloud()
                return true
            }
            return false
        },

        // 穿戴/卸下 装备
        equipItem(itemId, silent = false) {
            const exp = this.ownedItems[itemId]
            if (!exp || exp < getRealTime()) {
                if (!silent) uni.showToast({ title: '该数据资产已过期或未获取', icon: 'none' })
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
            // 彩蛋特效类 (目前定义可能也占用某个槽位或者只是开关，这里假设目前彩蛋暂留或者设为挂载件)
            else if (itemId.startsWith('e_')) {
                // 如果后续有特效槽位可以加在这，如果只是留个后门先不处理
                console.log('彩蛋已激活: ', itemId)
            }

            uni.setStorageSync('neuro_equipped', this.equipped)
            if (!silent) uni.showToast({ title: '物理特征已更新', icon: 'none' })

            // 装备变化也需要同步
            this.syncAssetsToCloud()
        },

        // 在系统关键节点（例如每次打开战区）检验是否过期并自动扒下过期衣服
        verifyEquipmentExpiry() {
            let changed = false
            const now = getRealTime()
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
                // 【性能优化】高频写入改为防抖
                debouncedSetStorage('neuro_coins', this.neuroCoins)
                console.log(`[Store] 消费了 ${amount} 币, 理由: ${reason}`)

                // --- 【高危漏洞四修复】强鉴权：向云端发起交易溯源核销，防篡改 ---
                const token = uni.getStorageSync('uni_id_token')
                if (token) {
                    uniCloud.callFunction({
                        name: 'user-center',
                        data: { action: 'verifyTransaction', token, payload: { type: 'spend', amount, reason } }
                    }).catch(err => console.error('云端核销拒付', err))
                }
                return true
            }
            return false
        },
        // 赚取/奖励神经币 —— 【模块B】增加云端核销记录，防内存刷币
        earnCoins(amount, reason = '') {
            this.neuroCoins += amount
            debouncedSetStorage('neuro_coins', this.neuroCoins)
            console.log(`[Store] 赚取了 ${amount} 币, 理由: ${reason}`)

            // 向云端发起收入流水记录（与 spendCoins 对齐）
            const token = uni.getStorageSync('uni_id_token')
            if (token) {
                uniCloud.callFunction({
                    name: 'user-center',
                    data: { action: 'verifyTransaction', token, payload: { type: 'earn', amount, reason } }
                }).catch(err => console.error('云端收入核销失败', err))
            }
        },

        // --- [黑金通行证] 开通与续费 ---
        // 模拟/实际接入 IAP 的充值逻辑，durationDays 为开通天数 (30表示包月，365表示年度，36500表示终身)
        purchaseVip(durationDays, reason = '订阅黑金通行证') {
            const now = getRealTime()
            const durationMs = durationDays * 24 * 60 * 60 * 1000

            if (this.vipExpireTime > now) { // 校准时间判断
                // 尚未过期，叠加时长
                this.vipExpireTime += durationMs
            } else {
                // 已过期或首次开通，从当前时间算起
                this.vipExpireTime = now + durationMs
            }

            uni.setStorageSync('neuro_vip_expire', this.vipExpireTime)
            console.log(`[Store] ${reason}, 有效期增加 ${durationDays} 天。`)

            this.syncAssetsToCloud()
            return true
        },

        // 每天登录时调用，检查是否发放黑金会员的每日 50 币特权
        claimDailyVipGift() {
            if (!this.isVipActive) return false

            // 使用校准后的服务端时间防刷
            const nowStr = new Date(getRealTime()).toDateString()
            const lastStr = this.lastVipGiftTime ? new Date(this.lastVipGiftTime).toDateString() : ''

            if (nowStr !== lastStr) {
                this.lastVipGiftTime = getRealTime()
                debouncedSetStorage('neuro_vip_last_gift', this.lastVipGiftTime)
                this.earnCoins(50, '黑金数据链：每日例行算力拨付')
                return true
            }
            return false
        },

        // 消耗一次免单除颤特权
        consumeFreeRevive() {
            if (!this.hasFreeRevive) return false

            const currentMonth = new Date().toISOString().slice(0, 7)

            // 跨月重置判定
            if (this.lastReviveMonth !== currentMonth) {
                this.monthlyFreeReviveCount = 0
                this.lastReviveMonth = currentMonth
            }

            this.monthlyFreeReviveCount++
            uni.setStorageSync('neuro_free_revive_cnt', this.monthlyFreeReviveCount)
            uni.setStorageSync('neuro_last_revive_month', this.lastReviveMonth)
            return true
        },

        // --- [深网隐私锁] 开启与关闭 ---
        togglePrivacyLock(enable, newPin) {
            if (enable) {
                // 开通必须是 VIP，如果不是，则拦截返回 false
                if (!this.isVipActive) {
                    uni.showToast({ title: '仅限黑金档案启用量子伪装层', icon: 'none' })
                    return false
                }
                this.privacyLock.enabled = true
                if (newPin) this.privacyLock.pin = newPin
            } else {
                this.privacyLock.enabled = false
            }
            uni.setStorageSync('neuro_privacy_lock', this.privacyLock)
            return true
        },

        // 【高危漏洞修复】VIP 到期后自动强制关闭隐私锁，防用户被永久锁在门外
        checkAndAutoUnlock() {
            if (this.privacyLock.enabled && !this.isVipActive) {
                this.privacyLock.enabled = false
                uni.setStorageSync('neuro_privacy_lock', this.privacyLock)
                console.log('[Store] VIP 已到期，自动卸载隐私伪装层')
            }
        },

        // 领取一次性 24 小时越权体验 (看广告后调用)
        claimTrialPermission() {
            this.hasUsedTrial = true
            uni.setStorageSync('neuro_has_used_trial', 'true')
            console.log('[Store] 已发放一次性临时越权体验。')
        },

        // 处理广告奖励发放
        earnAdReward() {
            // 使用校准时间防止改系统日期刷广告
            const now = new Date(getRealTime())
            const todayStr = now.toDateString()
            const lastDate = new Date(this.lastAdTime).toDateString()

            // 如果是新的一天，重置计数器
            if (todayStr !== lastDate) {
                this.dailyAdCount = 0
            }

            // 限制每日上限 (商业模型更新：封顶 3 次)
            if (this.dailyAdCount >= 3) {
                uni.showToast({ title: '今日外网算力通道已关闭', icon: 'none' })
                return false
            }

            // 广告变现极大收紧，每次单价控制在 20 币
            const reward = 20
            this.earnCoins(reward, '外网神经算力注入(看广告)')
            this.dailyAdCount++
            this.lastAdTime = getRealTime()

            debouncedSetStorage('neuro_daily_ad_count', this.dailyAdCount)
            debouncedSetStorage('neuro_last_ad_time', this.lastAdTime)

            // 防止 toast 泛滥，交给调用方 UI 来弹窗
            return true
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
                if (profileData.vip_expire !== undefined) {
                    this.vipExpireTime = profileData.vip_expire
                    uni.setStorageSync('neuro_vip_expire', this.vipExpireTime)

                    // 云端恢复时顺便检查一下能否领取今日特权
                    this.claimDailyVipGift()
                }
                if (profileData.has_used_trial !== undefined) {
                    // 同步云端，如果云端有这个标记
                    this.hasUsedTrial = profileData.has_used_trial
                    uni.setStorageSync('neuro_has_used_trial', Boolean(this.hasUsedTrial).toString())
                }

                // 恢复特权使用次数记录
                if (profileData.monthly_free_revive_cnt !== undefined) {
                    this.monthlyFreeReviveCount = profileData.monthly_free_revive_cnt
                    uni.setStorageSync('neuro_free_revive_cnt', this.monthlyFreeReviveCount)
                }
                if (profileData.last_revive_month !== undefined) {
                    this.lastReviveMonth = profileData.last_revive_month
                    uni.setStorageSync('neuro_last_revive_month', this.lastReviveMonth)
                }

                // --- 【高危漏洞三修复】从云端恢复不可篡改的时长记录与打卡天数 ---
                if (profileData.neuro_start_date) {
                    uni.setStorageSync('neuro_start_date', profileData.neuro_start_date)
                }
                if (profileData.neuro_checkins) {
                    uni.setStorageSync('neuro_checkins', profileData.neuro_checkins)
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
                            equipped: this.equipped,
                            vipExpire: this.vipExpireTime,
                            monthlyFreeReviveCnt: this.monthlyFreeReviveCount,
                            lastReviveMonth: this.lastReviveMonth,
                            // --- 【高危漏洞三修复】实时对账上传天数资产 ---
                            neuroStartDate: uni.getStorageSync('neuro_start_date'),
                            neuroCheckins: uni.getStorageSync('neuro_checkins')
                        }
                    }
                })
            } catch (err) {
                console.error('[Store] 云端资产对账失败', err)
            }
        }
    }
})
