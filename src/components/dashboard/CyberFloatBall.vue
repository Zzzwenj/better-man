<template>
  <view 
    class="ai-fab-container"
    :class="{ 'dragging': isDragging, 'docking': isDocking }"
    :style="ballStyle"
    @touchstart="onTouchStart"
    @touchmove.stop.prevent="onTouchMove"
    @touchend="onTouchEnd"
    @click="onFabClick"
  >
    <view class="ai-fab-glow"></view>
    <text class="ai-fab-icon">⎔</text>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, getCurrentInstance } from 'vue'

const instance = getCurrentInstance()
const sysInfo = uni.getSystemInfoSync()
const windowWidth = sysInfo.windowWidth || 375
const windowHeight = sysInfo.windowHeight || 667

// 基本状态
const posX = ref(0)
const posY = ref(0)
const isDragging = ref(false)
const isDocking = ref(false)
const isMoved = ref(false) // 只有拖动过之后才使用 posX/posY

// 动态样式：初始由 CSS right/bottom 控制
const ballStyle = computed(() => {
  if (!isMoved.value) return '' // 使用 CSS 默认值
  return `left: ${posX.value}px !important; top: ${posY.value}px !important; right: auto !important; bottom: auto !important;`
})

let startX = 0
let startY = 0
let lastX = 0
let lastY = 0

const onTouchStart = (e) => {
  isDragging.value = true
  isDocking.value = false
  const touch = e.touches[0]
  startX = touch.clientX
  startY = touch.clientY

  // 如果是第一次拖拽，需要先同步当前的 left/top
  if (!isMoved.value) {
    const query = uni.createSelectorQuery().in(instance)
    query.select('.ai-fab-container').boundingClientRect(data => {
      if (data) {
        posX.value = data.left
        posY.value = data.top
        lastX = data.left
        lastY = data.top
        isMoved.value = true
      }
    }).exec()
  } else {
    lastX = posX.value
    lastY = posY.value
  }
}

const onTouchMove = (e) => {
  if (!isDragging.value) return
  const touch = e.touches[0]
  
  let nextX = lastX + (touch.clientX - startX)
  let nextY = lastY + (touch.clientY - startY)

  // 边界约束
  const ballSize = 56
  if (nextX < 0) nextX = 0
  if (nextX > windowWidth - ballSize) nextX = windowWidth - ballSize
  if (nextY < 40) nextY = 40 
  if (nextY > windowHeight - ballSize - 80) nextY = windowHeight - ballSize - 80

  posX.value = nextX
  posY.value = nextY
}

const onTouchEnd = (e) => {
  isDragging.value = false
  isDocking.value = true
  
  // 贴边吸附
  const ballSize = 56
  const centerX = posX.value + ballSize / 2
  if (centerX < windowWidth / 2) {
    posX.value = 10
  } else {
    posX.value = windowWidth - ballSize - 10
  }
}

const onFabClick = () => {
  uni.vibrateShort()
  uni.navigateTo({ url: '/pages/companion/index' })
}

onMounted(() => {
  // 组件挂载完成
})
</script>

<style lang="scss" scoped>
.ai-fab-container {
  position: fixed;
  z-index: 999999;
  right: 40rpx;
  bottom: 150rpx;
  width: 56px;
  height: 56px;
  border-radius: 28px;
  background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
  border: 1px solid rgba(139, 92, 246, 0.5);
  box-shadow: 0 10px 25px rgba(139, 92, 246, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  touch-action: none;
  pointer-events: auto !important;
}

.docking {
  transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
}

.dragging {
  opacity: 0.9;
  transform: scale(1.05);
  transition: none !important;
}

.ai-fab-glow {
  position: absolute;
  width: 100%; height: 100%;
  border-radius: 50%;
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.6);
  animation: fab-pulse 2s infinite;
  pointer-events: none;
}

.ai-fab-icon {
  font-size: 28px;
  color: #fff;
  font-weight: bold;
  z-index: 2;
  text-shadow: 0 0 10px rgba(255,255,255,0.8);
  pointer-events: none;
}

@keyframes fab-pulse {
  0% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.3); opacity: 0; }
  100% { transform: scale(1); opacity: 0; }
}
</style>
