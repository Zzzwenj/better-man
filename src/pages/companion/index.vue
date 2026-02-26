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
      <view class="msg-wrapper ai mt-6">
        <view class="avatar ai-avatar flex items-center justify-center">
          <text class="ai-icon">⎔</text>
        </view>
        <view class="msg-bubble">
          <text class="msg-text">检测到心率与使用间隔异常。\n探索者 #8972，你的前额叶皮层正在遭受强烈的多巴胺受体反噬。\n\n请如实反馈：你现在的渴求层级 (1-10) 是多少？</text>
        </view>
      </view>
      
      <!-- 高级特权引导模块 -->
      <view class="premium-block mt-8 flex-col items-center justify-center">
        <text class="lock-icon">🔒</text>
        <text class="premium-title mt-3">深度精神分析已锁定</text>
        <text class="premium-desc mt-2">目前的渴求层级需要更深度的对抗话术。\n升级以获取无限次 AI 临床导师干预。</text>
        <view class="premium-btn mt-6 flex justify-center items-center" hover-class="btn-hover" @click="upgrade">
          <text class="btn-text">解锁「强制护城河」- ￥9.9 / 月</text>
        </view>
      </view>
    </scroll-view>
    
    <!-- 底部输入区 (已锁定状态) -->
    <view class="input-area flex items-center px-4 pd-bottom">
      <view class="input-box flex-1 flex items-center locked-input">
        <text class="placeholder-text">获取权限后方可继续对话...</text>
      </view>
      <view class="btn-send disabled ml-3 flex items-center justify-center">
        <text class="send-icon">▲</text>
      </view>
    </view>
  </view>
</template>

<script setup>
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
.pd-bottom { padding-bottom: 30px; }
.flex { display: flex; }
.flex-col { display: flex; flex-direction: column; }
.flex-1 { flex: 1; }
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
}
.msg-wrapper {
  display: flex;
  align-items: flex-start;
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
  background-color: #09090b;
  border-top: 1px solid rgba(255,255,255,0.05);
}
.input-box {
  height: 44px;
  background: #18181b;
  border-radius: 22px;
  padding: 0 20px;
  border: 1px solid #27272a;
}
.locked-input { background: rgba(24, 24, 27, 0.5); border: 1px dashed #3f3f46;}
.placeholder-text { color: #52525b; font-size: 13px; }
.btn-send {
  width: 44px; height: 44px;
  border-radius: 22px;
  background: #27272a;
}
.send-icon { color: #52525b; font-size: 18px; }
</style>
