<template>
  <view class="cyber-modal-overlay" v-if="visible" @click.stop="handleCancel">
    <view class="cyber-modal-content flex-col" @click.stop>
      <!-- 头部告警信号 -->
      <view class="modal-header flex items-center justify-center">
        <text class="glitch-text" :data-text="isAffordable ? '确认覆写协议?' : '访问被拒绝'">
          {{ isAffordable ? '确认覆写协议?' : '访问被拒绝' }}
        </text>
      </view>
      
      <!-- 交易商品信息 -->
      <view class="item-snapshot flex items-center mt-6">
        <view class="snapshot-icon flex justify-center items-center">
          <text>{{ product.icon }}</text>
        </view>
        <view class="snapshot-info ml-3 flex-col">
          <text class="snapshot-title">{{ product.title }}</text>
          <view class="flex items-center mt-1">
            <NeuroCoinIcon :size="14" />
            <text class="snapshot-price ml-1">{{ product.price }} <text class="duration-badge ml-2" v-if="product.duration">({{ product.duration }})</text></text>
          </view>
        </view>
      </view>

      <!-- 资产校验结果 -->
      <view class="validation-box mt-4 flex-col" :class="isAffordable ? 'valid' : 'invalid'">
        <view class="flex justify-between items-center w-full">
          <text class="val-label">账户持有</text>
          <view class="flex items-center">
            <NeuroCoinIcon :size="14" />
            <text class="val-value ml-1">{{ currentBalance }}</text>
          </view>
        </view>
        <view class="flex justify-between items-center w-full mt-2 pt-2 border-top">
          <text class="val-label">结余预测</text>
          <view class="flex items-center">
            <NeuroCoinIcon :size="14" />
            <text class="val-value ml-1" :class="isAffordable ? 'text-cyan' : 'text-red'">
              {{ expectedBalance }}
            </text>
          </view>
        </view>
        <text v-if="!isAffordable" class="error-msg mt-2">ERR_INSUFFICIENT_FUNDS</text>
      </view>

      <!-- 交互按钮 -->
      <view class="modal-actions flex justify-between mt-6">
        <view class="btn btn-cancel flex justify-center items-center flex-1 mr-2" @click="handleCancel">
          <text>中止交易</text>
        </view>
        <view 
          class="btn flex justify-center items-center flex-1 ml-2" 
          :class="isAffordable ? 'btn-confirm' : 'btn-disabled'"
          @click="handleConfirm"
        >
          <text>{{ isAffordable ? '确认授权' : '算力不足' }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'
import NeuroCoinIcon from './NeuroCoinIcon.vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  product: {
    type: Object,
    default: () => ({ id: '', title: '', price: 0, icon: '', duration: '' })
  },
  currentBalance: { type: Number, default: 0 }
})

const emit = defineEmits(['cancel', 'confirm'])

const isAffordable = computed(() => {
  return props.currentBalance >= props.product.price
})

const expectedBalance = computed(() => {
  const bal = props.currentBalance - props.product.price
  return bal >= 0 ? bal : 'FAILED'
})

const handleCancel = () => {
  emit('cancel')
}

const handleConfirm = () => {
  if (isAffordable.value) {
    emit('confirm', props.product)
  } else {
    uni.vibrateLong()
  }
}
</script>

<style scoped>
.cyber-modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cyber-modal-content {
  width: 320px;
  background: linear-gradient(180deg, #18181b 0%, #09090b 100%);
  border: 1px solid #3f3f46;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 0 50px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05) inset;
  position: relative;
  overflow: hidden;
  animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.cyber-modal-content::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: var(--theme-primary, #00e5ff);
  box-shadow: 0 0 10px var(--theme-primary, #00e5ff);
}

@keyframes popIn {
  0% { transform: scale(0.9) translateY(20px); opacity: 0; filter: blur(10px); }
  100% { transform: scale(1) translateY(0); opacity: 1; filter: blur(0); }
}

/* 故障字体特效 */
.glitch-text {
  font-size: 18px;
  font-weight: 900;
  color: #fff;
  letter-spacing: 2px;
  position: relative;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}

.item-snapshot {
  background: rgba(255, 255, 255, 0.02);
  border: 1px dashed rgba(255, 255, 255, 0.1);
  padding: 12px;
  border-radius: 12px;
}
.snapshot-icon {
  width: 48px; height: 48px;
  background: #27272a;
  border-radius: 10px;
  font-size: 24px;
  border: 1px solid #3f3f46;
}
.snapshot-title { font-size: 16px; color: #f4f4f5; font-weight: bold; }
.snapshot-price { font-size: 14px; color: #a1a1aa; font-family: monospace; }

.validation-box {
  background: #000;
  padding: 12px;
  border-radius: 8px;
  border-left: 3px solid;
}
.validation-box.valid { border-color: #00e5ff; }
.validation-box.invalid { border-color: #ef4444; }

.val-label { font-size: 12px; color: #71717a; }
.val-value { font-size: 14px; color: #e4e4e7; font-family: monospace; font-weight: bold; }
.border-top { border-top: 1px dashed #27272a; }
.text-cyan { color: #00e5ff; text-shadow: 0 0 5px rgba(0, 229, 255, 0.5); }
.text-red { color: #ef4444; text-shadow: 0 0 5px rgba(239, 68, 68, 0.5); }
.error-msg { font-size: 10px; color: #ef4444; font-family: monospace; text-align: right;}

.btn { height: 44px; border-radius: 8px; font-size: 13px; font-weight: bold; font-family: monospace; transition: all 0.2s;}
.btn:active { transform: scale(0.95); }
.btn-cancel { background: #27272a; color: #a1a1aa; border: 1px solid #3f3f46;}
.btn-confirm { 
  background: rgba(0, 229, 255, 0.1); 
  color: #00e5ff; 
  border: 1px solid rgba(0, 229, 255, 0.5);
  box-shadow: 0 0 15px rgba(0, 229, 255, 0.1) inset;
}
.btn-disabled { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px dashed rgba(239, 68, 68, 0.4); opacity: 0.6;}

.flex { display: flex; }
.flex-col { display: flex; flex-direction: column; }
.flex-1 { flex: 1; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
.w-full { width: 100%; box-sizing: border-box;}
.mt-1 { margin-top: 4px; }
.mt-2 { margin-top: 8px; }
.mt-4 { margin-top: 16px; }
.mt-6 { margin-top: 24px; }
.ml-2 { margin-left: 8px; }
.ml-3 { margin-left: 12px; }
.mr-2 { margin-right: 8px; }
.pt-2 { padding-top: 8px; }
</style>
