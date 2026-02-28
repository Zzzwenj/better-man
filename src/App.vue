<template>
  <view class="app-theme-wrapper" :style="themeStore.themeCssVars">
    <router-view></router-view>
  </view>
</template>

<script setup>
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import { useChatStore } from './store/chat.js'
import { useThemeStore } from './store/theme.js'

const themeStore = useThemeStore()

onLaunch(() => {
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
})

onShow(() => { console.log('App Show') })
onHide(() => { console.log('App Hide') })
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
