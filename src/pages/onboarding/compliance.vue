<template>
  <view class="compliance-wrapper flex-col" :style="themeStore.themeCssVars">
    <view class="safe-area-top"></view>
    
    <!-- 极光背景 -->
    <view class="ambient-glow"></view>

    <!-- 顶部标题 -->
    <view class="header mt-10 px-6 fade-up">
       <text class="title">身份验证与契约签署</text>
       <text class="subtitle mt-3">你即将接入【觉醒空间】神经网络。在此之前，系统需要与你缔结具备法律效力的单向契约。</text>
    </view>

    <!-- 合规文本滚动区 -->
    <scroll-view class="contract-area flex-1 px-6 mt-8 fade-up" style="animation-delay: 0.1s;" scroll-y :show-scrollbar="false">
       <view class="contract-card">
          <text class="section-title">§ 核心预警与免责声明</text>
          <text class="content-text mt-2 block">
            1. <text class="highlight">高强度自律训练</text>：本系统包含物理阻断、专注警报等非传统激励手段，旨在帮助你建立自律习惯。若您有特殊健康状况，<text style="color: #ef4444; font-weight: bold;">请咨询专业人士后再决定是否继续</text>。
          </text>
          <text class="content-text mt-2 block">
            2. <text class="highlight">战区连坐机制</text>：部分战区涉及积分扣除及小队连坐判定，您的违规行为可能导致积分清零及队友进度受损。
          </text>

          <text class="section-title mt-6 block">§ 隐私防线承诺</text>
          <text class="content-text mt-2 block">
            我们在采集打卡数据、崩溃节点、生物钟等匿名坐标时，<text class="highlight">绝不会</text>越权获取您的通讯录、相册或现实定位。一切信息只为云端 AI 精准输出干预策略。
          </text>

          <view class="links-row flex flex-col mt-8">
             <view class="link-item flex items-center mb-3" @click="goTo('terms')" hover-class="link-hover">
               <text class="icon-link">📄</text>
               <text class="link-text ml-2">完整阅读《产品服务协议》</text>
             </view>
             <view class="link-item flex items-center" @click="goTo('privacy')" hover-class="link-hover">
               <text class="icon-link">🔒</text>
               <text class="link-text ml-2">完整阅读《隐私防线政策》</text>
             </view>
          </view>
       </view>
       <view class="pb-10"></view>
    </scroll-view>

    <!-- 底部硬核按钮 -->
    <view class="footer-action flex-col px-6 pb-bottom fade-up" style="animation-delay: 0.2s;">
        <view class="btn-refuse flex justify-center items-center mb-4" @click="handleRefuse" hover-class="btn-pressed">
           <text class="refuse-text">拒绝并切断连接</text>
        </view>

        <view class="btn-accept flex justify-center items-center" @click="handleAccept" hover-class="btn-pressed">
           <text class="accept-text">我已阅读并签署契约</text>
        </view>
    </view>
  </view>
</template>

<script setup>
import { onMounted } from 'vue'
import { useThemeStore } from '../../store/theme.js'

const themeStore = useThemeStore()

onMounted(() => {
    uni.hideTabBar()
})

const goTo = (type) => {
    uni.navigateTo({ url: `/pages/agreement/index?type=${type}` })
}

const handleRefuse = () => {
    uni.showToast({ title: '已断开神经元连接', icon: 'none' })
    setTimeout(() => {
        // #ifdef APP-PLUS
        plus.runtime.quit()
        // #endif
        
        // #ifndef APP-PLUS
        uni.reLaunch({ url: '/pages/login/index' })
        // #endif
    }, 1500)
}

const handleAccept = () => {
    uni.vibrateShort()
    uni.setStorageSync('privacy_agreed', true)
    
    // 如果已经有缓存的 token 并且没过期，说明是老用户卸载重装或被重置策略拦截
    const token = uni.getStorageSync('uni_id_token')
    if (token) {
        uni.showLoading({ title: '重连云端...' })
        // 安全起见，再做一次验活然后再去 dashboard
        setTimeout(() => {
            uni.hideLoading()
            uni.switchTab({ url: '/pages/dashboard/index' })
        }, 1000)
    } else {
        // 正常新用户去登录
        uni.reLaunch({ url: '/pages/login/index' })
    }
}
</script>

<style lang="scss" scoped>
.compliance-wrapper {
  min-height: 100vh;
  width: 100vw;
  background-color: #050505;
  color: #fff;
  position: relative;
  overflow: hidden;
}

.safe-area-top { height: calc(var(--status-bar-height) + 10px); }
.px-6 { padding: 0 24px; }
.mt-10 { margin-top: 40px; }
.mt-8 { margin-top: 32px; }
.mt-6 { margin-top: 24px; }
.mt-3 { margin-top: 12px; }
.mt-2 { margin-top: 8px; }
.ml-2 { margin-left: 8px; }
.mb-4 { margin-bottom: 16px; }
.mb-3 { margin-bottom: 12px; }
.pb-10 { padding-bottom: 40px; }
.pb-bottom { padding-bottom: max(30px, env(safe-area-inset-bottom)); }
.flex { display: flex; }
.flex-col { display: flex; flex-direction: column; }
.flex-1 { flex: 1; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
.block { display: block; }

/* 氛围光晕 */
.ambient-glow {
  position: absolute;
  top: -100px;
  right: -50px;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(0, 229, 255, 0.15) 0%, transparent 70%);
  pointer-events: none;
  z-index: 1;
}

.title { font-size: 26px; font-weight: 900; letter-spacing: 2px; color: var(--theme-primary, #00e5ff); text-shadow: 0 0 15px rgba(0, 229, 255, 0.3);}
.subtitle { font-size: 14px; color: #a1a1aa; line-height: 1.6; letter-spacing: 1px;}

.contract-area {
  z-index: 10;
  box-sizing: border-box;
}

.contract-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 24px 20px;
  backdrop-filter: blur(10px);
}

.section-title { font-size: 16px; font-weight: 900; color: #f4f4f5; letter-spacing: 1px;}
.content-text { font-size: 14px; color: #a1a1aa; line-height: 1.6; letter-spacing: 0.5px;}
.highlight { color: var(--theme-primary, #00e5ff); font-weight: bold;}

.links-row {
  border-top: 1px dashed rgba(255, 255, 255, 0.1);
  padding-top: 20px;
}

.link-item {
  background: rgba(0, 0, 0, 0.3);
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.2s;
}
.link-hover { background: rgba(0, 229, 255, 0.1); border-color: rgba(0, 229, 255, 0.4); }
.icon-link { font-size: 16px; }
.link-text { font-size: 14px; font-weight: bold; color: #f4f4f5;}

.footer-action {
  z-index: 10;
  background: linear-gradient(180deg, transparent 0%, #050505 40%);
  padding-top: 40px;
}

.btn-refuse {
  height: 52px;
  background: transparent;
  border-radius: 12px;
}
.refuse-text { font-size: 15px; color: #71717a; font-weight: bold; letter-spacing: 1px;}

.btn-accept {
  height: 56px;
  background: var(--theme-primary, #00e5ff);
  border-radius: 16px;
  box-shadow: 0 10px 20px rgba(0, 229, 255, 0.2);
}
.accept-text { font-size: 16px; color: #000; font-weight: 900; letter-spacing: 1.5px;}

.btn-pressed { transform: scale(0.97); opacity: 0.9; }

/* 极其平滑的入场动画 */
.fade-up {
  opacity: 0;
  transform: translateY(20px);
  animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeUp {
  to { opacity: 1; transform: translateY(0); }
}
</style>
