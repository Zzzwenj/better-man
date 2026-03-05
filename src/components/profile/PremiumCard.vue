<template>
  <view :class="['premium-card', userStore.isVipActive ? 'active-contract' : '']">
      <!-- 会员订阅主体区 -->
      <view @click="handleUpgradeClick" hover-class="card-hover" class="contract-main">
          <view class="flex justify-between items-center w-full">
              <text class="premium-title flex-1 mr-2" style="word-break: break-all; line-height: 1.2;">{{ userStore.isVipActive ? '👑 黑金权限生效中' : '🔥 黑金通行证 (全量特权)' }}</text>
              <view class="price-chip" style="flex-shrink: 0;" v-if="!userStore.isVipActive">
                  <text>15 ¥ / 月</text>
              </view>
          </view>
          
          <view class="premium-desc mt-2" v-if="!userStore.isVipActive">
            <view class="desc-item"><text class="bullet">▪</text> 部署最高算力节点，解除系统所有限制</view>
            <view class="desc-item"><text class="bullet">▪</text> <text class="highlight">每月领取 1500 神经储备金</text> (立即发放)</view>
            <view class="desc-item"><text class="bullet">▪</text> 解锁绝版黑金冠冕标识及战区主理人通道</view>
            <view class="desc-item"><text class="bullet">▪</text> 每日专属算力，REWIRE AI 心理干预 (50次/天)</view>
            <view class="desc-item"><text class="bullet">▪</text> 解锁本地「量子伪装计算器」隐私防卫</view>
          </view>
          
          <view class="contract-progress mt-4 flex-col" v-else>
             <text class="timer-text">黑金链路维持天数: {{ userStore.vipDaysLeft }} 天</text>
             <view class="progress-bar mt-2">
               <!-- 模拟 30 天为一个周期的进度视觉 -->
               <view class="progress-fill" :style="{ width: ((userStore.vipDaysLeft % 30) / 30 * 100) + '%' }"></view>
             </view>
          </view>
  
          <view class="premium-footer flex items-center mt-4" v-if="!userStore.isVipActive">
              <text class="unlock-text">建立特权连接</text>
              <text class="arrow ml-1">→</text>
          </view>
      </view>

      <!-- 临时越权体验 (看广告, 仅显示一次) -->
      <view class="ad-trial-zone mt-4" v-if="!userStore.isVipActive && !userStore.hasUsedTrial" @click.stop="$emit('watchAd')" hover-class="ad-hover">
          <view class="ad-content flex items-center justify-center">
               <text class="ad-icon">📺</text>
               <text class="ad-text ml-2">_ 获取24H 残破特权节点 (仅限1次)</text>
          </view>
      </view>
  </view>
</template>

<script setup>
import { useUserStore } from '@/store/user.js'
import { paymentManager } from '@/utils/paymentManager.js'

defineEmits(['upgrade', 'watchAd'])
const userStore = useUserStore()

// 拦截原生点击，如果是非 VIP 则拉起真实环境
const handleUpgradeClick = async () => {
    if (userStore.isVipActive) {
        // 如果已经是 VIP，只做事件穿透，让父级弹窗展示剩余时间
        uni.$emit('vip-info-click') 
        return
    }

    const platform = uni.getSystemInfoSync().platform
    // #ifdef APP-PLUS
    if (platform === 'ios') {
        uni.showLoading({ title: '安全连接 App Store...' })
        try {
            await paymentManager.requestPayment({
                productId: 'vip_1month',
                provider: 'appleiap',
                price: 1500 // 分
            })
            uni.hideLoading()
            // 付费成功，手动赋予权益（真实项目应由服务器发端回调加资产）
            userStore.purchaseVip(31, 'App Store 内购特权开通')
            uni.showToast({ title: '特权链已接通', icon: 'success' })
        } catch (e) {
            uni.hideLoading()
            uni.showToast({ title: 'Apple 支付中断', icon: 'none' })
        }
        return
    }
    // #endif

    // [安卓/H5/小程序] 抛出事件给外部去调起微信/支付宝弹窗
    uni.$emit('trigger-android-pay', { price: 1500, type: 'vip_1month' })
}
</script>

<style lang="scss" scoped>
.flex { display: flex; }
.flex-col { display: flex; flex-direction: column; }
.justify-between { justify-content: space-between; }
.justify-center { justify-content: center; }
.items-center { align-items: center; }
.block { display: block; }
.mt-2 { margin-top: 8px; }
.mt-4 { margin-top: 16px; }
.ml-1 { margin-left: 4px; }
.ml-2 { margin-left: 8px; }

/* 订阅特权模幅 */
.premium-card {
    margin-top: 24px;
    margin-bottom: 0px;
    background: rgba(255, 255, 255, 0.03);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 16px;
    padding: 20px 16px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}
.contract-main {
    padding: 4px;
    border-radius: 12px;
    transition: all 0.2s ease;
}
.card-hover { transform: translateY(2px); text-shadow: 0 0 5px var(--theme-shadow-primary); }
.premium-title { font-size: 16px; font-weight: 900; color: var(--theme-primary, #00e5ff); }
.price-chip { background: var(--theme-primary, #00e5ff); color: #09090b; padding: 2px 8px; border-radius: 10px; font-size: 12px; font-weight: bold;}
.premium-desc { font-size: 11px; color: #a1a1aa; line-height: 1.6; }
.desc-item { margin-bottom: 4px; }
.bullet { color: #facc15; margin-right: 6px; font-size: 12px; }
.highlight { color: #00e5ff; font-weight: bold; text-shadow: 0 0 5px rgba(0, 229, 255, 0.4); }
.premium-footer { border-top: 1px dashed var(--theme-shadow-primary); padding-top: 12px;}
.unlock-text { color: #f4f4f5; font-size: 14px; font-weight: bold; }
.arrow { color: var(--theme-primary, #00e5ff); font-weight: bold; font-size: 18px;}

/* 契约进行中状态 */
.active-contract {
    border-color: rgba(0, 229, 255, 0.4);
    box-shadow: 0 0 20px rgba(0, 229, 255, 0.1);
    background: linear-gradient(180deg, rgba(0, 229, 255, 0.05) 0%, rgba(24, 24, 27, 0.9) 100%);
}
.contract-progress { width: 100%; }
.timer-text { font-size: 16px; color: #00e5ff; font-family: monospace; font-weight: bold; text-shadow: 0 0 10px rgba(0,229,255,0.5);}
.progress-bar { width: 100%; height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden; }
.progress-fill { height: 100%; background: #00e5ff; box-shadow: 0 0 10px #00e5ff; border-radius: 3px; transition: width 0.5s ease-out; }

/* 广告体验栏位 */
.ad-trial-zone {
    margin-top: 16px;
    padding: 12px;
    background: rgba(16, 185, 129, 0.05);
    border: 1px dashed rgba(16, 185, 129, 0.3);
    border-radius: 8px;
    transition: all 0.2s ease;
}
.ad-hover { background: rgba(16, 185, 129, 0.1); border-color: rgba(16, 185, 129, 0.6); }
.ad-text { color: #10b981; font-size: 13px; font-family: monospace; text-shadow: 0 0 5px rgba(16, 185, 129, 0.2); }
</style>
