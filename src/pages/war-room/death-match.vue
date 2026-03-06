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
        <text class="status-label">连坐惩罚协议</text>
        <view class="prize-pool mt-2 flex justify-between items-center">
          <view class="flex items-center">
            <text class="prize-icon">⚠️</text>
            <text class="prize-amount text-red-500 text-xl font-bold">全队倒退 20%</text>
          </view>
          <view class="flex-col items-end" v-if="dmRoom.onlineCount < dmRoom.maxUsers">
            <text class="text-xs text-red-500 font-bold">集结倒计时</text>
            <text class="countdown-val">{{ countdownText || '计算中...' }}</text>
          </view>
        </view>
        <text class="status-desc mt-2">小队同生共死。任何一人生理防线崩溃，全队神经进度强制倒退并面临系统锁屏的物理级惩罚。</text>
      </view>

      <!-- 战役宣言展示区 (置顶加强) -->
      <view class="slogan-card mb-6 flex-col">
        <view class="flex items-center mb-2">
          <text class="slogan-tag">战役宣言</text>
          <view class="tag-line flex-1 ml-2"></view>
        </view>
        <text class="slogan-text">“ {{ dmRoom.slogan }} ”</text>
      </view>
      
      <!-- 个人操作控制台 -->
      <view class="admin-panel mb-6">
        <view class="flex justify-between items-center">
          <text class="panel-title flex items-center"><text class="text-xl mr-1">🛡️</text>战术防具库</text>
          <view class="flex gap-3">
             <text class="edit-link text-yellow-500" @click="buyShield">配装静音防护罩</text>
             <text v-if="isOwner" class="edit-link" @click="editSlogan">编辑宣言 ✎</text>
          </view>
        </view>
      </view>

        <view class="participant-list">
          <view class="flex justify-between items-center mb-4">
            <text class="list-title">生还名单 ({{ dmRoom.onlineCount }} / {{ dmRoom.maxUsers }})</text>
            <!-- 征召令：所有成员均可生成，促进病毒式引流 -->
            <view class="invite-chip flex items-center" @click="handleInvite" hover-class="invite-chip-hover">
              <text class="invite-chip-icon">📡</text>
              <text class="invite-chip-text">生成征召令</text>
            </view>
          </view>
          
          <view v-if="memberLoading" class="text-center py-4 text-xs text-gray-500">神经链接扫描中...</view>
          
          <view v-else>
            <view 
              v-for="user in currentMembers" 
              :key="user._id"
              class="user-row flex justify-between items-center mb-3" 
              @longpress="handleUserLongPress(user)"
            >
              <view class="flex items-center">
                <view class="user-avatar bg-primary text-black font-bold flex items-center justify-center overflow-hidden">
                   <image v-if="user.avatar" :src="user.avatar" mode="aspectFill" style="width: 100%; height: 100%;" />
                   <text v-else>{{ user.nickname ? user.nickname.substring(0,1) : '?' }}</text>
                </view>
                <text class="user-name ml-2">{{ user.nickname || '匿名特工' }} <text v-if="user._id === currentUid" class="text-xs text-primary">(我)</text></text>
              </view>
              <text class="status-alive text-green">存活</text>
            </view>
          </view>

        </view>
    </view>
    
    <!-- 分享/引流 赛博征召海报蒙层 -->
    <view class="share-overlay flex justify-center items-center" v-if="showShareModal" @click="showShareModal = false">
      <view class="share-card flex-col items-center" @click.stop>
        <view class="share-header flex-col items-center w-full mb-4">
          <text class="share-brand tracking-widest text-primary mb-1">=== BETTER MAN ===</text>
          <text class="share-title">觉醒者强制征召令</text>
          <text class="share-subtitle text-center mt-2">系统发出连坐组队协议，第 {{ dmRoom.id }} 号战区正在集结。</text>
        </view>
        
        <view class="qr-container flex-col items-center justify-center p-4 mb-4">
          <!-- 采用云端合成的真二维码 (2026 方案: 动态接口渲染) -->
          <view class="qr-mock flex justify-center items-center relative">
            <view class="scan-line" v-if="!qrLoading"></view>
            <view class="qr-placeholder flex items-center justify-center" v-if="qrLoading">
               <text class="loading-icon">⚡</text>
            </view>
            <image 
              class="qr-real-img" 
              :src="`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://app.betterman.vip/join/${dmRoom.id}&bgcolor=ffffff&color=000000`"
              mode="aspectFit"
              @load="onQrLoad"
            ></image>
          </view>
          <text class="text-xs text-gray-500 mt-2">感知链接: app.betterman.vip/join/{{ dmRoom.id }}</text>
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

    <!-- 弹窗：宣言修改 (自定义组件) -->
    <SloganEditModal 
      v-model:show="showSloganModal" 
      :value="dmRoom.slogan"
      @confirm="onSloganConfirm"
    />

    <CyberDialog
      v-model:show="dialog.show"
      :title="dialog.title"
      :content="dialog.content"
      :showCancel="true"
      confirmText="确定撤离"
      @confirm="executeLeave"
    />

    <!-- 自定义操作菜单 -->
    <CyberActionSheet
      v-model:show="actionSheet.show"
      :title="actionSheet.title"
      :itemList="actionSheet.list"
      @select="onActionSelect"
    />

    <!-- 离屏画布：用于合成海报 -->
    <canvas canvas-id="posterCanvas" style="width: 750px; height: 1334px; position: absolute; left: -9999px; visibility: hidden;"></canvas>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useThemeStore } from '../../store/theme.js'
