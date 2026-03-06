<template>
  <view class="dialog-wrapper" v-if="show" catchtouchmove="true">
    <!-- 独立的蒙层处理点击关闭，完全分离不嵌套 -->
    <view class="dialog-mask fade-in" @click.stop="handleCancel"></view>
    
    <!-- 内容层直接被 wrapper 的 flex 居中，用 z-index 保证在蒙层上方 -->
    <view class="dialog-content pop-in flex-col" @click.stop>
      <!-- 装饰性顶部光条 -->
      <view class="glow-bar" :style="{ background: color }"></view>
      
      <view class="dialog-header flex justify-between items-center pb-3">
          <text class="dialog-title">{{ title || '💀 系统警告' }}</text>
        </view>
        
        <view class="dialog-body py-6">
          <text class="dialog-text" v-if="content">{{ content }}</text>
          
          <!-- 核心隔离区：为外部传入的 input 绝对开辟点击捕获隔离带 -->
          <view class="slot-container" @click.stop>
            <slot></slot>
          </view>
          
          <!-- 装饰性边角 -->
          <view class="corner top-left" :style="{ borderColor: color }"></view>
          <view class="corner top-right" :style="{ borderColor: color }"></view>
          <view class="corner bottom-left" :style="{ borderColor: color }"></view>
          <view class="corner bottom-right" :style="{ borderColor: color }"></view>
        </view>

        <view class="dialog-footer pt-3 flex gap-4">
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
.dialog-wrapper {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.dialog-mask {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(12px);
}
.dialog-content {
  width: 85%;
  max-width: 320px;
  background: linear-gradient(145deg, #18181b 0%, #09090b 100%);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5), inset 0 0 20px rgba(239, 68, 68, 0.05);
  position: relative;
  z-index: 10; /* 提升自身层级 */
  overflow: visible; /* 改为 visible 防止 clip 掉原生组件的虚拟层 */
}
.slot-container {
  position: relative;
  z-index: 999;
  width: 100%;
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
.btn { height: 42px; border-radius: 8px; transition: all 0.2s; font-size: 14px; font-weight: bold; }
.btn:active { transform: scale(0.96); opacity: 0.8; }

.cancel-btn { background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); }
.confirm-btn { box-shadow: 0 4px 15px rgba(239, 68, 68, 0.2); }

.btn-text-confirm { color: #fff; font-size: 14px; letter-spacing: 1px; }
.btn-text-cancel { color: #d4d4d8; font-size: 14px; }

.flex { display: flex; }
.flex-col { display: flex; flex-direction: column; }
.flex-1 { flex: 1; }
.justify-between { justify-content: space-between; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
.gap-3 { gap: 12px; }
.gap-4 { gap: 16px; }
.pb-3 { padding-bottom: 12px; }
.pt-3 { padding-top: 12px; }
.py-6 { padding-top: 24px; padding-bottom: 24px; }

.fade-in { animation: fadeIn 0.2s forwards; }
.pop-in { animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes popIn { from { opacity: 0; transform: scale(0.9) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
</style>
