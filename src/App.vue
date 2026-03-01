<template>
  <view class="app-theme-wrapper" :style="themeStore.themeCssVars">
    <router-view></router-view>
  </view>
</template>

<script>
import { useChatStore } from './store/chat.js'
import { useThemeStore } from './store/theme.js'

export default {
  setup() {
    const themeStore = useThemeStore()
    return { themeStore }
  },
  onLaunch: function () {
    console.log('App Launch - 特工隐秘模式已激活 (伪装: 计算器)')
    
    // 监听 uni-push 2.0 透传消息
    uni.onPushMessage((res) => {
        console.log("收到推送透传消息：", res)
        if (res.type === 'receive') {
            const chatStore = useChatStore()
            // 将来自云端的实时消息体 push 进状态管理器
            chatStore.pushMessage(res.data.payload)
        }
    })
    
    // 全局凭证静默校验守卫 (冷启动路由分发)
    this.checkAutoLogin()
  },
  onShow: function () {
    console.log('App Show')
    // 每日打卡热力图计算 (位图字符串法)
    const lastCheckin = uni.getStorageSync('neuro_last_checkin_date')
    const todayStr = new Date().toDateString()
    
    if (lastCheckin !== todayStr) {
        let history = uni.getStorageSync('neuro_checkins') || ''
        
        // 如果是新的一天，默认他今天还未破戒，追平这中间断断的 0，并加上今天的 1
        if (lastCheckin) {
           const diffDays = Math.floor((new Date(todayStr).getTime() - new Date(lastCheckin).getTime()) / (1000 * 60 * 60 * 24))
           if (diffDays > 1) {
               history += '0'.repeat(diffDays - 1)
           }
        }
        history += '1' // 收录今天
        
        // 限制长度只存最近 100 天节省内存
        if (history.length > 100) history = history.slice(-100)
        
        uni.setStorageSync('neuro_checkins', history)
        uni.setStorageSync('neuro_last_checkin_date', todayStr)
    }
  },
  onHide: function () {
    console.log('App Hide')
  },
  methods: {
    checkAutoLogin() {
        // App端 onLaunch 时执行的路由跳转，能避免白屏或反复输入
        const token = uni.getStorageSync('uni_id_token')
        const tokenExpired = uni.getStorageSync('uni_id_token_expired')
        const now = Date.now()
        
        // 判断 Token 是否有效 (简单的本地时间戳校验)
        const isTokenValid = token && tokenExpired && (now < tokenExpired)
        
        if (isTokenValid) {
            // 已接入，再检查是否有基线问卷档案
            const baseline = uni.getStorageSync('neuro_baseline')
            if (baseline) {
                // 两者齐全，直接进入控制台中枢
                uni.switchTab({ url: '/pages/dashboard/index' })
            } else {
                // 有账号，没问卷（如新手机刚登入，或者上面那步异步拉取慢了一拍）
                // 稳妥起见，这里也可以加个异步去 user-center 取一次。
                // 为了启动快，如果在 login 或者之前没拉到，就让用户重新走一遍也没事，或者用云端 fallback
                uni.redirectTo({ url: '/pages/onboarding/index' })
            }
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
