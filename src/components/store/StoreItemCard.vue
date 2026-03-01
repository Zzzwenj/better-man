<template>
  <view class="store-item-card" :class="cardClass" hover-class="store-item-hover" @click="handlePurchase">
    <view class="item-header flex justify-between items-center">
      <view class="item-icon-box flex justify-center items-center">
        <text class="item-icon">{{ icon }}</text>
      </view>
      <view class="item-price flex items-center" :class="isOwned && typeTag !== '消耗品(单次)' && typeTag !== '概率深坑' ? 'owned' : (canAfford ? 'affordable' : 'expensive')">
        <template v-if="isOwned && typeTag !== '消耗品(单次)' && typeTag !== '概率深坑'">
           残存 {{ daysLeft }} 天
        </template>
        <template v-else>
           <NeuroCoinIcon :size="16" class="mr-1" /> {{ price }}
        </template>
      </view>
    </view>
    
    <view class="item-content mt-3">
      <text class="item-title">{{ title }}</text>
      <text class="item-desc mt-1">{{ description }}</text>
    </view>
    
    <view class="item-footer flex justify-between items-center mt-3">
      <view class="tag flex items-center">
        <text class="tag-dot"></text>
        <text class="tag-text ml-1">{{ typeTag }}</text>
        <text class="tag-text ml-2">[{{ duration }}]</text>
      </view>
      <view class="purchase-btn flex justify-center items-center">
        <text class="btn-text">{{ btnText }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
/**
 * @component StoreItemCard
 * @description 暗网黑市(商店)商品独立卡片组件，包含商品首图、价签及兑换动作触发。
 */

import { computed } from 'vue'
import { useUserStore } from '@/store/user'
import NeuroCoinIcon from '@/components/common/NeuroCoinIcon.vue'

const props = defineProps({
  id: { type: String, required: true },
  title: { type: String, default: '未知节点' },
  description: { type: String, default: '加密数据...' },
  price: { type: Number, default: 9999 },
  icon: { type: String, default: '📦' },
  typeTag: { type: String, default: '不明' },
  duration: { type: String, default: '未知' }
})

const emit = defineEmits(['purchase'])
const userStore = useUserStore()

const canAfford = computed(() => userStore.neuroCoins >= props.price)

// 鉴别对象 dict 而不是 includes 数组
const isOwned = computed(() => {
  const exp = userStore.ownedItems[props.id]
  return exp && exp > Date.now()
})

// 计算剩余天数 (供 UI 炫耀或警告)
const daysLeft = computed(() => {
  if (!isOwned.value) return 0
  const exp = userStore.ownedItems[props.id]
  return Math.ceil((exp - Date.now()) / (1000 * 60 * 60 * 24))
})

// 检查该物品是否正处于装备状态
const isEquipped = computed(() => {
  if (!isOwned.value && props.typeTag !== '消耗品(单次)') return false
  const eq = userStore.equipped
  return eq.avatarFrame === props.id || eq.title === props.id || eq.empActive && props.id === 'w_01'
})

// 根据不同状态渲染按钮文案
const btnText = computed(() => {
  if (props.typeTag === '消耗品(单次)' || props.typeTag === '概率深坑') {
    return '获取权限'
  }
  if (isEquipped.value) return '卸下'
  if (isOwned.value) return '续期'
  return '获取权限'
})

// 卡片的样式判定
const cardClass = computed(() => {
  if (isEquipped.value) return 'item-equipped'
  if (isOwned.value) return 'item-owned'
  return ''
})

const handlePurchase = () => {
  emit('purchase', {
    id: props.id,
    title: props.title,
    price: props.price,
    icon: props.icon,
    typeTag: props.typeTag
  })
}
</script>

<style scoped>
.store-item-card {
  background: rgba(24, 24, 27, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 16px;
  backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.store-item-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(0, 229, 255, 0.3), transparent);
}

.store-item-hover {
  transform: translateY(-4px) scale(1.02);
  border-color: rgba(0, 229, 255, 0.4);
  background: rgba(39, 39, 42, 0.8);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 0 15px rgba(0, 229, 255, 0.1) inset;
}

.item-icon-box {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(0, 229, 255, 0.1);
  border: 1px solid rgba(0, 229, 255, 0.2);
  box-shadow: 0 0 10px rgba(0, 229, 255, 0.1);
}
.item-icon {
  font-size: 20px;
}

.item-price {
  font-family: monospace;
  font-weight: 900;
  font-size: 16px;
  letter-spacing: 1px;
}
.affordable {
  color: #00e5ff;
  text-shadow: 0 0 8px rgba(0, 229, 255, 0.6);
}
.expensive {
  color: #ef4444;
  text-shadow: 0 0 8px rgba(239, 68, 68, 0.6);
}
.owned {
  color: #10b981;
  text-shadow: 0 0 8px rgba(16, 185, 129, 0.6);
  font-size: 14px;
}

/* 卡片整体状态 */
.item-owned {
  background: rgba(16, 185, 129, 0.05);
  border-color: rgba(16, 185, 129, 0.2);
}
.item-owned::before {
  background: linear-gradient(90deg, transparent, rgba(16, 185, 129, 0.3), transparent);
}
.item-equipped {
  background: rgba(139, 92, 246, 0.1);
  border-color: rgba(139, 92, 246, 0.5);
  box-shadow: 0 0 15px rgba(139, 92, 246, 0.2) inset;
}
.item-equipped::before {
  background: linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.8), transparent);
}

.item-title {
  font-size: 15px;
  font-weight: bold;
  color: #f4f4f5;
  letter-spacing: 0.5px;
}
.item-desc {
  font-size: 11px;
  color: #a1a1aa;
  line-height: 1.5;
  min-height: 32px;
}

.tag {
  background: rgba(255, 255, 255, 0.05);
  padding: 4px 8px;
  border-radius: 6px;
}
.tag-dot {
  width: 6px;
  height: 6px;
  border-radius: 3px;
  background: #a78bfa;
  box-shadow: 0 0 5px #a78bfa;
}
.tag-text {
  font-size: 10px;
  color: #d4d4d8;
  font-family: monospace;
  font-weight: bold;
}

.purchase-btn {
  background: rgba(255, 255, 255, 0.08);
  border: 1px dashed rgba(255, 255, 255, 0.2);
  padding: 6px 14px;
  border-radius: 8px;
}
.btn-text {
  font-size: 11px;
  color: #fff;
  font-weight: bold;
}
.store-item-hover .purchase-btn {
  background: rgba(0, 229, 255, 0.15);
  border-color: #00e5ff;
}
.store-item-hover .purchase-btn .btn-text {
  color: #00e5ff;
  text-shadow: 0 0 5px rgba(0, 229, 255, 0.8);
}

.flex { display: flex; }
.justify-between { justify-content: space-between; }
.justify-center { justify-content: center; }
.items-center { align-items: center; }
.mt-1 { margin-top: 4px; }
.mt-3 { margin-top: 12px; }
.ml-1 { margin-left: 4px; }
</style>
