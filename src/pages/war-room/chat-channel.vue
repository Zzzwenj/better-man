<template>
  <view class="container flex-col" :style="themeStore.themeCssVars">
    <!-- Header: Status & Tabs -->
    <view class="header flex justify-between items-center">
      <view class="flex items-center">
        <!-- 隐形大热区返回，配合细腻图标 -->
        <view class="back-action flex items-center justify-center p-2 mr-1" @click="goBack" hover-class="back-hover">
          <text class="icon-chevron">‹</text>
        </view>
        <view class="room-info flex-col">
          <text class="room-title">第 {{ displayRoomNum || '???' }} 战区</text>
          <text class="room-subtitle mt-1">战区通讯网络</text>
        </view>
      </view>
      <view class="flex items-center">
        <view class="online-chip flex items-center mr-2">
          <view class="dot-live"></view>
          <text class="online-text ml-1">{{ currentOnlineCount }} 在线</text>
        </view>
        <!-- 举报/群管理入口 -->
        <view class="more-action flex items-center justify-center p-2" @click="handleMoreAction">
          <text class="icon-more">⋮</text>
        </view>
      </view>
    </view>

    <!-- Global Resonance Matrix (代替排行榜) -->
    <view class="px-4 mt-4">
      <GlobalResonance />
    </view>

    <!-- 战区宣言横条 (只读展示，从 warzoneStore 读取当前战区宣言) -->
    <view class="slogan-banner px-4" v-if="currentRoomSlogan">
      <view class="slogan-banner-inner flex items-center">
        <text class="slogan-banner-label">战役宣言</text>
        <text class="slogan-banner-text flex-1">“ {{ currentRoomSlogan }} ”</text>
      </view>
    </view>

    <!-- Chat Area -->
    <scroll-view 
      scroll-y 
      class="chat-area flex-1 px-4" 
      :scroll-top="scrollTop" 
      scroll-with-animation
    >
      <view v-if="chatStore.messages.length === 0" class="empty-state">
        <text class="text-gray-600 block text-center mt-10 text-sm">通讯频道建立，等待讯号...</text>
      </view>

      <view 
        v-for="(msg, index) in chatStore.messages" 
        :key="msg._id || Math.random()" 
        class="msg-row flex mb-4 msg-pop"
        :style="`animation-delay: ${index * 0.05 < 1 ? index * 0.05 : 0}s;`"
        :class="{'justify-end': msg.user_id === currentUid}"
      >
        <!-- 其他人发送的消息，头像在气泡左侧 -->
        <view class="avatar other-avatar flex items-center justify-center mr-2 mt-1" 
              :class="{
                 'frame-plasma': msg.equipped_avatar === 'f_01',
                 'frame-glitch': msg.equipped_avatar === 'f_02'
              }" 
              v-if="msg.user_id !== currentUid">
          <image v-if="msg.avatar" :src="msg.avatar" class="avatar-img" mode="aspectFill"></image>
          <text v-else class="user-icon">{{ msg.nickname ? msg.nickname.substring(msg.nickname.length - 2) : '?' }}</text>
        </view>

        <!-- 消息内容主轴 -->
        <view class="msg-content-wrapper flex-col" :class="[msg.user_id === currentUid ? 'align-end' : 'align-start']">
          
          <!-- 贴紧气泡的名称与徽章 (他人与自己均显示以实现闭环) -->
          <view class="name-tag-row flex-col" :class="[msg.user_id === currentUid ? 'align-end' : 'align-start']">
            <view class="flex items-center" v-if="msg.is_vanguard || msg.equipped_title">
              <text class="vanguard-crown mr-1" v-if="msg.is_vanguard">👑</text>
              <text class="title-tag ellipsis">
                {{ getTitleName(msg.equipped_title) }}
              </text>
            </view>
            <view class="flex items-center">
              <text class="user-name-tag">{{ (msg.user_id === currentUid ? '我' : '') + (msg.nickname || '匿名特工') }}</text>
              <text class="time-tag ml-1">{{ formatTimeAgo(msg.created_date) }}</text>
            </view>
          </view>

          <view class="msg-bubble" :class="[
            msg.user_id === currentUid ? 'my-bubble' : 'other-bubble',
            msg.is_broadcast ? 'world-broadcast-bubble' : '',
            msg.is_emp ? 'emp-pulse-bubble' : ''
          ]" @longpress="handleReportMsg(msg)">
            <!-- 如果是广播，附带震动动画样式和土豪边框 -->
            <rich-text :nodes="renderContent(msg.content, msg.is_broadcast)"></rich-text>
          </view>
        </view>

        <!-- 本人发送的消息，头像在气泡右侧 -->
        <view class="avatar my-avatar flex items-center justify-center ml-2 mt-1" 
              :class="{
                 'frame-plasma': msg.equipped_avatar === 'f_01',
                 'frame-glitch': msg.equipped_avatar === 'f_02'
              }" 
              v-if="msg.user_id === currentUid">
          <image v-if="msg.avatar || userAvatar" :src="msg.avatar || userAvatar" class="avatar-img" mode="aspectFill"></image>
          <text v-else class="user-icon">{{ avatarInitial }}</text>
        </view>
      </view>
      <!-- Spacer for bottom input -->
      <view class="chat-spacer"></view>
    </scroll-view>

    <!-- Input Area (悬浮式现代设计) -->
    <view class="input-area flex items-center">
      <view class="input-container flex-1 flex items-center">
        <view class="quick-emos flex items-center mr-2">
          <text class="emo-btn" @click="sendEmo('fire')">🔥</text>
          <text class="emo-btn" @click="sendEmo('ice')">🧊</text>
          <text class="emo-btn" @click="triggerBroadcast">📢</text>
        </view>
        
        <input 
          class="input-box flex-1" 
          v-model="inputVal" 
          placeholder="传递意志..." 
          placeholder-class="text-gray-500"
          @confirm="sendText"
        />
        
        <view class="btn-send flex justify-center items-center ml-2" 
              :class="{'disabled': !inputVal.trim()}" 
              @click="sendText">
          <text class="send-icon">▲</text>
        </view>
      </view>
    </view>
    
    <!-- 弹窗：战区名重排 (自定义组件) -->
    <SloganEditModal 
      v-model:show="showRenameModal" 
      title="📡 战区重排"
      placeholder="输入新的战区识别代号..."
      @confirm="onRenameConfirm"
    />

    <CyberDialog
      v-model:show="dialog.show"
      :title="dialog.title"
      :content="dialog.content"
      :showCancel="true"
      @confirm="dialog.confirmAction"
    />

    <!-- 自定义操作菜单，替代原生 uni.showActionSheet -->
    <CyberActionSheet
      v-model:show="actionSheet.show"
      :title="actionSheet.title"
      :itemList="actionSheet.list"
      @select="onActionSelect"
    />
  </view>
