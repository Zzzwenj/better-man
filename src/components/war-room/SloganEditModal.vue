<template>
  <view class="modal-mask flex items-center justify-center fade-in" v-if="show" @click.stop="close">
    <view class="modal-content pop-in flex-col" @click.stop>
      <view class="modal-header flex justify-between items-center pb-3">
        <text class="modal-title">📡 修改战役宣言</text>
        <text class="close-btn" @click="close">✕</text>
      </view>
      
      <view class="modal-body py-6">
        <view class="input-container">
          <textarea 
            class="cyber-textarea" 
            v-model="editValue" 
            :placeholder="placeholder"
            placeholder-class="placeholder-text"
            maxlength="50"
            auto-focus
          />
          <view class="char-count">{{ editValue.length }}/50</view>
          <!-- 装饰性边角 -->
          <view class="corner top-left"></view>
          <view class="corner top-right"></view>
          <view class="corner bottom-left"></view>
          <view class="corner bottom-right"></view>
        </view>
        <text class="hint-text mt-3">建议：简短有力的宣言更能激发战友斗志。</text>
      </view>

      <view class="modal-footer pt-3">
        <view class="confirm-btn w-full flex justify-center items-center" @click="handleConfirm">
          <text class="btn-text">确认部署宣言</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
/**
 * @component SloganEditModal
 * @description 赛博风格的文本编辑弹窗，用于修改战役宣言，替换原生 uni.showModal(editable)。
 */
import { ref, watch } from 'vue'

const props = defineProps({
  show: Boolean,
  value: String,
  placeholder: { type: String, default: '请输入新的宣言...' }
})

const emit = defineEmits(['update:show', 'confirm'])

const editValue = ref('')

watch(() => props.show, (newVal) => {
  if (newVal) {
    editValue.value = props.value || ''
  }
})

const close = () => {
  emit('update:show', false)
}

const handleConfirm = () => {
  if (!editValue.value.trim()) {
    uni.showToast({ title: '宣言不能为空', icon: 'none' })
    return
  }
  emit('confirm', editValue.value.trim())
  close()
}
</script>

<style scoped>
.modal-mask {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(10px);
  z-index: 1000;
}
.modal-content {
  width: 85%;
  max-width: 320px;
  background: #09090b;
  border: 1px solid rgba(0, 229, 255, 0.3);
  border-radius: 4px;
  padding: 24px;
  box-shadow: 0 0 30px rgba(0, 229, 255, 0.1);
  position: relative;
}
.modal-header { border-bottom: 1px solid rgba(255, 255, 255, 0.05); }
.modal-title { font-size: 16px; font-weight: 900; color: #fff; letter-spacing: 1px; }
.close-btn { color: #52525b; font-size: 18px; padding: 4px; }

.modal-body { width: 100%; box-sizing: border-box; }

.input-container {
  position: relative;
  background: rgba(255, 255, 255, 0.02);
  padding: 12px;
}

.cyber-textarea {
  width: 100%;
  height: 100px;
  color: #00e5ff;
  font-size: 15px;
  line-height: 1.5;
  background: transparent;
  border: none;
}

.char-count {
  position: absolute;
  bottom: 8px;
  right: 12px;
  font-size: 10px;
  color: #3f3f46;
  font-family: monospace;
}

/* 装饰边角 */
.corner {
  position: absolute;
  width: 6px;
  height: 6px;
  border: 1px solid #00e5ff;
}
.top-left { top: 0; left: 0; border-right: none; border-bottom: none; }
.top-right { top: 0; right: 0; border-left: none; border-bottom: none; }
.bottom-left { bottom: 0; left: 0; border-right: none; border-top: none; }
.bottom-right { bottom: 0; right: 0; border-left: none; border-top: none; }

.placeholder-text { color: #27272a; }

.hint-text { font-size: 11px; color: #52525b; font-style: italic; display: block; }

.modal-footer { border-top: 1px solid rgba(255, 255, 255, 0.05); }
.confirm-btn {
  background: #00e5ff;
  height: 44px;
  border-radius: 2px;
  box-shadow: 0 0 15px rgba(0, 229, 255, 0.4);
}
.confirm-btn:active { transform: scale(0.98); opacity: 0.8; }
.btn-text { color: #000; font-size: 14px; font-weight: 900; letter-spacing: 2px; }

.flex { display: flex; }
.flex-col { display: flex; flex-direction: column; }
.justify-between { justify-content: space-between; }
.items-center { align-items: center; }
.w-full { width: 100%; }
.mt-3 { margin-top: 12px; }
.pb-3 { padding-bottom: 12px; }
.pt-3 { padding-top: 12px; }
.py-6 { padding-top: 24px; padding-bottom: 24px; }

.fade-in { animation: fadeIn 0.3s forwards; }
.pop-in { animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes popIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
</style>
