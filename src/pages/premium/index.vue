<template>
  <view class="premium-container flex-col">
    <!-- 定制的高斯模糊导航栏 -->
    <CyberNavBar title="黑金链路激活" :blur="true" />
    
    <scroll-view scroll-y class="premium-scroll flex-1" :show-scrollbar="false">
      <!-- 头部：身份状态 -->
      <view class="hero-section mt-4 mx-4 relative overflow-hidden flex-col items-center justify-center">
        <view class="glow-bg absolute top-0 left-0 w-full h-full"></view>
        <view class="current-status relative z-10 flex-col items-center">
          <text class="status-icon">◈</text>
          <text class="status-title mt-2">{{ isVip ? 'REWIRE 黑金档案' : '普通神经漫游者' }}</text>
          <text class="status-desc mt-1">{{ isVip ? `核心链路满载运行中 / ${daysLeft}天后衰减` : '未获得高维观测权限' }}</text>
        </view>
      </view>

      <!-- 特权对比阵列 -->
      <view class="privilege-matrix mx-4 mt-8 flex-col">
        <text class="section-title mb-4">核心算力差异</text>
        <view class="matrix-table flex-col">
          <view class="matrix-row header flex items-center">
            <text class="col-feature flex-1">机能</text>
            <text class="col-base">漫游者</text>
            <text class="col-vip">黑金</text>
          </view>
          
          <view v-for="(item, index) in privileges" :key="index" class="matrix-row flex items-center">
            <view class="col-feature flex-1 flex items-center">
              <text class="feat-icon mr-2">{{ item.icon }}</text>
              <text class="feat-name">{{ item.name }}</text>
            </view>
            <text class="col-base">{{ item.base }}</text>
            <text class="col-vip active">{{ item.vip }}</text>
          </view>
        </view>
      </view>

      <!-- 套餐选择 -->
      <view class="plan-selector mx-4 mt-8 flex-col">
        <text class="section-title mb-4">选择续接协议</text>
        <view class="plan-list flex justify-between">
          <view 
            v-for="plan in plans" 
            :key="plan.id"
            class="plan-card flex-col items-center relative"
            :class="{ active: currentPlan.id === plan.id }"
            @click="selectPlan(plan)"
          >
            <view v-if="plan.tag" class="plan-tag absolute">{{ plan.tag }}</view>
            <text class="plan-duration mt-3">{{ plan.name }}</text>
            <view class="plan-price mt-2 flex items-end">
              <text class="symbol">¥</text>
              <text class="amount">{{ plan.price }}</text>
            </view>
            <text class="plan-ori-price mt-1" v-if="plan.originalPrice">¥{{ plan.originalPrice }}</text>
          </view>
        </view>
      </view>

      <!-- 支付通道选择 -->
      <view class="pay-method mx-4 mt-8 flex-col">
        <text class="section-title mb-4">支付方式</text>
        
        <!-- iOS: 仅 Apple 内购（苹果审核要求，不得展示第三方支付） -->
        <view v-if="isIOS"
          class="pay-item flex items-center justify-between"
          :class="{ active: true }"
        >
          <view class="flex items-center">
            <text class="pay-icon-fallback apple mr-3">🍎</text>
            <text class="pay-name">Apple 内购</text>
          </view>
          <view class="radio-circle"></view>
        </view>

        <!-- Android: 微信 / 支付宝 -->
        <template v-else>
          <view 
            class="pay-item flex items-center justify-between"
            :class="{ active: currentPayMethod === 'wechat' }"
            @click="currentPayMethod = 'wechat'"
          >
            <view class="flex items-center">
              <text class="pay-icon-fallback wechat mr-3">W</text>
              <text class="pay-name">微信支付</text>
            </view>
            <view class="radio-circle"></view>
          </view>

          <view 
            class="pay-item flex items-center justify-between mt-3"
            :class="{ active: currentPayMethod === 'alipay' }"
            @click="currentPayMethod = 'alipay'"
          >
            <view class="flex items-center">
              <text class="pay-icon-fallback alipay mr-3">A</text>
              <text class="pay-name">支付宝</text>
            </view>
            <view class="radio-circle"></view>
          </view>
        </template>
      </view>
      
      <!-- 底部安全保障声明 -->
      <view class="security-notice mx-4 mt-6 mb-40 flex items-center justify-center">
        <text class="sec-icon mr-2">🔒</text>
        <text class="sec-text">端到端加密结算 · 虚拟服务概不退款</text>
      </view>
    </scroll-view>

    <!-- 吸底结算台 -->
    <view class="checkout-bar absolute bottom-0 left-0 w-full flex items-center justify-between px-4">
      <view class="total flex-col">
        <text class="total-label">协议总计</text>
        <view class="total-val flex items-end">
          <text class="symbol_sm mb-1">¥</text>
          <text class="amount_large">{{ currentPlan.price }}</text>
        </view>
      </view>
      <view class="btn-checkout flex items-center justify-center" hover-class="btn-hover" @click="handleRealPay">
        <text class="btn-text">立即获取权限</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '@/store/user'
