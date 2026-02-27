<template>
  <view class="container flex-col">
    <!-- 顶部导航栏 -->
    <view class="nav-bar flex justify-between items-center px-4">
      <view>
        <text class="nav-title">REWIRE AI</text>
        <text class="nav-subtitle block">临床级认知行为干预</text>
      </view>
      <view class="quota-badge flex items-center">
        <text class="quota-text">脑机防护持续在线</text>
      </view>
    </view>
    
    <!-- 聊天流水区 -->
    <scroll-view scroll-y class="chat-list flex-1" :scroll-top="scrollTop" scroll-with-animation>
      <view class="msg-wrapper mt-6" v-for="(msg, index) in chatList" :key="index" :class="msg.role">
        <!-- User Avatar & Bubble -->
        <!-- DOM 顺序：为了使用 row-reverse 且头像靠右，我们在 DOM 中先放头像，再放气泡 -->
        <template v-if="msg.role === 'user'">
          <view class="avatar user-avatar flex items-center justify-center ml-3">
            <text class="user-icon">U</text>
          </view>
          
          <view class="msg-bubble user-bubble">
            <text class="msg-text">{{ msg.content }}</text>
          </view>
        </template>
        
        <!-- AI Avatar & Bubble -->
        <template v-else>
          <view class="avatar ai-avatar flex items-center justify-center">
            <text class="ai-icon">⎔</text>
          </view>
          
          <view class="msg-bubble">
            <text class="msg-text">{{ msg.content }}</text>
          </view>
        </template>
      </view>
      
      <view class="msg-wrapper ai mt-6" v-if="isLoading">
        <view class="avatar ai-avatar flex items-center justify-center">
          <text class="ai-icon">⎔</text>
        </view>
        <view class="msg-bubble">
          <text class="msg-text">正在分析神经脉冲...</text>
        </view>
      </view>
      

    </scroll-view>
    
    <!-- 底部输入区 (现代 AI 对话框悬浮式设计) -->
    <view class="input-area flex items-center px-4">
      <view class="input-container flex-1 flex items-center">
        <input 
          class="input-box flex-1" 
          v-model="inputValue" 
          placeholder="告诉 AI 你的感受..." 
          placeholder-class="placeholder-text" 
          @confirm="sendMessage" 
        />
        <view class="btn-send flex items-center justify-center" :class="{ 'disabled': !inputValue }" @click="sendMessage">
          <text class="send-icon">▲</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'

const chatList = ref([])
const inputValue = ref('')
const isLoading = ref(false)
const scrollTop = ref(0) // 用于控制自动滚动到最底部

let userProfile = null

const scrollToBottom = () => {
  nextTick(() => {
    // 强制赋予一个极大值将其推到底部
    scrollTop.value = chatList.value.length * 1000 
  })
}

onMounted(() => {
  // --- 拦截鉴权: 检查如果未登录跳登录页 ---
  const token = uni.getStorageSync('uni_id_token')
  if (!token) {
    uni.redirectTo({ url: '/pages/login/index' })
    return
  }
  // ------------------------------------

  // 1. 获取问卷体检数据
  const data = uni.getStorageSync('neuro_baseline')
  if (data) {
    userProfile = JSON.parse(data)
  }
  
  // 2. 初始干预话术
  chatList.value.push({
    role: 'ai',
    content: `你好，我是你的专属成长伙伴。\n在这里，你可以放下防备，随时和我倾诉你的焦虑、困惑或是生活中的那些微小进步。\n\n今天感觉怎么样？聊聊你的想法吧。`
  })
  
  scrollToBottom()
})

const sendMessage = async () => {
  if (!inputValue.value.trim() || isLoading.value) return
  
  const userMsg = inputValue.value
  chatList.value.push({ role: 'user', content: userMsg })
  inputValue.value = ''
  isLoading.value = true
  scrollToBottom()
  
  // 组装针对当前用户的 System Prompt：动态切换“严厉教官”与“温和导师”模式
  let systemPrompt = '你是一位专业的脑神经科学干预导师。你需要根据用户的发言内容动态调整你的语气：'
  systemPrompt += '\n1. 【当用户表达“忍不住”、“想破戒”、“受不了了”等屈服欲望的言论时】：立刻化身为冷酷严厉的军队教官！用斩钉截铁的语气、甚至带一点呵斥，一针见血地指出他现在只是多巴胺的奴隶，被原始大脑绑架了。不要给他任何借口，下达强制性的物理打断命令（比如：立刻去洗冷水脸、做50个俯卧撑）。'
  systemPrompt += '\n2. 【当用户表达“我很累”、“坚持了很久”、“我今天做到了”或者感到深深的挫败内疚时】：化身为温和包容的心理咨询师。接纳他的痛苦，告诉他这是神经重塑必经的阵痛，给予科学原理解释（例如受体恢复）和温暖的鼓励，并提供一个微小可行的建议。'
  if (userProfile) {
    systemPrompt += `\n\n该用户生理画像：年龄段[${userProfile.age}]，成瘾史[${userProfile.history}]，目前的波动频率[${userProfile.frequency}]，高危触发场景包含：[${userProfile.triggers.join(',')}]。`
  }
  systemPrompt += '\n\n无论哪种模式，回复必须都是中文，字数控制在 120 字左右，不要说你好之类的废话，直击灵魂。'

  // 上下文截断保护：只携带 System Prompt + 最近 6 条聊天记录，防止 Token 失控
  const conversationHistory = chatList.value.slice(-6).map(msg => ({
    role: msg.role === 'ai' ? 'assistant' : 'user',
    content: msg.content
  }))

  const messagesPayload = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory
  ]

  try {
    const { result } = await uniCloud.callFunction({
      name: 'ai-shield',
      data: {
        messages: messagesPayload,
        userMsg: userMsg
      }
    })

    if (result.code === 0) {
      chatList.value.push({ role: 'ai', content: result.data })
    } else {
      chatList.value.push({ role: 'ai', content: `[链路警报] ${result.data || result.msg}` })
    }
  } catch (error) {
    console.error('Call AI Shield function error:', error)
    chatList.value.push({ role: 'ai', content: '连接量子心理学数据库超时或发生异常。' })
  } finally {
    isLoading.value = false
    scrollToBottom()
    uni.vibrateShort()
  }
}
</script>

