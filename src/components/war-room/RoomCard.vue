<template>
  <view class="room-card" :class="{ 'is-active-card': isActive }" hover-class="room-card-hover" @click="onClick">
    <view class="flex justify-between items-center mb-2">
      <view class="flex items-center">
        <!-- Icon based on type -->
        <view class="room-icon flex items-center justify-center" :class="roomType">
          <text v-if="roomType === 'public'">📡</text>
          <text v-else>⚔️</text>
        </view>
        <text class="room-name ml-2">{{ roomName }}</text>
      </view>
      <view class="status-badge" :class="statusClass">
        <text class="status-text">{{ statusText }}</text>
      </view>
    </view>
    
    <!-- 激活驻留状态的特殊横幅提示 -->
    <view class="active-banner flex items-center justify-center mb-2" v-if="isActive">
      <text class="active-icon mr-1">📍</text>
      <text class="active-banner-text">神经已连接 · 点击立即折跃</text>
    </view>
    
    <view class="room-desc mb-2">
      <text class="desc-text">{{ description }}</text>
    </view>
    
    <view class="room-footer flex justify-between items-center mt-2">
      <view class="flex items-center">
        <text class="metric-icon">👥</text>
        <text class="metric-text ml-1">{{ onlineCount }} / {{ maxUsers || '∞' }}</text>
      </view>
      <view class="flex items-center" v-if="roomType === 'death-match'">
        <text class="metric-icon mt-px">💰</text>
        <text class="metric-text prize-text ml-1">{{ prizePool }} 神经币</text>
      </view>
    </view>
  </view>
</template>

<script setup>
/**
 * @component RoomCard
 * @description 战区大厅模块房间列表卡片组件，独立渲染单个竞技场/防线基站的各项入场信息。
 */

import { computed } from 'vue'

const props = defineProps({
  roomType: { type: String, default: 'public' }, // 'public' | 'death-match'
  roomName: { type: String, default: '' },
  description: { type: String, default: '' },
  onlineCount: { type: Number, default: 0 },
  maxUsers: { type: Number, default: null }, // null means infinite
  prizePool: { type: Number, default: 0 },
  status: { type: String, default: 'active' }, // 'active' | 'waiting' | 'closed'
  isActive: { type: Boolean, default: false } // 此战区是否为当前用户驻留状态
})

const emit = defineEmits(['click'])

const onClick = () => {
  emit('click')
}

const statusText = computed(() => {
  if (props.roomType === 'public') return '信号流畅'
  switch (props.status) {
    case 'active': return '激战中'
    case 'waiting': return '招募中'
    case 'closed': return '已结算'
    default: return '未知'
  }
})

const statusClass = computed(() => {
  if (props.roomType === 'public') return 'status-public'
  switch (props.status) {
    case 'active': return 'status-active'
    case 'waiting': return 'status-waiting'
    case 'closed': return 'status-closed'
    default: return ''
  }
})
</script>

<style scoped>
.room-card {
  box-sizing: border-box;
  width: 100%;
  background: rgba(24, 24, 27, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 12px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}
/* 外层追加激活时的呼吸灯与高光边框 */
.room-card[v-cloak] { display: none; }

.is-active-card {
  background: rgba(39, 39, 42, 0.7);
  border-color: rgba(239, 68, 68, 0.4);
  box-shadow: 0 0 15px rgba(239, 68, 68, 0.1) inset;
}

/* 通过 Vue 作用域我们把组件根直接绑个类名会更好，所以稍后这里其实可以直接用动态class。
 * 先做基础的激活特效：
 */
.active-banner {
  background: linear-gradient(90deg, transparent 0%, rgba(239, 68, 68, 0.2) 50%, transparent 100%);
  padding: 4px 0;
  border-top: 1px dashed rgba(239, 68, 68, 0.3);
  border-bottom: 1px dashed rgba(239, 68, 68, 0.3);
  animation: bgPulse 2s infinite;
}
.active-icon { font-size: 14px; animation: bounce 1s infinite alternate; }
.active-banner-text { font-size: 11px; font-weight: 900; color: #ef4444; letter-spacing: 2px; }

@keyframes bgPulse { 0%, 100% { opacity: 0.8; } 50% { opacity: 0.3; } }
@keyframes bounce { from { transform: translateY(-1px); } to { transform: translateY(2px); } }

.room-card-hover {
  background: rgba(39, 39, 42, 0.8);
  border-color: var(--theme-primary, #00e5ff);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 229, 255, 0.1);
}
.room-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  font-size: 16px;
}
.room-icon.public {
  background: rgba(0, 229, 255, 0.1);
  border: 1px solid rgba(0, 229, 255, 0.3);
}
.room-icon.death-match {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
}
.room-name {
  font-size: 16px;
  font-weight: bold;
  color: #fff;
  letter-spacing: 1px;
}
.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
}
.status-text {
  font-size: 10px;
  font-weight: bold;
}
.status-public {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.2);
}
.status-public .status-text { color: #10b981; }

.status-active {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  animation: pulse 2s infinite;
}
.status-active .status-text { color: #ef4444; }

.status-waiting {
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.2);
}
.status-waiting .status-text { color: #f59e0b; }

.status-closed {
  background: rgba(113, 113, 122, 0.1);
  border: 1px solid rgba(113, 113, 122, 0.2);
}
.status-closed .status-text { color: #71717a; }

.room-desc {  margin-top: 8px; }
.desc-text { font-size: 12px; color: #a1a1aa; line-height: 1.4; }
.room-footer { border-top: 1px solid rgba(255, 255, 255, 0.05); padding-top: 12px; }
.metric-icon { font-size: 12px; color: #a1a1aa; }
.metric-text { font-size: 12px; color: #d4d4d8; font-family: monospace; }
.prize-text { color: #facc15; font-weight: bold; }

.flex { display: flex; }
.justify-between { justify-content: space-between; }
.items-center { align-items: center; }
.mb-2 { margin-bottom: 8px; }
.mt-2 { margin-top: 8px; }
.ml-1 { margin-left: 4px; }
.ml-2 { margin-left: 8px; }
.mt-px { margin-top: 1px; }

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
  70% { box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
  100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
}
</style>
