<template>
  <view class="container flex-col" :style="themeStore.themeCssVars">
    <CyberNavBar title="裂变引流中心" />
    <scroll-view scroll-y class="scroll-area flex-1 px-4">
      
      <!-- 头部介绍区：裂变规则 -->
      <view class="header-banner mt-4 p-4 flex-col items-center relative cyber-border">
         <view class="cyber-corner top-left"></view>
         <view class="cyber-corner bottom-right"></view>
         <text class="banner-title mb-2 glitch-text" data-text="📡 星际信号扩散阵列">📡 星际信号扩散阵列</text>
         <text class="banner-desc text-center">
            这个世界需要更多的觉醒者。向外散播你的专属信标，每成功接引 <text class="highlight font-bold neon-text">1</text> 位新探员降落本空间，双方均可获得 <text class="highlight font-bold neon-text">100</text> 神经币战略空投。
         </text>
         <view class="banner-target mt-4 px-3 py-3 w-full text-center cyber-inner-box">
            <text class="text-sm text-gray-300">特别悬赏：累计成功邀请 <text class="highlight font-bold text-xl neon-text mx-1">3</text> 位探员</text>
            <text class="block text-xs mt-2 text-green-400 font-bold tracking-wide">▷ 即可解锁 [ 1天黑金通行证VIP ] 体验特权 ◁</text>
         </view>
      </view>

      <!-- 我的信标区 -->
      <view class="section mt-6 p-4 relative cyber-border">
         <view class="cyber-corner bottom-left"></view>
         <view class="section-title flex items-center mb-4">
            <text class="icon mr-2 text-primary">🔗</text>
            <text class="text-md font-bold text-white tracking-widest">向外分发你的专属引流信标</text>
         </view>
         
         <view class="share-box flex-col items-center px-4 py-6" @click="copyInviteCode">
            <text class="text-3xl text-primary font-mono font-bold cyber-glitch-hover mb-4">{{ userStore.inviteCode || '获取中...' }}</text>
            <view class="cyber-btn-small">
               <text class="btn-text">点击复制专属信标</text>
            </view>
         </view>
         <text class="block text-xs text-gray-500 mt-3 wrap-text text-center">将上方信标发给新探员，注册时输入即可建立连接。</text>
      </view>
      
      <!-- 核验别人信标区 -->
      <view class="section mt-6 p-4 relative cyber-border">
         <view class="cyber-corner top-right"></view>
         <view class="section-title flex items-center mb-4">
            <text class="icon mr-2 text-green-400">🤝</text>
            <text class="text-md font-bold text-white tracking-widest">接入引路人信标</text>
         </view>

         <view v-if="!userStore.invitedBy" class="flex-col">
            <text class="text-sm text-gray-400 mb-3 wrap-text">如果你受人邀请，请在此处填写对方的信标：</text>
            <view class="input-row flex justify-between items-center mt-2">
               <input 
                  class="cyber-input text-center font-mono text-xl text-green-400 flex-1 mr-3" 
                  type="text" 
                  v-model="bindCode" 
                  maxlength="8"
                  placeholder="[ ---- ]"
                  placeholder-style="color: rgba(74, 222, 128, 0.3);"
               />
               <view class="cyber-btn" @click="submitBindCode">
                  <text class="btn-text">建立链路</text>
               </view>
            </view>
         </view>
         
         <!-- 已绑定状态 -->
         <view class="bind-success text-center py-6 mt-2 flex-col items-center cyber-inner-box" v-else>
            <text class="text-xl text-green-400 font-bold mb-2 neon-text-green">✓ 已成功建立连接</text>
            <text class="text-xs text-gray-400">你已被引路人接纳，无法重复激活。</text>
         </view>
      </view>
      
      <!-- 底部留白 -->
      <view style="height: 100px;"></view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '../../store/user.js'
import { useThemeStore } from '../../store/theme.js'

const userStore = useUserStore()
const themeStore = useThemeStore()

const bindCode = ref('')

onMounted(() => {
    // 进入界面自动从云端获取或生成最新邀请码
    if (!userStore.inviteCode) {
        userStore.fetchUserProfile()
    }
})

