<template>
  <view class="premium-card relative overflow-hidden" :class="{ active: isVip }">
    <!-- 背景流光 -->
    <view class="glow-bg absolute w-full h-full inset-0"></view>
    
    <view class="flex items-center justify-between relative z-10">
      <view class="flex items-center">
        <text class="vip-icon">◈</text>
        <view class="ml-2 flex-col">
          <text class="vip-title">{{ isVip ? 'REWIRE 黑金档案' : '普通神经漫游者' }}</text>
          <text class="vip-desc mt-1">{{ isVip ? `档案有效期至: ${vipExpireTime}` : '神经链接受限中' }}</text>
        </view>
      </view>
      <view class="flex items-center">
         <view class="cyber-coin-badge flex items-center mr-3" hover-class="badge-hover" @click="$emit('openStore')">
           <text class="coin-icon">⎔</text>
           <text class="coin-num">{{ userCoins }}</text>
         </view>
         <view v-if="!isVip" class="btn-upgrade flex items-center justify-center" hover-class="btn-hover" @click="$emit('openStore')">
           <text class="btn-text">神经溯源</text>
         </view>
         <view v-else class="btn-renew flex items-center justify-center" hover-class="btn-hover" @click="$emit('openStore')">
           <text class="btn-text">时空续接</text>
         </view>
      </view>
    </view>
    
    <!-- VIP 专属特权图标区 -->
    <view class="privileges flex items-center justify-around mt-4 relative z-10" :class="{ 'opacity-50': !isVip }">
       <view class="priv-item flex-col items-center">
         <view class="icon-wrap"><text class="priv-icon">⎈</text></view>
         <text class="priv-text mt-1">深度图谱</text>
       </view>
       <view class="priv-item flex-col items-center">
         <view class="icon-wrap"><text class="priv-icon">⌬</text></view>
         <text class="priv-text mt-1">AI 伴疗</text>
       </view>
       <view class="priv-item flex-col items-center">
         <view class="icon-wrap"><text class="priv-icon">✧</text></view>
         <text class="priv-text mt-1">绝密频道</text>
       </view>
    </view>

    <!-- 针对非VIP的试用横幅 -->
    <view v-if="!isVip" class="trial-banner mt-3 flex items-center justify-between relative z-10" hover-class="banner-hover" @click="$emit('watchAd')">
       <view class="flex items-center">
         <text class="ad-icon mr-2">▶</text>
         <text class="trial-text">观看神经共振广告获取 [ 24H 体验权 ]</text>
       </view>
       <text class="trial-arrow">></text>
    </view>
    <!-- 针对 VIP 的状态栏 -->
    <view v-else class="vip-status-bar mt-3 flex items-center justify-between relative z-10">
       <view class="flex items-center">
          <text class="status-dot mr-2"></text>
          <text class="status-text">黑金链路已激活</text>
       </view>
       <view class="sparkline flex items-end">
          <view class="bar" style="height: 12px"></view>
          <view class="bar" style="height: 18px"></view>
          <view class="bar" style="height: 10px"></view>
          <view class="bar" style="height: 24px"></view>
          <view class="bar active" style="height: 16px"></view>
       </view>
    </view>
  </view>
</template>

<script setup>
defineProps({
  isVip: { type: Boolean, default: false },
  vipExpireTime: { type: String, default: '' },
  vipDaysLeft: { type: Number, default: 0 },
  userCoins: { type: Number, default: 0 }
})
defineEmits(['openStore', 'watchAd'])
</script>