</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick, onUnmounted } from 'vue'
import { onHide } from '@dcloudio/uni-app'
import { useChatStore } from '../../store/chat.js'
import GlobalResonance from '../../components/war-room/GlobalResonance.vue'
import { useThemeStore } from '../../store/theme.js'
import SloganEditModal from '../../components/war-room/SloganEditModal.vue'
import CyberDialog from '../../components/common/CyberDialog.vue'
import CyberActionSheet from '../../components/common/CyberActionSheet.vue'
import { serverTime } from '@/utils/serverTime.js'
import { checkMessage } from '@/utils/contentFilter.js'
import { getTitleName } from '@/utils/itemDict.js'

const themeStore = useThemeStore()
import { useUserStore } from '../../store/user.js'
const userStore = useUserStore()

const chatStore = useChatStore()
const inputVal = ref('')
const scrollTop = ref(0)
const currentUid = ref('')
const userAvatar = ref('')
const avatarInitial = ref('我')
const showRenameModal = ref(false)
const dialog = ref({ show: false, title: '', content: '', confirmAction: () => {} })

// 自定义 ActionSheet 状态
const actionSheet = ref({ show: false, title: '', list: [], type: '' })
const pendingReportMsg = ref(null) // 暂存待举报的消息对象

import { useWarzoneStore } from '../../store/warzone.js'
const warzoneStore = useWarzoneStore()