const copyInviteCode = () => {
    if (!userStore.inviteCode) {
        uni.showToast({ title: '信标正在生成，请稍候', icon: 'none' })
        return
    }
    uni.setClipboardData({
        data: userStore.inviteCode,
        success: () => {
            uni.showToast({ title: '信标已写入剪贴板', icon: 'success' })
        }
    })
}

const submitBindCode = async () => {
    if (!bindCode.value.trim()) {
        uni.showToast({ title: '信标代号不可为空', icon: 'none' })
        return
    }
    uni.showLoading({ title: '核验链路中...' })
    const res = await userStore.submitInviteCode(bindCode.value.trim().toUpperCase())
    uni.hideLoading()
    
    if (res.success) {
        uni.showToast({ title: res.msg, icon: 'success' })
    } else {
        uni.showToast({ title: res.msg, icon: 'none' })
    }
}
</script>

<style lang="scss" scoped>
* {
  box-sizing: border-box;
}

.container {
  min-height: 100vh;
  background-color: var(--theme-bg, #090a0f);
  background-image: linear-gradient(rgba(0, 229, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 229, 255, 0.03) 1px, transparent 1px);
  background-size: 20px 20px;
  color: #fff;
  position: relative;
}
.container::after {
  content: "";
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background: repeating-linear-gradient(0deg, rgba(0,0,0,0.15), rgba(0,0,0,0.15) 1px, transparent 1px, transparent 2px);
  pointer-events: none;
  z-index: 999;
}

.scroll-area {
  margin-top: calc(var(--status-bar-height) + 44px); 
}
.px-4 { padding: 0 16px; }
.px-3 { padding: 0 12px; }
.py-3 { padding: 12px 0; }
.py-4 { padding: 16px 0; }
.py-6 { padding: 24px 0; }
.mt-2 { margin-top: 8px; }
.mt-4 { margin-top: 16px; }
.mt-6 { margin-top: 24px; }
.p-4 { padding: 16px; }
.mr-2 { margin-right: 8px; }
.mr-3 { margin-right: 12px; }
.mx-1 { margin-left: 4px; margin-right: 4px; }
.mb-2 { margin-bottom: 8px; }
.mb-3 { margin-bottom: 12px; }
.mb-4 { margin-bottom: 16px; }
.w-full { width: 100%; box-sizing: border-box; }

.flex { display: flex; }
.flex-col { display: flex; flex-direction: column; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.flex-1 { flex: 1; }
.text-center { text-align: center; }
.relative { position: relative; }

.highlight { color: #00e5ff; }
.font-bold { font-weight: bold; }
.font-mono { font-family: "Courier New", Courier, monospace; }
.text-primary { color: #00e5ff; }
.text-green-400 { color: #4ade80; }
.text-green-500 { color: #10b981; }
.text-gray-300 { color: #d1d5db; }
.text-gray-400 { color: #9ca3af; }
.text-gray-500 { color: #6b7280; }
.text-xs { font-size: 12px; }
.text-sm { font-size: 14px; }
.text-md { font-size: 16px; }
.text-lg { font-size: 18px; }
.text-xl { font-size: 22px; }
.text-2xl { font-size: 28px; }
.text-3xl { font-size: 36px; letter-spacing: 4px; }
.block { display: block; }
.opacity-80 { opacity: 0.8; }
.tracking-wide { letter-spacing: 1px; }
.tracking-widest { letter-spacing: 2px; }
.wrap-text { word-wrap: break-word; word-break: break-all; white-space: normal; }

/* 赛博朋克边框与面板 */
.cyber-border {
  background: rgba(10, 15, 20, 0.8);
  border: 1px solid rgba(0, 229, 255, 0.3);
  box-shadow: 0 0 10px rgba(0, 229, 255, 0.1), inset 0 0 20px rgba(0, 229, 255, 0.05);
  backdrop-filter: blur(5px);
  clip-path: polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px));
}

.cyber-corner {
  position: absolute;
  width: 15px; height: 15px;
  border: 2px solid #00e5ff;
}
.cyber-corner.top-left { top: -1px; left: -1px; border-right: none; border-bottom: none; }
.cyber-corner.top-right { top: -1px; right: -1px; border-left: none; border-bottom: none; }
.cyber-corner.bottom-left { bottom: -1px; left: -1px; border-right: none; border-top: none; }
.cyber-corner.bottom-right { bottom: -1px; right: -1px; border-left: none; border-top: none; }

.header-banner {
  background: linear-gradient(135deg, rgba(0, 229, 255, 0.15) 0%, rgba(139, 92, 246, 0.05) 100%);
  border-top: 3px solid #00e5ff;
}

/* 霓虹字效与故障效 */
.neon-text {
  text-shadow: 0 0 5px #00e5ff, 0 0 10px #00e5ff;
}
.neon-text-green {
  text-shadow: 0 0 5px #4ade80, 0 0 10px #4ade80;
}

.glitch-text {
  position: relative;
  display: inline-block;
  color: #fff;
}
.glitch-text::before, .glitch-text::after {
  content: attr(data-text);
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  opacity: 0.8;
}
.glitch-text::before {
  color: #00e5ff;
  z-index: -1;
  transform: translate(-2px, 2px);
  animation: glitch-anim-1 2s infinite linear alternate-reverse;
}
.glitch-text::after {
  color: #ff00ea;
  z-index: -2;
  transform: translate(2px, -2px);
  animation: glitch-anim-2 3s infinite linear alternate-reverse;
}
@keyframes glitch-anim-1 {
  0% { clip-path: inset(20% 0 80% 0); }
  20% { clip-path: inset(60% 0 10% 0); }
  40% { clip-path: inset(40% 0 50% 0); }
  60% { clip-path: inset(80% 0 5% 0); }
  80% { clip-path: inset(10% 0 70% 0); }
  100% { clip-path: inset(30% 0 40% 0); }
}
@keyframes glitch-anim-2 {
  0% { clip-path: inset(10% 0 60% 0); }
  20% { clip-path: inset(30% 0 20% 0); }
  40% { clip-path: inset(70% 0 10% 0); }
  60% { clip-path: inset(20% 0 50% 0); }
  80% { clip-path: inset(50% 0 30% 0); }
  100% { clip-path: inset(5% 0 80% 0); }
}

.banner-title {
  font-size: 20px;
  font-weight: 900;
  letter-spacing: 2px;
}
.banner-desc {
  font-size: 13px;
  line-height: 1.8;
  color: #a1a1aa;
}

/* 内部凹陷容器 */
.cyber-inner-box {
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.8);
  position: relative;
  overflow: hidden;
}
.cyber-inner-box::before {
  content: '';
  position: absolute;
  top: 0; left: -100%; width: 50%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent);
  animation: scan-light 4s infinite linear;
}
@keyframes scan-light {
  100% { left: 200%; }
}

/* 交互元素 */
.share-box {
  background: linear-gradient(90deg, rgba(0, 229, 255, 0.05), rgba(0, 0, 0, 0.6));
  border-left: 3px solid #00e5ff;
  border-right: 1px solid rgba(0, 229, 255, 0.2);
  border-top: 1px solid rgba(0, 229, 255, 0.1);
  border-bottom: 1px solid rgba(0, 229, 255, 0.1);
  cursor: pointer;
  transition: all 0.2s;
}
.share-box:active {
  transform: scale(0.98);
  background: rgba(0, 229, 255, 0.1);
}

.cyber-btn-small {
  background: #00e5ff;
  color: #000;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: bold;
  clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);
}

.cyber-input {
  height: 48px;
  background: rgba(0, 20, 10, 0.6);
  border: 1px solid #4ade80;
  border-left: 4px solid #4ade80;
  color: #4ade80;
  box-shadow: inset 0 0 10px rgba(74, 222, 128, 0.1);
  transition: all 0.3s ease;
}
.cyber-input:focus {
  box-shadow: 0 0 10px rgba(74, 222, 128, 0.4), inset 0 0 15px rgba(74, 222, 128, 0.2);
}

.cyber-btn {
  background: #10b981;
  color: #000;
  height: 48px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 15px;
  clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);
  position: relative;
}
.cyber-btn::after {
  content: '';
  position: absolute;
  top: 0; right: 0;
  width: 10px; height: 100%;
  background: rgba(255,255,255,0.2);
}
.cyber-btn:active {
  transform: translate(2px, 2px);
}
</style>
