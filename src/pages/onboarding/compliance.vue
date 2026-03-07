<template>
  <view class="compliance-wrapper flex-col" :style="themeStore.themeCssVars">
    <view class="safe-area-top"></view>
    
    <!-- 极光背景 -->
    <view class="ambient-glow"></view>

    <!-- 顶部标题 -->
    <view class="header mt-4 px-6 fade-up">
       <text class="title block">身份验证与契约签署</text>
       <text class="subtitle mt-3 block">你即将接入【觉醒空间】神经网络。在此之前，系统需要与你缔结具备法律效力的单向契约。</text>
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
             <view class="checkbox-row flex items-start mb-6" @click="agreeTerms = !agreeTerms">
               <view class="cyber-checkbox mt-1 mr-3" :class="{ 'checked': agreeTerms }">
                 <view class="inner-dot" v-if="agreeTerms"></view>
               </view>
               <text class="check-desc flex-1">我已满 18 周岁，并已完整阅读且同意 <text class="highlight-link" @click.stop="goTo('terms')">《产品服务协议》</text></text>
             </view>
             
             <view class="checkbox-row flex items-start" @click="agreePrivacy = !agreePrivacy">
               <view class="cyber-checkbox mt-1 mr-3" :class="{ 'checked': agreePrivacy }">
                 <view class="inner-dot" v-if="agreePrivacy"></view>
               </view>
               <text class="check-desc flex-1">我已明悉并同意 <text class="highlight-link" @click.stop="goTo('privacy')">《隐私防线政策》</text> 中的所有数据处理条例</text>
             </view>
          </view>
       </view>
    </scroll-view>

    <!-- 底部硬核按钮 -->
    <view class="footer-action flex-col px-6 pb-bottom fade-up" style="animation-delay: 0.2s;">
        <view class="btn-refuse flex justify-center items-center mb-4" @click="handleRefuse" hover-class="btn-pressed">
           <text class="refuse-text">拒绝并切断连接</text>
        </view>

        <view class="btn-accept flex justify-center items-center" :class="{ 'disabled': !bothAgreed }" @click="handleAccept" :hover-class="bothAgreed ? 'btn-pressed' : ''">
           <text class="accept-text">我已阅读并签署契约</text>
        </view>
        
        <CyberFooter />
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useThemeStore } from '../../store/theme.js'
import CyberFooter from '@/components/common/CyberFooter.vue'

const themeStore = useThemeStore()

const agreeTerms = ref(false)
const agreePrivacy = ref(false)

const bothAgreed = computed(() => agreeTerms.value && agreePrivacy.value)

onMounted(() => {
    uni.hideTabBar()
})

const goTo = (type) => {
    uni.navigateTo({ url: `/pages/agreement/index?type=${type}` })
}

const handleRefuse = () => {
    uni.showToast({ title: '拒绝契约，切断神经元连接', icon: 'none' })
    uni.removeStorageSync('uni_id_token')
    setTimeout(() => {
        // #ifdef APP-PLUS
        plus.runtime.quit()
        // #endif
        
        // #ifndef APP-PLUS
        // 非 App 环境无法直接退杀进程，提示用户自行关闭网页/小程序
        uni.showToast({
            title: '因未签署安全契约，系统无法介入。请手动关闭当前页面。',
            icon: 'none',
            duration: 3000
        })
        // #endif
    }, 1500)
}

const handleAccept = () => {
    if (!bothAgreed.value) {
        uni.showToast({ title: '请先勾选并签署上方所有契约', icon: 'none' })
        // 添加震动提醒
        uni.vibrateShort()
        return
    }

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

.safe-area-top { height: calc(var(--status-bar-height) + 40px); }
.px-6 { padding: 0 24px; }
.mt-4 { margin-top: 16px; }
.mt-8 { margin-top: 32px; }
.mt-6 { margin-top: 24px; }
.mt-3 { margin-top: 12px; }
.mt-2 { margin-top: 8px; }
.mt-1 { margin-top: 4px; }
.mr-3 { margin-right: 12px; }
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
  padding-top: 24px;
}

.checkbox-row {
  transition: all 0.3s;
}

.cyber-checkbox {
  width: 20px;
  height: 20px;
  border: 2px solid #52525b;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  flex-shrink: 0;
}
.cyber-checkbox.checked {
  border-color: var(--theme-primary, #00e5ff);
  background: rgba(0, 229, 255, 0.1);
}
.inner-dot {
  width: 10px;
  height: 10px;
  background: var(--theme-primary, #00e5ff);
  border-radius: 3px;
  box-shadow: 0 0 10px var(--theme-shadow-primary);
}

.check-desc {
  font-size: 13px;
  color: #a1a1aa;
  line-height: 1.6;
}

.highlight-link {
  color: var(--theme-primary, #00e5ff);
  font-weight: bold;
  text-decoration: underline;
  text-decoration-color: rgba(0, 229, 255, 0.3);
  text-underline-offset: 2px;
}
.highlight-link:active {
  opacity: 0.7;
}

.icon-link { font-size: 16px; }

.footer-action {
  z-index: 10;
  background: linear-gradient(180deg, transparent 0%, #050505 40%);
  padding-top: 20px;
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
  transition: all 0.3s;
}
.btn-accept.disabled {
  background: #27272a;
  box-shadow: none;
  opacity: 0.5;
}
.accept-text { font-size: 16px; color: #000; font-weight: 900; letter-spacing: 1.5px;}

.btn-pressed:not(.disabled) { transform: scale(0.96); opacity: 0.9; box-shadow: 0 4px 15px rgba(0, 229, 255, 0.4); }

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
