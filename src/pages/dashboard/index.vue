<template>
  <view class="container flex-col">
    <!-- 顶部状态栏 -->
    <view class="header flex justify-between items-center px-4">
      <view>
        <text class="title tracking-wider">觉醒空间</text>
        <text class="subtitle block mt-1">神经元重塑计划 v1.0</text>
      </view>
      <view class="user-chip flex items-center justify-center">
        <text class="chip-dot"></text>
        <text class="chip-text ml-1">#8972</text>
      </view>
    </view>
    
    <!-- 核心专注区域（能量环） -->
    <view class="core-area flex-1 flex-col justify-center items-center">
      <view class="energy-core flex items-center justify-center relative">
        <view class="ring outer-ring"></view>
        <view class="ring inner-ring"></view>
        <view class="core-pulse"></view>
        
        <view class="time-display flex-col items-center z-10">
          <text class="hours-val">{{ hoursClean }}</text>
          <text class="hours-label">已净化小时数</text>
          <view class="level-badge mt-2">
            <text>{{ currentPhase }}</text>
          </view>
        </view>
      </view>

      <view class="ad-banner mt-8 flex justify-center items-center">
        <text class="ad-text">► 观看 30s 神经学短片，获取 1 次『多巴胺强心针』能量</text>
      </view>
    </view>
    
    <!-- 底部紧急阻断按钮 -->
    <view class="action-area px-4 pb-8">
      <view class="panic-btn flex justify-center items-center" hover-class="panic-hover" @click="triggerPanic">
        <text class="panic-icon mr-2">⚠️</text>
        <text class="panic-text">紧急干预系统</text>
      </view>
      <text class="panic-hint block mt-3 text-center">渴求来袭？点击进入 60秒 强制神经阻断</text>
    </view>

    <!-- 阻断模式全屏覆盖层 (物理干预验证) -->
    <view class="panic-overlay" v-if="isPanicMode">
      <view class="panic-content flex-col items-center justify-center">
        <view class="heartbeat-circle"></view>
        <text class="overlay-title mt-4">系统已强行接管</text>
        <text class="overlay-desc mt-2 px-4 text-center">将手机放于地面。用鼻尖触碰下方按钮，\n完成俯卧撑验证，转化生理多巴胺。</text>
        <text class="overlay-timer mt-6">{{ timeLeft }}s</text>
        
        <view class="pushup-counter mt-6">
            <text class="pushup-val">{{ completedPushups }}</text>
            <text class="pushup-target"> / {{ requiredPushups }}</text>
        </view>
        
        <view class="verify-btn mt-8 flex items-center justify-center" hover-class="verify-hover" @click="doPushup">
            <text class="verify-text">完成 1 个</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const hoursClean = ref(0)
const currentPhase = ref('Phase I: 生理挣扎')
let timeInterval = null

onMounted(() => {
  let startTimestamp = uni.getStorageSync('neuro_start_date')
  if (!startTimestamp) {
    startTimestamp = Date.now() - (5 * 24 * 60 * 60 * 1000)
    uni.setStorageSync('neuro_start_date', startTimestamp)
  }
  
  const updateTimer = () => {
    const diffMs = Date.now() - startTimestamp
    hoursClean.value = Math.floor(diffMs / (1000 * 60 * 60))
    
    if (hoursClean.value < 72) {
      currentPhase.value = 'Phase I: 生理挣脱'
    } else if (hoursClean.value < 336) {
      currentPhase.value = 'Phase II: 额叶觉醒'
    } else if (hoursClean.value < 1080) {
      currentPhase.value = 'Phase III: 边缘重塑'
    } else {
      currentPhase.value = 'Phase IV: 神经霸体'
    }
  }
  
  updateTimer()
  timeInterval = setInterval(updateTimer, 60000)
})

const isPanicMode = ref(false)
const requiredPushups = ref(20)
const completedPushups = ref(0)
const timeLeft = ref(60)
let panicInterval = null

const triggerPanic = () => {
  isPanicMode.value = true
  completedPushups.value = 0
  timeLeft.value = 60
  
  // 初始强烈震动
  uni.vibrateLong()
  
  if (panicInterval) clearInterval(panicInterval)
  
  panicInterval = setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--
    }
    // 每秒持续施加物理震动压力，加重紧迫感
    uni.vibrateLong()
  }, 1000)
}

const doPushup = () => {
  if (!isPanicMode.value) return
  
  completedPushups.value++
  // 点击时的短促震动反馈
  uni.vibrateShort()
  
  if (completedPushups.value >= requiredPushups.value) {
    // 验证通过，解除接管
    isPanicMode.value = false
    if (panicInterval) clearInterval(panicInterval)
    uni.showToast({
      title: '多巴胺已转化',
      icon: 'success'
    })
  }
}

onUnmounted(() => {
  if (panicInterval) clearInterval(panicInterval)
  if (timeInterval) clearInterval(timeInterval)
})
</script>

<style lang="scss" scoped>
.container {
  height: 100vh;
  background-color: #09090b; /* obsidian black */
  background-image: 
    radial-gradient(circle at 50% 30%, rgba(16, 185, 129, 0.05) 0%, transparent 60%),
    radial-gradient(circle at 100% 100%, rgba(139, 92, 246, 0.05) 0%, transparent 50%);
  display: flex;
  flex-direction: column;
}
.px-4 { padding: 0 20px; }
.pb-8 { padding-bottom: 32px; }
.mt-1 { margin-top: 4px; }
.mt-2 { margin-top: 8px; }
.mt-3 { margin-top: 12px; }
.mt-4 { margin-top: 16px; }
.mt-6 { margin-top: 24px; }
.mt-8 { margin-top: 32px; }
.ml-1 { margin-left: 4px; }
.mr-2 { margin-right: 8px; }
.flex { display: flex; }
.flex-col { display: flex; flex-direction: column; }
.justify-between { justify-content: space-between; }
.justify-center { justify-content: center; }
.items-center { align-items: center; }
.flex-1 { flex: 1; }
.block { display: block; }
.text-center { text-align: center; }
.relative { position: relative; }
.z-10 { z-index: 10; }
.tracking-wider { letter-spacing: 4px; }

