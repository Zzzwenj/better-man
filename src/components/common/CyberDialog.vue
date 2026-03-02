<template>
  <view class="dialog-mask flex items-center justify-center fade-in" v-if="show" @click.stop="handleCancel">
    <view class="dialog-content pop-in flex-col" @click.stop>
      <!-- 装饰性顶部光条 -->
      <view class="glow-bar" :style="{ background: color }"></view>
      
      <view class="dialog-header flex justify-between items-center pb-3">
        <text class="dialog-title">{{ title || '💀 系统警告' }}</text>
        <text class="close-btn" @click="handleCancel">✕</text>
      </view>
      
      <view class="dialog-body py-6">
        <text class="dialog-text">{{ content }}</text>
        <!-- 装饰性边角 -->
        <view class="corner top-left" :style="{ borderColor: color }"></view>
        <view class="corner top-right" :style="{ borderColor: color }"></view>
        <view class="corner bottom-left" :style="{ borderColor: color }"></view>
        <view class="corner bottom-right" :style="{ borderColor: color }"></view>
      </view>

      <view class="dialog-footer pt-3 flex gap-3">
        <view v-if="showCancel" class="btn cancel-btn flex-1 flex justify-center items-center" @click="handleCancel">
          <text class="btn-text-cancel">{{ cancelText || '取消' }}</text>
        </view>
        <view class="btn confirm-btn flex-1 flex justify-center items-center" :style="{ background: color }" @click="handleConfirm">
          <text class="btn-text-confirm">{{ confirmText || '确认接收' }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
/**
 * @component CyberDialog
 * @description 通用的赛博风格弹窗，用于替换原生的 uni.showModal。
 */
const props = defineProps({
  show: Boolean,
  title: String,
  content: String,
  confirmText: String,
  cancelText: String,
  showCancel: { type: Boolean, default: false },
  color: { type: String, default: '#ef4444' } // 默认警示红
})

const emit = defineEmits(['update:show', 'confirm', 'cancel'])

const handleCancel = () => {
  emit('update:show', false)
  emit('cancel')
}

const handleConfirm = () => {
  emit('confirm')
  emit('update:show', false)
}
</script>

<style scoped>
.dialog-mask {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(12px);
  z-index: 2000;
}
.dialog-content {
  width: 80%;
  max-width: 300px;
  background: #09090b;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  padding: 24px;
  box-shadow: 0 0 40px rgba(0, 0, 0, 0.8);
  position: relative;
  overflow: hidden;
}
.glow-bar {
  position: absolute;
  top: 0; left: 0; right: 0; height: 2px;
  box-shadow: 0 0 10px currentColor;
  opacity: 0.8;
}
.dialog-header { border-bottom: 1px solid rgba(255, 255, 255, 0.05); }
.dialog-title { font-size: 15px; font-weight: 900; color: #fff; letter-spacing: 1px; }
.close-btn { color: #3f3f46; font-size: 16px; padding: 4px; }

.dialog-body { position: relative; padding: 20px 0; }
.dialog-text { 
  font-size: 14px; 
  color: #d4d4d8; 
  line-height: 1.6; 
  text-align: center;
  display: block;
}

/* 装饰边角 */
.corner { position: absolute; width: 6px; height: 6px; border: 1px solid #ef4444; opacity: 0.5; }
.top-left { top: 0; left: 0; border-right: none; border-bottom: none; }
.top-right { top: 0; right: 0; border-left: none; border-bottom: none; }
.bottom-left { bottom: 0; left: 0; border-right: none; border-top: none; }
.bottom-right { bottom: 0; right: 0; border-left: none; border-top: none; }

.dialog-footer { border-top: 1px solid rgba(255, 255, 255, 0.05); padding-top: 20px; }
.btn { height: 42px; border-radius: 2px; transition: all 0.2s; }
.btn:active { transform: scale(0.96); opacity: 0.8; }

.cancel-btn { background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); }
.confirm-btn { box-shadow: 0 0 15px rgba(239, 68, 68, 0.3); }

.btn-text-confirm { color: #000; font-size: 13px; font-weight: 900; letter-spacing: 1px; }
.btn-text-cancel { color: #a1a1aa; font-size: 13px; }

.flex { display: flex; }
.flex-col { display: flex; flex-direction: column; }
.flex-1 { flex: 1; }
.justify-between { justify-content: space-between; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
.gap-3 { gap: 12px; }
.pb-3 { padding-bottom: 12px; }
.pt-3 { padding-top: 12px; }
.py-6 { padding-top: 24px; padding-bottom: 24px; }

.fade-in { animation: fadeIn 0.2s forwards; }
.pop-in { animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes popIn { from { opacity: 0; transform: scale(0.9) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
</style>
