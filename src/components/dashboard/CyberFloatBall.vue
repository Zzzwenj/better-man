<!-- src/components/dashboard/CyberFloatBall.vue -->
<template>
  <movable-area class="fab-movable-area">
    <movable-view 
      class="ai-fab flex items-center justify-center pop-in"
      :x="initialX" 
      :y="initialY" 
      direction="all" 
      :out-of-bounds="true"
      :damping="50"
      :friction="2"
      @click.stop="onFabClick"
    >
      <view class="ai-fab-glow"></view>
      <text class="ai-fab-icon">⎔</text>
    </movable-view>
  </movable-area>
</template>

<script setup>
/**
 * @component CyberFloatBall
 * @description 觉醒空间原生悬浮球组件。使用 movable-area 和 movable-view 替代手写 touchmove 渲染，提供 60FPS 丝滑的拖拽及物理回弹体验。
 */
import { ref, onMounted } from 'vue'

const sysInfo = uni.getSystemInfoSync()
// 初始位置放置在右下角偏上的位置
const initialX = ref(sysInfo.windowWidth - 76)
const initialY = ref(sysInfo.windowHeight - 220)

const onFabClick = () => {
  uni.vibrateShort()
  uni.navigateTo({ url: '/pages/companion/index' })
}
</script>

<style lang="scss" scoped>
/* 悬浮球的容器区域(覆盖全屏以允许任意拖拽) */
.fab-movable-area {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none; /* 穿透点击事件，不阻挡底层页面交互 */
  z-index: 999;
}

.ai-fab {
  pointer-events: auto; /* 恢复自身的点击和拖拽能力 */
  width: 56px;
  height: 56px;
  border-radius: 28px;
  background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
  border: 1px solid rgba(139, 92, 246, 0.5);
  box-shadow: 0 10px 25px rgba(139, 92, 246, 0.4);
}

.ai-fab:active {
  transform: scale(0.9);
}

.ai-fab-glow {
  position: absolute;
  width: 100%; height: 100%;
  border-radius: 50%;
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.6);
  animation: fab-pulse 2s infinite;
}

.ai-fab-icon {
  font-size: 28px;
  color: #fff;
  font-weight: bold;
  z-index: 2;
  text-shadow: 0 0 10px rgba(255,255,255,0.8);
}

@keyframes fab-pulse {
  0% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.3); opacity: 0; }
  100% { transform: scale(1); opacity: 0; }
}

.flex { display: flex; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }

/* 进场动画 */
.pop-in {
  animation: popIn 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}

@keyframes popIn { 
  0% { transform: scale(0.5); opacity: 0;}
  100% { transform: scale(1); opacity: 1; }
}
</style>
