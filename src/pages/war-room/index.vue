<template>
  <view class="container flex-col" :style="themeStore.themeCssVars">
    <view class="header flex-col">
      <view class="flex justify-between items-center mb-4">
        <view class="room-info flex-col">
          <text class="room-title">全境通讯大厅</text>
          <text class="room-subtitle mt-1">寻找组织 或 发起血契对赌</text>
        </view>
        <view class="online-chip flex items-center">
          <view class="dot-live"></view>
          <text class="online-text ml-1">{{ totalOnline }} 在线</text>
        </view>
      </view>
      
      <view class="tab-wrapper flex">
        <view :class="['tab-item flex-1 flex justify-center', currentTab === 0 ? 'active' : '']" @click="currentTab = 0">
          <text class="tab-text">公共频段</text>
        </view>
        <view :class="['tab-item flex-1 flex justify-center', currentTab === 1 ? 'active' : '']" @click="currentTab = 1">
          <text class="tab-text">生死血契 🔒</text>
        </view>
      </view>
    </view>

    <!-- 全局防溢出的大厅滚动层 -->
    <scroll-view scroll-y class="hall-area flex-1 px-4 mt-4" scroll-with-animation>
      <!-- 战局搜索口 -->
      <view class="search-bar flex items-center mb-4">
        <text class="search-icon ml-3">🔍</text>
        <input 
          class="search-input flex-1 ml-2" 
          v-model="searchQuery" 
          placeholder="输入战役特征或 ID..." 
          placeholder-class="search-placeholder"
        />
        <view class="clear-btn p-2" v-if="searchQuery" @click="searchQuery = ''">
          <text class="text-gray-500">✕</text>
        </view>
      </view>

      <view v-if="currentTab === 0" class="fade-in-up">
        <RoomCard 
          v-for="room in filteredPublicRooms" :key="room.id"
          :roomType="room.type"
          :roomName="room.name"
          :description="room.description"
          :onlineCount="room.onlineCount"
          :maxUsers="room.maxUsers"
          :status="room.status"
          :isActive="room.id === warzoneStore.activePublicRoomId"
          @click="enterRoom(room)"
        />
      </view>
      
      <view v-else-if="currentTab === 1" class="fade-in-up">
        <view class="create-btn flex justify-center items-center mb-4" @click="handleCreateDeathMatch">
          <text class="btn-icon">⚔️</text>
          <text class="btn-text ml-2">发起新的战局</text>
        </view>
        
        <RoomCard 
          v-for="dm in filteredDeathMatches" :key="dm.id"
          :roomType="dm.type"
          :roomName="dm.name"
          :description="dm.description"
          :onlineCount="dm.onlineCount"
          :maxUsers="dm.maxUsers"
          :prizePool="dm.prizePool"
          :status="dm.status"
          :isActive="dm.id === warzoneStore.activeDeathMatchId"
          @click="enterRoom(dm)"
        />
      </view>
      
      <view class="pb-safe"></view>
    </scroll-view>

    <!-- 生死局创建弹窗 -->
    <ContractModal 
      :show="showContractModal" 
      @update:show="showContractModal = $event"
      @confirm="onContractCreated"
    />

    <CustomTabBar :current="1" />
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useThemeStore } from '../../store/theme.js'
import { useWarzoneStore } from '../../store/warzone.js'
import CustomTabBar from '../../components/common/CustomTabBar.vue'
import RoomCard from '../../components/war-room/RoomCard.vue'
import ContractModal from '../../components/war-room/ContractModal.vue'
import { onShow, onHide } from '@dcloudio/uni-app'

const themeStore = useThemeStore()
const warzoneStore = useWarzoneStore()

const currentTab = ref(0)
const showContractModal = ref(false)
const searchQuery = ref('')

onShow(() => {
  // 每次进入大厅，静默拉取一下最新数据
  warzoneStore.fetchRooms()
  
  // 不再执行任何强制路由跳转，让用户在重新切回战区Tab时，能够一览大盘全局
  const savedTab = uni.getStorageSync('warzone_current_tab')
  if (savedTab !== '') {
    currentTab.value = Number(savedTab)
  }
})

onHide(() => {
  uni.setStorageSync('warzone_current_tab', currentTab.value)
})

const publicRooms = computed(() => warzoneStore.publicRooms)
const deathMatches = computed(() => warzoneStore.deathMatches)

const matchSearch = (room) => {
  if (!searchQuery.value) return true
  const q = searchQuery.value.toLowerCase()
  return room.name.toLowerCase().includes(q) || 
         room.id.toLowerCase().includes(q) || 
         room.description.toLowerCase().includes(q)
}

const filteredPublicRooms = computed(() => publicRooms.value.filter(matchSearch))
const filteredDeathMatches = computed(() => deathMatches.value.filter(matchSearch))

const totalOnline = computed(() => {
  let count = 0
  publicRooms.value.forEach(r => count += r.onlineCount)
  deathMatches.value.forEach(r => count += r.onlineCount)
  return count > 500 ? 500 : count // Mock value cap
})

const handleCreateDeathMatch = () => {
  if (warzoneStore.activeDeathMatchId) {
     uni.showModal({
       title: '警告：身负血契',
       content: '作为神经连接者，你只能同时身处一条血契时间线。请返回当前战役执行撤离后重试。',
       showCancel: false,
       confirmColor: '#ef4444'
     })
     return
  }
  showContractModal.value = true
}

