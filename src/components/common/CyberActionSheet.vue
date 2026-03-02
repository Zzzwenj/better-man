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
  backdrop-filter: blur(12px);
  z-index: 3000;
}
.action-sheet-content {
  width: 100%;
  background: #09090b;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 28px 28px 0 0;
  overflow: hidden;
  position: relative;
  box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.8);
}
.glow-bar {
  position: absolute;
  top: 0; left: 15%; right: 15%; height: 2px;
  background: linear-gradient(90deg, transparent, #ef4444, transparent);
  box-shadow: 0 0 15px rgba(239, 68, 68, 0.5);
  filter: blur(1px);
}
.sheet-header { 
  border-bottom: 1px solid rgba(255, 255, 255, 0.05); 
  background: rgba(255, 255, 255, 0.02);
}
.sheet-title { font-size: 13px; color: #52525b; letter-spacing: 3px; font-weight: 600; }

.options-list { 
  border-bottom: 1px solid rgba(255, 255, 255, 0.05); 
}
.option-item { border-bottom: 1px solid rgba(255, 255, 255, 0.03); }
.option-item:last-child { border-bottom: none; }
.option-text { font-size: 16px; font-weight: 900; letter-spacing: 1px; }

.cancel-btn { background: transparent; }
.cancel-text { font-size: 16px; color: #71717a; font-weight: 500; }

.item-hover { background: rgba(255, 255, 255, 0.05); }

.flex { display: flex; }
.items-end { align-items: flex-end; }
.justify-center { justify-content: center; }
.py-4 { padding-top: 18px; padding-bottom: 18px; }
.pb-safe { padding-bottom: env(safe-area-inset-bottom, 20px); }

.fade-in { animation: fadeIn 0.25s ease-out forwards; }
.slide-up { animation: slideUp 0.4s cubic-bezier(0.19, 1, 0.22, 1) forwards; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
</style>
