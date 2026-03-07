<template>
  <view class="audit-overlay" v-if="show" catchtouchmove="preventTouchMove">
    <view class="audit-bg"></view>
    <view class="audit-content flex-col items-center">
      
      <!-- 状态 1: 每日问询 -->
      <template v-if="step === 'ask'">
        <view class="icon-wrap mb-4 mt-6">
          <text class="audit-icon">👁️</text>
        </view>
        <text class="title">神经元例行自检</text>
        <text class="subtitle mt-3">距离上次同步已过 24 周期。<br/>你今天是否依然保持了纯净的心智，未曾被劣质多巴胺俘获？</text>
        
        <view class="btn safe-btn mt-8" @click="onSafe" hover-class="btn-hover-safe">
          <text class="btn-text">[是] 坚若磐石，未曾染指</text>
        </view>
        <view class="btn danger-btn mt-4 mb-6" @click="step = 'confess'" hover-class="btn-hover-danger">
          <text class="btn-text" style="color: #fca5a5;">[否] 防线崩溃，我不慎破戒</text>
        </view>
      </template>

      <!-- 状态 2: 破戒审问 -->
      <template v-if="step === 'confess'">
        <view class="icon-wrap mb-4 mt-6 danger-color">
          <text class="audit-icon">💀</text>
        </view>
        <text class="title text-red">审判前夕</text>
        <text class="subtitle mt-3">自律防线出现裂隙，系统即将判定突触断裂。<br/>这段时间累积的神经重建天数面临清火。</text>
        
        <view class="btn danger-btn-solid mt-8" @click="onRelapse" hover-class="btn-hover-danger-solid">
          <text class="btn-text text-white">接受系统审判 (准备清零)</text>
        </view>
        <view class="btn safe-btn mt-4 mb-6" @click="step = 'ask'" hover-class="btn-hover-safe" style="opacity: 0.6">
          <text class="btn-text">误触信号，重新汇报</text>
        </view>
      </template>

    </view>
  </view>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits } from 'vue'
import { useUserStore } from '@/store/user.js'
import { serverTime } from '@/utils/serverTime.js'

const props = defineProps({
  show: Boolean
})

const emit = defineEmits(['close', 'relapseTriggered'])
const step = ref('ask')

watch(() => props.show, (newVal) => {
  if (newVal) {
    step.value = 'ask'
  }
})

const preventTouchMove = () => {}

const onSafe = () => {
    uni.vibrateShort()
    
    // 更新最后打卡日期为今天（统一 YYYY-MM-DD 格式）
    const realDate = new Date(serverTime.now())
    const todayStr = `${realDate.getFullYear()}-${String(realDate.getMonth()+1).padStart(2,'0')}-${String(realDate.getDate()).padStart(2,'0')}`
    uni.setStorageSync('last_checkin_date', todayStr)
    
    // ✅ 写入每日成功打卡记录 "1"，供 Journey 热力图读取
    let checkins = uni.getStorageSync('neuro_checkins') || ''
    checkins += '1'
    uni.setStorageSync('neuro_checkins', checkins)
    
    // ✅ 每日自检成功奖励 10 神经币
    const userStore = useUserStore()
    userStore.earnCoins(10, '每日自律自检通过奖励')
    
    uni.showToast({ title: '突触稳定 +10币，继续保持', icon: 'none' })
    emit('close')
}

const onRelapse = () => {
    uni.vibrateLong()
    // 发射破戒流程信号给父组件，由父组件关闭当前窗，并直接弹出"脉冲稳压器"(DefibrillatorModal)
    emit('relapseTriggered')
}
</script>

<style lang="scss" scoped>
.audit-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.audit-bg {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(4, 4, 5, 0.98);
  backdrop-filter: blur(10px);
}

.audit-content {
  position: relative;
  z-index: 10;
  width: 85%;
  max-width: 340px;
  background: #18181b;
  border: 1px solid #3f3f46;
  border-radius: 20px;
  padding: 20px 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.9), inset 0 0 15px rgba(255,255,255,0.02);
  text-align: center;
}

.icon-wrap {
  width: 72px; height: 72px;
  border-radius: 36px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 30px rgba(255,255,255,0.05);
}

.danger-color {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.3);
  box-shadow: 0 0 40px rgba(239, 68, 68, 0.3);
  animation: pulse-danger 2s infinite;
}

@keyframes pulse-danger {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.audit-icon { font-size: 32px; filter: drop-shadow(0 0 10px rgba(255,255,255,0.3));}
.title { font-size: 22px; font-weight: 900; color: #fff; letter-spacing: 2px;}
.text-red { color: #ef4444; text-shadow: 0 0 10px rgba(239, 68, 68, 0.5);}
.subtitle { font-size: 13px; color: #a1a1aa; line-height: 1.6; }

.btn {
  width: 100%;
  padding: 16px 0;
  border-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.2s;
}

.btn-text { font-size: 15px; font-weight: bold; font-family: monospace; }
.text-white { color: #fff; }

.safe-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.btn-hover-safe { background: rgba(255, 255, 255, 0.1); transform: scale(0.98); }

.danger-btn {
  background: rgba(239, 68, 68, 0.05);
  border: 1px dashed rgba(239, 68, 68, 0.4);
}
.btn-hover-danger { background: rgba(239, 68, 68, 0.1); transform: scale(0.98); }

.danger-btn-solid {
  background: linear-gradient(135deg, #ef4444, #b91c1c);
  box-shadow: 0 5px 20px rgba(239, 68, 68, 0.4);
}
.btn-hover-danger-solid { filter: brightness(1.2); transform: scale(0.98); }

.flex-col { display: flex; flex-direction: column; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
.mt-3 { margin-top: 12px; }
.mt-4 { margin-top: 16px; }
.mt-6 { margin-top: 24px; }
.mt-8 { margin-top: 32px; }
.mb-4 { margin-bottom: 16px; }
.mb-6 { margin-bottom: 24px; }

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}
</style>
