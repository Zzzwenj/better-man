<template>
  <view class="neuro-coin-wrapper" :style="{ width: size + 'px', height: size + 'px' }">
    <svg viewBox="0 0 100 100" class="neuro-coin-svg" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- 赛博荧光滤镜 -->
        <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <!-- 内部电路纹理渐变 -->
        <linearGradient id="cyberGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#8b5cf6" />
          <stop offset="50%" stop-color="#7c3aed" />
          <stop offset="100%" stop-color="#00e5ff" />
        </linearGradient>

        <!-- 边框金属反光渐变 -->
        <linearGradient id="borderGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#a855f7" />
          <stop offset="50%" stop-color="#e879f9" />
          <stop offset="100%" stop-color="#3b82f6" />
        </linearGradient>
      </defs>

      <!-- 外层发光核心组 -->
      <g filter="url(#neonGlow)">
        <!-- 基础八边形底座 (去除原本深黑色，强化金属环感) -->
        <polygon 
          points="25,5 75,5 95,25 95,75 75,95 25,95 5,75 5,25" 
          fill="none" 
          stroke="url(#borderGrad)" 
          stroke-width="6"
        />
        
        <!-- 内层加密数据环 (冰蓝) -->
        <polygon 
          points="32,12 68,12 88,32 88,68 68,88 32,88 12,68 12,32" 
          fill="none" 
          stroke="#00e5ff" 
          stroke-width="1.5" 
          stroke-dasharray="8,4" 
          class="spin-slow"
          style="transform-origin: 50% 50%"
        />

        <!-- 核心底色 (赛博渐变) -->
        <polygon 
          points="35,18 65,18 82,35 82,65 65,82 35,82 18,65 18,35" 
          fill="url(#cyberGrad)" 
          opacity="0.8"
        />

        <!-- 中心的神经元突触 (Synapse) 几何体 -->
        <g class="pulse-core">
          <!-- 主节点 -->
          <circle cx="50" cy="50" r="8" fill="#fff" />
          <!-- 延展神经突触线条 -->
          <path d="M 50,42 L 50,25 M 50,58 L 50,75 M 42,50 L 25,50 M 58,50 L 75,50 M 44,44 L 32,32 M 56,56 L 68,68 M 44,56 L 32,68 M 56,44 L 68,32" stroke="#fff" stroke-width="2.5" stroke-linecap="round" />
          <!-- 端点突触囊泡 -->
          <circle cx="50" cy="25" r="3" fill="#00e5ff" />
          <circle cx="50" cy="75" r="3" fill="#00e5ff" />
          <circle cx="25" cy="50" r="3" fill="#00e5ff" />
          <circle cx="75" cy="50" r="3" fill="#00e5ff" />
          <circle cx="32" cy="32" r="2.5" fill="#facc15" />
          <circle cx="68" cy="68" r="2.5" fill="#facc15" />
          <circle cx="32" cy="68" r="2.5" fill="#facc15" />
          <circle cx="68" cy="32" r="2.5" fill="#facc15" />
        </g>
      </g>
    </svg>
  </view>
</template>

<script setup>
/**
 * @component NeuroCoinIcon
 * @description 神经币原生图标(SVG)组件，全局通用资产显示。提供大小可配置参数。
 */

defineProps({
  size: {
    type: [Number, String],
    default: 24
  }
})
</script>

<style scoped>
.neuro-coin-wrapper {
  display: inline-flex;
  justify-content: center;
  align-items: center;
}
.neuro-coin-svg {
  width: 100%;
  height: 100%;
}

/* 轨道自转变异动画 */
.spin-slow {
  animation: spin 10s linear infinite;
}
@keyframes spin {
  100% { transform: rotate(360deg); }
}

/* 核心突触如同心脏一样的脉动 */
.pulse-core {
  animation: corePulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  transform-origin: 50% 50%;
}
@keyframes corePulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(0.85); opacity: 0.8; }
}
</style>
