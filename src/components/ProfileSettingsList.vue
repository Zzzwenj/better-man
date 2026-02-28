<template>
  <view class="settings-group mt-6 mx-4">
    <text class="group-title block px-2 mb-2">{{ title }}</text>
    <view class="settings-list">
      <view class="list-item flex justify-between items-center" 
            v-for="(item, index) in list" 
            :key="index"
            hover-class="item-hover"
            @click="handleItemClick(item)">
        <view class="item-left flex items-center">
          <text class="item-icon">{{ item.icon }}</text>
          <text class="item-label ml-3">{{ item.label }}</text>
        </view>
        
        <view v-if="item.type === 'switch'">
          <switch v-show="!hideNative" :checked="item.value" color="#00C6FF" style="transform: scale(0.8);" @change="(e) => onSwitchChange(e, item)" />
        </view>
        <text v-else class="arrow-right">></text>
      </view>
    </view>
  </view>
</template>

<script setup>
const props = defineProps({
  title: { type: String, required: true },
  list: { type: Array, required: true },
  hideNative: { type: Boolean, default: false }
})
const emit = defineEmits(['itemClick'])

const handleItemClick = (item) => {
  if (item.type === 'switch') return // switch 交给 @change 单独处理，避免点整行触发两遍
  emit('itemClick', item)
}

const onSwitchChange = (e, item) => {
  // 包装一层事件吐出
  emit('itemClick', { ...item, value: e.detail.value })
}
</script>

<style lang="scss" scoped>
.mx-4 { margin: 0 20px; }
.mt-6 { margin-top: 24px; }
.px-2 { padding: 0 8px; }
.mb-2 { margin-bottom: 8px; }
.ml-3 { margin-left: 12px; }
.flex { display: flex; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.block { display: block; }

.group-title { font-size: 12px; color: #71717a; font-family: monospace; font-weight: bold;}
.settings-list {
    background: #18181b;
    border-radius: 16px;
    padding: 0 16px;
    border: 1px solid #27272a;
}
.list-item {
    padding: 16px 0;
    border-bottom: 1px solid #27272a;
}
.list-item:last-child { border-bottom: none; }
.item-hover { opacity: 0.7; }
.item-icon { font-size: 18px; }
.item-label { font-size: 14px; color: #d4d4d8; font-weight: 500;}
.arrow-right { color: #52525b; font-size: 16px; font-family: monospace;}
</style>
