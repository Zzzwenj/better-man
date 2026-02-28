<template>
  <view class="container flex-col" :style="themeStore.themeCssVars">
    <!-- Header: Status -->
    <view class="header flex justify-between items-center">
      <view class="room-info flex-col">
        <text class="room-title">第 {{ displayRoomNum || '???' }} 战区</text>
        <text class="room-subtitle mt-1">战区通讯频道</text>
      </view>
      <view class="online-chip flex items-center">
        <view class="dot-live"></view>
        <text class="online-text ml-1">500 在线</text>
      </view>
    </view>

    <!-- Global Resonance Matrix (代替排行榜) -->
    <view class="px-4 mt-4">
      <GlobalResonance />
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
        v-for="msg in chatStore.messages" 
        :key="msg._id || Math.random()" 
        class="msg-row flex mb-4"
        :class="{'justify-end': msg.user_id === currentUid}"
      >
        <!-- 其他人发送的消息，头像在气泡左侧 -->
        <view class="avatar other-avatar flex items-center justify-center mr-2" v-if="msg.user_id !== currentUid">
          <text class="user-icon">{{ msg.user_id ? msg.user_id.substring(msg.user_id.length - 2).toUpperCase() : '?' }}</text>
        </view>

        <view class="msg-bubble" :class="msg.user_id === currentUid ? 'my-bubble' : 'other-bubble'">
          <!-- 自定义渲染器，解析 [emo:xxx] -->
          <rich-text :nodes="renderContent(msg.content)"></rich-text>
        </view>

        <!-- 本人发送的消息，头像在气泡右侧 -->
        <view class="avatar my-avatar flex items-center justify-center ml-2" v-if="msg.user_id === currentUid">
          <image v-if="userAvatar" :src="userAvatar" class="avatar-img" mode="aspectFill"></image>
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
          <text class="emo-btn" @click="sendEmo('fist')">✊</text>
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
    <CustomTabBar :current="1" />
  </view>
</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick, onUnmounted } from 'vue'
import { onHide } from '@dcloudio/uni-app'
import { useChatStore } from '../../store/chat.js'
import CustomTabBar from '../../components/CustomTabBar.vue'
import GlobalResonance from '../../components/GlobalResonance.vue'
import { useThemeStore } from '../../store/theme.js'

const themeStore = useThemeStore()

const chatStore = useChatStore()
const inputVal = ref('')
const scrollTop = ref(0)
const currentUid = ref('')
const userAvatar = ref('')
const avatarInitial = ref('我')

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
        chatStore.setHistory(historyRes.result.data)
        scrollToBottom()
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
  uni.switchTab({ url: '/pages/dashboard/index' })
}

// 富文本渲染：替换指令为 emoji 
const renderContent = (content) => {
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
  return finalHTML
}

const sendEmo = (emoType) => {
  executeSend(`[emo:${emoType}]`)
}

const sendText = () => {
  if (!inputVal.value.trim()) return
  const txt = inputVal.value
  inputVal.value = ''
  executeSend(txt)
}

const executeSend = async (content) => {
  const token = uni.getStorageSync('uni_id_token')
  
  // 乐观更新（先不写，因为没真实的 ID 返回，直接等待实际入库结果）
  
  try {
    const res = await uniCloud.callFunction({
      name: 'chat-hub',
      data: { 
        token, 
        action: 'sendMessage', 
        payload: { room_id: chatStore.roomId, content } 
      }
    })
    
    if (res.result.code === 0 || res.result.code === 403) {
      // 本人发送的，直接由于推送不返回给自己，手动推入 state
      chatStore.pushMessage(res.result.data)
    }
  } catch(e) {
    uni.showToast({ title: '发送失败', icon: 'none' })
  }
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
.justify-center { justify-content: center; }
.justify-end { justify-content: flex-end; }
.items-center { align-items: center; }
.block { display: block; }
.text-center { text-align: center; }

/* Header */
.header { 
  padding: calc(var(--status-bar-height) + 20px) 20px 12px 20px;
  background: rgba(9, 9, 11, 0.65);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  position: sticky;
  top: 0;
  z-index: 50;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
  box-sizing: border-box;
  width: 100%;
}
.room-title { font-size: 24px; font-weight: 900; color: var(--theme-primary); letter-spacing: 2px; text-shadow: 0 0 15px var(--theme-shadow-primary); }
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
.online-text { font-size: 10px; color: var(--theme-primary); font-family: monospace; }
.leave-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 4px 12px;
  border-radius: 10px;
  transition: all 0.2s;
}
.leave-hover { background: rgba(239, 68, 68, 0.15); border-color: rgba(239, 68, 68, 0.3); }
.leave-text { font-size: 12px; color: #a1a1aa; font-weight: 500; }

/* Chat Area */
.chat-area { 
  flex: 1; 
  padding-top: 20px; 
  box-sizing: border-box; 
  padding-bottom: 100px; /* 为悬浮输入框预留空间 */
  overflow: hidden; 
}
.chat-spacer { height: 20px; }
.empty-state { opacity: 0.5; }

.msg-bubble {
  padding: 12px 16px;
  border-radius: 12px;
  max-width: 65%; /* 增加头像后收缩一点气泡最大宽度以免溢出 */
  font-size: 14px;
  line-height: 1.5;
  word-break: break-all;
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

/* 战区聊天头像样式 */
.avatar {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 12px;
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
.avatar-img { width: 100%; height: 100%; border-radius: 12px; }
.user-icon {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  font-weight: bold;
  font-family: monospace;
}

/* 现代悬浮底部输入区 */
.input-area {
  flex-shrink: 0;
  padding: 10px 16px calc(66px + env(safe-area-inset-bottom)) 16px; 
  background: linear-gradient(180deg, rgba(9, 9, 11, 0) 0%, rgba(9, 9, 11, 0.8) 20%, #09090b 100%);
  margin-top: -80px; 
  z-index: 20;
  width: 100%;
  box-sizing: border-box; /* 防止边距超出版心 */
}
.input-container {
  width: 100%;
  background: rgba(24, 24, 27, 0.8);
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
</style>
