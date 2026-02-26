<template>
  <view class="container">
    <view class="header flex items-center px-4">
      <view class="avatar flex items-center justify-center">
          <text class="avatar-text">探</text>
      </view>
      <view class="info ml-3">
        <text class="nickname">探索者 #8972</text>
        <view class="status-badge flex items-center justify-center mt-1">
            <text class="status-text">实时检测：已关闭</text>
        </view>
      </view>
    </view>
    
    <view class="premium-wrapper px-4 mt-8">
        <view class="premium-banner flex justify-between items-center" @click="upgradePremium" hover-class="banner-hover">
          <view class="banner-content">
            <text class="premium-title">⚡ 升级「核心护城河」</text>
            <view class="mt-2"><text class="premium-subtitle">系统级防漏拦截 · AI 深度情绪干预</text></view>
            <view class="price-tag mt-2"><text class="premium-price">限时特惠 ￥9.9 / 月</text></view>
          </view>
          <view class="arrow-circle flex items-center justify-center">
              <text class="arrow">></text>
          </view>
        </view>
    </view>
    
    <view class="list-container px-4 mt-8">
        <view class="list">
          <view class="list-item flex justify-between items-center" hover-class="item-hover">
            <text class="item-text">深色模式 / 赛博主题</text>
            <switch checked color="#00E676" style="transform:scale(0.8)"/>
          </view>
          <view class="list-item flex justify-between items-center" hover-class="item-hover">
            <text class="item-text">底层拦截白名单</text>
            <text class="arrow-right">></text>
          </view>
          <view class="list-item flex justify-between items-center" hover-class="item-hover">
            <text class="item-text">神经重塑科普资料库</text>
            <text class="arrow-right">></text>
          </view>
          <view class="list-item flex justify-between items-center" hover-class="item-hover">
            <text class="item-text">恢复数据导出</text>
            <text class="arrow-right">></text>
          </view>
        </view>
    </view>
  </view>
</template>

<script>
export default {
  methods: {
    upgradePremium() {
      uni.showModal({
        title: '获取强力监管',
        content: '开启由系统底层接管的全面拦截，为你的理智构建最后一道防火墙。',
        confirmText: '立即支付 9.9',
        cancelText: '再想想',
        confirmColor: '#00E676'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.container { padding: 40px 0; min-height: 100vh; background-color: #121212;}
.px-4 { padding: 0 20px; }
.ml-3 { margin-left: 16px; }
.mt-8 { margin-top: 32px; }
.mt-2 { margin-top: 8px; }
.mt-1 { margin-top: 4px; }

.avatar { 
    width: 72px; 
    height: 72px; 
    border-radius: 36px; 
    background: linear-gradient(135deg, #1A281E 0%, #0a120c 100%);
    border: 2px solid #00E676;
    box-shadow: 0 0 15px rgba(0, 230, 118, 0.3);
}
.avatar-text { font-size: 24px; font-weight: bold; color: #00E676;}

.nickname { font-size: 22px; font-weight: 900; display: block; color: white; letter-spacing: 1px;}
.status-badge { 
    background: rgba(255, 61, 0, 0.1); 
    border: 1px solid rgba(255, 61, 0, 0.3);
    padding: 2px 8px;
    border-radius: 4px;
    display: inline-flex;
}
.status-text { font-size: 10px; color: #FF3D00; font-weight: bold;}

.premium-banner {
  background: linear-gradient(135deg, #1f3625 0%, #101c13 100%);
  border: 1px solid rgba(0, 230, 118, 0.4);
  padding: 24px 20px;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 230, 118, 0.15);
  transition: all 0.3s;
}
.banner-hover { transform: translateY(2px); box-shadow: 0 5px 15px rgba(0, 230, 118, 0.2); }
.premium-title { font-size: 18px; font-weight: 900; color: #00E676; display: block; text-shadow: 0 0 10px rgba(0, 230, 118, 0.3);}
.premium-subtitle { font-size: 12px; color: #aaa; }
.price-tag { display: inline-block; background: rgba(0,230,118,0.15); padding: 4px 10px; border-radius: 6px;}
.premium-price { font-size: 14px; font-weight: bold; color: #00E676; }
.arrow-circle { width: 32px; height: 32px; border-radius: 16px; background: rgba(0,230,118,0.1); color: #00E676;}
.arrow { font-weight: bold; }

.list { 
    background-color: #1A1A1A; 
    border-radius: 20px; 
    padding: 8px 20px; 
    border: 1px solid #222;
}
.list-item {
  padding: 20px 0;
  border-bottom: 1px solid #252525;
}
.list-item:last-child { border-bottom: none; }
.item-text { color: #E0E0E0; font-size: 15px; font-weight: 500;}
.arrow-right { color: #555; font-size: 16px;}
.item-hover { opacity: 0.8; }
</style>
