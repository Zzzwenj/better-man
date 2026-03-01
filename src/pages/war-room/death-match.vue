<template>
  <view class="container flex-col" :style="themeStore.themeCssVars">
    <view class="header flex justify-between items-center mb-4">
      <view class="flex items-center">
        <!-- 隐形大热区返回，配合细腻图标 -->
        <view class="back-action flex items-center justify-center p-2 mr-1" @click="goBack" hover-class="back-hover">
          <text class="icon-chevron">‹</text>
        </view>
        <view class="room-info flex-col">
          <text class="room-title">{{ dmRoom.name }}</text>
          <text class="room-subtitle mt-1">短位通讯口令 - {{ dmRoom.id }} <text class="copy-hint" @click.stop="copyId">复制</text></text>
        </view>
      </view>
      <!-- 右侧增加“举报 / 操作”入口 -->
      <view class="flex items-center">
        <view class="more-action flex items-center justify-center p-2" @click="handleMoreAction">
          <text class="icon-more">⋮</text>
        </view>
      </view>
    </view>
    
    <view class="px-4 mt-4 flex-1 fade-in-up" style="animation-delay: 0.1s;">
      <view class="status-card mb-6">
        <text class="status-label">奖金池 (神经币)</text>
        <view class="prize-pool mt-2 flex items-center">
          <text class="prize-icon">💰</text>
          <text class="prize-amount">{{ dmRoom.prizePool }}</text>
        </view>
        <text class="status-desc mt-2">存活者将平分全部奖金。破戒者当即出局并扣除保密金进入公池。</text>
      </view>
      
      <!-- 群主干预台 -->
      <view class="admin-panel mb-6" v-if="isOwner">
        <text class="panel-title flex items-center mb-3"><text class="text-xl mr-1">👑</text>一号位权限</text>
        <view class="btn-group flex flex-col gap-3">
          <view class="admin-btn edit-btn flex justify-center items-center" @click="editSlogan">
            <text class="btn-text">修改战役宣言 / 公告</text>
          </view>
        </view>
      </view>

      <view class="participant-list">
        <view class="flex justify-between items-center mb-4">
          <text class="list-title">生还名单 ({{ dmRoom.onlineCount }} / {{ dmRoom.maxUsers }})</text>
          <view class="invite-action-btn flex items-center p-2" @click="handleInvite" v-if="dmRoom.onlineCount < dmRoom.maxUsers">
             <text class="text-sm font-bold text-primary">✚ 招收战友</text>
          </view>
        </view>
        <!-- 占位假数据 -->
        <view class="user-row flex justify-between items-center mb-3">
          <view class="flex items-center">
            <view class="user-avatar bg-primary text-black font-bold flex items-center justify-center">我</view>
            <text class="user-name ml-2">特工 #当前你</text>
          </view>
          <text class="status-alive text-green">存活</text>
        </view>
      </view>
    </view>
    
    <!-- 分享/引流 赛博征召海报蒙层 -->
    <view class="share-overlay flex justify-center items-center" v-if="showShareModal" @click="showShareModal = false">
      <view class="share-card flex-col items-center" @click.stop>
        <view class="share-header flex-col items-center w-full mb-4">
          <text class="share-brand tracking-widest text-primary mb-1">=== BETTER MAN ===</text>
          <text class="share-title">觉醒者强制征召令</text>
          <text class="share-subtitle text-center mt-2">系统检测到你的能量场波动，第 {{ dmRoom.id }} 号战区正在集结。</text>
        </view>
        
        <view class="qr-container flex-col items-center justify-center p-4 mb-4">
          <!-- 模拟高级渐变边界与扫码框 -->
          <view class="qr-mock flex justify-center items-center relative">
            <view class="scan-line"></view>
            <text class="text-xs text-gray-800 font-bold relative z-10 text-center">📱<br/>微信/相机扫码<br/>一键加入战局</text>
          </view>
          <text class="text-xs text-gray-500 mt-2">DeepLink: app.betterman.vip/join/{{ dmRoom.id }}</text>
        </view>

        <view class="code-box flex-col items-center justify-center w-full mb-6">
          <text class="text-xs text-gray-400 mb-1">或于大厅军用终端输入入场标识：</text>
          <text class="room-code-display">{{ dmRoom.id }}</text>
        </view>
        
        <view class="flex gap-3 w-full">
           <view class="action-btn border-btn flex-1 flex justify-center items-center" @click="copyLink">
              <text class="btn-text">复制招募链</text>
           </view>
           <view class="action-btn primary-btn flex-1 flex justify-center items-center" @click="savePoster">
              <text class="btn-text">生成通缉海报</text>
           </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useThemeStore } from '../../store/theme.js'