const currentOnlineCount = computed(() => {
  if (!chatStore.roomId) return '...'
  // 尝试在公频库查找
  const pubMatch = warzoneStore.publicRooms.find(r => r.id === chatStore.roomId.replace('room_', ''))
  if (pubMatch) return pubMatch.onlineCount
  // 尝试在生死局查找
  const deathMatch = warzoneStore.deathMatches.find(r => r.id === chatStore.roomId.replace('room_', ''))
  if (deathMatch) return deathMatch.onlineCount
  return Math.floor(Math.random() * 50) + 10 // Mock fallback
})

/**
 * 当前战区宣言 — 从 warzoneStore 读取，展示在聊天页顶部
 * 同时匹配公频和生死局
 */
const currentRoomSlogan = computed(() => {
  if (!chatStore.roomId) return ''
  const roomKey = chatStore.roomId.replace('room_', '')
  const pubMatch = warzoneStore.publicRooms.find(r => r.id === roomKey)
  if (pubMatch && pubMatch.slogan) return pubMatch.slogan
  const deathMatch = warzoneStore.deathMatches.find(r => r.id === roomKey)
  if (deathMatch && deathMatch.slogan) return deathMatch.slogan
  return ''
})

// 获取云端数据
onMounted(async () => {
  uni.hideTabBar()
  
  const token = uni.getStorageSync('uni_id_token')
  if (!token) {
    uni.redirectTo({ url: '/pages/login/index' })
    return
  }
  currentUid.value = token.split('_').pop()
  
  const data = uni.getStorageSync('neuro_baseline')
  if (data) {
    const profile = JSON.parse(data)
    userAvatar.value = profile.avatar || ''
    if (profile.nickname) {
       const str = String(profile.nickname)
       avatarInitial.value = str.includes('_') ? str.split('_').pop().substring(0,2) : str.substring(str.length - 2)
    } else {
        avatarInitial.value = currentUid.value ? currentUid.value.substring(currentUid.value.length - 2).toUpperCase() : '我'
    }
  } else {
      avatarInitial.value = currentUid.value ? currentUid.value.substring(currentUid.value.length - 2).toUpperCase() : '我'
  }

  uni.showLoading({ title: '搜索战区标定...' })
  try {
    // 1. 调用云函数进行自动分组
    const assignRes = await uniCloud.callFunction({
      name: 'chat-hub',
      data: { token, action: 'assignRoom' }
    })
    
    if (assignRes.result.code === 0) {
      chatStore.setRoomId(assignRes.result.roomId)
      
      // 2. 拉取近期历史记录
      const historyRes = await uniCloud.callFunction({
        name: 'chat-hub',
        data: { token, action: 'getHistoryLogs', payload: { room_id: assignRes.result.roomId } }
      })
      if (historyRes.result.code === 0) {
        // 直接使用云端下发的结构数据，服务端已经洗净处理好了 `is_broadcast` 等标记
        chatStore.setHistory(historyRes.result.data)
        scrollToBottom()
        
        // --- 黑金 VIP 进场自动装逼广播 ---
        if (userStore.isVipActive) {
            // 利用 setTimeout 稍微错开渲染
            setTimeout(() => {
            const titleStr = getTitleName(userStore.equipped.title) || '高级特权者'
                executeSend(`🚨 [系统警报] ${titleStr} 已突破防火墙，空降本战区。`, true, `🚨 [系统警报] ${titleStr} 已突破防火墙，空降本战区。`)
            }, 800)
        }
      }
    }
  } catch(e) {
    uni.showToast({ title: '连接通讯塔失败', icon: 'none' })
  } finally {
    uni.hideLoading()
  }
})

// 防止跳转到其他 tab 时 loading 仍然滞留
onHide(() => {
  uni.hideLoading()
})

onUnmounted(() => {
  uni.hideLoading()
})

// 自动滚到底部机制
watch(() => chatStore.messages.length, () => {
  scrollToBottom()
})

const scrollToBottom = () => {
  nextTick(() => {
    scrollTop.value = chatStore.messages.length * 100 // 暴力滚动
  })
}

