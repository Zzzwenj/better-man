<template>
  <view class="container flex-col" :class="{ 'war-mode': currentTab === 1 }" :style="themeStore.themeCssVars">
    <view class="header flex-col">
      <view class="flex justify-between items-center mb-4">
        <view class="room-info flex-col">
          <text class="room-title">全境通讯大厅</text>
          <text class="room-subtitle mt-1">寻找组织 或 组建连坐小队</text>
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
          <text class="tab-text">斯巴达小队 🛡️</text>
        </view>
      </view>
    </view>

    <!-- 全局防溢出的大厅滚动层 -->
    <scroll-view scroll-y class="hall-area flex-1 px-4 mt-4" scroll-with-animation :show-scrollbar="false">
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
        <!-- 新增: 创建公共大厅按钮 -->
        <view class="create-btn public-create-btn flex justify-center items-center mb-4" @click="handleCreatePublicRoom">
          <text class="btn-icon">📡</text>
          <text class="btn-text ml-2">建立新的公共通讯频段</text>
        </view>

        <RoomCard 
          v-for="room in filteredPublicRooms" :key="room.id"
          :roomId="room.id"
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
        <view class="create-btn flex justify-center items-center mb-4" :class="{ 'active-squad': warzoneStore.activeDeathMatchId }" @click="handleCreateDeathMatch">
          <text class="btn-icon">🛡️</text>
          <text class="btn-text ml-2">{{ warzoneStore.activeDeathMatchId ? '进入我的连坐小队' : '招募连坐小队' }}</text>
        </view>
        
        <RoomCard 
          v-for="dm in filteredDeathMatches" :key="dm.id"
          :roomId="dm.id"
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

    <ContractModal 
      :show="showContractModal" 
      @update:show="showContractModal = $event"
      @confirm="onContractCreated"
    />

    <!-- 新增：公共大厅建房弹窗 -->
    <CyberDialog 
      :show="showPublicRoomModal"
      title="📡 建立公共信号塔"
      confirmText="申请建立 (消耗 200 神经币)"
      :showCancel="true"
      color="#10b981"
      @update:show="showPublicRoomModal = $event"
      @confirm="doCreatePublicRoom"
      @cancel="showPublicRoomModal = false"
    >
      <view class="flex-col pb-2">
        <text class="text-xs text-gray-500 mb-2">黑金 VIP 探员可免除建塔费用</text>
        <input 
          v-model="publicRoomForm.name" 
          class="cyber-input mb-3" 
          placeholder="代号 (必填) 如：斯巴达300" 
          placeholder-style="color: #52525b; font-size: 13px;"
        />
        <input 
          v-model="publicRoomForm.slogan" 
          class="cyber-input mb-3" 
          placeholder="阵列精神纲领 (可选)" 
          placeholder-style="color: #52525b; font-size: 13px;"
        />
        
        <text class="text-xs text-gray-500 mb-2 mt-1">频段容载量 (最大接入节点):</text>
        <view class="flex gap-2 mb-3">
          <view 
            v-for="size in [50, 100, 500]" :key="size" 
            class="tag-btn flex-1 flex justify-center items-center py-1.5"
            :class="{ 'active-tag': publicRoomForm.maxUsers === size }"
            @click="publicRoomForm.maxUsers = size"
          >
            <text class="text-xs">{{size}} 节点</text>
          </view>
        </view>

        <text class="text-xs text-gray-500 mb-2">阵列倾向 (环境设定):</text>
        <view class="flex gap-2 mb-2">
          <view 
            v-for="cat in ['极客共修', '深度潜航', '闲聊摸鱼']" :key="cat" 
            class="tag-btn flex-1 flex justify-center items-center py-1.5"
            :class="{ 'active-tag': publicRoomForm.category === cat }"
            @click="publicRoomForm.category = cat"
          >
            <text class="text-xs">{{cat}}</text>
          </view>
        </view>
      </view>
    </CyberDialog>

    <CyberDialog
      v-model:show="dialog.show"
      :title="dialog.title"
      :content="dialog.content"
      :color="dialog.color"
    />

    <CustomTabBar :current="2" />
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useThemeStore } from '../../store/theme.js'
import { useWarzoneStore } from '../../store/warzone.js'
import CustomTabBar from '../../components/common/CustomTabBar.vue'
import RoomCard from '../../components/war-room/RoomCard.vue'
import ContractModal from '../../components/war-room/ContractModal.vue'
import CyberDialog from '../../components/common/CyberDialog.vue'
import { useUserStore } from '../../store/user.js'
import { onShow, onHide } from '@dcloudio/uni-app'