import { useWarzoneStore } from '../../store/warzone.js'

const themeStore = useThemeStore()
const warzoneStore = useWarzoneStore()

let roomId = ''
const showShareModal = ref(false)

const dmRoom = computed(() => {
  return warzoneStore.deathMatches.find(r => r.id === roomId) || {
    id: '??????', name: '未知对局', maxUsers: 0, onlineCount: 0, prizePool: 0
  }
})

// 模拟群主判定 (未来接入实际建房人 UID 判断)
const isOwner = computed(() => true) 

const displayRoomNum = computed(() => {
  // 原有的截取逻辑不再需要，因为已经是短id，我们备用直接展示短id
  return roomId
})

onLoad((options) => {
  roomId = options.id || ''
  uni.hideTabBar()
})

const goBack = () => {
  const pages = getCurrentPages()
  if (pages.length <= 1) {
    uni.switchTab({ url: '/pages/dashboard/index' })
  } else {
    uni.navigateBack({
      fail: () => {
        uni.switchTab({ url: '/pages/dashboard/index' })
      }
    })
  }
}

const leaveRoom = () => {
  uni.showModal({
    title: '撤离警告',
    content: '撤离后你将断开与该战役的通讯链接。是否继续撤离？',
    confirmText: '坚决撤离',
    confirmColor: '#ef4444',
    success: (res) => {
      if (res.confirm) {
        warzoneStore.clearActiveDeathMatch()
        uni.switchTab({ url: '/pages/war-room/index' })
      }
    }
  })
}

// 举报 / 更多交互
const handleMoreAction = () => {
  uni.showActionSheet({
    itemList: ['撤离当前生死局', '举报违背契约精神行为', '投诉不良内容', '屏蔽此战局'],
    itemColor: '#ef4444',
    success: (res) => {
      if (res.tapIndex === 0) {
         leaveRoom()
      } else if (res.tapIndex === 1 || res.tapIndex === 2) {
        uni.showToast({ title: '已将证据锚定并上报肃清委员会', icon: 'none' })
      } else {
        uni.showToast({ title: '已切断与该对决的共振', icon: 'none' })
      }
    }
  })
}

// 修改宣言
const editSlogan = () => {
  uni.showModal({
    title: '修改宣言',
    content: '新宣言将通过推流同步给所有参战者',
    editable: true,
    placeholderText: '绝不退缩...',
    confirmColor: themeStore.activeThemeData.primary,
    success: (res) => {
      if (res.confirm && res.content) {
        uni.showToast({ title: '战役密码已更替', icon: 'success' })
      }
    }
  })
}

const handleInvite = () => {
   showShareModal.value = true
}

// 复制带 Deep Linking 的征召文案
const copyLink = () => {
    const inviteText = `【生死血契召集】我已在 Better Man 建立/加入第 ${dmRoom.value.id} 号净化战役。\n\n你有种来接下这局豪赌吗？\n🔗 浏览器内点击直达，未安装自动跳商店：\nhttps://app.betterman.vip/join/${dmRoom.value.id}\n\n也可在战区大厅直输入口令：${dmRoom.value.id}`
    uni.setClipboardData({
        data: inviteText,
        success: () => {
            uni.showToast({ title: '召集令已复制，发送给猎物吧' , icon: 'none' })
            showShareModal.value = false
        }
    })
}

