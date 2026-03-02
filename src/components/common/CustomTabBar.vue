<template>
  <view class="custom-tab-bar">
    <view 
      v-for="(item, index) in list" 
      :key="index"
      class="tab-item"
      :class="{ 'active': current === index }"
      @click="switchTab(index, item.pagePath)"
    >
      <view class="icon-wrapper" :class="{ 'bounce': isAnimating === index }">
        <image :src="getIconData(index)" class="tab-icon" mode="aspectFit" />
      </view>
      <text class="tab-text">{{ item.text }}</text>
    </view>
  </view>
</template>

<script setup>
/**
 * @component CustomTabBar
 * @description 全局底部自定义导航栏组件，负责主页、战区、图谱、系统页面的路由分发与高亮状态控制。
 */

import { ref } from 'vue'
import { useThemeStore } from '../../store/theme.js'

const themeStore = useThemeStore()
const props = defineProps({
  current: {
    type: Number,
    default: 0
  }
})

const isAnimating = ref(-1)

const list = [
  { pagePath: '/pages/dashboard/index', text: '主控' },
  { pagePath: '/pages/war-room/index', text: '战区' },
  { pagePath: '/pages/journey/index', text: '图谱' },
  { pagePath: '/pages/profile/index', text: '系统' }
]

const getIconData = (index) => {
  const isActive = props.current === index;
  const primary = isActive ? themeStore.activeThemeData.primary : '#71717a';
  const bg = isActive ? (themeStore.activeThemeData.bgHighlight || `rgba(0, 229, 255, 0.1)`) : 'none';
  
  const iconTemplates = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2L22 7V17L12 22L2 17V7L12 2Z" fill="${bg}" stroke="${primary}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="12" r="3" fill="${isActive ? primary : 'none'}" stroke="${primary}"/><path d="M12 15V19 M12 5V9 M5 8L8 10 M19 16L16 14 M5 16L8 14 M19 8L16 10" stroke="${primary}"/></svg>`,
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="${bg}" stroke="${primary}" stroke-width="1.5"/><circle cx="12" cy="12" r="4" fill="${isActive ? primary : 'none'}" stroke="${primary}"/><path d="M12 2v6 M12 16v6 M2 12h6 M16 12h6" stroke="${primary}"/><path d="M4.93 4.93l4.24 4.24 M14.83 14.83l4.24 4.24 M4.93 19.07l4.24-4.24 M14.83 9.17l4.24-4.24" stroke="${primary}"/></svg>`,
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M2 12h4l3-9 5 18 3-9h5" stroke="${primary}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="3" y="3" width="18" height="18" rx="2" fill="${bg}" stroke="${isActive ? 'transparent' : '#71717a'}" stroke-dasharray="2 2"/>${isActive ? `<circle cx="12" cy="12" r="2" fill="${primary}"/>` : ''}</svg>`,
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="1" fill="${bg}" stroke="${primary}" stroke-width="1.5"/><path d="M9 6V2 M15 6V2 M9 22v-4 M15 22v-4 M6 9H2 M6 15H2 M22 9h-4 M22 15h-4" stroke="${primary}" stroke-width="1.5" stroke-linecap="round"/><circle cx="12" cy="12" r="2" fill="${isActive ? primary : 'none'}" stroke="${primary}"/></svg>`
  ];
  
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(iconTemplates[index])}`;
}

const switchTab = (index, url) => {
  if (props.current === index) return
  
  // 立即触发点击动画类
  isAnimating.value = index
  uni.vibrateShort()
  
  // 无延迟立刻抛出跳转，避免卡顿。动画将由 Vue 在卸载前/新页面挂载后依靠 CSS 弥补
  uni.switchTab({ url })
  
  // 动画状态清理
  setTimeout(() => {
    if (isAnimating.value === index) isAnimating.value = -1
  }, 400)
}
</script>

<style scoped>
.custom-tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: calc(56px + env(safe-area-inset-bottom));
  padding-bottom: env(safe-area-inset-bottom);
  background: rgba(9, 9, 11, 0.85); /* 极度深渊黑带微透明 */
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  display: flex;
  justify-content: space-around;
  align-items: center;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.5);
  z-index: 999;
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 25%;
  height: 56px;
  position: relative;
}

.icon-wrapper {
  width: 26px;
  height: 26px;
  margin-bottom: 4px;
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.tab-icon {
  width: 100%;
  height: 100%;
  transition: all 0.3s ease;
}

.tab-text {
  font-size: 10px;
  color: #71717a;
  font-weight: 500;
  transition: all 0.3s ease;
  letter-spacing: 1px;
}

/* 激活态光效 */
.tab-item.active .tab-text {
  color: var(--theme-primary);
  text-shadow: 0 0 10px var(--theme-shadow-primary);
}

.tab-item.active .icon-wrapper {
  transform: translateY(-2px);
  filter: drop-shadow(0 0 8px var(--theme-shadow-primary));
}

/* 独立弹簧动画序列 */
@keyframes springBounce {
  0% { transform: scale(1); }
  30% { transform: scale(0.65); filter: drop-shadow(0 0 15px var(--theme-shadow-primary)); }
  60% { transform: scale(1.25); }
  100% { transform: scale(1) translateY(-2px); }
}

.bounce {
  animation: springBounce 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}
</style>
