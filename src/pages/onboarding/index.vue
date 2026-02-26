<template>
  <view class="onboarding-container flex-col">
    <!-- Header Process -->
    <view class="process-header flex items-center justify-between px-6 pt-6">
      <text class="process-step">步骤 {{ currentStep + 1 }} / {{ steps.length }}</text>
      <view class="progress-bar flex-1 ml-4">
        <view class="progress-fill" :style="{ width: ((currentStep + 1) / steps.length * 100) + '%' }"></view>
      </view>
    </view>

    <view class="content flex-1 px-6 pt-10">
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
    <view class="footer-action px-6 pb-bottom">
      <view class="btn-next flex items-center justify-center" :class="{ 'disabled': !canProceed }" @click="nextStep" hover-class="btn-hover">
        <text class="btn-text">{{ isLastStep ? '生成核心协议 (INITIATE)' : '继续 (NEXT_)' }}</text>
      </view>
      <text class="disclaimer block text-center mt-4">所有数据仅用于本地终端的神经算法推理，绝不上传云端。</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'

const currentStep = ref(0)
const answers = ref({
  age: '',
  history: '',
  frequency: '',
  triggers: []
})

const steps = [
  {
    key: 'age',
    multiple: false,
    title: 'SYS. 生理基模录入',
    subtitle: '请选择你的年龄段。不同年龄段的性激素分泌与前额叶发育程度将直接影响多巴胺受体的脱敏预估模型。',
    options: [
      { label: '<18岁 (发育阶段)', value: '<18' },
      { label: '18 - 25岁 (高危波动期)', value: '18-25' },
      { label: '26 - 35岁 (受体固化期)', value: '26-35' },
      { label: '36岁以上 (代谢放缓期)', value: '36+' }
    ]
  },
  {
    key: 'history',
    multiple: false,
    title: 'SYS. 神经连结扫描',
    subtitle: '你接触各类擦边或成瘾刺激性内容的历史大约有多久？这决定了你边缘系统的成瘾通路深度。',
    options: [
      { label: '不到 1 年 (轻度浅表)', value: '<1y' },
      { label: '1 - 3 年 (习惯成型)', value: '1-3y' },
      { label: '3 - 5 年 (通路固化)', value: '3-5y' },
      { label: '5 年以上 (重度受体阻滞)', value: '>5y' }
    ]
  },
  {
    key: 'frequency',
    multiple: false,
    title: 'SYS. 峰值多巴胺测试',
    subtitle: '在过去的一年中，你最高频次的爆发或破戒频率大约是多久一次？',
    options: [
      { label: '每周 1-2 次', value: 'weekly' },
      { label: '每隔 1-2 天', value: 'every_other_day' },
      { label: '几乎每天', value: 'daily' },
      { label: '每天多次 (极度警报)', value: 'multiple_daily' }
    ]
  },
  {
    key: 'triggers',
    multiple: true,
    title: 'SYS. 触发源映射图',
    subtitle: '请回想一下，最容易让你失去理智、打开手机开始放纵的情境通常有哪些？(可多选)',
    options: [
      { label: '深夜失眠，极度焦虑时', value: 'insomnia_anxiety' },
      { label: '工作/学习遇到挫折，压力巨大时', value: 'stress_escape' },
      { label: '独自一人，极度无聊闲暇时', value: 'boredom' },
      { label: '偶然看到擦边图片/视频刺激', value: 'visual_trigger' }
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
.process-step { font-family: monospace; color: #10b981; font-size: 14px; font-weight: bold;}
.progress-bar { height: 4px; background: rgba(255,255,255,0.05); border-radius: 2px; overflow: hidden; }
.progress-fill { height: 100%; background: #10b981; box-shadow: 0 0 10px #10b981; transition: width 0.3s ease; }

/* Content */
.title-text { font-size: 26px; font-weight: 900; color: #f4f4f5; letter-spacing: 2px; text-shadow: 0 0 15px rgba(255,255,255,0.1);}
.subtitle-text { font-size: 14px; color: #a1a1aa; line-height: 1.6; }

/* Options */
.option-card {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 20px 24px;
  border-radius: 12px;
  transition: all 0.2s;
}
.option-hover { background: rgba(255, 255, 255, 0.05); }
.option-card.selected {
  background: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.5);
  box-shadow: 0 0 20px rgba(16, 185, 129, 0.1);
}
.option-label { font-size: 15px; color: #e4e4e7; font-weight: 500; }
.checkbox {
  width: 20px; height: 20px;
  border-radius: 4px;
  border: 2px solid #3f3f46;
  display: flex; align-items: center; justify-content: center;
}
.option-card.selected .checkbox { border-color: #10b981; }
.checkbox-inner { width: 10px; height: 10px; background: #10b981; border-radius: 2px; box-shadow: 0 0 5px #10b981; }

/* Footer */
.btn-next {
  height: 56px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 28px;
  box-shadow: 0 10px 20px rgba(16, 185, 129, 0.2);
  transition: all 0.3s;
}
.btn-next.disabled {
  background: #27272a;
  box-shadow: none;
  opacity: 0.5;
}
.btn-text { color: #000; font-size: 16px; font-weight: 900; letter-spacing: 2px; font-family: monospace;}
.btn-hover:not(.disabled) { transform: translateY(2px) scale(0.98); box-shadow: 0 5px 10px rgba(16, 185, 129, 0.3); }
.disclaimer { font-size: 11px; color: #52525b; }
</style>
