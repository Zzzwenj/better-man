<template>
  <view class="container flex-col" :style="themeStore.themeCssVars">
    <!-- 顶部状态栏 -->
    <view class="header flex justify-between items-center">
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
    <view class="core-area flex-1 flex-col justify-center items-center mt-4">
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

      <!-- 新增：具象化数据面板 -->
      <view class="data-cards flex justify-between mt-8 px-4 w-full">
        <view class="data-card flex-col items-center">
          <text class="data-val">{{ hoursSaved }}h</text>
          <text class="data-label mt-1">夺回专注力</text>
        </view>
        <view class="data-card flex-col items-center">
          <text class="data-val">{{ dopamineIndex }}%</text>
          <text class="data-label mt-1">多巴胺修复率</text>
        </view>
      </view>

      <view class="quote-wrapper mt-4 px-4">
        <MotivationalQuote />
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
        
        <!-- 动态显示干预类型 -->
        <text class="intervention-type mt-2">{{ currentIntervention.name }}</text>
        <text class="overlay-desc mt-2 px-4 text-center">{{ currentIntervention.desc }}</text>
        
        <text class="overlay-timer mt-6">{{ timeLeft }}s</text>
        
        <view class="pushup-counter mt-6">
            <text class="pushup-val">{{ completedActions }}</text>
            <text class="pushup-target"> / {{ currentIntervention.target }}</text>
        </view>
        
        <view class="verify-btn mt-8 flex items-center justify-center" hover-class="verify-hover" @click="doAction">
            <text class="verify-text">{{ currentIntervention.btnText }}</text>
        </view>
      </view>
    </view>

    <!-- 平台级原生原生防卡顿悬浮球 -->
    <movable-area class="fab-area">
      <movable-view 
        class="ai-fab flex items-center justify-center" 
        :x="fabX" 
        :y="fabY" 
        direction="all"
        :out-of-bounds="false"
        @click="onFabClick"
      >
        <view class="ai-fab-glow"></view>
        <text class="ai-fab-icon">⎔</text>
      </movable-view>
    </movable-area>

    <!-- 全局接管的自定义波动特效导航栏 -->
    <CustomTabBar :current="0" />
  </view>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import MotivationalQuote from '../../components/MotivationalQuote.vue'
import CustomTabBar from '../../components/CustomTabBar.vue'
import { useThemeStore } from '../../store/theme.js'

const themeStore = useThemeStore()

// FAB 拖拽逻辑原生理代
const sysInfo = uni.getSystemInfoSync()
const fabX = ref(sysInfo.windowWidth - 80)
const fabY = ref(sysInfo.windowHeight - 120)

const onFabClick = () => {
  uni.vibrateShort()
  uni.navigateTo({ url: '/pages/companion/index' })
}

const hoursClean = ref(0)
const hoursSaved = ref(0)
const dopamineIndex = ref(0)
const currentPhase = ref('Phase I: 生理挣扎')
let timeInterval = null

