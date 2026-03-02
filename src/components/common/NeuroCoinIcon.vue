<template>
  <view class="neuro-coin-wrapper" :style="{ width: size + 'px', height: size + 'px' }">
    <image :src="svgData" class="neuro-coin-svg" mode="aspectFit" />
  </view>
</template>

<script setup>
/**
 * @component NeuroCoinIcon
 * @description 神经币原生图标(SVG)组件，全局通用资产显示。提供大小可配置参数。
 * 兼容性说明：已重构为 Data URI 模式以支持真机调试。
 */

const props = defineProps({
  size: {
    type: [Number, String],
    default: 24
  }
})

// 赛博硬币 SVG 模板
const svgContent = `
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    <linearGradient id="cyberGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#8b5cf6" />
      <stop offset="50%" stop-color="#7c3aed" />
      <stop offset="100%" stop-color="#00e5ff" />
    </linearGradient>
    <linearGradient id="borderGrad" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#a855f7" />
      <stop offset="50%" stop-color="#e879f9" />
      <stop offset="100%" stop-color="#3b82f6" />
    </linearGradient>
  </defs>
  <g filter="url(#neonGlow)">
    <polygon points="25,5 75,5 95,25 95,75 75,95 25,95 5,75 5,25" fill="none" stroke="url(#borderGrad)" stroke-width="6" />
    <polygon points="32,12 68,12 88,32 88,68 68,88 32,88 12,68 12,32" fill="none" stroke="#00e5ff" stroke-width="1.5" stroke-dasharray="8,4" />
    <polygon points="35,18 65,18 82,35 82,65 65,82 35,82 18,65 18,35" fill="url(#cyberGrad)" opacity="0.8" />
    <g>
      <circle cx="50" cy="50" r="8" fill="#fff" />
      <path d="M 50,42 L 50,25 M 50,58 L 50,75 M 42,50 L 25,50 M 58,50 L 75,50 M 44,44 L 32,32 M 56,56 L 68,68 M 44,56 L 32,68 M 56,44 L 68,32" stroke="#fff" stroke-width="2.5" stroke-linecap="round" />
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
`;

const svgData = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgContent.trim())}`;
</script>

<style scoped>
.neuro-coin-wrapper {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  /* 整个图标加入呼吸和旋转动画以弥补内层动画的丧失 */
  animation: corePulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
.neuro-coin-svg {
  width: 100%;
  height: 100%;
}

@keyframes corePulse {
  0%, 100% { transform: scale(1); opacity: 1; filter: drop-shadow(0 0 0px transparent); }
  50% { transform: scale(0.92); opacity: 0.9; filter: drop-shadow(0 0 8px var(--theme-shadow-primary)); }
}
</style>
