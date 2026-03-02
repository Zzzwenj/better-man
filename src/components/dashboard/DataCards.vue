<template>
  <view class="data-cards flex justify-between mt-8 px-4 w-full">
    <view class="data-card flex-col items-center" hover-class="card-hover">
      <view class="glass-bg"></view>
      <view class="light-sweep"></view>
      <text class="data-val">{{ hoursSaved }}h</text>
      <text class="data-label mt-1">夺回专注力</text>
    </view>
    <view class="data-card flex-col items-center" hover-class="card-hover">
      <view class="glass-bg"></view>
      <view class="light-sweep delayed-sweep"></view>
      <text class="data-val">{{ dopamineIndex }}%</text>
      <text class="data-label mt-1">多巴胺修复率</text>
    </view>
  </view>
</template>

<script setup>
import { defineProps } from 'vue'

const props = defineProps({
  hoursSaved: {
    type: Number,
    default: 0
  },
  dopamineIndex: {
    type: Number,
    default: 0
  }
})
</script>

<style lang="scss" scoped>
.w-full { width: 100%; box-sizing: border-box; }
.px-4 { padding: 0 20px; }
.mt-8 { margin-top: 32px; }
.mt-1 { margin-top: 4px; }
.flex { display: flex; }
.flex-col { display: flex; flex-direction: column; }
.justify-between { justify-content: space-between; }
.items-center { align-items: center; }

.data-cards { gap: 16px; }

.data-card {
  flex: 1;
  position: relative;
  background: rgba(255, 255, 255, 0.03); 
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1); 
  border-top-color: rgba(255, 255, 255, 0.2);
  border-left-color: rgba(255, 255, 255, 0.2);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.5),
    inset 0 0 10px rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 22px 0;
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  overflow: hidden;
}

.glass-bg {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: radial-gradient(circle at top left, rgba(255, 255, 255, 0.05) 0%, transparent 50%);
  pointer-events: none;
}

/* 动态扫掠光影 */
.light-sweep {
  position: absolute;
  top: 0; left: -100%;
  width: 50%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transform: skewX(-20deg);
  animation: sweep 4s infinite cubic-bezier(0.4, 0, 0.2, 1);
}

.delayed-sweep { animation-delay: 2s; }

@keyframes sweep {
  0% { left: -100%; }
  50% { left: 200%; }
  100% { left: 200%; }
}

.card-hover {
  transform: translateY(-6px) scale(1.03);
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.6), 0 0 20px rgba(139, 92, 246, 0.2);
  border-color: rgba(139, 92, 246, 0.5);
  background: rgba(255, 255, 255, 0.05);
}

.data-val { 
  font-size: 26px; 
  font-weight: 900; 
  color: #ffffff; 
  font-family: monospace; 
  text-shadow: 0 0 15px rgba(255,255,255,0.4); 
  letter-spacing: 1px;
}

.data-label { 
  font-size: 12px; 
  color: #a1a1aa; 
  letter-spacing: 1px;
  font-weight: 500;
}
</style>