// 保存合成海报到相册
const savePoster = () => {
    uni.showLoading({ title: '正在渲染通缉令...' })
    setTimeout(() => { 
      uni.hideLoading()
      uni.showToast({ title: '已将高能海报封存到画廊', icon: 'success' })
      showShareModal.value = false 
    }, 1200)
}
</script>

<style scoped>
page { height: 100%; }
.container { 
  height: 100%; width: 100%; background-color: #09090b; 
}
.header { 
  padding: calc(var(--status-bar-height) + 24px) 20px 16px 20px;
  background: linear-gradient(180deg, rgba(9, 9, 11, 0.9) 0%, rgba(9, 9, 11, 0.4) 100%);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  position: sticky; top: 0; z-index: 50;
  box-sizing: border-box;
  width: 100%;
}
.room-title { font-size: 20px; font-weight: 800; color: #ef4444; letter-spacing: 1px; text-shadow: 0 0 15px rgba(239, 68, 68, 0.5); }
.room-subtitle { font-size: 11px; color: #a1a1aa; letter-spacing: 1px; }

.back-action { border-radius: 50%; transition: background-color 0.2s; }
.back-hover { background-color: rgba(255, 255, 255, 0.1); }
.icon-chevron { font-size: 32px; color: #fff; font-weight: 300; line-height: 1; margin-top: -4px;}

.more-action { transition: opacity 0.2s; color: #a1a1aa; }
.more-action:active { opacity: 0.5; }
.icon-more { font-size: 24px; font-weight: bold; line-height: 1; margin-top: -2px; }

.px-4 { padding: 0 20px; }
.p-2 { padding: 8px; margin-left: -8px; }
.mt-4 { margin-top: 16px; }
.mt-2 { margin-top: 8px; }
.mb-6 { margin-bottom: 24px; }
.mb-4 { margin-bottom: 16px; }
.mb-3 { margin-bottom: 12px; }
.ml-2 { margin-left: 8px; }
.flex { display: flex; }
.flex-col { display: flex; flex-direction: column; }
.flex-1 { flex: 1; overflow-y: auto; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.justify-center { justify-content: center; }
.block { display: block; }

.status-card {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(185, 28, 28, 0.05) 100%);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}
.status-label { font-size: 13px; color: #a1a1aa; }
.prize-amount { font-size: 36px; font-weight: 900; color: #facc15; font-family: monospace; letter-spacing: 2px; }
.prize-icon { font-size: 28px; margin-right: 8px; }
.status-desc { font-size: 12px; color: #d4d4d8; line-height: 1.5; }

/* 管理员面板 */
.admin-panel {
  background: rgba(24, 24, 27, 0.6);
  border: 1px solid rgba(24acc15, 0.2);
  border-radius: 16px;
  padding: 16px;
  backdrop-filter: blur(10px);
}
.panel-title { font-size: 14px; font-weight: bold; color: #facc15; }
.text-xl { font-size: 18px; }
.gap-3 { gap: 12px; }
.admin-btn { border-radius: 12px; padding: 12px 0; transition: transform 0.2s; }
.admin-btn:active { transform: scale(0.95); }
.edit-btn { background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); }
.edit-btn .btn-text { color: #e4e4e7; font-size: 13px; font-weight: bold; }

.list-title { font-size: 16px; font-weight: bold; color: #fff; }
.invite-action-btn { background: rgba(0, 229, 255, 0.1); border-radius: 20px; border: 1px solid rgba(0, 229, 255, 0.2); }
.text-primary { color: var(--theme-primary, #00e5ff); }
.text-sm { font-size: 12px; }
.user-row { background: rgba(255,255,255,0.05); padding: 12px; border-radius: 12px; }
.user-avatar { width: 36px; height: 36px; border-radius: 10px; font-size: 14px; }
.bg-primary { background: var(--theme-primary); }
.text-black { color: #000; }
.font-bold { font-weight: bold; }
.user-name { font-size: 14px; color: #e4e4e7; font-family: monospace; }
.status-alive { font-size: 12px; font-weight: bold; }
.text-green { color: #10b981; }
.copy-hint { background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 6px; margin-left: 6px; text-decoration: underline; }

.fade-in-up { opacity: 0; transform: translateY(15px); animation: fadeInUp 0.4s cubic-bezier(0.25, 0.8, 0.25, 1) forwards; }
@keyframes fadeInUp { to { opacity: 1; transform: translateY(0); } }

/* 赛博朋克深海报蒙层分享 */
.share-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.85); z-index: 999; backdrop-filter: blur(10px); }
.share-card { 
  background: linear-gradient(145deg, #18181b 0%, #09090b 100%); 
  width: 85%; 
  border-radius: 8px; /* 故意改用硬朗的边角 */
  padding: 30px 24px; 
  border: 1px solid var(--theme-primary, #00e5ff); 
  box-shadow: 0 0 30px rgba(0, 229, 255, 0.15), inset 0 0 20px rgba(0, 229, 255, 0.05); 
  animation: popScale 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); 
  position: relative;
  overflow: hidden;
}
.share-card::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: var(--theme-primary);
}
@keyframes popScale { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }

.share-brand { font-size: 10px; font-weight: bold; font-family: monospace; letter-spacing: 2px; }
.tracking-widest { letter-spacing: 0.1em; }
.share-title { font-size: 22px; font-weight: 900; color: #fff; letter-spacing: 1px; text-shadow: 0 2px 10px rgba(255,255,255,0.2); }
.share-subtitle { font-size: 13px; color: #a1a1aa; line-height: 1.6; }

.qr-container { background: rgba(0,0,0,0.3); border-radius: 8px; border: 1px dashed rgba(255,255,255,0.1); width: 100%;}
.qr-mock { 
  width: 140px; height: 140px; background: #fff; 
  border: 4px solid var(--theme-primary); 
  box-shadow: 0 0 20px rgba(0, 229, 255, 0.4);
  overflow: hidden;
}
.scan-line {
  position: absolute; top: 0; left: 0; width: 100%; height: 2px; background: var(--theme-primary);
  box-shadow: 0 0 10px 2px var(--theme-primary);
  animation: scan 2s linear infinite;
  z-index: 5;
}
@keyframes scan { 0% { top: 0; } 50% { top: 100%; } 100% { top: 0; } }

.text-gray-800 { color: #27272a; }
.relative { position: relative; }
.z-10 { z-index: 10; }
.text-xs { font-size: 10px; }
.text-gray-400 { color: #a1a1aa; }
.text-gray-500 { color: #71717a; }

.code-box { background: rgba(0, 229, 255, 0.05); padding: 12px; border-radius: 8px; border: 1px solid rgba(0,229,255,0.1); }
.room-code-display { font-family: monospace; font-size: 36px; font-weight: 900; letter-spacing: 6px; color: var(--theme-primary, #00e5ff); text-shadow: 0 0 15px rgba(0, 229, 255, 0.6); }

.w-full { width: 100%; }
.action-btn { padding: 14px 0; border-radius: 8px; transition: all 0.2s;}
.action-btn:active { transform: scale(0.96); opacity: 0.8; }
.border-btn { border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.05); }
.border-btn .btn-text { color: #fff; font-size: 14px; font-weight: bold; }
.primary-btn { background: var(--theme-primary, #00e5ff); box-shadow: 0 4px 15px rgba(0, 229, 255, 0.3); }
.primary-btn .btn-text { color: #000; font-weight: 900; font-size: 14px; }
</style>
