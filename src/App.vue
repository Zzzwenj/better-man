<script>
import { useChatStore } from './store/chat.js'

export default {
  onLaunch: function () {
    console.log('App Launch - 接入系统并执行身份核验')
    
    // 监听 uni-push 2.0 透传消息
    uni.onPushMessage((res) => {
        console.log("收到推送透传消息：", res)
        if (res.type === 'receive') {
            const chatStore = useChatStore()
            chatStore.pushMessage(res.data.payload)
        }
    })
    
    // 全局凭证静默校验守卫 (冷启动路由分发)
    this.checkAutoLogin()
  },
  onShow: function () {
    console.log('App Show')
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

.text-primary { color: #00E676; } /* 霓虹绿，用于正向、成功、天数 */
.text-danger { color: #FF3D00; }  /* 霓虹红，用于急救、警报 */
.bg-surface { background-color: #1E1E1E; }
.bg-dark { background-color: #121212; }

/* Flex 快捷工具类 */
.flex { display: flex; }
.flex-col { display: flex; flex-direction: column; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
</style>
