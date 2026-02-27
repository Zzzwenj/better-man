<template>
  <view class="container flex-col">
    <!-- 顶部导航栏 -->
    <view class="nav-bar flex justify-between items-center px-4">
      <view>
        <text class="nav-title">REWIRE AI</text>
        <text class="nav-subtitle block">临床级认知行为干预</text>
      </view>
      <view class="quota-badge flex items-center">
        <text class="quota-text">今日免费额度: 1/1</text>
      </view>
    </view>
    
    <!-- 聊天流水区 -->
    <scroll-view scroll-y class="chat-list flex-1">
      <view class="msg-wrapper mt-6" v-for="(msg, index) in chatList" :key="index" :class="msg.role">
        <!-- AI Avatar -->
        <view class="avatar ai-avatar flex items-center justify-center" v-if="msg.role === 'ai'">
          <text class="ai-icon">⎔</text>
        </view>
        
        <view class="msg-bubble" :class="{ 'user-bubble': msg.role === 'user' }">
          <text class="msg-text">{{ msg.content }}</text>
        </view>
      </view>
      
      <view class="msg-wrapper ai mt-6" v-if="isLoading">
        <view class="avatar ai-avatar flex items-center justify-center">
          <text class="ai-icon">⎔</text>
        </view>
        <view class="msg-bubble">
          <text class="msg-text">正在分析神经脉冲...</text>
        </view>
      </view>
      
      <!-- 高级特权引导模块 -->
      <view class="premium-block mt-8 flex-col items-center justify-center" v-if="isPremiumLocked">
        <text class="lock-icon">🔒</text>
        <text class="premium-title mt-3">深度精神分析已锁定</text>
        <text class="premium-desc mt-2">免费调用额度已用尽。\n升级以获取无限次 AI 临床导师干预。</text>
        <view class="premium-btn mt-6 flex justify-center items-center" hover-class="btn-hover" @click="upgrade">
          <text class="btn-text">解锁「强制护城河」- ￥9.9 / 月</text>
        </view>
      </view>
    </scroll-view>
    
    <!-- 底部输入区 -->
    <view class="input-area flex items-center px-4 pd-bottom">
      <input 
        class="input-box flex-1" 
        :class="{ 'locked-input': isPremiumLocked }"
        v-model="inputValue" 
        :placeholder="isPremiumLocked ? '获取权限后方可继续对话...' : '告诉 AI 你的感受...'" 
        placeholder-class="placeholder-text" 
        @confirm="sendMessage" 
        :disabled="isPremiumLocked" 
      />
      <view class="btn-send ml-3 flex items-center justify-center" :class="{ 'disabled': !inputValue || isPremiumLocked }" @click="sendMessage">
        <text class="send-icon">▲</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'

const chatList = ref([])
const inputValue = ref('')
const isLoading = ref(false)
const isPremiumLocked = ref(false) 

// 🎯 请在此处填入真实的 DeepSeek 或其他兼容 OpenAI 格式的大模型 API Key
// 若为空，系统会自动使用 [模拟回复模式]
const API_KEY = '' 

let userProfile = null

onMounted(() => {
  // 1. 获取问卷体检数据
  const data = uni.getStorageSync('neuro_baseline')
  if (data) {
    userProfile = JSON.parse(data)
  }
  
  // 2. 初始干预话术
  chatList.value.push({
    role: 'ai',
    content: `检测到神经使用间隔异常。\n探索者，你的前额叶皮层正在遭受强烈的多巴胺反噬。\n\n请如实反馈：你现在的渴求层级 (1-10) 是多少？`
  })
})

