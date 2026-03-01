<template>
  <view class="dashboard-wrapper" :style="themeStore.themeCssVars">
    <view class="container flex-col">
      <!-- 顶部状态栏 -->
      <view class="header flex justify-between items-center">
        <view class="title-wrap">
          <text class="title tracking-wider">核心中枢</text>
          <text class="subtitle block mt-1">神经元重塑计划 v1.0</text>
        </view>
        <view class="user-chip flex items-center justify-center">
          <text class="chip-dot"></text>
          <text class="chip-text ml-1">#8972</text>
        </view>
      </view>
      
      <!-- 核心专注区域 -->
      <view class="scroll-area flex-1 flex-col">
        <view class="core-area flex-col justify-center items-center mt-4 fade-in-up" style="animation-delay: 0.1s;">
          <EnergyCore :hoursClean="hoursClean" :currentPhase="currentPhase" />
          <view class="fade-in-up" style="animation-delay: 0.2s; width: 100%;">
            <DataCards :hoursSaved="hoursSaved" :dopamineIndex="dopamineIndex" />
          </view>
          <view class="quote-wrapper mt-4 px-4 fade-in-up" style="animation-delay: 0.3s; width: 100%;">
            <MotivationalQuote />
          </view>
        </view>
        
        <!-- 底部紧急阻断按钮 -->
        <view class="action-area px-4 pb-8 fade-in-up" style="animation-delay: 0.4s;">
          <view class="panic-btn flex justify-center items-center" hover-class="panic-hover" @click="triggerPanic">
            <text class="panic-icon mr-2">⚠️</text>
            <text class="panic-text">紧急干预系统</text>
            <view class="btn-ripple"></view>
          </view>
          <text class="panic-hint block mt-3 text-center">渴求来袭？点击进入 60秒 强制神经阻断</text>
        </view>
      </view>

      <!-- 阻断模式全屏覆盖层 -->
      <PanicOverlay 
        :show="isPanicMode" 
        :currentIntervention="currentIntervention"
        :timeLeft="timeLeft"
        :completedActions="completedActions"
        @doAction="doAction"
      />
    </view>

    <CustomTabBar :current="0" />
  </view>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import MotivationalQuote from '../../components/dashboard/MotivationalQuote.vue'
import CustomTabBar from '../../components/common/CustomTabBar.vue'
import EnergyCore from '../../components/dashboard/EnergyCore.vue'
import DataCards from '../../components/dashboard/DataCards.vue'
import PanicOverlay from '../../components/dashboard/PanicOverlay.vue'
import { useThemeStore } from '../../store/theme.js'

const themeStore = useThemeStore()

const hoursClean = ref(0)
const hoursSaved = ref(0)
const dopamineIndex = ref(0)
const currentPhase = ref('Phase I: 生理挣脱')
let timeInterval = null

onMounted(() => {
  uni.hideTabBar()
  
  // 拦截鉴权
  const token = uni.getStorageSync('uni_id_token')
  if (!token) {
    uni.redirectTo({ url: '/pages/login/index' })
    return
  }

  let startTimestamp = uni.getStorageSync('neuro_start_date')
  if (!startTimestamp) {
    startTimestamp = Date.now() - (5 * 24 * 60 * 60 * 1000)
    uni.setStorageSync('neuro_start_date', startTimestamp)
  }
  
  const updateTimer = () => {
    const diffMs = Date.now() - startTimestamp
    const totalHours = Math.floor(diffMs / (1000 * 60 * 60))
    hoursClean.value = totalHours
    
    hoursSaved.value = Math.floor((totalHours / 24) * 2)
    
    const days = totalHours / 24
    let rate = 10 + (days * 1.5)
    dopamineIndex.value = Math.min(Math.floor(rate), 100)
    
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
const interventions = [
  { name: '🔥 俯卧撑极限验证', desc: '将手机放于地面，用鼻尖触碰下方按钮。\n将多巴胺转化为肌肉撕裂。', target: 20, btnText: '完成 1 个' },
  { name: '🦵 战术深蹲验证', desc: '手持设备，每完成一次标准深蹲\n点击屏幕确认一次。', target: 30, btnText: '完成 1 次' },
  { name: '🧊 冰水物理冷却', desc: '立刻用冷水拍打面部 5 次，\n强制唤醒前额叶理智。', target: 5, btnText: '完成 1 组冷水' },
  { name: '🫁 4-7-8 神经呼吸', desc: '吸气 4 秒，憋气 7 秒，呼气 8 秒。\n完成完整循环极速降低心率。', target: 5, btnText: '完成 1 次循环' }
]

const currentIntervention = ref(interventions[0])
const completedActions = ref(0)
const timeLeft = ref(60)
let panicInterval = null

const triggerPanic = () => {
  isPanicMode.value = true
  completedActions.value = 0
  timeLeft.value = 60
  
  const randomIndex = Math.floor(Math.random() * interventions.length)
  currentIntervention.value = interventions[randomIndex]
  
  uni.vibrateLong()
  
  if (panicInterval) clearInterval(panicInterval)
  
  panicInterval = setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--
    }
    uni.vibrateLong()
  }, 1000)
}