/* 顶部状态栏 */
.header {
  padding-top: calc(var(--status-bar-height) + 20px);
}
.title { font-size: 24px; font-weight: 900; color: #10b981; text-shadow: 0 0 15px rgba(16, 185, 129, 0.4); }
.subtitle { font-size: 11px; color: #71717a; letter-spacing: 1px;}
.user-chip { 
  background: rgba(255,255,255,0.05); 
  border: 1px solid rgba(255,255,255,0.1); 
  padding: 4px 10px; 
  border-radius: 12px;
  backdrop-filter: blur(10px);
}
.chip-dot { width: 6px; height: 6px; border-radius: 3px; background-color: #10b981; box-shadow: 0 0 8px #10b981;}
.chip-text { font-size: 12px; color: #a1a1aa; font-family: monospace;}

/* 核心能量环 */
.energy-core {
  width: 280px;
  height: 280px;
}
.ring {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  border-radius: 50%;
  border: 1px solid transparent;
}
.outer-ring {
  border-top-color: rgba(16, 185, 129, 0.3);
  border-bottom-color: rgba(139, 92, 246, 0.3);
  animation: spin 15s linear infinite;
}
.inner-ring {
  margin: 15px;
  border-left-color: rgba(16, 185, 129, 0.6);
  border-right-color: rgba(16, 185, 129, 0.2);
  animation: spin-reverse 10s linear infinite;
}
.core-pulse {
  position: absolute;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%);
  animation: pulse 4s ease-in-out infinite;
}
@keyframes spin { 100% { transform: rotate(360deg); } }
@keyframes spin-reverse { 100% { transform: rotate(-360deg); } }
@keyframes pulse {
  0%, 100% { transform: scale(0.9); opacity: 0.5; }
  50% { transform: scale(1.1); opacity: 1; }
}

.time-display {
  text-align: center;
}
.hours-val {
  font-size: 72px;
  font-weight: 900;
  color: #fff;
  font-family: 'Courier New', Courier, monospace;
  text-shadow: 0 0 30px rgba(16, 185, 129, 0.6);
  line-height: 1;
}
.hours-label {
  font-size: 14px;
  color: #10b981;
  letter-spacing: 3px;
  font-weight: bold;
}
.level-badge {
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.4);
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  color: #e4e4e7;
}

/* 广告横幅 */
.ad-banner {
  background: rgba(255, 255, 255, 0.03);
  border: 1px dashed rgba(255, 255, 255, 0.1);
  padding: 12px 20px;
  border-radius: 12px;
  margin: 32px 20px 0;
  backdrop-filter: blur(5px);
}
.ad-text {
  color: #a1a1aa;
  font-size: 12px;
}

/* 紧急阻断按钮 */
.panic-btn {
  background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
  height: 60px;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(239, 68, 68, 0.3), inset 0 2px 0 rgba(255, 255, 255, 0.2);
  transition: all 0.2s;
  border: 1px solid #7f1d1d;
}
.panic-hover {
  transform: translateY(2px) scale(0.98);
  box-shadow: 0 5px 15px rgba(239, 68, 68, 0.4);
}
.panic-icon { font-size: 20px; }
.panic-text {
  color: #fff;
  font-size: 18px;
  font-weight: 900;
  letter-spacing: 2px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}
.panic-hint {
  font-size: 12px;
  color: #71717a;
}

/* 阻断模式全屏覆盖层 */
.panic-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: #000;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
}
.panic-content {
  text-align: center;
}
.heartbeat-circle {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: radial-gradient(circle, #ef4444 0%, transparent 70%);
  animation: heartbeat 1s ease-in-out infinite;
}
@keyframes heartbeat {
  0%, 100% { transform: scale(1); opacity: 0.5; }
  15% { transform: scale(1.3); opacity: 1; }
  30% { transform: scale(1); opacity: 0.5; }
  45% { transform: scale(1.3); opacity: 1; }
}
.overlay-title { font-size: 24px; color: #ef4444; font-weight: bold; letter-spacing: 4px;}
.overlay-desc { color: #fff; font-size: 14px; margin-top: 12px; line-height: 1.5; color: #a1a1aa;}
.overlay-timer { font-size: 64px; font-family: monospace; color: #ef4444; font-weight: 900; margin-top: 20px;}

.pushup-counter {
  background: rgba(239, 68, 68, 0.1);
  padding: 10px 40px;
  border-radius: 30px;
  border: 1px solid rgba(239, 68, 68, 0.3);
}
.pushup-val { font-size: 40px; font-weight: 900; color: #fff; font-family: monospace; }
.pushup-target { font-size: 20px; color: #ef4444; font-weight: bold; font-family: monospace; }

.verify-btn {
  width: 220px;
  height: 64px;
  border-radius: 32px;
  background: #ef4444;
  box-shadow: 0 10px 30px rgba(239, 68, 68, 0.4), inset 0 2px 0 rgba(255, 255, 255, 0.2);
  background-image: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
  transition: all 0.1s;
}
.verify-hover {
  transform: scale(0.95);
  box-shadow: 0 5px 15px rgba(239, 68, 68, 0.5);
}
.verify-text { font-size: 18px; color: #fff; font-weight: 900; letter-spacing: 2px;}
</style>
