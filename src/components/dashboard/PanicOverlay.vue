<template>
  <view class="panic-overlay" v-if="show" catchtouchmove="preventTouchMove">
    <view class="panic-bg-pulse"></view>
    
    <view class="panic-content flex-col items-center justify-center">
      <!-- 带有故障视效的警告圈 -->
      <view class="warning-ring flex items-center justify-center">
        <view class="heartbeat-circle"></view>
        <text class="warning-icon">!</text>
      </view>
      
      <text class="overlay-title mt-6 glitch-text" data-text="系统已强行接管">系统已强行接管</text>
      
      <!-- 动态显示干预类型 -->
      <view class="intervention-box mt-4 flex-col items-center">
        <text class="intervention-type">{{ currentIntervention.name }}</text>
        <text class="overlay-desc mt-2 text-center">{{ currentIntervention.desc }}</text>
      </view>
      
      <view class="timer-wrapper mt-6 relative">
         <text class="overlay-timer">{{ formattedTimeLeft }}s</text>
      </view>
      
      <view class="pushup-counter mt-6 flex items-baseline">
          <text class="pushup-val">{{ completedActions }}</text>
          <text class="pushup-target"> / {{ currentIntervention.target }}</text>
      </view>
      
      <view class="verify-btn mt-8 flex items-center justify-center" hover-class="verify-hover" @click="emitDoAction">
          <view class="btn-ripple"></view>
          <text class="verify-text">{{ currentIntervention.btnText }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
/**
 * @component PanicOverlay
 * @description 紧急阻断全屏遮罩组件，触发后提供随机物理行为验证并开启 60 秒强制倒计时。
 */

import { computed, defineProps, defineEmits } from 'vue'

const props = defineProps({
  show: Boolean,
  currentIntervention: {
    type: Object,
    default: () => ({ name: '', desc: '', target: 0, btnText: '' })
  },
  timeLeft: Number,
  completedActions: Number
})

const emit = defineEmits(['doAction'])

// 格式化时间保留两位数
const formattedTimeLeft = computed(() => {
  return props.timeLeft.toString().padStart(2, '0')
})

const preventTouchMove = () => {
    // 拦截滚动穿透
}

const emitDoAction = () => {
  emit('doAction')
}
</script>

<style lang="scss" scoped>
.panic-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(9, 9, 11, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease-out;
}

/* 红色压迫感呼吸背景 */
.panic-bg-pulse {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  width: 150vw;
  height: 150vh;
  background: radial-gradient(circle, rgba(220, 38, 38, 0.15) 0%, transparent 60%);
  animation: bgPulse 2s ease-in-out infinite;
  pointer-events: none;
}

.panic-content {
  text-align: center;
  z-index: 10;
  width: 90%;
  max-width: 400px;
}

/* 警告环带点赛博感 */
.warning-ring {
  position: relative;
  width: 100px; height: 100px;
  border-radius: 50%;
  border: 2px dashed rgba(239, 68, 68, 0.5);
  animation: spin 10s linear infinite;
}

.heartbeat-circle {
  position: absolute;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(239, 68, 68, 0.8) 0%, rgba(185, 28, 28, 0.2) 80%);
  animation: heartbeat 1s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.warning-icon {
  position: absolute;
  font-size: 40px;
  color: #fff;
  font-weight: 900;
  text-shadow: 0 0 10px rgba(255,255,255,0.8);
  /* 抵消外层旋转 */
  animation: spin-reverse 10s linear infinite;
}

/* 抖音视效的故障文字 */
.glitch-text {
  font-size: 28px;
  font-weight: 900;
  color: #ef4444;
  letter-spacing: 4px;
  position: relative;
  text-shadow: 2px 2px 10px rgba(239,68,68,0.5);
}

.intervention-box {
  background: rgba(239, 68, 68, 0.05);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 12px;
  padding: 16px;
  width: 100%;
  box-sizing: border-box;
}

.intervention-type { font-size: 20px; color: #fef2f2; font-weight: bold; letter-spacing: 2px;}
.overlay-desc { color: #fca5a5; font-size: 14px; line-height: 1.6;}

.timer-wrapper {
  background: rgba(0,0,0,0.5);
  padding: 10px 30px;
  border-radius: 40px;
  border: 1px solid rgba(255,255,255,0.1);
  box-shadow: inset 0 0 20px rgba(239, 68, 68, 0.2);
}
.overlay-timer { 
  font-size: 72px; 
  font-family: monospace; 
  color: #ef4444; 
  font-weight: 900; 
  text-shadow: 0 0 20px rgba(239,68,68,0.6);
  line-height: 1;
}

.pushup-counter {
  align-items: baseline;
}
.pushup-val { font-size: 48px; font-weight: 900; color: #fff; font-family: monospace; text-shadow: 0 0 10px rgba(255,255,255,0.5);}
.pushup-target { font-size: 24px; color: #ef4444; font-weight: bold; font-family: monospace; margin-left: 8px;}

/* 炫酷打卡按钮 */
.verify-btn {
  position: relative;
  width: 240px;
  height: 64px;
  border-radius: 32px;
  background: linear-gradient(135deg, #ef4444 0%, #991b1b 100%);
  box-shadow: 0 10px 30px rgba(239, 68, 68, 0.4), inset 0 2px 0 rgba(255, 255, 255, 0.3);
  overflow: hidden;
  transition: all 0.2s;
}
.verify-hover {
  transform: scale(0.96);
  box-shadow: 0 5px 15px rgba(239, 68, 68, 0.6);
}
.verify-text { 
  font-size: 18px; 
  color: #fff; 
  font-weight: 900; 
  letter-spacing: 2px;
  z-index: 2;
  text-shadow: 0 2px 4px rgba(0,0,0,0.4);
}

.btn-ripple {
  position: absolute;
  top: 0; left: -100%;
  width: 50%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
  animation: slide 2s infinite;
}

@keyframes fadeIn { from { opacity: 0; transform: scale(1.05); } to { opacity: 1; transform: scale(1); } }
@keyframes slide { 100% { left: 200%; } }
@keyframes bgPulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
@keyframes heartbeat {
  0%, 100% { transform: scale(1); opacity: 0.7; }
  15% { transform: scale(1.4); opacity: 1; }
  30% { transform: scale(1); opacity: 0.7; }
  45% { transform: scale(1.4); opacity: 1; }
}
@keyframes spin { 100% { transform: rotate(360deg); } }
@keyframes spin-reverse { 100% { transform: rotate(-360deg); } }

.flex { display: flex; }
.flex-col { display: flex; flex-direction: column; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
.mt-2 { margin-top: 8px; }
.mt-4 { margin-top: 16px; }
.mt-6 { margin-top: 24px; }
.mt-8 { margin-top: 32px; }
.text-center { text-align: center; }
.relative { position: relative; }
</style>
