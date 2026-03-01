<template>
  <view class="data-cards flex justify-between mt-8 px-4 w-full">
    <view class="data-card flex-col items-center" hover-class="card-hover">
      <view class="glow-bg"></view>
      <text class="data-val">{{ hoursSaved }}h</text>
      <text class="data-label mt-1">夺回专注力</text>
    </view>
    <view class="data-card flex-col items-center" hover-class="card-hover">
      <view class="glow-bg"></view>
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
  background: rgba(255, 255, 255, 0.02); 
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.04); 
  border-bottom: 1px solid rgba(255, 255, 255, 0.02);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  border-radius: 16px;
  padding: 18px 0;
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  overflow: hidden; /* 控制内发光不出界 */
}

.glow-bg {
  position: absolute;
  top: -50%; left: -50%;
  width: 200%; height: 200%;
  background: radial-gradient(circle at 50% 100%, rgba(139, 92, 246, 0.1) 0%, transparent 60%);
  opacity: 0;
  transition: opacity 0.4s ease;
  pointer-events: none;
}

.card-hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.5), 0 0 15px rgba(139, 92, 246, 0.15);
  border-color: rgba(139, 92, 246, 0.3);
}

.card-hover .glow-bg {
  opacity: 1;
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