const sendMessage = async () => {
  if (!inputValue.value.trim() || isLoading.value || isPremiumLocked.value) return
  
  const userMsg = inputValue.value
  chatList.value.push({ role: 'user', content: userMsg })
  inputValue.value = ''
  isLoading.value = true
  
  // 达到免费对话上限，弹出付费墙
  if (chatList.value.length > 5) {
      isLoading.value = false
      isPremiumLocked.value = true
      return
  }
  
  // 组装针对当前用户的 System Prompt
  let systemPrompt = '你是一个严厉的脑神经科学干预AI导师。'
  if (userProfile) {
    systemPrompt += `该用户的生理画像：年龄段[${userProfile.age}]，成瘾史[${userProfile.history}]，破戒爆发频率[${userProfile.frequency}]，高危触发场景包含：[${userProfile.triggers.join(',')}]。`
  }
  systemPrompt += '请用冷峻、专业、直接的中文回复他，字数限制在 80 字以内，一针见血地指出他只不过是多巴胺的奴隶，并给出强烈的反制命令。坚决不要回复诸如你好之类的话。'

  if (API_KEY) {
    try {
      // 真实的大模型 API 请求对接
      const res = await new Promise((resolve, reject) => {
        uni.request({
          url: 'https://api.deepseek.com/chat/completions',
          method: 'POST',
          header: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`
          },
          data: {
            model: 'deepseek-chat',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userMsg }
            ],
            temperature: 0.7
          },
          success: (res) => resolve(res),
          fail: (err) => reject(err)
        })
      })
      
      const aiReply = res.data?.choices?.[0]?.message?.content || 'API 调用异常，无法获取协议指令。'
      chatList.value.push({ role: 'ai', content: aiReply })
    } catch (e) {
      chatList.value.push({ role: 'ai', content: '连接量子心理学数据库超时。' })
    }
  } else {
    // 高级动态模拟响应库 (根据关键词匹配)
    setTimeout(() => {
      let mockReply = ''
      if (userMsg.includes('想') || userMsg.includes('忍不住') || userMsg.includes('破戒')) {
          mockReply = `[临床模拟] 警告：前额叶控制力正在断开。你现在感受到的“想”，仅仅是边缘系统对高浓度多巴胺的乞求，并非你真实的意志。立刻放下手机，去洗把冷水脸！`
      } else if (userMsg.includes('累') || userMsg.includes('坚持') || userMsg.includes('痛苦')) {
          mockReply = `[临床模拟] 阵痛是神经拔节的必经之路。你多忍受一分钟的焦虑，你的多巴胺受体就多恢复一分敏锐度。不要向低级欲望妥协。`
      } else {
          mockReply = `[临床模拟] 收到你的反馈。数据分析表明你的情绪波动来源于 [${userProfile?.triggers?.join(' / ') || '未知环境刺激'}]。请保持觉察，深呼吸。`
      }
      mockReply += ` (注: 在源码加入真实 API_KEY 获取无删减全动态干预)`
      
      chatList.value.push({ role: 'ai', content: mockReply })
      isLoading.value = false
      
      // 触觉反馈模拟 AI 消息到达
      uni.vibrateShort()
    }, 1500)
    return
  }
  
  isLoading.value = false
}

const upgrade = () => {
  uni.showModal({
    title: '开启全面护城河',
    content: '通过 9.9 元/月解锁无限次临床级 AI 心理拉扯包，为理智上锁。',
    confirmColor: '#10b981',
    confirmText: '立即解锁'
  })
}
</script>

<style lang="scss" scoped>
.container {
  height: 100vh;
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
.flex-1 { flex: 1; overflow: hidden; }
.justify-between { justify-content: space-between; }
.justify-center { justify-content: center; }
.items-center { align-items: center; }
.block { display: block; }

/* 顶部导航栏 */
.nav-bar {
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
  padding: 0 20px;
  box-sizing: border-box;
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
  flex-shrink: 0;
  box-shadow: 0 0 15px rgba(139, 92, 246, 0.2);
}
.ai-icon { color: #8b5cf6; font-size: 18px; font-weight: bold;}
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
  margin-right: 12px;
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

/* 高级特权引导模块 */
.premium-block {
  margin-top: 60px;
  padding: 30px 20px;
  background: radial-gradient(circle at center, rgba(139,92,246,0.1) 0%, transparent 70%);
  border-radius: 20px;
  border: 1px dashed rgba(139, 92, 246, 0.3);
}
.lock-icon { font-size: 32px; filter: drop-shadow(0 0 10px rgba(139,92,246,0.5));}
.premium-title { font-size: 18px; font-weight: bold; color: #a78bfa; }
.premium-desc { font-size: 13px; color: #71717a; text-align: center; line-height: 1.5;}
.premium-btn {
  background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
  padding: 0 24px;
  height: 44px;
  border-radius: 22px;
  box-shadow: 0 8px 20px rgba(139, 92, 246, 0.3);
  transition: all 0.2s;
}
.btn-text { color: white; font-size: 14px; font-weight: bold; letter-spacing: 1px;}
.btn-hover { transform: scale(0.96); box-shadow: 0 4px 10px rgba(139, 92, 246, 0.4);}

/* 底部输入区 */
.input-area {
  padding-top: 12px;
  padding-bottom: max(16px, env(safe-area-inset-bottom));
  background-color: #09090b;
  border-top: 1px solid rgba(255,255,255,0.05);
  box-sizing: border-box;
}
.input-box {
  height: 44px;
  background: #18181b;
  border-radius: 22px;
  padding: 0 20px;
  border: 1px solid #27272a;
  color: #e4e4e7;
  font-size: 14px;
}
.locked-input { 
    background: rgba(24, 24, 27, 0.5); 
    border: 1px dashed #3f3f46;
}
.placeholder-text { color: #52525b; font-size: 13px; }
.btn-send {
  width: 44px; height: 44px;
  border-radius: 22px;
  background: #10b981;
  transition: all 0.2s;
}
.btn-send.disabled {
    background: #27272a;
    opacity: 0.5;
}
.send-icon { color: #000; font-size: 18px; font-weight: bold; }
.btn-send.disabled .send-icon { color: #52525b; font-weight: normal; }
</style>
