<template>
  <view class="tactical-leaderboard" :class="{ 'collapsed': isCollapsed }">
    <!-- Header Controls -->
    <view class="resonance-header flex justify-between items-center" @click="toggleCollapse" hover-class="header-hover">
      <view class="flex items-center">
        <text class="earth-icon mr-2">⚔️</text>
        <text class="resonance-title">战术指令与大盘 (排行)</text>
      </view>
      <view class="collapse-btn flex items-center justify-center">
        <text class="arrow" :class="{ 'arrow-up': !isCollapsed, 'arrow-down': isCollapsed }">▲</text>
      </view>
    </view>

    <!-- Expanded Body -->
    <view class="resonance-body" v-if="!isCollapsed">
      <!-- Tabs -->
      <view class="tabs flex mt-2 mb-4">
        <view 
          class="tab-item flex-1 text-center py-2" 
          :class="{ 'active': activeTab === 0 }" 
          @click="activeTab = 0"
        >
          <text class="tab-text">本区行者排行</text>
        </view>
        <view 
          class="tab-item flex-1 text-center py-2" 
          :class="{ 'active': activeTab === 1 }" 
          @click="activeTab = 1"
        >
          <text class="tab-text">战区对抗大盘</text>
        </view>
      </view>

      <!-- Tab 0: 战区内个人排行 -->
      <scroll-view scroll-y class="list-container" v-if="activeTab === 0" enhanced :show-scrollbar="false">
        <view 
          v-for="user in displayLocalRankings" 
          :key="user.id"
          class="rank-row flex items-center"
          :class="{ 'is-me': user.isMe }"
        >
          <!-- 排名徽章 -->
          <view class="rank-badge flex items-center justify-center" :class="'rank-' + user.rank">
            <text class="rank-num">{{ user.rank }}</text>
          </view>
          
          <!-- 头像和信息 -->
          <view class="user-info flex items-center flex-1 ml-3">
            <view class="avatar">
               <text class="avatar-text">{{ user.avatarChar }}</text>
            </view>
            <view class="flex-col ml-2">
              <text class="nickname">{{ user.nickname }} <text v-if="user.isMe" class="me-tag"> (You)</text></text>
              <text class="title-tag mt-1" :style="{ color: user.titleColor }">{{ user.title }}</text>
            </view>
          </view>
          
          <!-- 成绩 -->
          <view class="score-info flex-col items-end">
            <text class="score-val">{{ user.days }}</text>
            <text class="score-unit">Days</text>
          </view>
        </view>
      </scroll-view>

      <!-- Tab 1: 全局战区对抗排行 -->
      <scroll-view scroll-y class="list-container" v-if="activeTab === 1" enhanced :show-scrollbar="false">
        <view 
          v-for="room in displayRoomRankings" 
          :key="room.roomId"
          class="rank-row flex items-center"
          :class="{ 'is-my-room': room.isMyRoom }"
        >
          <!-- 排名徽章 -->
          <view class="rank-badge flex items-center justify-center" :class="'rank-' + room.rank">
            <text class="rank-num">{{ room.rank }}</text>
          </view>
          
          <!-- 战区信息 -->
          <view class="room-info flex items-center flex-1 ml-3">
            <view class="room-icon flex items-center justify-center">
              <text>🛡️</text>
            </view>
            <view class="flex-col ml-2">
              <text class="room-name">第 {{ room.roomId }} 战区 <text v-if="room.isMyRoom" class="me-tag">(本区)</text></text>
              <text class="room-desc mt-1">在线人数: {{ room.online }}</text>
            </view>
          </view>
          
          <!-- 战区总算力 -->
          <view class="score-info flex-col items-end">
            <text class="score-val text-cyan">{{ room.totalHours }}</text>
            <text class="score-unit">总净化时</text>
          </view>
        </view>
      </scroll-view>
      
    </view>
  </view>
</template>

<script setup>
/**
 * @component GlobalResonance
 * @description 战区通讯基站大盘组件，用于展示当前频道内的全球在线探员及战区总体数据看板。
 */

import { ref, computed, onMounted } from 'vue'

const isCollapsed = ref(true) 
const activeTab = ref(0) // 0: 个人排行, 1: 战区排行

// 真实的从云端拉回来的数据
const rawLocalRankings = ref([])
const rawRoomRankings = ref([])

onMounted(async () => {
    try {
        const token = uni.getStorageSync('uni_id_token')
        if (!token) return
        
        const res = await uniCloud.callFunction({
            name: 'user-center',
            data: { action: 'getRankings', token }
        })
        
        if (res.result.code === 0 && res.result.data) {
            rawLocalRankings.value = res.result.data.localRankings || []
            rawRoomRankings.value = res.result.data.roomRankings || []
        }
    } catch (err) {
        console.error('拉取大盘共振数据失败', err)
    }
})

// 截断逻辑：最多显示10人。如果在前9名，直接显示前10；如果不在前9名，显示前9名 + 本人
const displayLocalRankings = computed(() => {
  const list = rawLocalRankings.value
  if (list.length === 0) return []
  const meIndex = list.findIndex(u => u.isMe)
  
  if (meIndex < 10 && meIndex !== -1) {
    return list.slice(0, 10).map((u, i) => ({ ...u, rank: i + 1 }))
  } else if (meIndex >= 10) {
    const top9 = list.slice(0, 9).map((u, i) => ({ ...u, rank: i + 1 }))
    const me = { ...list[meIndex], rank: meIndex + 1 }
    return [...top9, me]
  } else {
    return list.slice(0, 10).map((u, i) => ({ ...u, rank: i + 1 }))
  }
})

