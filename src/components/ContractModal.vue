<template>
  <view class="modal-mask flex items-center justify-center fade-in" v-if="show" @click.stop="closeModal">
    <view class="modal-content pop-in flex-col" @click.stop="">
      <view class="modal-header flex justify-between items-center pb-3">
        <text class="modal-title">⚔️ 发起生死局</text>
        <text class="close-btn" @click="closeModal">✕</text>
      </view>
      
      <scroll-view scroll-y class="modal-body py-4">
        <view class="form-group mb-4">
          <text class="label">战役代号</text>
          <input class="styled-input" v-model="form.name" placeholder="请输入战役名称..." placeholder-class="placeholder-text" />
        </view>
        
        <view class="form-group mb-4">
          <text class="label">目标天数 (Days)</text>
          <view class="flex items-center space-x-2">
            <view class="day-btn" :class="{ active: form.days === 7 }" @click="form.days = 7">7天</view>
            <view class="day-btn" :class="{ active: form.days === 21 }" @click="form.days = 21">21天</view>
            <view class="day-btn" :class="{ active: form.days === 30 }" @click="form.days = 30">30天</view>
            <view class="day-btn" :class="{ active: form.days === 90 }" @click="form.days = 90">90天</view>
          </view>
        </view>

        <view class="form-group mb-4">
          <text class="label">个人保密金 (神经币)</text>
          <input class="styled-input" type="number" v-model="form.deposit" placeholder="如: 500" placeholder-class="placeholder-text" />
          <text class="hint-text mt-1 text-xs block">⚠️ 破戒出局将输掉全部保密金入公池</text>
        </view>
        
        <view class="form-group mb-2">
          <text class="label">最大招募人数</text>
          <picker mode="selector" :range="rangeArray" @change="onPickerChange">
            <view class="picker-box flex justify-between items-center">
              <text>{{ form.maxUsers }} 人</text>
              <text class="picker-icon">▼</text>
            </view>
          </picker>
        </view>
      </scroll-view>

      <view class="modal-footer pt-3 flex justify-between items-center">
        <view class="total-pool flex-col">
          <text class="pool-label">预期最高奖池</text>
          <text class="pool-value">{{ expectedPool }} 神经币</text>
        </view>
        <view class="confirm-btn" @click="submitContract">
          <text class="btn-text">血契结成</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { reactive, computed } from 'vue'

const props = defineProps({
  show: { type: Boolean, default: false }
})

const emit = defineEmits(['update:show', 'confirm'])

const rangeArray = [2, 3, 5, 8, 10]

const closeModal = () => {
  emit('update:show', false)
}

const form = reactive({
  name: '',
  days: 21,
  deposit: 500,
  maxUsers: 2
})

const onPickerChange = (e) => {
  form.maxUsers = rangeArray[e.detail.value]
}

const expectedPool = computed(() => {
  const dep = parseInt(form.deposit) || 0
  return dep * form.maxUsers
})

const submitContract = () => {
  if (!form.name.trim()) return uni.showToast({ title: '引子不能为空', icon: 'none' })
  if (form.deposit <= 0) return uni.showToast({ title: '保密金须大于0', icon: 'none' })
  
  emit('confirm', { ...form })
  closeModal()
}
</script>

<style scoped>
.modal-mask {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(5px);
  z-index: 999;
}
.modal-content {
  width: 85%;
  max-width: 340px;
  background: #18181b;
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5), inset 0 0 20px rgba(239, 68, 68, 0.05);
}
.modal-header { border-bottom: 1px solid rgba(255, 255, 255, 0.05); }
.modal-title { font-size: 18px; font-weight: 900; color: #ef4444; letter-spacing: 1px; }
.close-btn { color: #52525b; font-size: 20px; padding: 4px; }
.modal-body { max-height: 50vh; }
.label { font-size: 13px; color: #a1a1aa; margin-bottom: 8px; display: block; }
.styled-input {
  background: #09090b;
  border: 1px solid #3f3f46;
  border-radius: 8px;
  padding: 10px 14px;
  color: #fff;
  font-size: 14px;
}
.styled-input:focus { border-color: #ef4444; }
.space-x-2 { gap: 8px; }
.day-btn {
  flex: 1;
  text-align: center;
  padding: 8px 0;
  background: #09090b;
  border: 1px solid #3f3f46;
  border-radius: 8px;
  color: #a1a1aa;
  font-size: 13px;
  transition: all 0.2s;
}
.day-btn.active {
  background: rgba(239, 68, 68, 0.1);
  border-color: #ef4444;
  color: #ef4444;
  font-weight: bold;
}
.hint-text { color: #f59e0b; }
.picker-box {
  background: #09090b;
  border: 1px solid #3f3f46;
  border-radius: 8px;
  padding: 10px 14px;
  color: #fff;
  font-size: 14px;
}
.picker-icon { color: #52525b; font-size: 12px; }

.modal-footer { border-top: 1px solid rgba(255, 255, 255, 0.05); }
.pool-label { font-size: 11px; color: #a1a1aa; }
.pool-value { font-size: 16px; font-weight: bold; color: #facc15; font-family: monospace; }
.confirm-btn {
  background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
  padding: 10px 24px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}
.confirm-btn:active { transform: scale(0.95); }
.btn-text { color: #fff; font-size: 14px; font-weight: bold; letter-spacing: 1px; }

.flex { display: flex; }
.flex-col { display: flex; flex-direction: column; }
.justify-between { justify-content: space-between; }
.items-center { align-items: center; }
.mb-4 { margin-bottom: 16px; }
.mb-2 { margin-bottom: 8px; }
.mt-1 { margin-top: 4px; }
.pb-3 { padding-bottom: 12px; }
.pt-3 { padding-top: 12px; }
.py-4 { padding-top: 16px; padding-bottom: 16px; }
.block { display: block; }
.text-xs { font-size: 12px; }

.fade-in { animation: fadeIn 0.3s forwards; }
.pop-in { animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes popIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
</style>
