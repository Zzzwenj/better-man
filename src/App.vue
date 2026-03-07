<template>
  <view class="app-theme-wrapper" :style="themeStore.themeCssVars">
    <router-view></router-view>
  </view>
</template>

<script>
import { useChatStore } from './store/chat.js'
import { useThemeStore } from './store/theme.js'
import { useUserStore } from './store/user.js'
import { serverTime } from './utils/serverTime.js'
import { flushPendingStorage } from './utils/storageDebounce.js'

export default {
  setup() {
    const themeStore = useThemeStore()
    return { themeStore }
  },
  onLaunch: function () {
    console.log('App Launch - 特工隐秘模式已激活 (伪装: 计算器)')
    
    // 监听 uni-push 2.0 透传消息 (暂不启用推送模块，避免打包报错)
    /*
    uni.onPushMessage((res) => {
        console.log("收到推送透传消息：", res)
        if (res.type === 'receive') {
            const chatStore = useChatStore()
            // 将来自云端的实时消息体 push 进状态管理器
            chatStore.pushMessage(res.data.payload)
        }
    })
    */
    
    // 【安全加固】启动时初始化时间防篡改校准
    const token = uni.getStorageSync('uni_id_token')
    if (token) {
        serverTime.sync()
    }
    
    // 全局凭证静默校验守卫 (冷启动路由分发)
    this.checkAutoLogin()
  },
  onShow: function () {
    console.log('App Show')

    // --- VIP 到期自动关锁（防用户因 VIP 续费断了被永久关在门外）---
    const userStore = useUserStore()
    userStore.checkAndAutoUnlock()

    // --- 切后台隐私锁防绕过 ---
    const userLock = uni.getStorageSync('neuro_privacy_lock')
    if (userLock && userLock.enabled) {
        const pages = getCurrentPages()
        if (pages.length === 0 || (pages[pages.length - 1] && pages[pages.length - 1].route !== 'pages/calculator/index')) {
            uni.reLaunch({ url: '/pages/calculator/index' })
            return
        }
    }

    // 每日打卡热力图计算 —— 使用校准后的服务端时间，防本地时间篡改
    const lastCheckin = uni.getStorageSync('last_checkin_date')
    const realDate = new Date(serverTime.now())
    const todayStr = `${realDate.getFullYear()}-${String(realDate.getMonth()+1).padStart(2,'0')}-${String(realDate.getDate()).padStart(2,'0')}`

    // ✅ 去重：同一天多次 onShow 不重复写入
    if (lastCheckin !== todayStr) {
        let history = uni.getStorageSync('neuro_checkins') || ''

        if (lastCheckin) {
           // 计算跸天差（统一用 YYYY-MM-DD 进行解析，避免 toDateString 在 Android 上 NaN）
           const lastMs = new Date(lastCheckin + 'T00:00:00').getTime()
           const todayMs = new Date(todayStr + 'T00:00:00').getTime()
           if (!isNaN(lastMs) && !isNaN(todayMs)) {
               const diffDays = Math.floor((todayMs - lastMs) / (1000 * 60 * 60 * 24))
               if (diffDays > 1) {
                   history += '0'.repeat(diffDays - 1)
               }
           }
        }
        // 此处不再追加 "1"，由 DailyAuditModal 的 onSafe 或拦截成功时写入
        // 仅补零，避免与 DailyAuditModal 重复写入

        if (history.length > 100) history = history.slice(-100)

        uni.setStorageSync('neuro_checkins', history)
        // 不在此处更新 last_checkin_date，留给 DailyAuditModal 来写入
    }
  },
  onHide: function () {
    console.log('App Hide')
    // 【性能优化】App 退到后台时，强制刷新所有待写入的防抖缓存
    flushPendingStorage()
  },
  methods: {
    checkAutoLogin() {
        // App端 onLaunch 时执行的路由跳转，能避免白屏或反复输入
        
        // 【合规补丁】：无论是否持有 Token，只要没有明确的隐私协议同意记录，一律拦截进黑屋
        const isPrivacyAgreed = uni.getStorageSync('privacy_agreed')
        if (!isPrivacyAgreed) {
           console.warn('[合规拦截] 未同意隐私协议，强制调度至合规阻断墙')
           uni.reLaunch({ url: '/pages/onboarding/compliance' })
           // 【高危漏洞一修复】必须显式 return 斩断执行链，防止底层生命周期串联越权跳过重定向！
           return
        }

        const token = uni.getStorageSync('uni_id_token')
        const tokenExpired = uni.getStorageSync('uni_id_token_expired')
        const now = serverTime.now() // 使用校准时间替代裸 Date.now()
        
        // 判断 Token 是否有效 (本地时间戳初筛)
        const isTokenValid = token && tokenExpired && (now < tokenExpired)
        
        if (isTokenValid) {
            // 【模块D：Token 云端验活】本地初筛通过后，异步向云端确认账号状态
            const verifyAndNavigate = async () => {
                try {
                    const timeoutPromise = new Promise((_, reject) =>
                        setTimeout(() => reject(new Error('验活超时')), 5000)
                    )
                    const cloudPromise = uniCloud.callFunction({
                        name: 'user-center',
                        data: { action: 'getUserProfile', token }
                    })
                    const profileRes = await Promise.race([cloudPromise, timeoutPromise])
                    
                    if (profileRes.result.code === 401 || profileRes.result.code === 404) {
                        // 云端判定无效：账号被封/已彻底销毁/密码已改/在其他终端全息重连
                        console.warn('[Auth] 云端验活失败，互斥掉线')
                        uni.removeStorageSync('uni_id_token')
                        uni.removeStorageSync('uni_id_token_expired')
                        
                        // 【多端互斥挤占提醒】使用全局事件触发赛博弹窗，避免原生弹窗破坏沉浸感
                        uni.showToast({
                            title: '您的档案已在其他终端接入，当前连接已切断。如非本人操作，请立即修改密码。',
                            icon: 'none',
                            duration: 3000
                        })
                        setTimeout(() => {
                            uni.reLaunch({ url: '/pages/login/index' })
                        }, 2000)
                        return
                    }
                    
                    if (profileRes.result.data && profileRes.result.data.status === 'pending_delete') {
                        // 处于7天注销反悔期，依然放行进入主应用，但在进入后会有顶层弹窗或拦截引导恢复
                        uni.setStorageSync('user_account_status', 'pending_delete')
                        const deleteAt = profileRes.result.data.delete_at
                        if (deleteAt) uni.setStorageSync('account_delete_at', deleteAt)
                    } else {
                        uni.removeStorageSync('user_account_status')
                        uni.removeStorageSync('account_delete_at')
                    }
                    
                    // --- 【高危漏洞二修复】全局档案核心资料下行同步 ---
                    if (profileRes.result.data && profileRes.result.data.neuro_baseline) {
                        const baseline = profileRes.result.data.neuro_baseline
                        // 合并最高优先级的最新属性（如果存在）
                        baseline.nickname = profileRes.result.data.nickname || baseline.nickname
                        baseline.avatar = profileRes.result.data.avatar || baseline.avatar
                        baseline.signature = profileRes.result.data.signature || baseline.signature
                        uni.setStorageSync('neuro_baseline', JSON.stringify(baseline))
                    }
                } catch (e) {
                    // 超时或网络异常 → 放行（离线容错）
                    console.warn('[Auth] 云端验活超时/失败，降级放行:', e.message || e)
                }
                
                // 验活通过或已降级，正常路由
                const baseline = uni.getStorageSync('neuro_baseline')
                if (baseline) {
                    uni.switchTab({ url: '/pages/dashboard/index' })
                } else {
                    uni.redirectTo({ url: '/pages/onboarding/index' })
                }
            }
            verifyAndNavigate()
        } else {
            // 没接入，或者 token 过期了，清理缓存并打回登录页
            if(token) {
                 uni.removeStorageSync('uni_id_token')
                 uni.removeStorageSync('uni_id_token_expired')
            }
            uni.reLaunch({ url: '/pages/login/index' })
        }
    }
  }
}
</script>


