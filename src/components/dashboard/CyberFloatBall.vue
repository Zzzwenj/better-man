<template>
  <!-- 容器使用全屏透明 movable-area，确保球体可以全屏挪动 -->
  <movable-area class="fab-area" v-if="show">
    <movable-view 
      class="ai-fab-container"
      direction="all"
      :x="posX" 
      :y="posY"
      :damping="25"
      :friction="2"
      @change="onMove"
      @touchstart="handleTouchStart"
      @touchend="handleTouchEnd"
    >
      <!-- HUD 提示气泡 (动态对齐防止截断) -->
      <view 
        class="hud-bubble" 
        :class="[
          { 'hud-visible': hudVisible },
          'placement-' + bubblePlacement
        ]"
      >
        <text class="hud-text">守护核就绪 | 单击立即拦截</text>
        <view class="hud-arrow"></view>
      </view>

      <!-- 视觉增强层：极光描边 -->
      <view class="fab-border-glow"></view>

      <view class="ai-fab-glow" :class="{ 'panic-glow': isPanicActive }"></view>
      
      <!-- 环绕粒子轨道 -->
      <view class="fab-orbit"></view>
      
      <!-- CSS 绘制的神盾图标 -->
      <view class="fab-guardian-icon" :class="{ 'panic-icon-anim': isPanicActive }">
        <view class="shield-core"></view>
        <view class="shield-ring-1"></view>
        <view class="shield-ring-2"></view>
      </view>
    </movable-view>
  </movable-area>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, defineProps } from 'vue'

const props = defineProps({
  show: { type: Boolean, default: true }
})

const sysInfo = uni.getSystemInfoSync()
const windowWidth = sysInfo.windowWidth || 375
// 初始位置放置在右下角
const posX = ref(windowWidth - 80)
const posY = ref(sysInfo.windowHeight - 160)

const hudVisible = ref(false)
const isPanicActive = ref(false)

// 动态计算气泡弹出位置，防止边缘截断
const bubblePlacement = computed(() => {
  // 球体宽度 64px，中线位置为 posX + 32
  const centerX = posX.value + 32
  if (centerX < 140) return 'left'
  if (centerX > windowWidth - 140) return 'right'
  return 'center'
})

// 交互精度控制
let touchStartTime = 0
let touchStartX = 0
let touchStartY = 0
let idleTimer = null

const startIdleTimer = () => {
  stopIdleTimer()
  // 如果当前气泡已显示，则不重复开启
  if (hudVisible.value) return 
  
  // 用户反馈 10s 闲置显示气泡
  idleTimer = setTimeout(() => {
    showHudTemporarily()
  }, 10000)
}

const stopIdleTimer = () => {
  if (idleTimer) {
    clearTimeout(idleTimer)
    idleTimer = null
  }
}

const handleTouchStart = (e) => {
  touchStartTime = Date.now()
  const touch = e.touches[0]
  touchStartX = touch.clientX
  touchStartY = touch.clientY
  stopIdleTimer()
}

const handleTouchEnd = (e) => {
  const duration = Date.now() - touchStartTime
  const touch = e.changedTouches[0]
  const dist = Math.sqrt(
    Math.pow(touch.clientX - touchStartX, 2) + 
    Math.pow(touch.clientY - touchStartY, 2)
  )

  // 判定规则：位移极小 (<8px) 且时长短 (<250ms)，视为单击
  // 这样能完美避开拖拽带来的 tap 误触
  if (dist < 8 && duration < 250) {
    onFabClick()
  }
  startIdleTimer()
}

const onMove = (e) => {
  // movable-view 的 change 事件会返回当前的 x, y
  if (e.detail.source === 'touch') {
    // 增加位移判定：位移 > 1px 才认为是有效移动，防止框架重绘抖动重置定时器
    const moveDist = Math.sqrt(
      Math.pow(e.detail.x - posX.value, 2) + 
      Math.pow(e.detail.y - posY.value, 2)
    )
    
    if (moveDist > 1) {
      posX.value = e.detail.x
      posY.value = e.detail.y
      
      if (hudVisible.value) hudVisible.value = false
      stopIdleTimer()
      startIdleTimer()
    }
  }
}

const onFabClick = () => {
  // 单击即干预：符合“紧急避险”第一直觉
  triggerEmergency()
  hudVisible.value = false
}

const showHudTemporarily = () => {
  hudVisible.value = true
  // 气泡停留 4秒
  setTimeout(() => {
    hudVisible.value = false
    // V2.10 核心修复：气泡消失后，重新开启闲置检测，实现“每闲置 10s 出现一次”
    startIdleTimer()
  }, 4000)
}

const triggerEmergency = () => {
  uni.vibrateLong()
  isPanicActive.value = true
  uni.$emit('TRIGGER_PANIC_SYSTEM')
  setTimeout(() => {
    isPanicActive.value = false
  }, 2000)
}

