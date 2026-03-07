<template>
  <view v-if="activeBattle" class="battle-bar-container mx-4 mt-2" @click="goToBattle" hover-class="bar-hover">
    <view class="bar-sweep"></view>
    <view class="flex items-center justify-between z-10">
      <view class="flex items-center">
        <view class="status-dot-pulse"></view>
        <view class="ml-2 flex-col">
          <text class="battle-tag">正在进行的血契战役</text>
          <text class="battle-name">{{ activeBattle.name }}</text>
        </view>
      </view>
      <view class="timer-wrap flex-col items-end">
        <text class="timer-label">剩余生命时长</text>
        <text class="timer-val">{{ countdownText }}</text>
      </view>
    </view>
    <view class="progress-underlay">
      <view class="progress-fill" :style="{ width: progressWidth + '%' }"></view>
    </view>
  </view>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useWarzoneStore } from '../../store/warzone.js'
import { serverTime } from '@/utils/serverTime.js'

const warzoneStore = useWarzoneStore()
const countdownText = ref('00:00:00')
const progressWidth = ref(100)
let timer = null

const activeBattle = computed(() => {
  if (!warzoneStore.activeDeathMatchId) return null
  return warzoneStore.deathMatches.find(m => m.id === warzoneStore.activeDeathMatchId)
})

const updateCountdown = () => {
  if (!activeBattle.value || !activeBattle.value.expiryTime) return
  
  // 使用服务端校准时间，防止本地调表影响战区倒计时
  const now = serverTime.now()
  const expiry = activeBattle.value.expiryTime
  const total = 6 * 3600 * 1000 
  const diff = expiry - now
  
  if (diff <= 0) {
    countdownText.value = '战役已终结'
    progressWidth.value = 0
    return
  }
  
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  const s = Math.floor((diff % 60000) / 1000)
  
  countdownText.value = `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`
  progressWidth.value = Math.max(0, Math.min(100, (diff / total) * 100))
}

const goToBattle = () => {
  if (activeBattle.value) {
    uni.vibrateShort()
    uni.navigateTo({ url: `/pages/war-room/death-match?id=${activeBattle.value.id}` })
  }
}

onMounted(() => {
  updateCountdown()
  timer = setInterval(updateCountdown, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style lang="scss" scoped>
.battle-bar-container {
  background: rgba(239, 68, 68, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(239, 68, 68, 0.25);
  border-radius: 12px;
  padding: 14px 16px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.bar-sweep {
  position: absolute;
  top: 0; left: -100%;
  width: 100%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(239, 68, 68, 0.1), transparent);
  animation: bar-sweep 6s infinite;
  z-index: 1;
}

@keyframes bar-sweep {
  0% { left: -100%; }
  20% { left: 100%; }
  100% { left: 100%; }
}

.bar-hover {
  background: rgba(239, 68, 68, 0.1);
  transform: translateY(-2px);
  border-color: rgba(239, 68, 68, 0.5);
}

.status-dot-pulse {
  width: 8px;
  height: 8px;
  background: #ffffff;
  border-radius: 50%;
  box-shadow: 0 0 12px #ef4444, 0 0 4px #ef4444;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 1; box-shadow: 0 0 12px #ef4444; }
  50% { transform: scale(1.4); opacity: 0.6; box-shadow: 0 0 20px #ef4444; }
  100% { transform: scale(1); opacity: 1; box-shadow: 0 0 12px #ef4444; }
}

.battle-tag {
  font-size: 10px;
  color: #ef4444;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-weight: 900;
}

.battle-name {
  font-size: 14px;
  color: #ffffff;
  font-weight: 800;
  margin-top: 2px;
}

.timer-wrap {
  text-align: right;
  z-index: 10;
}

.timer-label {
  font-size: 9px;
  color: #a1a1aa;
  text-transform: uppercase;
}

.timer-val {
  font-size: 18px;
  font-family: monospace;
  color: #ef4444;
  font-weight: 900;
  text-shadow: 0 0 12px rgba(239, 68, 68, 0.6);
}

.progress-underlay {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: rgba(255, 255, 255, 0.05);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #ef4444, #991b1b);
  box-shadow: 0 0 8px #ef4444;
  transition: width 1s linear;
}

.flex { display: flex; }
.flex-col { display: flex; flex-direction: column; }
.items-center { align-items: center; }
.items-end { align-items: flex-end; }
.justify-between { justify-content: space-between; }
.ml-2 { margin-left: 8px; }
.mt-2 { margin-top: 8px; }
.mx-4 { margin: 0 20px; }
</style>