<style lang="scss">
/* 全局样式表 — 重置浏览器默认边距 */
html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  overflow-x: hidden;
}

page {
  background-color: #121212;
  color: #E0E0E0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  margin: 0;
  padding: 0;
}

view {
  box-sizing: border-box;
}

/* 彻底隐藏所有原生滚动条 (2026 沉浸式 App 标准) */
::-webkit-scrollbar {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
  -webkit-appearance: none;
  background: transparent;
}

/* 兼容 Firefox */
* {
  scrollbar-width: none !important;
}

/* 针对部分容器隐藏滚动条 */
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}

.app-theme-wrapper {
  min-height: 100vh;
  width: 100vw;
  /* 初始化 Fallback 变量 */
  --theme-primary: #00e5ff;
  --theme-primary-grad-start: #00C6FF;
  --theme-primary-grad-end: #0072FF;
  --theme-secondary: #8b5cf6;
  --theme-bg-highlight: rgba(0, 229, 255, 0.05);
  --theme-shadow-primary: rgba(0, 229, 255, 0.4);
}

.text-primary { color: var(--theme-primary, #00E676); } 
.text-danger { color: #ef4444; }  /* 霓虹红，用于急救、警报不变 */
.bg-surface { background-color: #1E1E1E; }
.bg-dark { background-color: #121212; }

/* Flex 快捷工具类 */
.flex { display: flex; }
.flex-col { display: flex; flex-direction: column; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
</style>