import { useUserStore } from '../../store/user.js'
import { useWarzoneStore } from '../../store/warzone.js'
import { serverTime } from '@/utils/serverTime.js'
import SloganEditModal from '../../components/war-room/SloganEditModal.vue'
import CyberDialog from '../../components/common/CyberDialog.vue'
import CyberActionSheet from '../../components/common/CyberActionSheet.vue'

const themeStore = useThemeStore()
const warzoneStore = useWarzoneStore()

const roomId = ref('')
const showShareModal = ref(false)
const showSloganModal = ref(false)

const dmRoom = computed(() => {
  return warzoneStore.deathMatches.find(r => r.id === roomId.value) || {
    id: '??????', name: '未知对局', maxUsers: 0, onlineCount: 0, prizePool: 0, slogan: '绝不退缩...', expiryTime: 0
  }
})

const isOwner = computed(() => {
  const token = uni.getStorageSync('uni_id_token')
  const currentUid = token ? token.split('_').pop() : ''
  return dmRoom.value.creator_id === currentUid
})

const displayRoomNum = computed(() => {
  return roomId.value
})

const currentMembers = ref([])
const memberLoading = ref(true)

const currentUid = computed(() => {
  const token = uni.getStorageSync('uni_id_token')
  return token ? token.split('_').pop() : ''
})

onLoad(async (options) => {
  roomId.value = options.id || ''
  uni.hideTabBar()

  // 先拉取云端数据，保证 expiryTime 就绪，再启动倒计时
  await warzoneStore.fetchRooms()
  
  // 拉取真实存活名单（字段统一用 .id）
  if (dmRoom.value && dmRoom.value.id && dmRoom.value.id !== '??????') {
     const members = await warzoneStore.fetchRoomMembers(dmRoom.value.id)
     currentMembers.value = members
     memberLoading.value = false
  }

  startCountdown()
  
  // 预加载二维码以提升海报生成速度
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://app.betterman.vip/join/${roomId.value}&bgcolor=ffffff&color=000000`
  uni.getImageInfo({ 
    src: qrUrl,
    success: (res) => {
      cachedQrPath.value = res.path
    }
  })
})

const cachedQrPath = ref('')

const dialog = ref({ show: false, title: '', content: '' })
const actionSheet = ref({ show: false, title: '', list: [], type: '' })
const qrLoading = ref(true)
const countdownText = ref('')

/**
 * 启动征召倒计时
 * 首次立即计算，之后每秒更新，避免进入页面时空白 1 秒
 */
const startCountdown = () => {
  // 内联计算函数，首次调用 + interval 复用
  const tick = () => {
    if (!dmRoom.value.expiryTime) {
      // 数据仍未就绪（极端情况兜底）
      countdownText.value = '计算中...'
      return
    }
    const now = serverTime.now()
    const diff = dmRoom.value.expiryTime - now
    if (diff <= 0) {
      clearInterval(timer)
      countdownText.value = '征召已强制终结'
      return
    }
    const h = Math.floor(diff / (3600 * 1000))
    const m = Math.floor((diff % (3600 * 1000)) / (60 * 1000))
    const s = Math.floor((diff % (60 * 1000)) / 1000)
    countdownText.value = `${h}h ${m}m ${s}s`
  }
  tick() // 立即执行一次，不等 1 秒
  const timer = setInterval(tick, 1000)
}

