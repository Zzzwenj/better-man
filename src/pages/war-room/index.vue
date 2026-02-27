<template>
  <view class="container flex-col">
    <!-- Header: Status -->
    <view class="header px-4 pt-10 pb-4 flex justify-between items-center">
      <view class="room-info flex-col">
        <text class="room-title">第 {{ displayRoomNum || '???' }} 战区</text>
        <view class="online-status flex items-center mt-1">
          <view class="dot-live"></view>
          <text class="online-text ml-2">500 神经节点在线</text>
        </view>
      </view>
      <view class="action-btn">
        <text class="leave-text" @click="goBack">撤出</text>
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
        v-for="msg in chatStore.messages" 
        :key="msg._id" 
        class="msg-row flex mb-4"
        :class="{'justify-end': msg.user_id === currentUid}"
      >
        <view class="msg-bubble" :class="msg.user_id === currentUid ? 'my-bubble' : 'other-bubble'">
          <!-- 自定义渲染器，解析 [emo:xxx] -->
          <rich-text :nodes="renderContent(msg.content)"></rich-text>
        </view>
      </view>
      <!-- Spacer for bottom input -->
      <view class="chat-spacer"></view>
    </scroll-view>

    <!-- Input Area -->
    <view class="input-area px-4 py-3 flex items-center pb-bottom">
      <view class="quick-emos flex items-center mr-3">
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
      
      <view class="send-btn ml-3 flex justify-center items-center" 
            :class="{'disabled': !inputVal.trim()}" 
            @click="sendText">
        <text class="send-icon">▲</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import { useChatStore } from '../../store/chat.js'

const chatStore = useChatStore()
const inputVal = ref('')
const scrollTop = ref(0)
const currentUid = ref('')

// 获取云端数据
onMounted(async () => {
  const token = uni.getStorageSync('uni_id_token')
  if (!token) {
    uni.redirectTo({ url: '/pages/login/index' })
    return
  }
  currentUid.value = token.split('_').pop()

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
.container {
  height: 100vh;
  background-color: #09090b;
  display: flex;
}
.px-4 { padding: 0 16px; }
.pt-10 { padding-top: 40px; }
.pb-4 { padding-bottom: 16px; }
.py-3 { padding: 12px 16px; }
.pb-bottom { padding-bottom: max(16px, env(safe-area-inset-bottom)); }
.mt-1 { margin-top: 4px; }
.mt-10 { margin-top: 40px; }
.mb-4 { margin-bottom: 16px; }
.ml-2 { margin-left: 8px; }
.ml-3 { margin-left: 12px; }
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
.header { border-bottom: 1px solid rgba(255,255,255,0.05); }
.room-title { font-size: 18px; font-weight: 900; color: #f4f4f5; letter-spacing: 2px;}
.dot-live { width: 6px; height: 6px; background-color: #10b981; border-radius: 50%; box-shadow: 0 0 5px #10b981; animation: blink 2s infinite; }
@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
.online-text { font-size: 11px; color: #10b981; font-family: monospace; }
.leave-text { font-size: 13px; color: #71717a; }

/* Chat Area */
.chat-area { flex: 1; padding-top: 20px; }
.chat-spacer { height: 20px; }
.empty-state { opacity: 0.5; }

.msg-bubble {
  padding: 12px 16px;
  border-radius: 12px;
  max-width: 75%;
  font-size: 14px;
  line-height: 1.5;
  word-break: break-all;
}
.other-bubble {
  background-color: #18181b;
  border: 1px solid #27272a;
  color: #e4e4e7;
  border-bottom-left-radius: 2px;
}
.my-bubble {
  background-color: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: #10b981;
  border-bottom-right-radius: 2px;
}

/* Input Area */
.input-area { background-color: #09090b; border-top: 1px solid rgba(255,255,255,0.05); }
.emo-btn { font-size: 22px; padding: 4px; margin-right: 8px; transition: transform 0.1s;}
.emo-btn:active { transform: scale(0.9); }

.input-box {
  background: #18181b;
  height: 40px;
  border-radius: 20px;
  padding: 0 16px;
  font-size: 14px;
  color: #fff;
}
.text-gray-500 { color: #52525b; }

.send-btn {
  width: 40px; height: 40px; border-radius: 20px;
  background-color: #10b981;
  transition: all 0.2s;
}
.send-btn.disabled { background-color: #27272a; opacity: 0.5;}
.send-icon { color: #000; font-size: 16px; font-weight: 900; }
.send-btn.disabled .send-icon { color: #71717a; }
</style>