const themeStore = useThemeStore()
const warzoneStore = useWarzoneStore()
const userStore = useUserStore()

const currentTab = ref(0)
const showContractModal = ref(false)
const showPublicRoomModal = ref(false)
const publicRoomForm = ref({ name: '', slogan: '', maxUsers: 50, category: '闲聊摸鱼' })
const searchQuery = ref('')

const dialog = ref({
  show: false,
  title: '',
  content: '',
  color: '#ef4444'
})

const showWarning = (title, content) => {
  dialog.value = {
    show: true,
    title,
    content,
    color: '#ef4444'
  }
}

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

const filteredPublicRooms = computed(() => {
  const list = publicRooms.value.filter(matchSearch)
  const activeId = warzoneStore.activePublicRoomId
  if (!activeId) return list
  
  // 置顶逻辑
  const activeIdx = list.findIndex(r => r.id === activeId)
  if (activeIdx > -1) {
    const activeRoom = list.splice(activeIdx, 1)[0]
    list.unshift(activeRoom)
  }
  return list
})

const filteredDeathMatches = computed(() => {
  const list = deathMatches.value.filter(matchSearch)
  const activeId = warzoneStore.activeDeathMatchId
  if (!activeId) return list
  
  // 置顶逻辑
  const activeIdx = list.findIndex(r => r.id === activeId)
  if (activeIdx > -1) {
    const activeRoom = list.splice(activeIdx, 1)[0]
    list.unshift(activeRoom)
  }
  return list
})

const totalOnline = computed(() => {
  let count = 0
  publicRooms.value.forEach(r => count += r.onlineCount)
  deathMatches.value.forEach(r => count += r.onlineCount)
  return count > 500 ? 500 : count // Mock value cap
})

const handleCreateDeathMatch = () => {
  if (warzoneStore.activeDeathMatchId) {
     uni.navigateTo({ url: `/pages/war-room/death-match?id=${warzoneStore.activeDeathMatchId}` })
     return
  }
  showContractModal.value = true
}

const handleCreatePublicRoom = () => {
  showPublicRoomModal.value = true
}

const doCreatePublicRoom = async () => {
  if (!publicRoomForm.value.name.trim()) {
    uni.showToast({ title: '大厅代号不能为空', icon: 'none' })
    return
  }
  
  if (!userStore.isVipActive) {
      const success = userStore.spendCoins(200, '申请建立公共通讯阵列')
      if (!success) {
          uni.showToast({ title: '神经币不足，无法建立通道', icon: 'none' })
          return
      }
  }

  uni.showLoading({ title: '信号塔架设中...' })
  // 这里有可能是因为 store 没热更新，加上 ?. 调用防崩溃，或者通过获取实例确保加载
  const res = await warzoneStore.createPublicRoom({
      name: publicRoomForm.value.name.trim(),
      slogan: publicRoomForm.value.slogan.trim(),
      maxUsers: publicRoomForm.value.maxUsers,
      category: publicRoomForm.value.category
  })
  uni.hideLoading()
  
  if (res) {
      showPublicRoomModal.value = false
      uni.showToast({ title: '大厅部署成功', icon: 'success' })
      publicRoomForm.value = { name: '', slogan: '', maxUsers: 50, category: '闲聊摸鱼' }
  }
}

