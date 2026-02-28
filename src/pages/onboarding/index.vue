<template>
  <view class="onboarding-container flex-col" :style="themeStore.themeCssVars">
    <!-- Header Process -->
    <view class="process-header flex items-center justify-between px-6 pt-6">
      <text class="process-step">步骤 {{ currentStep + 1 }} / {{ steps.length }}</text>
      <view class="progress-bar flex-1 ml-4">
        <view class="progress-fill" :style="{ width: ((currentStep + 1) / steps.length * 100) + '%' }"></view>
      </view>
    </view>

    <!-- 引入 key，触发重新渲染以呈现酷炫滑入动效 -->
    <view class="content flex-1 px-6 pt-10" :key="currentStep">
      <view class="glitch-title mb-8">
        <text class="title-text">{{ steps[currentStep].title }}</text>
        <text class="subtitle-text block mt-2">{{ steps[currentStep].subtitle }}</text>
      </view>

      <!-- Dynamic Options based on steps -->
      <view class="options-list pb-8">
        <view 
          class="option-card flex items-center justify-between mb-4" 
          v-for="(opt, index) in steps[currentStep].options" 
          :key="index"
          :class="{ 'selected': isSelected(opt.value) }"
          @click="toggleOption(opt.value)"
          hover-class="option-hover"
        >
          <text class="option-label">{{ opt.label }}</text>
          <view class="checkbox">
            <view class="checkbox-inner" v-if="isSelected(opt.value)"></view>
          </view>
        </view>
      </view>
    </view>

    <!-- Footer Action -->
    <view class="footer-action px-6 pb-bottom flex items-center justify-between">
      <view class="btn-prev flex items-center justify-center mr-4" v-if="currentStep > 0" @click="prevStep" hover-class="btn-hover-sub">
        <text class="btn-text-sub">上一步</text>
      </view>
      <view class="btn-next flex items-center justify-center flex-1" :class="{ 'disabled': !canProceed }" @click="nextStep" hover-class="btn-hover">
        <text class="btn-text">{{ isLastStep ? '生成核心协议' : '继续' }}</text>
      </view>
    </view>
    <text class="disclaimer block text-center pb-4 pt-2">所有数据仅用于本地终端的神经算法推理，绝不上传云端。</text>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useThemeStore } from '../../store/theme.js'

const themeStore = useThemeStore()
const currentStep = ref(0)
const answers = ref({
  gender: '',
  age: '',
  history: '',
  frequency: '',
  psych: '',
  triggers: []
})

