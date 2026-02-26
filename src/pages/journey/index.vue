<template>
  <view class="container">
    <view class="header px-4">
        <text class="title glow-text">重建历程</text>
    </view>
    
    <view class="card mt-6">
        <view class="card-title flex items-center">
            <text class="icon">📅</text>
            <text class="ml-2">本月足迹</text>
        </view>
        <view class="mock-calendar mt-3 flex-col justify-center items-center">
            <view class="calendar-grid">
                <!-- Mockup dots for calendar -->
                <view class="day-dot active"></view>
                <view class="day-dot active"></view>
                <view class="day-dot"></view>
                <view class="day-dot active"></view>
                <view class="day-dot active"></view>
                <view class="day-dot active"></view>
                <view class="day-dot current"></view>
            </view>
            <text class="text-sm mt-4">2月26日 - 今日已注入能量</text>
        </view>
    </view>
    
    <!-- Ad Placeholder -->
    <view class="ad-placeholder mt-4 flex items-center justify-center">
        <text class="ad-text">| 商业内容占位 (穿山甲/优量汇) |</text>
    </view>
    
    <view class="card mt-4">
        <view class="card-title flex items-center">
            <text class="icon">🧠</text>
            <text class="ml-2">神经可塑性模型分析</text>
        </view>
        <view class="stats flex justify-between mt-4">
            <view class="stat-box">
                <text class="val text-primary">+15%</text>
                <text class="label">前额叶控制力</text>
            </view>
            <view class="stat-divider"></view>
            <view class="stat-box">
                <text class="val text-primary">-20%</text>
                <text class="label">焦虑值预估</text>
            </view>
        </view>
    </view>
  </view>
</template>

<script>
export default {}
</script>

<style lang="scss" scoped>
.container { padding: 40px 0; min-height: 100vh; background-color: #121212; }
.px-4 { padding: 0 20px; }
.mt-6 { margin-top: 24px; }
.mt-4 { margin-top: 16px; }
.mt-3 { margin-top: 12px; }
.ml-2 { margin-left: 8px; }
.text-sm { color: #aaa; font-size: 14px;}

.title { font-size: 28px; font-weight: 900; }
.glow-text {
  color: #fff;
  text-shadow: 0 0 10px rgba(0, 230, 118, 0.4), 0 0 20px rgba(0, 230, 118, 0.2);
  letter-spacing: 2px;
}

.card {
  background-color: #1E1E1E;
  margin: 0 20px;
  padding: 24px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
}
.card-title {
  font-size: 16px;
  color: #E0E0E0;
  font-weight: bold;
}
.icon { font-size: 18px; }

.mock-calendar { height: 160px; background-color: #151515; border-radius: 12px; border: 1px solid #222;}
.calendar-grid {
    display: flex;
    gap: 8px;
}
.day-dot {
    width: 24px;
    height: 24px;
    border-radius: 6px;
    background-color: #2A2A2A;
}
.day-dot.active {
    background-color: #00E676;
    box-shadow: 0 0 10px rgba(0, 230, 118, 0.4);
}
.day-dot.current {
    border: 2px solid #00E676;
    background-color: transparent;
}

.stat-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}
.stat-divider {
    width: 1px;
    height: 40px;
    background-color: #333;
}
.val { font-size: 28px; font-weight: 900; margin-bottom: 6px; text-shadow: 0 0 15px rgba(0,230,118,0.3);}
.label { font-size: 12px; color: #888; }

.ad-placeholder {
    margin: 16px 20px;
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
</style>