const enterRoom = (room) => {
  const isPublic = room.type === 'public'
  const currentActive = isPublic ? warzoneStore.activePublicRoomId : warzoneStore.activeDeathMatchId
  const typeName = isPublic ? '公共战区' : '连坐小队部署序列'

  if (currentActive && currentActive !== room.id) {
     showWarning('侦测到并行的部署指令', `你目前正在参与第 ${currentActive} 号${typeName}。贸然切入新战区会导致意识粉碎。请先进入该战区并执行【撤离】。`)
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
  uni.showLoading({ title: '小队阵列部署中' })
  const res = await warzoneStore.createDeathMatch(formData)
  uni.hideLoading()
  if (res) {
    uni.showToast({ title: '小队信标已生成', icon: 'success' })
  }
}
</script>

<style scoped>
page { height: 100%; }
.container { 
  height: 100%; width: 100%; overflow-x: hidden; background-color: #09090b; display: flex; box-sizing: border-box; 
}
.header { 
  padding: calc(var(--status-bar-height) + 24px) 20px 12px 20px;
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
.search-icon { font-size: 16px; opacity: 0.6; padding-left: 10px;}
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

/* 公共大厅新建按钮改色 */
.public-create-btn {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.3) 100%);
  border: 1px dashed rgba(16, 185, 129, 0.4);
}
.public-create-btn:active { background: rgba(16, 185, 129, 0.3); }
.public-create-btn .btn-text { color: #10b981; }

.btn-icon { font-size: 20px; }
.btn-text { font-size: 16px; font-weight: bold; color: #ef4444; letter-spacing: 1px; }

/* 赛博风输入框 */
.cyber-input {
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  height: 44px;
  padding: 0 12px;
  color: #e4e4e7;
  font-size: 14px;
  transition: all 0.2s;
}
.cyber-input:focus {
  border-color: #10b981;
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.2);
}
.text-xs { font-size: 12px; }
.text-gray-500 { color: #71717a; }

/* 标签选择按钮 */
.gap-2 { gap: 8px; }
.py-1\.5 { padding-top: 6px; padding-bottom: 6px; }
.tag-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #a1a1aa;
  transition: all 0.2s;
}
.tag-btn:active { transform: scale(0.95); }
.tag-btn.active-tag {
  background: rgba(16, 185, 129, 0.15);
  border-color: rgba(16, 185, 129, 0.5);
  color: #10b981;
  font-weight: bold;
}

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

/* 连坐小队 战时氛围 */
.war-mode {
  transition: all 0.5s ease-in-out;
  background-image: 
    radial-gradient(circle at 100% 0%, rgba(239, 68, 68, 0.15) 0%, transparent 60%),
    radial-gradient(circle at 0% 100%, rgba(185, 28, 28, 0.1) 0%, transparent 60%);
}

.war-mode .room-title {
  color: #ef4444 !important;
  text-shadow: 0 0 20px rgba(239, 68, 68, 0.6) !important;
  animation: textFlicker 2s infinite;
}

/* 联通红化小组件 */
.war-mode .tab-item.active { background: #ef4444 !important; box-shadow: 0 0 10px rgba(239, 68, 68, 0.5) !important; }
.war-mode .online-chip { background: rgba(239, 68, 68, 0.1) !important; border-color: rgba(239, 68, 68, 0.3) !important; }
.war-mode .dot-live { background-color: #ef4444 !important; box-shadow: 0 0 5px #ef4444 !important; }
.war-mode .online-text { color: #ef4444 !important; }

@keyframes textFlicker {
  0%, 100% { opacity: 1; text-shadow: 0 0 20px rgba(239, 68, 68, 0.6); }
  50% { opacity: 0.8; text-shadow: 0 0 10px rgba(239, 68, 68, 0.3); }
}
</style>
