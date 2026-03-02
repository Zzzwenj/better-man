<template>
  <view class="cyber-ad-card flex-col align-stretch" hover-class="card-hover">
    <view class="card-cover-wrap">
      <!-- uni-ad 原生定制展示组件 -->
      <ad-custom 
        :adpid="adpid" 
        @load="onAdLoad" 
        @error="onAdError" 
        class="native-ad-unit"
      ></ad-custom>
      
      <!-- 叙事化蒙层：当广告未加载完成时显示 -->
      <view v-if="!isLoaded" class="card-cover-placeholder flex items-center justify-center">
        <view class="loading-ripple"></view>
        <text class="placeholder-text mt-4">能量信号扫描中...</text>
      </view>

      <view class="card-badge ad-tag">外来信号 [AD]</view>
    </view>
    <view class="card-content">
      <text class="card-title block">外部能量注入协议</text>
      <view class="card-meta flex items-center mt-2">
        <text class="meta-item">来源：突触外网</text>
        <text class="meta-divider">·</text>
        <text class="meta-item">风险等级：低</text>
      </view>
    </view>
    
    <!-- 设计感底部装饰线 -->
    <view class="ad-glitch-line"></view>
  </view>
</template>

<script setup>
/**
 * @component CyberAdCard
 * @description 符合 Rewire 视觉规范的原生广告卡片，用于注入到 Feed 流中。
 */
import { ref } from 'vue'

const props = defineProps({
  adpid: {
    type: String,
    default: '1111111111' // 需替换为真实的原生广告位 ID
  }
})

const isLoaded = ref(false)

const onAdLoad = (e) => {
  console.log('[AdCard] 广告加载成功:', e)
  isLoaded.value = true
}

const onAdError = (e) => {
  console.error('[AdCard] 广告加载失败:', e)
  isLoaded.value = false
}
</script>

<style lang="scss" scoped>
.cyber-ad-card {
  background: #18181b;
  border: 1px solid #27272a;
  border-radius: 20px;
  margin-bottom: 24px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  position: relative;
}

.card-hover {
  transform: translateY(-4px) scale(1.01);
  border-color: #f59e0b; // 使用警告色/能量色作为外来信号区分
  box-shadow: 0 12px 30px rgba(245, 158, 11, 0.15);
}

.card-cover-wrap {
  width: 100%;
  height: 200px; // 原生广告预留稍高位置
  position: relative;
  background: #09090b;
}

.native-ad-unit {
  width: 100%;
  height: 100%;
}

.card-cover-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #09090b;
  z-index: 2;
}

.loading-ripple {
  width: 30px;
  height: 30px;
  border: 2px solid #f59e0b;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.placeholder-text {
  font-family: monospace;
  font-size: 10px;
  color: #f59e0b;
  opacity: 0.6;
  letter-spacing: 2px;
}

.card-badge.ad-tag {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 10px;
  background: rgba(245, 158, 11, 0.2);
  backdrop-filter: blur(8px);
  border-radius: 8px;
  font-size: 10px;
  font-weight: 900;
  color: #fbbf24;
  letter-spacing: 1px;
  border: 1px solid rgba(245, 158, 11, 0.5);
  z-index: 3;
}

.card-content {
  padding: 16px;
}

.card-title {
  font-size: 14px;
  font-weight: bold;
  color: #a1a1aa;
  font-family: monospace;
}

.card-meta {
  font-family: monospace;
}

.meta-item {
  font-size: 10px;
  color: #52525b;
}

.meta-divider {
  font-size: 10px;
  color: #27272a;
  margin: 0 6px;
}

.ad-glitch-line {
  height: 2px;
  width: 100%;
  background: repeating-linear-gradient(
    90deg,
    #f59e0b,
    #f59e0b 2px,
    transparent 2px,
    transparent 6px
  );
  opacity: 0.3;
}

// 基础原子类复用
.flex-col { display: flex; flex-direction: column; }
.align-stretch { align-items: stretch; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
.mt-2 { margin-top: 8px; }
.mt-4 { margin-top: 16px; }
.block { display: block; }
</style>
