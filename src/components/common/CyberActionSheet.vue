<template>
  <view class="action-sheet-mask flex items-end fade-in" v-if="show" @click.stop="close">
    <view class="action-sheet-content slide-up" @click.stop>
      <!-- 装饰性顶部光条 -->
      <view class="glow-bar"></view>
      
      <view class="sheet-header flex justify-center items-center py-4">
        <text class="sheet-title">{{ title || '系统交互指令' }}</text>
      </view>
      
      <view class="options-list">
        <view 
          v-for="(item, index) in itemList" 
          :key="index" 
          class="option-item flex justify-center items-center py-4"
          @click="handleSelect(index)"
          hover-class="item-hover"
        >
          <text class="option-text" :style="{ color: itemColor || '#ef4444' }">{{ item }}</text>
        </view>
      </view>
      
      <view class="sheet-footer pb-safe">
        <view class="cancel-btn flex justify-center items-center py-4" @click="close" hover-class="item-hover">
          <text class="cancel-text">取消执行</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
/**
 * @component CyberActionSheet
 * @description 通用的赛博风格操作菜单，用于替换原生的 uni.showActionSheet。
 */
const props = defineProps({
  show: Boolean,
  title: String,
  itemList: { type: Array, default: () => [] },
  itemColor: { type: String, default: '#ef4444' }
})

const emit = defineEmits(['update:show', 'select'])

const close = () => {
  emit('update:show', false)
}

const handleSelect = (index) => {
  emit('select', index)
  close()
}
</script>

<style scoped>
.action-sheet-mask {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  z-index: 3000;
}
.action-sheet-content {
  width: 100%;
  background: #09090b;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px 20px 0 0;
  overflow: hidden;
  position: relative;
}
.glow-bar {
  position: absolute;
  top: 0; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg, transparent, #ef4444, transparent);
  box-shadow: 0 0 10px #ef4444;
}
.sheet-header { border-bottom: 1px solid rgba(255, 255, 255, 0.05); }
.sheet-title { font-size: 13px; color: #52525b; letter-spacing: 2px; text-transform: uppercase; }

.options-list { border-bottom: 8px solid rgba(255, 255, 255, 0.03); }
.option-item { border-bottom: 1px solid rgba(255, 255, 255, 0.05); }
.option-item:last-child { border-bottom: none; }
.option-text { font-size: 16px; font-weight: bold; letter-spacing: 1px; }

.cancel-btn { background: #18181b; }
.cancel-text { font-size: 16px; color: #a1a1aa; }

.item-hover { background: rgba(255, 255, 255, 0.05); }

.flex { display: flex; }
.items-end { align-items: flex-end; }
.justify-center { justify-content: center; }
.py-4 { padding-top: 16px; padding-bottom: 16px; }
.pb-safe { padding-bottom: env(safe-area-inset-bottom, 0px); }

.fade-in { animation: fadeIn 0.2s forwards; }
.slide-up { animation: slideUp 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) forwards; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
</style>
