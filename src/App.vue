<script>
// 这里因为是在 App.vue 取 store，需要确保 pinia 已挂载。推荐在 onLaunch 内侧动态引入
import { useChatStore } from './store/chat.js'

export default {
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
  },
  onShow: function () {
    console.log('App Show')
  },
  onHide: function () {
    console.log('App Hide')
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