onMounted(() => {
  // 隐藏原生劣质 TabBar
  uni.hideTabBar()
  
  // --- 拦截鉴权: 检查如果未登录跳登录页 ---
  const token = uni.getStorageSync('uni_id_token')
  if (!token) {
    uni.redirectTo({ url: '/pages/login/index' })
    return
  }
  // ------------------------------------

  let startTimestamp = uni.getStorageSync('neuro_start_date')
  if (!startTimestamp) {
    startTimestamp = Date.now() - (5 * 24 * 60 * 60 * 1000)
    uni.setStorageSync('neuro_start_date', startTimestamp)
  }
  
  const updateTimer = () => {
    const diffMs = Date.now() - startTimestamp
    const totalHours = Math.floor(diffMs / (1000 * 60 * 60))
    hoursClean.value = totalHours
    
    // 计算夺回的专注力：假设每天浪费 2 小时在成瘾行为和内耗上
    hoursSaved.value = Math.floor((totalHours / 24) * 2)
    
    // 计算多巴胺修复指数 (最高 100%)
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
  
  // 随机选择一种干预方式
  const randomIndex = Math.floor(Math.random() * interventions.length)
  currentIntervention.value = interventions[randomIndex]
  
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

const doAction = () => {
  if (!isPanicMode.value) return
  
  completedActions.value++
  // 点击时的短促震动反馈
  uni.vibrateShort()
  
  if (completedActions.value >= currentIntervention.value.target) {
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
page {
  height: 100%;
}

.container {
  height: 100%;
  width: 100%;
  overflow-x: hidden;
  background-color: #09090b; /* 极简黑曜石 */
  background-image: 
    radial-gradient(circle at 50% 30%, var(--theme-bg-highlight) 0%, transparent 60%),
    radial-gradient(circle at 100% 100%, rgba(139, 92, 246, 0.05) 0%, transparent 50%);
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  overflow-y: auto;
  padding-bottom: calc(88px + env(safe-area-inset-bottom)); /* 适配悬浮底栏 */
}
.px-4 { padding: 0 20px; }
.pb-8 { padding-bottom: 32px; padding-top: 20px;}
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

.tracking-wider { letter-spacing: 4px; }

/* 顶部状态栏 */
.header {
  padding: calc(var(--status-bar-height) + 20px) 20px 12px 20px;
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
.title { font-size: 24px; font-weight: 900; color: var(--theme-primary); text-shadow: 0 0 15px var(--theme-shadow-primary); }
.subtitle { font-size: 11px; color: #a1a1aa; letter-spacing: 1px;}
.user-chip { 
  background: rgba(255,255,255,0.05); 
  border: 1px solid rgba(255,255,255,0.1); 
  padding: 4px 10px; 
  border-radius: 12px;
  backdrop-filter: blur(10px);
}
.chip-dot { width: 6px; height: 6px; border-radius: 3px; background-color: var(--theme-primary); box-shadow: 0 0 8px var(--theme-shadow-primary);}
.chip-text { font-size: 12px; color: #e4e4e7; font-family: monospace;}

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
  border-top-color: var(--theme-shadow-primary);
  border-bottom-color: rgba(139, 92, 246, 0.3);
  animation: spin 15s linear infinite;
}
.inner-ring {
  margin: 15px;
  border-left-color: var(--theme-shadow-primary);
  border-right-color: var(--theme-bg-highlight);
  animation: spin-reverse 10s linear infinite;
}
.core-pulse {
  position: absolute;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: radial-gradient(circle, var(--theme-bg-highlight) 0%, transparent 70%);
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
  text-shadow: 0 0 30px var(--theme-shadow-primary);
  line-height: 1;
}
.hours-label {
  font-size: 14px;
  color: var(--theme-primary);
  letter-spacing: 3px;
  font-weight: bold;
}
.level-badge {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(79, 70, 229, 0.2));
  border: 1px solid rgba(139, 92, 246, 0.4);
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  color: #e4e4e7;
}

/* 紧急阻断按钮 */
.w-full { width: 100%; box-sizing: border-box; }
.data-cards { gap: 16px; }
.data-card {
  flex: 1;
  background: rgba(255, 255, 255, 0.03); /* 高端玻璃态代替刺眼的纯色 */
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.05); /* 细微的光学边缘 */
  border-bottom: 1px solid rgba(255, 255, 255, 0.02);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  border-radius: 16px;
  padding: 16px 0;
  transition: all 0.3s ease;
}
.data-val { font-size: 24px; font-weight: 900; color: #fafafa; font-family: monospace; text-shadow: 0 0 15px var(--theme-shadow-primary); }
.data-label { font-size: 12px; color: #a1a1aa; letter-spacing: 1px;}

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
.intervention-type { font-size: 20px; color: #fff; font-weight: bold; margin-top: 12px; letter-spacing: 2px;}
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

/* 悬浮版 AI 护盾入口 */
.fab-area {
  position: fixed;
  top: 0; left: 0;
  width: 100vw; height: 100vh;
  z-index: 999;
  pointer-events: none;
}
.ai-fab {
  pointer-events: auto;
  width: 56px;
  height: 56px;
  border-radius: 28px;
  background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
  border: 1px solid rgba(139, 92, 246, 0.5);
  box-shadow: 0 10px 25px rgba(139, 92, 246, 0.4);
}
.ai-fab:active {
  transform: scale(0.9);
}
.ai-fab-glow {
  position: absolute;
  width: 100%; height: 100%;
  border-radius: 50%;
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.6);
  animation: fab-pulse 2s infinite;
}
.ai-fab-icon {
  font-size: 28px;
  color: #fff;
  font-weight: bold;
  z-index: 2;
  text-shadow: 0 0 10px rgba(255,255,255,0.8);
}
@keyframes fab-pulse {
  0% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.3); opacity: 0; }
  100% { transform: scale(1); opacity: 0; }
}
</style>