const steps = [
  {
    key: 'gender',
    multiple: false,
    title: 'SYS. 染色体图谱录入',
    subtitle: '请确认生理性别。不同性别的神经内分泌系统在多巴胺受体分布与冲动寻觅机制上存在本质差异。',
    options: [
      { label: 'XY 染色体 (男性体质)', value: 'male' },
      { label: 'XX 染色体 (女性体质)', value: 'female' }
    ]
  },
  {
    key: 'age',
    multiple: false,
    title: 'SYS. 生理基模扫描',
    subtitle: '录入年龄段。各类激素的衰退曲线与前额叶皮层发育度将直接影响脱敏模型预估。',
    options: [
      { label: '<18岁 (前额叶发育期)', value: '<18' },
      { label: '18 - 25岁 (高危激素波动期)', value: '18-25' },
      { label: '26 - 35岁 (受体固化期)', value: '26-35' },
      { label: '36岁以上 (代谢放缓期)', value: '36+' }
    ]
  },
  {
    key: 'history',
    multiple: false,
    title: 'SYS. 神经连结溯源',
    subtitle: '你接触超常刺激性内容的历史有多久？这决定了边缘系统异常神经通路的刻画深度。',
    options: [
      { label: '不到 1 年 (轻度浅表)', value: '<1y' },
      { label: '1 - 3 年 (习惯成型)', value: '1-3y' },
      { label: '3 - 5 年 (通路固化)', value: '3-5y' },
      { label: '5 年以上 (重度阻滞)', value: '>5y' }
    ]
  },
  {
    key: 'frequency',
    multiple: false,
    title: 'SYS. 峰值多巴胺频率',
    subtitle: '在过去的一年中，你引发边缘失控或理智熔断的最高频次大约是多久一次？',
    options: [
      { label: '每周 1-2 次 (常规阈值)', value: 'weekly' },
      { label: '每隔 1-2 天 (高频波动)', value: 'every_other_day' },
      { label: '几乎每天 (边缘失守)', value: 'daily' },
      { label: '每天多次 (临床红线)', value: 'multiple_daily' }
    ]
  },
  {
    key: 'psych',
    multiple: false,
    title: 'SYS. 精神内耗诊断',
    subtitle: '理智熔断后，最常体验到的负面情绪是什么？(用于构建 AI 护盾的防破环机制)',
    options: [
      { label: '极度空虚与自我厌恶', value: 'empty_disgust' },
      { label: '深深的悔恨与挫败感', value: 'regret_failure' },
      { label: '脑力严重透支，精神迟钝', value: 'brain_fog' },
      { label: '麻木无感，陷入习得性无助', value: 'numbness' }
    ]
  },
  {
    key: 'triggers',
    multiple: true,
    title: 'SYS. 触发源映射图',
    subtitle: '最容易引燃多巴胺失控的情境有哪些？(点击可复选锁定)',
    options: [
      { label: '深夜失眠，神经焦虑时', value: 'insomnia_anxiety' },
      { label: '现实受挫，试图压力逃避', value: 'stress_escape' },
      { label: '独处空档，无安全感无聊时', value: 'boredom' },
      { label: '算法推送擦边内容的感官刺激', value: 'visual_trigger' }
    ]
  }
]

const currentKey = computed(() => steps[currentStep.value].key)
const isMultiple = computed(() => steps[currentStep.value].multiple)
const isLastStep = computed(() => currentStep.value === steps.length - 1)

const isSelected = (val) => {
  if (isMultiple.value) {
    return answers.value[currentKey.value].includes(val)
  }
  return answers.value[currentKey.value] === val
}

const canProceed = computed(() => {
  if (isMultiple.value) {
    return answers.value[currentKey.value].length > 0
  }
  return answers.value[currentKey.value] !== ''
})

const toggleOption = (val) => {
  if (isMultiple.value) {
    const list = answers.value[currentKey.value]
    const idx = list.indexOf(val)
    if (idx > -1) list.splice(idx, 1)
    else list.push(val)
  } else {
    answers.value[currentKey.value] = val
  }
  // 简短震动反馈
  uni.vibrateShort()
}

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
    uni.vibrateShort()
  }
}

const nextStep = () => {
  if (!canProceed.value) return
  
  if (!isLastStep.value) {
    currentStep.value++
  } else {
    // 问卷完成，持久化数据
    uni.showLoading({ title: '生成神经协议...' })
    setTimeout(() => {
      uni.setStorageSync('neuro_baseline', JSON.stringify(answers.value))
      uni.hideLoading()
      uni.switchTab({
        url: '/pages/dashboard/index'
      })
    }, 1500)
  }
}
</script>

