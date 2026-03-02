<template>
  <view class="honor-carousel-container mt-6 mx-4">
    <text class="section-title block mb-4">数字资产成就长廊</text>
    <scroll-view scroll-x class="honor-scroll" :show-scrollbar="false">
      <view class="honor-track flex">
        <!-- 神经币资产卡片 -->
        <view class="honor-card asset-card mr-4">
          <view class="card-glow"></view>
          <text class="asset-label">当前神经币存量</text>
          <view class="flex items-end mt-2">
            <text class="asset-value">{{ userStore.formattedCoins }}</text>
            <text class="asset-unit ml-1">NC</text>
          </view>
          <view class="asset-trend mt-2">
            <text class="trend-icon">↑</text>
            <text class="trend-text">预计下月增长 12%</text>
          </view>
        </view>

        <!-- 勋章展示 (Mock) -->
        <view v-for="(medal, index) in medals" :key="index" class="honor-card medal-card mr-4">
          <view class="medal-icon-wrap">
            <text class="medal-icon">{{ medal.icon }}</text>
          </view>
          <text class="medal-name mt-2">{{ medal.name }}</text>
          <text class="medal-date">获得于 2026.02</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { useUserStore } from '../../store/user.js'

const userStore = useUserStore()

const medals = [
  { name: '初行者勋章', icon: '🎖️' },
  { name: '意志筑墙者', icon: '🛡️' },
  { name: '多巴胺猎手', icon: '🏹' },
  { name: '深夜守望者', icon: '🕯️' }
]
</script>

<style lang="scss" scoped>
.honor-carousel-container {
  overflow: hidden;
}

.honor-scroll {
  width: 100%;
  white-space: nowrap;
}

.honor-track {
  padding-bottom: 20px;
}

.honor-card {
  flex-shrink: 0;
  width: 160px;
  height: 100px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 12px;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.asset-card {
  background: linear-gradient(135deg, rgba(0, 229, 255, 0.1) 0%, rgba(9, 9, 11, 0.9) 100%);
  border-color: rgba(0, 229, 255, 0.2);
}

.card-glow {
  position: absolute;
  top: -20%;
  left: -20%;
  width: 140%;
  height: 140%;
  background: radial-gradient(circle at center, rgba(0, 229, 255, 0.1) 0%, transparent 70%);
  pointer-events: none;
}

.asset-label { font-size: 10px; color: #a1a1aa; text-transform: uppercase; letter-spacing: 0.5px; }
.asset-value { font-size: 24px; font-weight: 900; color: #00e5ff; font-family: monospace; line-height: 1; text-shadow: 0 0 10px rgba(0, 229, 255, 0.5);}
.asset-unit { font-size: 10px; color: #00e5ff; font-weight: bold; margin-bottom: 4px;}
.trend-text { font-size: 10px; color: #10b981; margin-left: 2px;}
.trend-icon { font-size: 10px; color: #10b981;}

.medal-card {
  align-items: center;
}

.medal-icon-wrap {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.medal-icon { font-size: 24px; }
.medal-name { font-size: 12px; font-weight: 800; color: #f4f4f5; }
.medal-date { font-size: 9px; color: #71717a; margin-top: 2px; }

.section-title { font-size: 14px; font-weight: bold; color: #e4e4e7; font-family: monospace;}
.mr-4 { margin-right: 16px; }
.mt-2 { margin-top: 8px; }
.mt-6 { margin-top: 24px; }
.ml-1 { margin-left: 4px; }
.mx-4 { margin: 0 20px; }
.flex { display: flex; }
.flex-col { display: flex; flex-direction: column; }
.items-center { align-items: center; }
.items-end { align-items: flex-end; }
.block { display: block; }
.mb-4 { margin-bottom: 16px; }
</style>