<style lang="scss" scoped>
/* 此处包含原 profile/index.vue 中 Premium Card 相关的局部作用域样式 */
.premium-card {
  margin-top: 20px;
  background: linear-gradient(135deg, rgba(39, 39, 42, 0.4) 0%, rgba(24, 24, 27, 0.6) 100%);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.premium-card.active {
  border-color: var(--theme-primary, #00e5ff);
  background: linear-gradient(135deg, rgba(8, 145, 178, 0.15) 0%, rgba(39, 39, 42, 0.8) 100%);
  box-shadow: 0 8px 30px rgba(0, 229, 255, 0.15);
}
.glow-bg {
  background: radial-gradient(circle at 100% 0%, rgba(0, 229, 255, 0.1) 0%, transparent 60%);
  pointer-events: none;
}
.premium-card.active .glow-bg {
  background: radial-gradient(circle at 100% 0%, rgba(0, 229, 255, 0.2) 0%, transparent 70%);
}

.vip-icon { font-size: 24px; color: #a1a1aa; }
.premium-card.active .vip-icon { color: var(--theme-primary, #00e5ff); text-shadow: 0 0 10px var(--theme-shadow-primary); }

.vip-title { font-size: 16px; font-weight: 900; color: #e4e4e7; letter-spacing: 1px; }
.premium-card.active .vip-title { color: var(--theme-primary, #00e5ff); }
.vip-desc { font-size: 11px; color: #71717a; font-family: monospace; }
.premium-card.active .vip-desc { color: #a1a1aa; }

.btn-upgrade {
  padding: 6px 14px;
  background: linear-gradient(135deg, var(--theme-primary, #00e5ff) 0%, #0284c7 100%);
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(0, 229, 255, 0.3);
  transition: transform 0.2s;
}
.btn-renew {
  padding: 6px 14px;
  background: rgba(0, 229, 255, 0.1);
  border: 1px solid var(--theme-primary, #00e5ff);
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(0, 229, 255, 0.1);
  transition: transform 0.2s;
}
.btn-text { color: #fff; font-size: 12px; font-weight: 900; letter-spacing: 1px; }
.btn-renew .btn-text { color: var(--theme-primary, #00e5ff); }
.btn-hover { transform: scale(0.95); opacity: 0.9; }

.privileges { margin-top: 24px; }
.priv-item { width: 33%; }
.icon-wrap {
  width: 40px; height: 40px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  display: flex; align-items: center; justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s;
}
.premium-card.active .icon-wrap {
  background: rgba(0, 229, 255, 0.1);
  border-color: rgba(0, 229, 255, 0.3);
  box-shadow: inset 0 0 10px rgba(0, 229, 255, 0.1);
}

.priv-icon { color: #a1a1aa; font-size: 18px; }
.premium-card.active .priv-icon { color: var(--theme-primary, #00e5ff); }
.priv-text { font-size: 11px; color: #a1a1aa; font-weight: 500; font-family: monospace; }
.premium-card.active .priv-text { color: #e4e4e7; }

.trial-banner {
  background: rgba(255, 255, 255, 0.05);
  padding: 10px 14px;
  border-radius: 8px;
  transition: all 0.2s;
}
.banner-hover { background: rgba(255, 255, 255, 0.08); transform: translateY(1px); }
.ad-icon { color: var(--theme-secondary, #f59e0b); font-size: 12px; }
.trial-text { font-size: 11px; color: #d4d4d8; font-weight: bold; }
.trial-arrow { color: #71717a; font-size: 12px; font-weight: bold; }

.vip-status-bar {
  background: rgba(0, 0, 0, 0.2);
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.03);
}
.status-dot { width: 6px; height: 6px; background: var(--theme-primary, #00e5ff); border-radius: 50%; box-shadow: 0 0 8px var(--theme-primary, #00e5ff); animation: pulse 2s infinite; }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
.status-text { font-size: 11px; color: #a1a1aa; font-family: monospace; letter-spacing: 1px;}
.sparkline .bar { width: 3px; background: rgba(255, 255, 255, 0.1); margin-left: 2px; border-radius: 1px; }
.sparkline .bar.active { background: var(--theme-primary, #00e5ff); box-shadow: 0 0 4px var(--theme-shadow-primary); }

.cyber-coin-badge { background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); padding: 4px 10px; border-radius: 12px; transition: all 0.2s;}
.badge-hover { border-color: var(--theme-secondary, #f59e0b); background: rgba(245, 158, 11, 0.1);}
.coin-icon { color: var(--theme-secondary, #f59e0b); font-size: 14px; font-weight: bold; margin-right: 4px; text-shadow: 0 0 8px rgba(245,158,11,0.5);}
.coin-num { color: #f4f4f5; font-size: 14px; font-weight: 900; font-family: monospace;}

.opacity-50 { opacity: 0.5; }
.mt-1 { margin-top: 4px; }
.mt-3 { margin-top: 12px; }
.mt-4 { margin-top: 16px; }
.mr-2 { margin-right: 8px; }
.mr-3 { margin-right: 12px; }
.ml-2 { margin-left: 8px; }
.flex { display: flex; }
.flex-col { display: flex; flex-direction: column; }
.items-center { align-items: center; }
.items-end { align-items: flex-end; }
.justify-between { justify-content: space-between; }
.justify-around { justify-content: space-around; }
.justify-center { justify-content: center; }
.relative { position: relative; }
.absolute { position: absolute; }
.inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
.overflow-hidden { overflow: hidden; }
.w-full { width: 100%; }
.h-full { height: 100%; }
.z-10 { z-index: 10; }
</style>