const doAction = () => {
  if (!isPanicMode.value) return
  
  completedActions.value++
  uni.vibrateShort()
  
  if (completedActions.value >= currentIntervention.value.target) {
    isPanicMode.value = false
    if (panicInterval) clearInterval(panicInterval)
    uni.showToast({
      title: '干预解除',
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
page {
  height: 100%;
}

.dashboard-wrapper {
  height: 100%;
  width: 100%;
  overflow: hidden;
  position: relative;
}

.container {
  height: 100%;
  width: 100%;
  overflow-x: hidden;
  background-color: #09090b;
  background-image: 
    radial-gradient(circle at 50% 30%, var(--theme-bg-highlight) 0%, transparent 60%),
    radial-gradient(circle at 100% 100%, rgba(139, 92, 246, 0.05) 0%, transparent 50%);
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  overflow-y: auto;
  padding-bottom: calc(88px + env(safe-area-inset-bottom));
}

/* 进场缓动动画群组 */
.fade-in-up {
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.6s cubic-bezier(0.25, 0.8, 0.25, 1) forwards;
}
.pop-in {
  opacity: 0;
  transform: scale(0.5);
  animation: popIn 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards 0.5s;
}

@keyframes fadeInUp { to { opacity: 1; transform: translateY(0); } }
@keyframes popIn { to { opacity: 1; transform: scale(1); } }

.px-4 { padding: 0 20px; }
.pb-8 { padding-bottom: 32px; padding-top: 20px;}
.mt-1 { margin-top: 4px; }
.mt-3 { margin-top: 12px; }
.mt-4 { margin-top: 16px; }
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
.tracking-wider { letter-spacing: 4px; }

/* 顶部状态栏 */
.header {
  padding: calc(var(--status-bar-height) + 24px) 20px 12px 20px;
  background: rgba(9, 9, 11, 0.65);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  position: sticky;
  top: 0;
  z-index: 50;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
  box-sizing: border-box;
  width: 100%;
}
.title-wrap { animation: fadeInUp 0.5s ease-out forwards; }
.title { font-size: 24px; font-weight: 900; color: var(--theme-primary); text-shadow: 0 0 15px var(--theme-shadow-primary); }
.subtitle { font-size: 11px; color: #a1a1aa; letter-spacing: 1px;}
.user-chip { 
  background: rgba(255,255,255,0.05); 
  border: 1px solid rgba(255,255,255,0.1); 
  padding: 4px 10px; 
  border-radius: 12px;
  backdrop-filter: blur(10px);
  animation: popIn 0.5s ease-out forwards 0.2s;
  opacity: 0;
}
.chip-dot { width: 6px; height: 6px; border-radius: 3px; background-color: var(--theme-primary); box-shadow: 0 0 8px var(--theme-shadow-primary);}
.chip-text { font-size: 12px; color: #e4e4e7; font-family: monospace;}


/* 紧急阻断按钮 */
.action-area { width: 100%; box-sizing: border-box; }
.panic-btn {
  position: relative;
  background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
  height: 60px;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(239, 68, 68, 0.3), inset 0 2px 0 rgba(255, 255, 255, 0.2);
  transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
  border: 1px solid #7f1d1d;
  overflow: hidden;
}
.panic-hover {
  transform: translateY(2px) scale(0.98);
  box-shadow: 0 5px 15px rgba(239, 68, 68, 0.4);
}
.panic-icon { font-size: 20px; z-index: 2; }
.panic-text {
  color: #fff;
  font-size: 18px;
  font-weight: 900;
  letter-spacing: 2px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
  z-index: 2;
}
.btn-ripple {
  position: absolute;
  top: 0; left: -100%;
  width: 50%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  animation: slideRipple 3s infinite;
  z-index: 1;
}
@keyframes slideRipple { 100% { left: 200%; } }

.panic-hint {
  font-size: 12px;
  color: #71717a;
  letter-spacing: 1px;
}

@keyframes fab-pulse {
  0% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.3); opacity: 0; }
  100% { transform: scale(1); opacity: 0; }
}
</style>
