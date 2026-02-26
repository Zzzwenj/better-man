<template>
  <view class="container flex-col">
    <view class="nav-bar flex items-center justify-center">
        <text class="nav-title">认知干预 AI</text>
    </view>
    
    <scroll-view scroll-y class="chat-list">
      <view class="msg-wrapper ai">
          <view class="avatar ai-avatar flex items-center justify-center">
              <text>🤖</text>
          </view>
          <view class="msg-bubble">
            <text>你好，探索者 #8972。我是专属的认知干预 AI。\n\n目前的你正面临多巴胺低谷吗？</text>
          </view>
      </view>
      
      <view class="msg-wrapper user mt-4">
          <view class="msg-bubble">
            <text>我刚才差点没忍住，脑子里全都是那些画面，我觉得好难受...</text>
          </view>
          <view class="avatar user-avatar flex items-center justify-center">
              <text>探</text>
          </view>
      </view>
      
      <view class="msg-wrapper ai mt-4">
          <view class="avatar ai-avatar flex items-center justify-center">
              <text>🤖</text>
          </view>
          <view class="msg-bubble highlight">
            <text>深呼吸。你现在感受到的是一种名为“渴求”的戒断反应。\n这并不代表你失败了，它只表明你的前额叶皮层正在努力收回控制权。\n\n🔥 <text style="color:#00E676; font-weight:bold;">转移任务</text>：请立刻站起来，做 10 个俯卧撑，或者去喝一杯冰水。完成后来告诉我感觉如何。</text>
          </view>
      </view>
    </scroll-view>
    
    <view class="input-area flex items-center">
      <input class="input-box" placeholder="输入你的感受..." placeholder-style="color:#666;" />
      <view class="btn-send flex items-center justify-center" hover-class="btn-hover">
          <text>发送</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {}
</script>

<style lang="scss" scoped>
.container {
  height: 100vh;
  justify-content: space-between;
  background-color: #121212;
}
.nav-bar {
    height: 44px;
    padding-top: var(--status-bar-height);
    background-color: rgba(18, 18, 18, 0.9);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid #222;
    position: sticky;
    top: 0;
    z-index: 10;
}
.nav-title { color: #fff; font-size: 16px; font-weight: bold; letter-spacing: 1px;}

.chat-list {
  flex: 1;
  padding: 20px;
  box-sizing: border-box;
}

.msg-wrapper {
    display: flex;
    align-items: flex-start;
    width: 100%;
}
.mt-4 { margin-top: 16px; }

.avatar { width: 40px; height: 40px; border-radius: 20px; flex-shrink: 0;}
.ai-avatar { background: linear-gradient(135deg, #1A281E 0%, #0a120c 100%); border: 1px solid #00E676;}
.user-avatar { background: #2A2A2A; color: #aaa; font-size: 14px; font-weight: bold;}

.msg-bubble {
  padding: 14px 18px;
  border-radius: 16px;
  max-width: 65%;
  line-height: 1.6;
  font-size: 15px;
}
.ai { justify-content: flex-start; }
.ai .msg-bubble {
  background-color: #1E1E1E;
  color: #E0E0E0;
  margin-left: 12px;
  border-top-left-radius: 4px;
  border: 1px solid #2A2A2A;
}
.ai .msg-bubble.highlight {
    border: 1px solid rgba(0, 230, 118, 0.4);
    box-shadow: 0 4px 15px rgba(0, 230, 118, 0.05);
}

.user { justify-content: flex-end; }
.user .msg-bubble {
  background: linear-gradient(135deg, #00E676 0%, #00B159 100%);
  color: #000;
  font-weight: 500;
  margin-right: 12px;
  border-top-right-radius: 4px;
}

.input-area {
  padding: 12px 20px 30px;
  background-color: #1A1A1A;
  border-top: 1px solid #222;
}
.input-box {
  flex: 1;
  background-color: #252525;
  color: white;
  padding: 12px 20px;
  border-radius: 24px;
  margin-right: 12px;
  font-size: 15px;
  border: 1px solid #333;
}
.btn-send {
  background: linear-gradient(135deg, #00E676 0%, #00B159 100%);
  color: #000;
  font-size: 15px;
  font-weight: 900;
  border-radius: 24px;
  height: 48px;
  width: 72px;
  box-shadow: 0 4px 10px rgba(0, 230, 118, 0.2);
}
.btn-hover { transform: scale(0.95); }
</style>
