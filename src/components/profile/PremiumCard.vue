<template>
  <view :class="['premium-card', userStore.isVipActive ? 'active-contract' : '']">
      <!-- 会员订阅主体区 -->
      <view @click="$emit('upgrade')" hover-class="card-hover" class="contract-main">
          <view class="flex justify-between items-center w-full">
              <text class="premium-title flex-1 mr-2" style="word-break: break-all; line-height: 1.2;">{{ userStore.isVipActive ? '👑 黑金权限生效中' : '🔥 黑金通行证 (全量特权)' }}</text>
              <view class="price-chip" style="flex-shrink: 0;" v-if="!userStore.isVipActive">
                  <text>1500 神经币 / 月</text>
              </view>
          </view>
          
          <text class="premium-desc block mt-2" v-if="!userStore.isVipActive">
            解锁深网最高权限。破戒月费<text style="color: #00e5ff; font-weight: bold;">首3次免单原谅</text>，
            绝版皇冠标识，专属实体结衣礼盒，以及每月最高 1500 神经币战略储备金！
          </text>
          
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

defineEmits(['upgrade', 'watchAd'])
const userStore = useUserStore()
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
.premium-desc { font-size: 13px; color: #a1a1aa; line-height: 1.5; }
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