const onQrLoad = () => {
  qrLoading.value = false
}

/** 复制当前房间 ID 到剪贴板 */
const copyId = () => {
  if (!dmRoom.value.id) return
  uni.setClipboardData({
    data: String(dmRoom.value.id),
    success: () => uni.showToast({ title: '战局口令已提取', icon: 'none' })
  })
}

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
  if (isOwner.value && dmRoom.value.status === 'waiting') {
      dialog.value = {
        show: true,
        title: '解散小队确认',
        content: '作为第一缔约人，此时撤离将判定为[本局流局]，小队将被立即解散。是否继续解散？'
      }
  } else {
      dialog.value = {
        show: true,
        title: '撤离警告',
        content: '撤离后你将断开与该小队的连坐协议。作为契约者，此时撤离将面临严峻的系统惩罚。是否继续？'
      }
  }
}

const executeLeave = async () => {
  const success = await warzoneStore.leaveRoomAction(dmRoom.value.room_id, true)
  if (success) {
    uni.switchTab({ url: '/pages/war-room/index' })
  }
}

// 举报 / 更多交互
const handleMoreAction = () => {
  actionSheet.value = {
    show: true,
    title: '战区战术指令',
    list: ['强行脱离连坐小队', '举报虚假打卡者', '投诉不良内容', '屏蔽此战局'],
    type: 'more'
  }
}

const handleUserLongPress = () => {
  actionSheet.value = {
    show: true,
    title: '探员交互操作',
    list: ['举报该探员违规', '屏蔽此探员通讯'],
    type: 'user'
  }
}

const onActionSelect = (index) => {
  if (actionSheet.value.type === 'more') {
    if (index === 0) {
       leaveRoom()
    } else if (index === 1 || index === 2) {
      uni.showToast({ title: '已将证据锚定并上报肃清委员会', icon: 'none' })
    } else {
      uni.showToast({ title: '已切断与该对决的共振', icon: 'none' })
    }
  } else if (actionSheet.value.type === 'user') {
    uni.showToast({ title: '投诉已提交，正在同步至治安局', icon: 'none' })
  }
}

// 修改宣言
const editSlogan = () => {
  showSloganModal.value = true
}

// 购买防具
const buyShield = () => {
  uni.showToast({ title: '静音防护罩正在进货，敬请期待', icon: 'none' })
}

const onSloganConfirm = (newSlogan) => {
  uni.showLoading({ title: '加密传输中...' })
  setTimeout(() => {
    // 调用 store 的 saveSlogan，同时更新内存 + 就算重进页面也能恢复
    warzoneStore.saveSlogan(roomId.value, newSlogan)
    uni.hideLoading()
    uni.showToast({ title: '战役口令已更替', icon: 'success' })
  }, 1000)
}

const handleInvite = () => {
   showShareModal.value = true
}

// 复制带 Deep Linking 的征召文案
const copyLink = () => {
    const inviteText = `【斯巴达小队召集】我已在 Better Man 发起第 ${dmRoom.value.id} 号连坐协议。\n\n你有种把后背交给我吗？\n🔗 浏览器点击直达，未安装自动跳商店：\nhttps://app.betterman.vip/join/${dmRoom.value.id}\n\n也可在战区大厅直输入口令：${dmRoom.value.id}`
    uni.setClipboardData({
        data: inviteText,
        success: () => {
            uni.showToast({ title: '召集令已复制，发送给猎物吧' , icon: 'none' })
            showShareModal.value = false
        }
    })
}