onMounted(() => {
  // 开屏 1.5秒后自动弹出 HUD 提示
  setTimeout(showHudTemporarily, 1500)
  startIdleTimer()
})

onUnmounted(() => {
  stopIdleTimer()
})
</script>

<style lang="scss" scoped>
.fab-area {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none; // 区域不阻断点击，由 movable-view 捕获
  z-index: 999999;
}

.ai-fab-container {
  width: 64px;
  height: 64px;
  pointer-events: auto; // 恢复球体点击
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

// 视觉强化：极光渐变描边
.fab-border-glow {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  padding: 2px;
  background: linear-gradient(45deg, #00e5ff, #4f46e5);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0.8;
  z-index: 2;
}

.ai-fab-glow {
  position: absolute;
  width: 100%; height: 100%;
  border-radius: 50%;
  background: rgba(10, 10, 15, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 
    0 15px 45px rgba(0, 0, 0, 0.9), 
    0 0 25px rgba(0, 229, 255, 0.2),
    inset 0 0 15px rgba(255, 255, 255, 0.05);
  animation: fab-pulse 3s infinite;
  z-index: 1;
}

/* 核心图标重构：神盾脉冲 (视觉放大) */
.fab-guardian-icon {
  position: relative;
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.shield-core {
  width: 12px;
  height: 12px;
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 0 20px #fff, 0 0 40px var(--theme-primary);
  z-index: 5;
}

.shield-ring-1 {
  position: absolute;
  width: 28px;
  height: 28px;
  border: 2px solid rgba(0, 229, 255, 0.6);
  border-radius: 50%;
  border-top-color: transparent;
  animation: rotate-shield 1.5s linear infinite;
}

.shield-ring-2 {
  position: absolute;
  width: 38px;
  height: 38px;
  border: 1px solid rgba(79, 70, 229, 0.4);
  border-radius: 50%;
  border-bottom-color: transparent;
  animation: rotate-shield 4s linear infinite reverse;
}

@keyframes rotate-shield {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes fab-pulse {
  0% { transform: scale(1); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.7); }
  50% { transform: scale(1.05); box-shadow: 0 20px 50px rgba(0, 0, 0, 0.9), 0 0 30px rgba(0, 229, 255, 0.3); }
  100% { transform: scale(1); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.7); }
}

.panic-glow {
  background: rgba(239, 68, 68, 0.3) !important;
  border-color: rgba(239, 68, 68, 0.8) !important;
  box-shadow: 0 0 50px rgba(239, 68, 68, 0.6) !important;
}

.panic-icon-anim {
  animation: shake 0.3s infinite;
}

.fab-orbit {
  position: absolute;
  width: 140%;
  height: 140%;
  border: 1px dashed rgba(0, 229, 255, 0.1);
  border-radius: 50%;
  animation: rotate-shield 12s linear infinite;
  z-index: 0;
}

@keyframes shake {
  0%, 100% { transform: translate(0, 0); }
  25% { transform: translate(-2px, 2px); }
  50% { transform: translate(2px, -2px); }
  75% { transform: translate(-2px, -2px); }
}

/* HUD 气泡 - 基础样式 */
.hud-bubble {
  position: absolute;
  bottom: 85px;
  background: rgba(18, 18, 23, 0.98);
  backdrop-filter: blur(15px);
  padding: 14px 24px;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 1), 0 0 0 1px rgba(255, 255, 255, 0.15);
  opacity: 0;
  transition: all 0.5s cubic-bezier(0.19, 1, 0.22, 1);
  pointer-events: none;
  z-index: 2000;

  // 默认居中样式
  &.placement-center {
    left: 50%;
    transform: translateX(-50%) translateY(10px) scale(0.9);
    &.hud-visible { transform: translateX(-50%) translateY(0) scale(1); opacity: 1; }
    .hud-arrow { left: 50%; margin-left: -7px; }
  }

  // 左对齐样式 (靠近屏幕左侧时)
  &.placement-left {
    left: 0;
    transform: translateX(0) translateY(10px) scale(0.9);
    &.hud-visible { transform: translateX(0) translateY(0) scale(1); opacity: 1; }
    .hud-arrow { left: 24px; }
  }

  // 右对齐样式 (靠近屏幕右侧时)
  &.placement-right {
    right: 0;
    transform: translateX(0) translateY(10px) scale(0.9);
    &.hud-visible { transform: translateX(0) translateY(0) scale(1); opacity: 1; }
    .hud-arrow { right: 24px; }
  }
}

.hud-text {
  color: #fff;
  font-size: 14px;
  font-weight: 900;
  white-space: nowrap;
  letter-spacing: 1.5px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.hud-arrow {
  position: absolute;
  bottom: -6px;
  width: 14px;
  height: 14px;
  background: rgba(18, 18, 23, 0.98);
  transform: rotate(45deg);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
</style>