const displayRoomNum = computed(() => {
  if (!chatStore.roomId) return ''
  return chatStore.roomId.replace('room_', '')
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
  const roomKey = chatStore.roomId.replace('room_', '')
  const isDeathMatch = warzoneStore.deathMatches.some(r => r.id === roomKey)
  
  if (isDeathMatch) {
      dialog.value = {
        show: true,
        title: '叛逃警告：连坐反噬',
        content: '作为誓约者，你正在试图脱离交战区。如果没有【防线崩溃金牌】，系统将直接剥夺你 20% 的神经重塑天数，并全区通报！',
        confirmAction: async () => {
            const success = await warzoneStore.leaveRoomAction(chatStore.roomId, true)
            if (success) {
                uni.switchTab({ url: '/pages/war-room/index' })
            }
        }
      }
  } else {
      dialog.value = {
        show: true,
        title: '撤离通讯网络',
        content: '即将断开与该公共频道的网络连接。是否继续？',
        confirmAction: async () => {
            const success = await warzoneStore.leaveRoomAction(chatStore.roomId, false)
            if (success) {
                uni.switchTab({ url: '/pages/war-room/index' })
            }
        }
      }
  }
}

// 获取房间真实创建者判断是否为所有者，或者是否是公频的管理员权限
const isOwner = computed(() => {
    if (!chatStore.roomId) return false;
    const roomKey = chatStore.roomId.replace('room_', ''); // 这里可能是公共房或者真实DM房间id
    const deathMatch = warzoneStore.deathMatches.find(r => r.id === roomKey);
    // 生死局判定：创建者拥有绝对权限
    if (deathMatch && deathMatch.creator_id === currentUid.value) {
        return true;
    }
    
    // 公频判定：如果是公频（没在 deathMatch 且能在 publicRooms 找到）
    const pubMatch = warzoneStore.publicRooms.find(r => r.id === roomKey);
    if (pubMatch) {
       // 如果持有黑金桂冠，或是极端称号 [深渊行者][破釜沉舟]，则临时赋予战区纠察队管理员权限
       if (userStore.hasBlackGoldCrown || userStore.equipped.title === 't_01' || userStore.equipped.title === 't_02') {
           return true;
       }
    }
    
    return false;
})

/**
 * 右上角三点菜单 — 使用自定义 CyberActionSheet 替代原生弹窗
 */
const handleMoreAction = () => {
  const itemList = isOwner.value
    ? ['撤离当前通讯网络', '修改本战区代号/密码', '清除所有叛逃者记录', '举报违规言论/洗脑信息']
    : ['撤离当前通讯网络', '举报违规言论/洗脑信息', '屏蔽该战区']
  actionSheet.value = {
    show: true,
    title: '战区战术指令',
    list: itemList,
    type: 'more'
  }
}

/**
 * 长按消息举报 — 使用自定义 CyberActionSheet 替代原生弹窗
 * @param {Object} msg - 被长按的消息对象
 */
const handleReportMsg = (msg) => {
  if (msg.user_id === currentUid.value) return // 过滤自己的消息
  pendingReportMsg.value = msg
  actionSheet.value = {
    show: true,
    title: '探员交互操作',
    list: ['举报该条言论', '屏蔽此特工'],
    type: 'msg'
  }
}

/**
 * ActionSheet 选项回调统一处理
 * @param {number} index - 被点击的选项索引
 */
const onActionSelect = (index) => {
  if (actionSheet.value.type === 'more') {
    if (index === 0) {
      leaveRoom()
    } else if (isOwner.value) {
      if (index === 1) {
        showRenameModal.value = true
      } else if (index === 2) {
        dialog.value = {
          show: true,
          title: '格式化确认',
          content: '即将清除本场所有本地通讯记录，此操作不可撤销。是否继续？',
          confirmAction: () => {
            chatStore.messages = []
            uni.showToast({ title: '格式化完成' })
          }
        }
      } else {
        uni.showToast({ title: '记录已锚定，等待秩序庭空降验证。', icon: 'none' })
      }
    } else {
      uni.showToast({ title: '系统已接到反馈，将派驻特工核实', icon: 'none' })
    }
  } else if (actionSheet.value.type === 'msg') {
    if (index === 0) {
      uni.showToast({ title: '已将违规指令抄送纠察队', icon: 'none' })
    } else if (index === 1) {
      uni.showToast({ title: '已切断与该个体的底层信号', icon: 'none' })
    }
    pendingReportMsg.value = null
  }
}

// 富文本渲染：替换指令为 emoji, 广播消息增加强调发光 
const renderContent = (content, isBroadcast = false) => {
  if (!content) return ''
  let finalHTML = content
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;") // 防 XSS
    .replace(/\[emo:fire\]/g, '<span style="font-size: 20px;">🔥</span>')
    .replace(/\[emo:ice\]/g, '<span style="font-size: 20px;">🧊</span>')
    .replace(/\[emo:fist\]/g, '<span style="font-size: 20px;">✊</span>')
  
  if (content === '***[通讯屏蔽]***') {
      finalHTML = '<span style="color: #ef4444; font-style: italic;">[该引子包含不稳定情绪，已屏蔽]</span>'
  }
  
  if (isBroadcast) {
    finalHTML = `<span style="font-size: 16px; font-weight: 900; color: #facc15; text-shadow: 0 0 10px rgba(250,204,21,0.5);">${finalHTML}</span>`
  }
  return finalHTML
}

const sendEmo = (emoType) => {
  executeSend(`[emo:${emoType}]`)
}

const sendText = () => {
  if (!inputVal.value.trim()) return
  const txt = inputVal.value.trim()

  // 前端合规预审核，拦截敏感内容
  const check = checkMessage(txt)
  if (!check.safe) {
    uni.showToast({ title: '消息包含违规内容，已拦截', icon: 'none' })
    return
  }

  inputVal.value = ''
  executeSend(txt)
}

const triggerBroadcast = () => {
    dialog.value = {
        show: true,
        title: '全境广播确认',
        content: '本次广播将无视战区区服，强行推送给所有在线探员，将消耗 500 神经币。',
        confirmAction: () => {
            if (userStore.spendCoins(500, '购买高能世界广播')) {
                const txt = inputVal.value.trim() || '🔥 战区最高意志者在此！'
                inputVal.value = ''
                executeSend(txt, true, `[BROADCAST] ${txt}`)
            } else {
                uni.showToast({ title: '神经币储备不足', icon: 'error' })
            }
        }
    }
}

const executeSend = async (content, isBroadcast = false, payloadContent = null) => {
  const token = uni.getStorageSync('uni_id_token')
  
  // 检查是否使用了 EMP 脉冲 (单挑或手动按钮都会设此状态)
  const isEMP = userStore.equipped.empActive
  if (isEMP) {
      userStore.consumeEMP()
  }

  // 获取当前最新的本地档案以同步推送
  const baselineStr = uni.getStorageSync('neuro_baseline')
  const profile = baselineStr ? JSON.parse(baselineStr) : {}
  const nickname = profile.nickname || '匿名特工'
  const avatar = profile.avatar || ''

  // 乐观更新，使用随机长效 ID 保证不重影
  const randomLocalId = 'local_' + serverTime.now().toString() + '_' + Math.random().toString(36).substring(2, 6)

  chatStore.pushMessage({
    _id: randomLocalId,
    user_id: currentUid.value,
    content: content,
    nickname: nickname,
    avatar: avatar,
    is_vanguard: userStore.hasBlackGoldCrown,
    is_broadcast: isBroadcast,
    is_emp: isEMP,
    equipped_title: userStore.equipped.title,
    equipped_avatar: userStore.equipped.avatarFrame,
    created_date: serverTime.now()
  })
  
  try {
    const res = await uniCloud.callFunction({
      name: 'chat-hub',
      data: { 
        token, 
        action: 'sendMessage', 
        payload: { 
            room_id: chatStore.roomId, 
            content: payloadContent || content, 
            is_broadcast: isBroadcast,
            is_emp: isEMP,
            nickname: nickname,
            avatar: avatar,
            is_vanguard: userStore.hasBlackGoldCrown,
            equipped_title: userStore.equipped.title,
            equipped_avatar: userStore.equipped.avatarFrame
        } 
      }
    })
    
    // 我们已经在发送前采用乐观更新，不再重复推入
    if (res.result.code === 0) {
        // 请求发走且落库成功了，替换为云端的真 ID
        chatStore.updateMessageId(randomLocalId, res.result.data._id)
    } else if (res.result.code === 403) {
        // 关键补丁：侦测到屏蔽词，剥夺该气泡的原始词句，修正为红色的警告！
        uni.vibrateLong()
        chatStore.updateMessageStatus(randomLocalId, '***[通讯屏蔽]***', true)
        uni.showToast({ title: '侦测到神经递质异常', icon: 'error' })
    } else {
        uni.showToast({ title: '发送失败', icon: 'none' })
        // 可以考虑增加标记“发送失败”的样式，目前先不删
    }
  } catch(e) {
    uni.showToast({ title: '发送失败', icon: 'none' })
  }
}
const onRenameConfirm = (newName) => {
  if (userStore.spendCoins(100, '重组战区命名')) {
    uni.showLoading({ title: '通讯号波段重设中...' })
    setTimeout(() => {
      uni.hideLoading()
      uni.showToast({ title: '战区名称部署完毕', icon: 'success' })
    }, 1000)
  } else {
    uni.showToast({ title: '神经币不足，无法覆盖指令', icon: 'none' })
  }
}

/**
 * 时间相对格式化工具
 * @param {Number|String} timestamp 
 */
const formatTimeAgo = (timestamp) => {
  if (!timestamp) return ''
  const now = serverTime.now()
  const diff = now - timestamp

  if (diff < 60000) return '刚刚' // 1 分钟内
  if (diff < 3600000) return Math.floor(diff / 60000) + 'm' // 1 小时内返回 m
  if (diff < 86400000) return Math.floor(diff / 3600000) + 'h' // 24 小时内返回 h
  return Math.floor(diff / 86400000) + 'd' // 天数计算
}

</script>

<style lang="scss" scoped>
/* 让 page 级高度撑满，避免 100vh 导致的滚动条和底部被遮挡 */
page {
  height: 100%;
}

.container {
  height: 100%;
  width: 100%;
  overflow-x: hidden;
  background-color: #09090b;
  display: flex;
  box-sizing: border-box;
}
.px-4 { padding: 0 20px; }
.pt-10 { padding-top: 40px; }
.pb-4 { padding-bottom: 16px; }
.py-3 { padding: 12px 16px; }
.p-2 { padding: 8px; margin-left: -8px; } /* 负边距拉宽热区但不推偏整体 */
.pb-bottom { padding-bottom: max(16px, env(safe-area-inset-bottom)); }
.mt-1 { margin-top: 4px; }
.mt-10 { margin-top: 40px; }
.mb-4 { margin-bottom: 16px; }
.ml-2 { margin-left: 8px; }
.ml-3 { margin-left: 12px; }
.mr-2 { margin-right: 8px; }
.mr-3 { margin-right: 12px; }

.flex { display: flex; }
.flex-col { display: flex; flex-direction: column; }
.flex-1 { flex: 1; overflow: hidden; }
.justify-between { justify-content: space-between; }
.justify-start { justify-content: flex-start; }
.justify-center { justify-content: center; }
.justify-end { justify-content: flex-end; }
.items-center { align-items: center; }
.block { display: block; }
.text-center { text-align: center; }

/* Header */
.header { 
  padding: calc(var(--status-bar-height) + 24px) 20px 16px 20px;
  background: linear-gradient(180deg, rgba(9, 9, 11, 0.9) 0%, rgba(9, 9, 11, 0.4) 100%);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  position: sticky;
  top: 0;
  z-index: 50;
  box-sizing: border-box;
  width: 100%;
}
.room-title { font-size: 20px; font-weight: 800; color: #fff; letter-spacing: 1px; }
.room-subtitle { font-size: 11px; color: #a1a1aa; letter-spacing: 1px; }
.header-right { gap: 8px; }
.online-chip {
  background: var(--theme-bg-highlight);
  border: 1px solid var(--theme-shadow-primary);
  padding: 3px 8px;
  border-radius: 10px;
}
.dot-live { width: 6px; height: 6px; background-color: var(--theme-primary); border-radius: 50%; box-shadow: 0 0 5px var(--theme-primary); animation: blink 2s infinite; }
@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
.online-text { font-size: 10px; color: var(--theme-primary); font-family: monospace; padding-left: 4px; }
.leave-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 4px 12px;
  border-radius: 10px;
  transition: all 0.2s;
}

.back-action { border-radius: 50%; transition: background-color 0.2s; }
.back-hover { background-color: rgba(255, 255, 255, 0.1); }
.icon-chevron { font-size: 32px; color: #fff; font-weight: 300; line-height: 1; margin-top: -4px;}
.more-action { transition: opacity 0.2s; color: #a1a1aa; }
.more-action:active { opacity: 0.5; }
.icon-more { font-size: 24px; font-weight: bold; line-height: 1; margin-top: -2px; }

/* Chat Area */
.chat-area { 
  flex: 1; 
  padding-top: 20px; 
  box-sizing: border-box; 
  /* 移除之前预留给悬浮的 100px 固定缝隙，交由 flex 自己流式撑开 */
  overflow-y: auto; 
}
.chat-spacer { height: 20px; }
.empty-state { opacity: 0.5; }

/* 消息流主布局 */
.msg-content-wrapper { 
  max-width: 65%; 
  display: flex; 
  flex-direction: column; 
}
.align-start { align-items: flex-start; }
.align-end { align-items: flex-end; }
.name-tag-row { margin-bottom: 4px; padding: 0 4px; }
.user-name-tag { font-size: 11px; color: #71717a; font-family: monospace; max-width: 100px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block; }
.time-tag { font-size: 9px; color: #52525b; font-family: monospace; margin-top: 1px; }
.vanguard-crown { font-size: 13px; line-height: 1; }
.ellipsis { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block; }

.msg-bubble {
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.5;
  word-break: break-all;
  transition: all 0.3s ease;
}

.msg-pop {
  opacity: 0;
  transform: translateY(10px) scale(0.95);
  animation: popMessage 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}

@keyframes popMessage {
  to { opacity: 1; transform: translateY(0) scale(1); }
}
.other-bubble {
  background-color: #18181b;
  border: 1px solid #27272a;
  color: #e4e4e7;
  border-top-left-radius: 4px;
}
.my-bubble {
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
  border-top-right-radius: 4px;
}
.world-broadcast-bubble {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.8) 100%) !important;
  border: 1px solid #ef4444 !important;
  box-shadow: 0 0 20px rgba(239, 68, 68, 0.5) !important;
  animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
}
@keyframes shake {
  10%, 90% { transform: translate3d(-1px, 0, 0); }
  20%, 80% { transform: translate3d(2px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
  40%, 60% { transform: translate3d(4px, 0, 0); }
}

/* 称号 Tag 样式 */
.title-tag {
  font-size: 10px;
  color: #a78bfa;
  font-weight: bold;
  font-family: monospace;
  text-shadow: 0 0 5px rgba(139, 92, 246, 0.4);
  max-width: 100px;
}

/* 战区聊天头像样式 */
.avatar {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 12px;
  position: relative;
  margin: 0 4px; /* 为 Glitch 左右抖动动画留出呼吸空间防止截断 */
}
.other-avatar {
  background: linear-gradient(135deg, rgba(8, 145, 178, 0.2), rgba(0, 229, 255, 0.1));
  border: 1px solid rgba(8, 145, 178, 0.3);
  box-shadow: 0 0 10px rgba(8, 145, 178, 0.1);
}
.my-avatar {
  background: linear-gradient(135deg, rgba(8, 145, 178, 0.2), rgba(0, 198, 255, 0.1));
  border: 1px solid rgba(0, 198, 255, 0.3);
  box-shadow: 0 0 10px rgba(0, 198, 255, 0.1);
}

/* 动态头像框 - 深空等离子 (f_01) */
.frame-plasma {
  border: none !important;
  box-shadow: 0 0 15px rgba(139, 92, 246, 0.8), 0 0 5px inset rgba(139, 92, 246, 0.5) !important;
}
.frame-plasma::after {
  content: '';
  position: absolute;
  top: -2px; left: -2px; right: -2px; bottom: -2px;
  border-radius: 14px;
  background: conic-gradient(from 0deg, transparent 0%, rgba(139, 92, 246, 0.8) 25%, transparent 50%, rgba(0, 229, 255, 0.8) 75%, transparent 100%);
  z-index: -1;
  animation: rotatePlasma 3s linear infinite;
}
@keyframes rotatePlasma { 100% { transform: rotate(360deg); } }

/* 动态头像框 - 故障干扰线 (f_02) */
.frame-glitch {
  border: 1px solid rgba(239, 68, 68, 0.8) !important;
  box-shadow: 0 0 10px rgba(239, 68, 68, 0.4) !important;
  animation: glitchBorder 1s infinite alternate;
  transform-style: preserve-3d;
  z-index: 5;
}
@keyframes glitchBorder {
  0% { transform: translate(0) skew(0deg); }
  20% { transform: translate(-2px, 1px) skew(2deg); }
  40% { transform: translate(1px, -1px) skew(-2deg); }
  60% { transform: translate(0) skew(0deg); }
  80% { transform: translate(2px, 0) skew(1deg); }
  100% { transform: translate(0) skew(0deg); }
}

/* EMP 脉冲电报气泡 */
.emp-pulse-bubble {
  border: 1px solid #ef4444 !important;
  background: rgba(239, 68, 68, 0.15) !important;
  box-shadow: 0 0 15px rgba(239, 68, 68, 0.5) !important;
  position: relative;
  overflow: hidden;
}
.emp-pulse-bubble::before {
  content: ''; position: absolute; top: 0; left: -100%; width: 50%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(239, 68, 68, 0.8), transparent);
  animation: empScan 2s linear infinite;
}
@keyframes empScan { 100% { left: 200%; } }

.avatar-img { width: 100%; height: 100%; border-radius: 12px; position:relative; z-index: 1;}
.user-icon {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  font-weight: bold;
  font-family: monospace;
  position:relative; z-index: 1;
}

/* 现代悬浮底部输入区: 抛弃负边距偏移，拥抱标准 Flex 与 safe-area */
.input-area {
  flex-shrink: 0;
  padding: 12px 16px; 
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
  background: rgba(9, 9, 11, 0.95);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  width: 100%;
  box-sizing: border-box;
}
.input-container {
  width: 100%;
  background: rgba(24, 24, 27, 0.6);
  backdrop-filter: blur(10px);
  border-radius: 28px;
  padding: 6px 6px 6px 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-sizing: border-box;
}
.input-container:focus-within {
  border-color: rgba(0, 229, 255, 0.4);
  box-shadow: 0 8px 32px rgba(0, 229, 255, 0.1);
  background: rgba(24, 24, 27, 0.95);
}

.emo-btn { font-size: 20px; padding: 4px; margin-right: 4px; transition: transform 0.1s;}
.emo-btn:active { transform: scale(0.9); }

.input-box {
  background: transparent;
  height: 40px;
  flex: 1;
  font-size: 14px;
  color: #fff;
  border: none;
}
.text-gray-500 { color: #52525b; }

.btn-send {
  width: 38px; height: 38px; border-radius: 50%;
  background: linear-gradient(135deg, var(--theme-primary-grad-start) 0%, var(--theme-primary-grad-end) 100%);
  box-shadow: 0 4px 12px var(--theme-shadow-primary);
  transition: all 0.2s;
  flex-shrink: 0; /* 绝对防止右侧发送按钮被挤压遮挡 */
}
.btn-send.disabled { background: #27272a; opacity: 0.6; box-shadow: none;}
.send-icon { color: #fff; font-size: 16px; font-weight: 900; }
.btn-send.disabled .send-icon { color: #52525b; }

/* 战区宣言横条 — 紧凑单行，不抢焦点 */
.slogan-banner {
  padding-top: 8px;
  padding-bottom: 4px;
  flex-shrink: 0;
}
.slogan-banner-inner {
  background: linear-gradient(90deg, rgba(0, 229, 255, 0.06) 0%, transparent 100%);
  border-left: 2px solid rgba(0, 229, 255, 0.5);
  border-radius: 0 6px 6px 0;
  padding: 6px 10px;
  gap: 8px;
}
.slogan-banner-label {
  font-size: 9px;
  color: #00e5ff;
  font-weight: bold;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  flex-shrink: 0;
  opacity: 0.7;
}
.slogan-banner-text {
  font-size: 12px;
  color: #a1a1aa;
  font-style: italic;
  /* 超长截断 */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