import { paymentManager } from '@/utils/paymentManager'
import CyberNavBar from '@/components/common/CyberNavBar.vue'

const userStore = useUserStore()
// 获取平台信息，用于 iOS/Android 支付分流
const platform = uni.getSystemInfoSync().platform

// 状态获取
const isVip = computed(() => userStore.isVipActive)
const daysLeft = computed(() => userStore.vipDaysLeft)

// 特权说明对比（用于向上销售 Upsell）
const privileges = [
  { icon: '⎈', name: '深度图谱记录', base: '基础 3 项', vip: '全维解锁' },
  { icon: '⌬', name: 'AI 伴疗对话强度', base: '普通级回应', vip: '无限制深度算力' },
  { icon: '✧', name: '极端频段介入', base: '限制', vip: '优先接入' },
  { icon: '🛡️', name: '极客集市专属商品', base: '上锁', vip: '无限购买权' }
]

// 真实法币价格体系（id 与云函数 PRODUCT_MAP 对齐）
const plans = [
  { id: 'vip_month', name: '30 天', price: '18', originalPrice: '25', days: 30, priceFen: 1800 },
  { id: 'vip_quarter', name: '90 天', price: '45', originalPrice: '75', tag: '最常开通', days: 90, priceFen: 4500 },
  { id: 'vip_forever', name: '永久重塑', price: '168', originalPrice: '298', tag: '限时 5 折', days: 36500, priceFen: 16800 }
]

const currentPlan = ref(plans[1])

const selectPlan = (plan) => {
  currentPlan.value = plan
  uni.vibrateShort()
}

// 支付方式（iOS 下仅展示 Apple IAP，Android 展示微信/支付宝）
const currentPayMethod = ref(platform === 'ios' ? 'appleiap' : 'wechat')
// 是否为 iOS 平台（模板中用于条件渲染）
const isIOS = platform === 'ios'

/**
 * 核心支付方法 —— 对接真实支付管线
 * iOS: Apple IAP 内购
 * Android: 微信/支付宝（通过 paymentManager）
 */
const handleRealPay = async () => {
  uni.vibrateShort()
  const plan = currentPlan.value
  const provider = currentPayMethod.value

  uni.showLoading({ title: '接驳加密支付网关...' })

  try {
    // 调用 paymentManager 统一支付接口
    await paymentManager.requestPayment({
      productId: plan.id,
      provider: provider,
      price: plan.priceFen
    })

    // 支付成功 → 本地激活 VIP
    userStore.purchaseVip(plan.days, `订阅黑金通行证 - ${plan.name}`)
    userStore.claimDailyVipGift() // 立即发放当日特权

    uni.hideLoading()
    uni.showToast({ title: '黑金特权已激活', icon: 'success', duration: 2000 })

    // 延迟返回上一页
    setTimeout(() => uni.navigateBack(), 1500)

  } catch (err) {
    uni.hideLoading()
    console.error('[Premium] 支付失败:', err)
    // 用户主动取消不弹错误提示
    if (err && err.errMsg && err.errMsg.includes('cancel')) return
    uni.showToast({ title: err.message || '支付通道中断', icon: 'none' })
  }
}
</script>

<style scoped>
.premium-container {
  width: 100vw;
  height: 100vh;
  background: #09090b;
  overflow: hidden;
  position: relative;
}
.premium-scroll { height: calc(100vh - 88px); box-sizing: border-box; }