// 保存合成海报到相册 (真正实现)
const savePoster = async () => {
    uni.showLoading({ title: '神经网络渲染中...' })
    
    try {
        const ctx = uni.createCanvasContext('posterCanvas')
        
        let localQrPath = cachedQrPath.value
        if (!localQrPath) {
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://app.betterman.vip/join/${roomId.value}&bgcolor=ffffff&color=000000`
            const qrRes = await uni.getImageInfo({ src: qrUrl })
            localQrPath = qrRes.path
        }

        // 2. 绘制背景
        ctx.setFillStyle('#09090b')
        ctx.fillRect(0, 0, 750, 1334)
        
        // 3. 绘制赛博噪点背景 (模拟)
        ctx.setGlobalAlpha(0.1)
        ctx.setFillStyle('#00e5ff')
        for(let i=0; i<100; i++) {
            ctx.fillRect(Math.random()*750, Math.random()*1334, 2, 2)
        }
        ctx.setGlobalAlpha(1.0)

        // 4. 绘制文字
        ctx.setFillStyle('#00e5ff')
        ctx.setFontSize(24)
        ctx.fillText('=== BETTER MAN ===', 240, 100)
        
        ctx.setFillStyle('#ffffff')
        ctx.setFontSize(48)
        ctx.fillText('觉醒者强制征召令', 180, 200)
        
        ctx.setFillStyle('#a1a1aa')
        ctx.setFontSize(28)
        ctx.fillText(`第 ${roomId} 号战区正在集结`, 230, 280)

        // 5. 绘制二维码
        ctx.setFillStyle('#ffffff')
        ctx.fillRect(225, 400, 300, 300) // QR 背景
        ctx.drawImage(localQrPath, 235, 410, 280, 280)

        // 6. 绘制入场标识
        ctx.setFillStyle('#00e5ff')
        ctx.setFontSize(80)
        ctx.fillText(roomId, 240, 900)
        
        ctx.setFillStyle('#52525b')
        ctx.setFontSize(20)
        ctx.fillText('扫描上方神经连接 或 输入口令', 230, 980)

        ctx.draw(false, () => {
            setTimeout(() => {
                uni.canvasToTempFilePath({
                    canvasId: 'posterCanvas',
                    success: (res) => {
                        uni.saveImageToPhotosAlbum({
                            filePath: res.tempFilePath,
                            success: () => {
                                uni.hideLoading()
                                uni.showToast({ title: '已存入神经图库', icon: 'success' })
                                showShareModal.value = false
                            },
                            fail: () => {
                                uni.hideLoading()
                                uni.showToast({ title: '保存失败，请检查权限', icon: 'none' })
                            }
                        })
                    }
                })
            }, 300)
        })
    } catch (e) {
        uni.hideLoading()
        uni.showToast({ title: '渲染引擎载荷异常', icon: 'none' })
    }
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
.edit-link { font-size: 12px; color: #00e5ff; text-decoration: underline; opacity: 0.8; }
.edit-link:active { opacity: 1; }
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
  display: flex;
  justify-content: center;
  align-items: center;
}
.qr-real-img { width: 120px; height: 120px; z-index: 2; }
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
.text-red-500 { color: #ef4444; }
.countdown-val { font-size: 14px; color: #ef4444; font-family: monospace; font-weight: bold; }
.qr-placeholder { position: absolute; inset: 0; background: #000; z-index: 3; }
.loading-icon { animation: blink 1s infinite; font-size: 24px; }

/* 宣言卡片样式 — 增强视觉重量，让用户明显感知 */
.slogan-card {
  background: linear-gradient(135deg, rgba(0, 229, 255, 0.06) 0%, rgba(0, 100, 120, 0.04) 100%);
  border: 1px solid rgba(0, 229, 255, 0.25);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 0 20px rgba(0, 229, 255, 0.08), inset 0 0 12px rgba(0, 229, 255, 0.03);
}
.slogan-tag { font-size: 10px; color: #00e5ff; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; opacity: 0.7; }
.tag-line { height: 1px; background: linear-gradient(90deg, rgba(0, 229, 255, 0.3), transparent); }
.slogan-text { font-size: 16px; color: #e4e4e7; font-weight: 500; font-style: italic; line-height: 1.6; text-align: center; text-shadow: 0 0 12px rgba(0, 229, 255, 0.3); }

/* 征召令小按钮 — 全员可见，紧凑内联在生还名单标题行 */
.invite-chip {
  background: rgba(0, 229, 255, 0.1);
  border: 1px solid rgba(0, 229, 255, 0.3);
  border-radius: 20px;
  padding: 4px 10px;
  gap: 4px;
  transition: all 0.2s;
}
.invite-chip-hover { background: rgba(0, 229, 255, 0.2); }
.invite-chip-icon { font-size: 12px; }
.invite-chip-text { font-size: 11px; color: #00e5ff; font-weight: bold; letter-spacing: 0.5px; }
</style>