// 截断逻辑：最多显示5个。如果在前4名，直接显示前5；如果不在前4名，显示前4名 + 本战区
const displayRoomRankings = computed(() => {
  const list = rawRoomRankings.value
  if (list.length === 0) return []
  const myRoomIndex = list.findIndex(r => r.isMyRoom)
  
  if (myRoomIndex < 5 && myRoomIndex !== -1) {
    return list.slice(0, 5).map((r, i) => ({ ...r, rank: i + 1 }))
  } else if (myRoomIndex >= 5) {
    const top4 = list.slice(0, 4).map((r, i) => ({ ...r, rank: i + 1 }))
    const myRoom = { ...list[myRoomIndex], rank: myRoomIndex + 1 }
    return [...top4, myRoom]
  } else {
    return list.slice(0, 5).map((r, i) => ({ ...r, rank: i + 1 }))
  }
})

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
  uni.vibrateShort()
}
</script>

<style lang="scss" scoped>
.tactical-leaderboard {
  background: rgba(24, 24, 27, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--theme-shadow-primary);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  margin-bottom: 20px;
}

.tactical-leaderboard.collapsed {
  background: rgba(24, 24, 27, 0.4);
  border-color: rgba(255, 255, 255, 0.05);
}

.resonance-header { padding: 12px 16px; }
.header-hover { background: rgba(255, 255, 255, 0.05); }

.earth-icon { font-size: 16px; }
.resonance-title { font-size: 14px; font-weight: bold; color: var(--theme-primary); letter-spacing: 2px; font-family: monospace; }
.collapse-btn { width: 28px; height: 28px; border-radius: 14px; background: rgba(255, 255, 255, 0.05); }
.arrow { color: #a1a1aa; font-size: 10px; transition: transform 0.3s; }
.arrow-up { transform: rotate(0deg); }
.arrow-down { transform: rotate(180deg); }

.resonance-body {
  padding: 0 16px 16px 16px;
  border-top: 1px dashed rgba(255, 255, 255, 0.05);
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Tabs */
.tabs {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 4px;
}
.tab-item { border-radius: 6px; transition: background 0.3s; }
.tab-item.active { background: var(--theme-bg-highlight); box-shadow: 0 0 10px var(--theme-shadow-primary); }
.tab-text { font-size: 13px; color: #a1a1aa; font-weight: bold; }
.tab-item.active .tab-text { color: var(--theme-primary); }
.py-2 { padding-top: 8px; padding-bottom: 8px; }

/* List */
.list-container {
  max-height: 260px; /* 限制高度，防止占据太多聊天区 */
}

.rank-row {
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 8px;
  border: 1px solid rgba(255, 255, 255, 0.03);
}

.rank-row.is-me, .rank-row.is-my-room {
  background: var(--theme-bg-highlight);
  border-color: var(--theme-shadow-primary);
}

.rank-badge {
  width: 24px; height: 24px; border-radius: 12px;
  background: #27272a;
  border: 1px solid #3f3f46;
}
.rank-num { font-size: 12px; color: #a1a1aa; font-family: monospace; font-weight: bold; }
/* 前三名特殊高亮 */
.rank-1 { background: linear-gradient(135deg, #eab308, #ca8a04); border-color: #fef08a; box-shadow: 0 0 10px rgba(234, 179, 8, 0.4); }
.rank-1 .rank-num { color: #fff; }
.rank-2 { background: linear-gradient(135deg, #94a3b8, #64748b); border-color: #e2e8f0; }
.rank-2 .rank-num { color: #fff; }
.rank-3 { background: linear-gradient(135deg, #b45309, #92400e); border-color: #fcd34d; }
.rank-3 .rank-num { color: #fff; }

.avatar {
  width: 36px; height: 36px; border-radius: 10px;
  background: #27272a;
  display: flex; align-items: center; justify-content: center;
}
.avatar-text { color: var(--theme-primary); font-weight: bold; font-size: 16px; }

.room-icon {
  width: 36px; height: 36px; border-radius: 10px;
  background: var(--theme-bg-highlight);
  border: 1px solid var(--theme-shadow-primary);
}

.nickname, .room-name { font-size: 14px; font-weight: bold; color: #e4e4e7; }
.me-tag { color: var(--theme-primary); font-size: 12px; }
.title-tag { font-size: 11px; font-family: monospace; }
.room-desc { font-size: 11px; color: #a1a1aa; }

.score-val { font-size: 18px; font-family: monospace; font-weight: 900; color: #fff; }
.text-cyan { color: var(--theme-primary) !important; }
.score-unit { font-size: 10px; color: #71717a; margin-top: 2px;}

.flex { display: flex; }
.flex-col { display: flex; flex-direction: column; }
.justify-between { justify-content: space-between; }
.justify-center { justify-content: center; }
.items-center { align-items: center; }
.items-end { align-items: flex-end; }
.flex-1 { flex: 1; }
.text-center { text-align: center; }
.mt-1 { margin-top: 4px; }
.mt-2 { margin-top: 8px; }
.mt-4 { margin-top: 16px; }
.mb-4 { margin-bottom: 16px; }
.ml-2 { margin-left: 8px; }
.ml-3 { margin-left: 12px; }
.mr-2 { margin-right: 8px; }
</style>