.px-4 { padding-left: 16px; padding-right: 16px; }
.mx-4 { margin-left: 16px; margin-right: 16px; }
.mt-2 { margin-top: 8px; }
.mt-3 { margin-top: 12px; }
.mt-4 { margin-top: 16px; }
.mt-6 { margin-top: 24px; }
.mt-8 { margin-top: 32px; }
.mb-4 { margin-bottom: 16px; }
.mb-1 { margin-bottom: 4px; }
.mb-24 { margin-bottom: 96px; }
.mb-40 { margin-bottom: 160px; }
.mr-2 { margin-right: 8px; }
.mr-3 { margin-right: 12px; }
.flex { display: flex; }
.flex-col { display: flex; flex-direction: column; }
.flex-1 { flex: 1; }
.items-center { align-items: center; }
.items-end { align-items: flex-end; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
.relative { position: relative; }
.absolute { position: absolute; }
.top-0 { top: 0; }
.bottom-0 { bottom: 0; }
.left-0 { left: 0; }
.w-full { width: 100%; }
.h-full { height: 100%; }
.z-10 { z-index: 10; }
.overflow-hidden { overflow: hidden; }

/* Hero Section */
.hero-section {
  height: 140px;
  border-radius: 20px;
  background: linear-gradient(135deg, rgba(39, 39, 42, 0.4) 0%, rgba(24, 24, 27, 0.8) 100%);
  border: 1px solid rgba(0, 229, 255, 0.1);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}
.glow-bg {
  background: radial-gradient(circle at 50% 120%, rgba(0, 229, 255, 0.15) 0%, transparent 70%);
  pointer-events: none;
}
.status-icon { font-size: 32px; color: #00e5ff; text-shadow: 0 0 15px rgba(0, 229, 255, 0.5); }
.status-title { font-size: 18px; font-weight: 900; color: #fff; letter-spacing: 1px; }
.status-desc { font-size: 12px; font-family: monospace; color: #a1a1aa; }

/* Section Title */
.section-title { font-size: 14px; font-weight: bold; color: #e4e4e7; font-family: monospace; letter-spacing: 1px;}
.section-title::before { content: '>'; color: #00e5ff; margin-right: 8px; font-weight: 900;}

/* Matrix */
.matrix-table {
  background: rgba(24, 24, 27, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 0 16px;
}
.matrix-row {
  padding: 14px 0;
  border-bottom: 1px dashed rgba(255, 255, 255, 0.05);
}
.matrix-row:last-child { border-bottom: none; }
.matrix-row.header { padding: 12px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.1); }
.header text { font-size: 12px; color: #71717a; font-family: monospace; }
.col-base, .col-vip { width: 70px; text-align: right; font-size: 11px; color: #a1a1aa; }
.feat-icon { font-size: 14px; color: #71717a;}
.feat-name { font-size: 13px; color: #d4d4d8; }
.col-vip.active { color: #00e5ff; font-weight: bold; text-shadow: 0 0 5px rgba(0,229,255,0.3); }

/* Plans */
.plan-list { gap: 12px; }
.plan-card {
  flex: 1;
  padding: 20px 0;
  background: rgba(39, 39, 42, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  transition: all 0.3s;
}
.plan-duration { font-size: 14px; font-weight: bold; color: #d4d4d8; }
.plan-price .symbol { font-size: 12px; color: #fff; margin-right: 2px; }
.plan-price .amount { font-size: 24px; font-weight: 900; color: #fff; font-family: monospace; line-height: 1;}
.plan-ori-price { font-size: 11px; color: #71717a; text-decoration: line-through; font-family: monospace;}
.plan-tag {
  top: -8px; 
  background: linear-gradient(90deg, #f59e0b, #d97706);
  padding: 2px 6px; border-radius: 4px; border: 1px solid #fbbf24;
  font-size: 9px; font-weight: bold; color: #fff; box-shadow: 0 2px 5px rgba(245, 158, 11, 0.3);
}

.plan-card.active {
  background: rgba(0, 229, 255, 0.1);
  border-color: #00e5ff;
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 229, 255, 0.15);
}
.plan-card.active .plan-duration, .plan-card.active .plan-price .amount, .plan-card.active .plan-price .symbol { color: #00e5ff; }

/* Pay method */
.pay-item {
  padding: 16px;
  background: rgba(24, 24, 27, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  transition: all 0.2s;
}
.pay-item.active { border-color: rgba(255, 255, 255, 0.2); background: rgba(39, 39, 42, 0.8); }
.pay-name { font-size: 14px; color: #e4e4e7; font-weight: bold;}
.pay-icon-fallback { width: 24px; height: 24px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 900; color: #fff; }
.pay-icon-fallback.wechat { background: #10b981; }
.pay-icon-fallback.alipay { background: #0ea5e9; }
.radio-circle { width: 20px; height: 20px; border-radius: 50%; border: 2px solid #52525b; transition: all 0.2s; }
.pay-item.active .radio-circle { border-color: #00e5ff; background: #00e5ff; box-shadow: inset 0 0 0 4px #18181b; }

/* Notice */
.sec-icon { font-size: 12px; opacity: 0.6;}
.sec-text { font-size: 11px; color: #71717a; font-family: monospace;}

/* Checkout */
.checkout-bar {
  height: 80px;
  background: rgba(9, 9, 11, 0.95);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  padding-bottom: env(safe-area-inset-bottom);
}
.total-label { font-size: 11px; color: #a1a1aa; font-family: monospace;}
.symbol_sm { font-size: 14px; color: #00e5ff; margin-right: 4px; font-weight: bold;}
.amount_large { font-size: 28px; font-weight: 900; color: #fff; font-family: monospace;}
.btn-checkout {
  height: 48px;
  padding: 0 32px;
  background: linear-gradient(135deg, #00e5ff 0%, #0284c7 100%);
  border-radius: 24px;
  box-shadow: 0 4px 15px rgba(0, 229, 255, 0.3);
  transition: all 0.2s;
}
.btn-hover { transform: scale(0.95); opacity: 0.9; }
.btn-text { font-size: 15px; font-weight: 900; color: #fff; letter-spacing: 1px;}
</style>