<style lang="scss" scoped>
.onboarding-container {
  min-height: 100vh;
  background-color: #09090b;
  display: flex;
  flex-direction: column;
}
.px-6 { padding: 0 24px; }
.pt-6 { padding-top: calc(var(--status-bar-height) + 24px); }
.pt-10 { padding-top: 40px; }
.pb-8 { padding-bottom: 32px; }
.pb-bottom { padding-bottom: 50px; }
.mt-2 { margin-top: 8px; }
.mt-4 { margin-top: 16px; }
.mb-4 { margin-bottom: 16px; }
.mb-8 { margin-bottom: 32px; }
.ml-4 { margin-left: 16px; }
.flex { display: flex; }
.flex-col { display: flex; flex-direction: column; }
.flex-1 { flex: 1; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.justify-center { justify-content: center; }
.block { display: block; }
.text-center { text-align: center; }

/* Header Progress */
.process-step { font-family: monospace; color: var(--theme-primary); font-size: 14px; font-weight: bold;}
.progress-bar { height: 4px; background: rgba(255,255,255,0.05); border-radius: 2px; overflow: hidden; }
.progress-fill { height: 100%; background: linear-gradient(90deg, var(--theme-primary-grad-end) 0%, var(--theme-primary-grad-start) 100%); box-shadow: 0 0 12px var(--theme-shadow-primary); transition: width 0.3s ease; }

/* Content Animations */
.content {
  animation: slideUpFade 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes slideUpFade {
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
}

@keyframes glitch {
  0%, 100% { text-shadow: 0 0 15px rgba(255,255,255,0.1); transform: none; }
  10% { text-shadow: -2px 0 var(--theme-primary), 2px 0 var(--theme-secondary); }
  20% { text-shadow: 2px 0 var(--theme-primary), -2px 0 var(--theme-secondary); }
}

/* Content */
.title-text { 
  font-size: 26px; font-weight: 900; color: #f4f4f5; 
  letter-spacing: 2px; text-shadow: 0 0 15px rgba(255,255,255,0.1);
  animation: glitch 4s infinite; /* 极其赛博朋克的微弱文字故障 */
}
.subtitle-text { font-size: 14px; color: #a1a1aa; line-height: 1.6; }

/* Options */
.option-card {
  position: relative;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 20px 24px;
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  overflow: hidden;
}
.option-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0;
  width: 4px; height: 100%;
  background: transparent;
  transition: background 0.3s, box-shadow 0.3s;
}

.option-hover { background: rgba(255, 255, 255, 0.05); }
.option-card.selected {
  background: rgba(255, 255, 255, 0.03);
  border-color: var(--theme-shadow-primary);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
  transform: scale(1.02);
}
.option-card.selected::before {
  background: linear-gradient(180deg, var(--theme-primary-grad-start) 0%, var(--theme-primary-grad-end) 100%);
  box-shadow: 0 0 15px var(--theme-shadow-primary);
}

.option-label { font-size: 15px; color: #e4e4e7; font-weight: 500; }
.checkbox {
  width: 20px; height: 20px;
  border-radius: 4px;
  border: 2px solid #3f3f46;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.3s;
}
.option-card.selected .checkbox { border-color: var(--theme-primary); }
.checkbox-inner { width: 10px; height: 10px; background: linear-gradient(135deg, var(--theme-primary-grad-start) 0%, var(--theme-primary-grad-end) 100%); border-radius: 2px; box-shadow: 0 0 8px var(--theme-shadow-primary); }

/* Footer */
.btn-prev {
  width: 90px;
  height: 56px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 28px;
  transition: all 0.3s;
}
.btn-hover-sub { background: rgba(255, 255, 255, 0.1); transform: translateY(2px) scale(0.98); }
.btn-text-sub { color: #a1a1aa; font-size: 14px; font-weight: bold; font-family: monospace;}
.mr-4 { margin-right: 16px; }

.btn-next {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 56px;
  background: linear-gradient(135deg, var(--theme-primary-grad-start) 0%, var(--theme-primary-grad-end) 100%);
  border-radius: 28px;
  box-shadow: 0 8px 24px var(--theme-shadow-primary);
  transition: all 0.3s;
}
.btn-next.disabled {
  background: #27272a;
  box-shadow: none;
  opacity: 0.5;
}
.btn-text { color: #fff; font-size: 16px; font-weight: 900; letter-spacing: 2px; text-align: center; width: 100%;}
.btn-hover:not(.disabled) { transform: translateY(2px) scale(0.98); box-shadow: 0 4px 12px var(--theme-shadow-primary); }
.disclaimer { font-size: 11px; color: #52525b; padding-bottom: max(20px, env(safe-area-inset-bottom)); }
</style>