<style lang="scss" scoped>
/* 让 page 级高度撑满，这是 flex 纵向布局的基础 */
page {
  height: 100%;
}

.container {
  height: 100%;
  background-color: #09090b;
  display: flex;
  flex-direction: column;
}
.px-4 { padding: 0 20px; }
.mt-2 { margin-top: 8px; }
.mt-3 { margin-top: 12px; }
.mt-6 { margin-top: 24px; }
.mt-8 { margin-top: 32px; }
.ml-3 { margin-left: 12px; }
.pb-safe { padding-bottom: constant(safe-area-inset-bottom); padding-bottom: env(safe-area-inset-bottom); }
.flex { display: flex; }
.flex-col { display: flex; flex-direction: column; }
.justify-between { justify-content: space-between; }
.justify-center { justify-content: center; }
.items-center { align-items: center; }
.block { display: block; }

/* 顶部导航栏 */
.nav-bar {
  flex-shrink: 0; /* 保证导航栏高度不被压缩 */
  padding-top: calc(var(--status-bar-height) + 16px);
  padding-bottom: 16px;
  background-color: rgba(9, 9, 11, 0.85);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  z-index: 10;
}
.nav-title { font-size: 18px; font-weight: 900; color: #8b5cf6; letter-spacing: 2px; }
.nav-subtitle { font-size: 11px; color: #71717a; margin-top: 2px;}
.quota-badge {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  padding: 4px 10px;
  border-radius: 12px;
}
.quota-text { font-size: 10px; color: #ef4444; font-weight: bold; }

/* 聊天流水区 */
.chat-list {
  flex: 1; /* 占据中间所有剩余空间 */
  overflow: hidden; /* 滑动由内部 scroll-view 自己接管 */
  padding: 0 20px;
  box-sizing: border-box;
  /* 为底部悬浮输入框预留滚动空间 */
  padding-bottom: 100px;
}
.msg-wrapper {
  display: flex;
  align-items: flex-start;
  margin-bottom: 20px;
  width: 100%;
}
.msg-wrapper.user {
  flex-direction: row-reverse;
}
.avatar {
  flex-shrink: 0; /* 防止头像被挤压变形 */
}
.ai-avatar {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(16, 185, 129, 0.1));
  border: 1px solid rgba(139, 92, 246, 0.4);
  box-shadow: 0 0 15px rgba(139, 92, 246, 0.2);
}
.ai-icon { color: #8b5cf6; font-size: 18px; font-weight: bold;}
.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(8, 145, 178, 0.1));
  border: 1px solid rgba(16, 185, 129, 0.4);
  box-shadow: 0 0 15px rgba(16, 185, 129, 0.2);
}
.user-icon { color: #10b981; font-size: 16px; font-weight: bold; font-family: monospace;}
.msg-bubble {
  margin-left: 12px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 4px 16px 16px 16px;
  padding: 16px;
  max-width: 80%;
  backdrop-filter: blur(5px);
}
.user-bubble {
  margin-left: 0;
  margin-right: 0; /* Clear right margin from earlier, will use avatar's ml-3 for gap */
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 16px 4px 16px 16px;
}
.msg-text {
  font-size: 14px;
  color: #d4d4d8;
  line-height: 1.6;
  letter-spacing: 0.5px;
}



/* 现代悬浮底部输入区 */
.input-area {
  flex-shrink: 0; /* 保证输入框高度不被压缩 */
  padding: 10px 20px max(16px, env(safe-area-inset-bottom)) 20px; 
  background: linear-gradient(180deg, rgba(9, 9, 11, 0) 0%, rgba(9, 9, 11, 0.8) 20%, #09090b 100%);
  margin-top: -80px; /* 向上偏移覆盖到聊天记录上，产生悬浮感 */
  z-index: 20;
}
.input-container {
  width: 100%;
  background: rgba(24, 24, 27, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 28px;
  padding: 6px 6px 6px 20px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.input-container:focus-within {
  border-color: rgba(16, 185, 129, 0.4);
  box-shadow: 0 8px 32px rgba(16, 185, 129, 0.1);
  background: rgba(24, 24, 27, 0.95);
}
.input-box {
  height: 44px;
  flex: 1;
  color: #e4e4e7;
  font-size: 15px;
  background: transparent;
  border: none;
}

.placeholder-text { color: #71717a; font-size: 14px; }

.btn-send {
  width: 38px; height: 38px;
  border-radius: 50%;
  background: #10b981;
  margin-left: 10px;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  transition: all 0.2s;
}
.btn-send:active { transform: scale(0.9); }
.btn-send.disabled {
  background: #27272a;
  box-shadow: none;
  opacity: 0.6;
}
.send-icon { color: #000; font-size: 16px; font-weight: 900; }
.btn-send.disabled .send-icon { color: #52525b; font-weight: normal; }
</style>
