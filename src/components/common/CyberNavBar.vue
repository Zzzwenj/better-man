<!-- src/components/common/CyberNavBar.vue -->
<template>
  <view class="cyber-nav-container" :class="{ 'with-blur': blur }" :style="{ paddingTop: statusBarHeight + 'px' }">
    <view class="cyber-nav-content flex items-center justify-between px-4">
      <view class="nav-left flex items-center" @click="handleBack">
        <view v-if="showBack" class="back-btn flex items-center justify-center p-2" hover-class="back-hover">
          <text class="back-icon">←</text>
        </view>
        <slot name="left"></slot>
      </view>
      
      <view class="nav-center flex-1 flex justify-center items-center">
        <text v-if="title" class="nav-title">{{ title }}</text>
        <slot name="center" v-else></slot>
      </view>
      
      <view class="nav-right flex items-center justify-end">
        <slot name="right"></slot>
      </view>
    </view>
  </view>
</template>

<script setup>
/**
 * @component CyberNavBar
 * @description 全局赛博朋克风格顶部导航栏组件。负责处理刘海屏安全区避让、统一定义返回行为和标题渲染。
 */
import { ref } from 'vue'

const props = defineProps({
  title: { type: String, default: '' },
  showBack: { type: Boolean, default: true },
  blur: { type: Boolean, default: true },
  customBack: { type: Function, default: null }
})

const sysInfo = uni.getSystemInfoSync()
const statusBarHeight = ref(sysInfo.statusBarHeight || 20) // default 20 if failed

const handleBack = () => {
  if (!props.showBack) return
  if (props.customBack) {
    props.customBack()
  } else {
    const pages = getCurrentPages()
    if (pages.length > 1) {
      uni.navigateBack()
    } else {
      uni.switchTab({ url: '/pages/dashboard/index' })
    }
  }
}
</script>

<style lang="scss" scoped>
.cyber-nav-container {
  width: 100%;
  position: sticky;
  top: 0;
  z-index: 100;
  box-sizing: border-box;
  transition: background-color 0.3s;
}

.cyber-nav-container.with-blur {
  background: rgba(9, 9, 11, 0.65);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
}

.cyber-nav-content {
  height: 44px; /* Standard nav bar height */
  width: 100%;
  box-sizing: border-box;
}

.px-4 { padding: 0 16px; }
.flex { display: flex; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.justify-center { justify-content: center; }
.justify-end { justify-content: flex-end; }
.flex-1 { flex: 1; }
.p-2 { padding: 8px; }

.nav-left, .nav-right {
  min-width: 60px;
}

.back-btn {
  border-radius: 50%;
  transition: all 0.2s;
  margin-left: -8px; /* Offset padding to align visually */
}

.back-hover {
  background: rgba(255, 255, 255, 0.1);
}

.back-icon {
  font-size: 20px;
  color: #e4e4e7;
  font-weight: bold;
}

.nav-title {
  font-size: 16px;
  font-weight: bold;
  color: #fff;
  letter-spacing: 1px;
  font-family: monospace;
  text-shadow: 0 0 10px rgba(0, 229, 255, 0.3);
}
</style>
