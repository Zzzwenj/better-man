<template>
  <view class="container flex-col items-center">
    <view class="header flex justify-between items-center w-full px-4">
        <text class="title glow-text">觉醒空间</text>
        <view class="user-badge flex items-center">
            <text class="level-text">Lv.3 探索者</text>
        </view>
    </view>
    
    <!-- Dynamic Progress Circle -->
    <view class="progress-wrapper mt-8">
        <view class="progress-ring flex-col items-center justify-center breathing-ring">
            <text class="days-count">14</text>
            <text class="days-label">DAYS</text>
        </view>
        <!-- Particle effects or glow can be added via CSS -->
    </view>
    
    <view class="status-box mt-6">
        <text class="status-title">神经元重塑中</text>
        <text class="status-desc">前额叶皮层正在恢复，多巴胺敏感度+12%</text>
    </view>
    
    <!-- Action Area -->
    <view class="action-row flex justify-between w-full px-5 mt-8">
        <button class="action-btn btn-checkin" @click="handleCheckin">
            <text>✨ 注入能量 (打卡)</text>
        </button>
        <button class="action-btn btn-video" @click="handleVideo">
            <text>🔥 意志淬炼 (励志视频)</text>
        </button>
    </view>
    
    <!-- Ad Placeholder -->
    <view class="ad-placeholder mt-6 flex items-center justify-center">
        <text class="ad-text">| 商业内容占位 (穿山甲/优量汇) |</text>
    </view>

    <view class="spacer"></view>
    
    <!-- Panic Button - Extreme Visual Weight -->
    <button class="btn-panic heartbeat" @click="handlePanic" hover-class="btn-panic-hover">
        <text class="panic-text">🆘 紧急干预拨号</text>
    </button>
  </view>
</template>

<script>
export default {
  data() {
    return {
      days: 14
    }
  },
  methods: {
    handleCheckin() {
      uni.showToast({ title: '多巴胺重置进度已推进', icon: 'success' })
    },
    handleVideo() {
      uni.showToast({ title: '准备播放高燃剪辑片段...', icon: 'none' })
    },
    handlePanic() {
      uni.showModal({
        title: '你已进入安全舱',
        content: '神经递质正在欺骗你。闭上眼，深呼吸 3 次。\n不要让 5 分钟的放纵，毁掉 14 天的重构进程。',
        confirmText: '开启 60 秒冷静',
        showCancel: false
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  padding: 40px 0;
  min-height: 100vh;
  background: radial-gradient(circle at 50% 10%, #1a2a20 0%, #121212 60%);
}
.w-full { width: 100%; }
.px-4 { padding: 0 20px; }
.px-5 { padding: 0 24px; }
.header { margin-bottom: 20px; }

.glow-text {
  font-size: 28px;
  font-weight: 900;
  color: #fff;
  text-shadow: 0 0 10px rgba(0, 230, 118, 0.4), 0 0 20px rgba(0, 230, 118, 0.2);
  letter-spacing: 2px;
}

.user-badge {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(0, 230, 118, 0.3);
    padding: 6px 12px;
    border-radius: 20px;
}
.level-text { font-size: 12px; color: #00E676; font-weight: bold;}

.progress-wrapper { position: relative; }

.progress-ring {
  width: 260px;
  height: 260px;
  border-radius: 130px;
  border: 12px solid #00E676;
  box-shadow: 0 0 40px rgba(0, 230, 118, 0.5), inset 0 0 30px rgba(0, 230, 118, 0.2);
  background: rgba(0, 230, 118, 0.05);
}

/* 呼吸动画 */
@keyframes breathing {
  0% { box-shadow: 0 0 30px rgba(0, 230, 118, 0.4), inset 0 0 20px rgba(0, 230, 118, 0.1); transform: scale(1); }
  50% { box-shadow: 0 0 60px rgba(0, 230, 118, 0.8), inset 0 0 40px rgba(0, 230, 118, 0.3); transform: scale(1.02); }
  100% { box-shadow: 0 0 30px rgba(0, 230, 118, 0.4), inset 0 0 20px rgba(0, 230, 118, 0.1); transform: scale(1); }
}
.breathing-ring {
    animation: breathing 4s infinite ease-in-out;
}

.days-count {
  font-size: 88px;
  font-weight: 900;
  color: #fff;
  text-shadow: 0 0 15px #00E676;
  line-height: 1;
}
.days-label {
  font-size: 16px;
  color: #00E676;
  letter-spacing: 4px;
  margin-top: 10px;
}

.status-box {
    background: rgba(255, 255, 255, 0.03);
    padding: 12px 24px;
    border-radius: 30px;
    text-align: center;
    border: 1px solid rgba(255, 255, 255, 0.05);
}
.status-title { display: block; font-size: 14px; font-weight: bold; color: #00E676; margin-bottom: 4px;}
.status-desc { display: block; font-size: 12px; color: #888; }

.action-row { gap: 16px; }
.action-btn {
    flex: 1;
    height: 54px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 15px;
    font-weight: bold;
    border: none;
    margin: 0;
}
.btn-checkin {
    background: linear-gradient(135deg, #00E676 0%, #00B159 100%);
    color: #000;
    box-shadow: 0 8px 16px rgba(0, 230, 118, 0.3);
}
.btn-video {
    background: rgba(255, 255, 255, 0.08);
    color: #fff;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.ad-placeholder {
    width: 90%;
    height: 80px;
    background: repeating-linear-gradient(
      45deg,
      #1A1A1A,
      #1A1A1A 10px,
      #222 10px,
      #222 20px
    );
    border: 1px dashed #444;
    border-radius: 12px;
    opacity: 0.7;
}
.ad-text { color: #666; font-size: 12px; letter-spacing: 1px;}

.spacer { flex-grow: 1; min-height: 40px; }

.btn-panic {
  background: linear-gradient(135deg, #FF3D00 0%, #D50000 100%);
  width: 90%;
  border-radius: 20px;
  height: 68px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 30px rgba(255, 61, 0, 0.5);
  margin-bottom: 30px;
  border: 1px solid #FF8A80;
}
.panic-text {
    color: white;
    font-size: 20px;
    font-weight: 900;
    letter-spacing: 2px;
}
.btn-panic-hover {
    transform: scale(0.96);
    box-shadow: 0 5px 15px rgba(255, 61, 0, 0.8);
}

/* 心跳动画 */
@keyframes heartbeat {
  0% { transform: scale(1); }
  10% { transform: scale(1.05); }
  20% { transform: scale(1); }
  30% { transform: scale(1.05); }
  40% { transform: scale(1); }
  100% { transform: scale(1); }
}
.heartbeat {
    animation: heartbeat 3s infinite;
}
</style>