const enterRoom = (room) => {
  const isPublic = room.type === 'public'
  const currentActive = isPublic ? warzoneStore.activePublicRoomId : warzoneStore.activeDeathMatchId
  const typeName = isPublic ? '公共战区' : '生死血契战役'

  if (currentActive && currentActive !== room.id) {
     uni.showModal({
       title: '侦测到并行的神经驻留',
       content: `你目前正在参与第 ${currentActive} 号${typeName}。贸然切入新战区会导致意识粉碎。请先进入该战区并执行【撤离】。`,
       showCancel: false,
       confirmColor: '#ef4444'
     })
     return
  }

  uni.vibrateShort()
  
  if (isPublic) {
    warzoneStore.setActivePublicRoom(room.id)
    uni.navigateTo({ url: `/pages/war-room/chat-channel?id=${room.id}` })
  } else {
    warzoneStore.setActiveDeathMatch(room.id)
    uni.navigateTo({ url: `/pages/war-room/death-match?id=${room.id}` })
  }
}

const onContractCreated = async (formData) => {
  uni.showLoading({ title: '血契阵列生成中' })
  const res = await warzoneStore.createDeathMatch(formData)
  uni.hideLoading()
  if (res) {
    uni.showToast({ title: '血契已生成', icon: 'success' })
  }
}
</script>

<style scoped>
page { height: 100%; }
.container { 
  height: 100%; width: 100%; overflow-x: hidden; background-color: #09090b; display: flex; box-sizing: border-box; 
}
.header { 
  padding: calc(var(--status-bar-height) + 20px) 20px 12px 20px;
  background: rgba(9, 9, 11, 0.65);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  position: sticky; top: 0; z-index: 50;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03); width: 100%; box-sizing: border-box;
}

.room-title { font-size: 24px; font-weight: 900; color: var(--theme-primary); letter-spacing: 2px; text-shadow: 0 0 15px var(--theme-shadow-primary); }
.room-subtitle { font-size: 11px; color: #a1a1aa; letter-spacing: 1px; }

.online-chip { background: var(--theme-bg-highlight); border: 1px solid var(--theme-shadow-primary); padding: 3px 8px; border-radius: 10px; }
.dot-live { width: 6px; height: 6px; background-color: var(--theme-primary); border-radius: 50%; box-shadow: 0 0 5px var(--theme-primary); animation: blink 2s infinite; }
@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
.online-text { font-size: 10px; color: var(--theme-primary); font-family: monospace; padding-left: 4px; }

.tab-wrapper { background: rgba(255,255,255,0.05); padding: 4px; border-radius: 12px; }
.tab-item { padding: 8px 0; border-radius: 8px; transition: all 0.2s; }
.tab-item.active { background: var(--theme-primary); box-shadow: 0 0 10px var(--theme-shadow-primary); }
.tab-item.active .tab-text { color: #09090b; font-weight: bold; }
.tab-text { font-size: 13px; color: #a1a1aa; font-weight: bold;}

/* 搜索框强聚合样式 */
.search-bar {
  background: rgba(24, 24, 27, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  height: 44px;
  backdrop-filter: blur(10px);
  transition: all 0.3s;
  box-sizing: border-box;
}
.search-bar:focus-within {
  border-color: var(--theme-primary);
  box-shadow: 0 0 10px var(--theme-shadow-primary);
}
.search-icon { font-size: 16px; opacity: 0.6; }
.search-input { color: #fff; font-size: 14px; height: 100%; border: none; background: transparent;}
.search-placeholder { color: #52525b; font-size: 13px; }
.clear-btn { padding: 4px 10px; }
.text-gray-500 { color: #71717a; font-size: 14px; }

.hall-area { padding-bottom: 120px; box-sizing: border-box; width: 100%; } /* 留出 TabBar 空间及约束溢出 */
.create-btn {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(185, 28, 28, 0.4) 100%);
  border: 1px dashed rgba(239, 68, 68, 0.5);
  border-radius: 16px;
  padding: 16px;
  transition: all 0.2s;
}
.create-btn:active { transform: scale(0.98); background: rgba(239, 68, 68, 0.3); }
.btn-icon { font-size: 20px; }
.btn-text { font-size: 16px; font-weight: bold; color: #ef4444; letter-spacing: 1px; }

.fade-in-up { opacity: 0; transform: translateY(10px); animation: fadeInUp 0.4s forwards; }
@keyframes fadeInUp { to { opacity: 1; transform: translateY(0); } }

.flex { display: flex; }
.flex-col { display: flex; flex-direction: column; }
.flex-1 { flex: 1; }
.justify-between { justify-content: space-between; }
.justify-center { justify-content: center; }
.items-center { align-items: center; }
.px-4 { padding: 0 20px; }
.mt-4 { margin-top: 16px; }
.mt-1 { margin-top: 4px; }
.mb-4 { margin-bottom: 16px; }
.ml-1 { margin-left: 4px; }
.ml-2 { margin-left: 8px; }
.pb-safe { height: calc(88px + env(safe-area-inset-bottom)); }
</style>
