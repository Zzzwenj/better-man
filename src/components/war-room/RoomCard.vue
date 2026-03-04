<template>
  <view class="room-card" :class="{ 'is-active-card': isActive }" hover-class="room-card-hover" @click="onClick">
    <view class="flex justify-between items-center mb-2">
      <view class="flex items-center flex-1 overflow-hidden">
        <!-- 图标 -->
        <view class="room-icon flex items-center justify-center flex-shrink-0" :class="roomType">
          <text v-if="roomType === 'public'">📡</text>
          <text v-else>🛡️</text>
        </view>
        <text class="room-name ml-2">{{ roomName }}</text>
        <!-- 唯一ID标签，点击可复制 -->
        <text class="room-id ml-2 flex-shrink-0" v-if="roomId" @click.stop="copyId">#{{ roomId }}</text>
      </view>
      <view class="status-badge flex-shrink-0 ml-2" :class="statusClass">
        <text class="status-text">{{ statusText }}</text>
      </view>
    </view>

    <!-- 激活驻留状态的特殊横幅提示 -->
    <view class="active-banner flex items-center justify-center mb-2" v-if="isActive">
      <text class="active-icon mr-1">📍</text>
      <text class="active-banner-text">阵列已绑定 · 神经共振中</text>
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
        <text class="metric-icon mt-px">⚠️</text>
        <text class="metric-text prize-text ml-1">连坐惩罚: 进度倒退 20%</text>
      </view>
    </view>
  </view>
</template>

<script setup>
/**
 * @component RoomCard
 * @description 战区大厅模块房间列表卡片组件。
 * @prop roomId    - 房间唯一ID，显示为标签并支持点击复制
 * @prop roomType  - 'public' | 'death-match'
 * @prop roomName  - 房间名称
 * @prop description - 房间描述
 * @prop onlineCount - 在线人数
 * @prop maxUsers  - 最大人数
 * @prop status    - 'active' | 'waiting' | 'closed'
 * @prop isActive  - 当前用户是否已连接该房间
 */
import { computed } from 'vue'

const props = defineProps({
  roomId:       { type: String,  default: '' },
  roomType:     { type: String,  default: 'public' },
  roomName:     { type: String,  default: '' },
  description:  { type: String,  default: '' },
  onlineCount:  { type: Number,  default: 0 },
  maxUsers:     { type: Number,  default: null },
  status:       { type: String,  default: 'active' },
  isActive:     { type: Boolean, default: false }
})

const emit = defineEmits(['click'])

const onClick = () => emit('click')

/** 点击 ID 标签复制到剪贴板 */
const copyId = () => {
  if (!props.roomId) return
  uni.setClipboardData({
    data: props.roomId,
    success: () => uni.showToast({ title: '战局口令已提取', icon: 'none' })
  })
}

const statusText = computed(() => {
  if (props.roomType === 'public') return '信号流畅'
  const map = { active: '激战中', waiting: '招募中', closed: '已结算' }
  return map[props.status] || '未知'
})

const statusClass = computed(() => {
  if (props.roomType === 'public') return 'status-public'
  const map = { active: 'status-active', waiting: 'status-waiting', closed: 'status-closed' }
  return map[props.status] || ''
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
.is-active-card {
  background: rgba(39, 39, 42, 0.7);
  border-color: rgba(239, 68, 68, 0.4);
  box-shadow: 0 0 15px rgba(239, 68, 68, 0.1) inset;
}
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
  width: 32px; height: 32px;
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
  font-size: 15px;
  font-weight: bold;
  color: #fff;
  letter-spacing: 1px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
/* 房间ID徽章：点击可复制 */
.room-id {
  font-size: 10px;
  color: #00e5ff;
  font-family: monospace;
  background: rgba(0, 229, 255, 0.08);
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid rgba(0, 229, 255, 0.2);
  white-space: nowrap;
}
.room-id:active { opacity: 0.5; }

.status-badge { padding: 4px 8px; border-radius: 12px; }
.status-text { font-size: 10px; font-weight: bold; }
.status-public { background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); }
.status-public .status-text { color: #10b981; }
.status-active { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); animation: pulse 2s infinite; }
.status-active .status-text { color: #ef4444; }
.status-waiting { background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.2); }
.status-waiting .status-text { color: #f59e0b; }
.status-closed { background: rgba(113, 113, 122, 0.1); border: 1px solid rgba(113, 113, 122, 0.2); }
.status-closed .status-text { color: #71717a; }

.room-desc { margin-top: 8px; }
.desc-text { font-size: 12px; color: #a1a1aa; line-height: 1.4; }
.room-footer { border-top: 1px solid rgba(255, 255, 255, 0.05); padding-top: 12px; }
.metric-icon { font-size: 12px; color: #a1a1aa; }
.metric-text { font-size: 12px; color: #d4d4d8; font-family: monospace; }
.prize-text { color: #ef4444; font-weight: bold; font-size: 11px;}

.flex { display: flex; }
.flex-1 { flex: 1; }
.flex-shrink-0 { flex-shrink: 0; }
.overflow-hidden { overflow: hidden; }
.justify-between { justify-content: space-between; }
.justify-center { justify-content: center; }
.items-center { align-items: center; }
.mb-2 { margin-bottom: 8px; }
.mt-2 { margin-top: 8px; }
.ml-1 { margin-left: 4px; }
.ml-2 { margin-left: 8px; }
.mr-1 { margin-right: 4px; }
.mt-px { margin-top: 1px; }

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
  70% { box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
  100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
}
</style>
