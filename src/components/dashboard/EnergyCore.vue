<template>
  <view class="energy-core flex items-center justify-center relative">
    <!-- 外层光晕环境 -->
    <view class="ambient-glow"></view>
    
    <!-- 多个旋转轨道，营造伪 3D 纵深感 -->
    <view class="orbit orbit-1"></view>
    <view class="orbit orbit-2"></view>
    <view class="orbit orbit-3"></view>
    
    <!-- 核心脉冲星 -->
    <view class="core-pulse flex items-center justify-center">
      <view class="core-inner"></view>
    </view>
    
    <!-- 数据悬浮层 -->
    <view class="time-display flex-col items-center z-10">
      <text class="hours-val">{{ hoursClean }}</text>
      <text class="hours-label">已净化小时数</text>
      <view class="level-badge mt-2">
        <text>{{ currentPhase }}</text>
      </view>
    </view>
    
    <!-- 散落的流光粒子模拟 (CSS阴影实现) -->
    <view class="particles"></view>
  </view>
</template>

<script setup>
/**
 * @component EnergyCore
 * @description 觉醒空间能量环核心组件，基于戒断时间渲染不同阶段及动态光效环。
 */

import { defineProps } from 'vue'

const props = defineProps({
  hoursClean: {
    type: Number,
    default: 0
  },
  currentPhase: {
    type: String,
    default: 'Phase I: 生理挣脱'
  }
})
</script>

<style lang="scss" scoped>
.energy-core {
  width: 320px;
  height: 320px;
  perspective: 1000px;
}

/* 环境背景光晕 */
.ambient-glow {
  position: absolute;
  width: 250px;
  height: 250px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%);
  animation: breathe 6s ease-in-out infinite;
  z-index: 0;
}

/* 伪3D轨道环绕 */
.orbit {
  position: absolute;
  border-radius: 50%;
  border: 1px solid transparent;
  transform-style: preserve-3d;
}

.orbit-1 {
  width: 280px; height: 280px;
  border-top-color: rgba(139, 92, 246, 0.4);
  border-bottom-color: rgba(0, 229, 255, 0.2);
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.1), inset 0 0 20px rgba(139, 92, 246, 0.1);
  animation: rotate3d-1 15s linear infinite;
  z-index: 1;
}

.orbit-2 {
  width: 240px; height: 240px;
  border-left-color: rgba(0, 229, 255, 0.5);
  border-right-color: rgba(139, 92, 246, 0.2);
  box-shadow: 0 0 15px rgba(0, 229, 255, 0.15);
  animation: rotate3d-2 20s linear infinite reverse;
  z-index: 2;
}

.orbit-3 {
  width: 200px; height: 200px;
  border-top-color: var(--theme-primary);
  border-bottom-color: transparent;
  border-left-color: transparent;
  border-right-color: transparent;
  border-width: 2px;
  border-style: dashed;
  animation: spin 10s linear infinite;
  opacity: 0.6;
  z-index: 3;
}

/* 核心脉冲星 */
.core-pulse {
  position: absolute;
  width: 170px;
  height: 170px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 60%);
  box-shadow: 0 0 40px rgba(139, 92, 246, 0.3);
  animation: pulse-glow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  z-index: 4;
}

.core-inner {
  width: 130px;
  height: 130px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(9, 9, 11, 0.8) 0%, rgba(9, 9, 11, 0.4) 100%);
  border: 1px solid rgba(139, 92, 246, 0.3);
  backdrop-filter: blur(4px);
  box-shadow: inset 0 0 20px rgba(139, 92, 246, 0.2);
}

/* 数据层 */
.time-display {
  text-align: center;
  z-index: 10;
  text-shadow: 0 0 20px rgba(0,0,0,0.8);
}

.hours-val {
  font-size: 78px; /* 加大尺寸 */
  font-weight: 900;
  color: #ffffff;
  font-family: 'Courier New', Courier, monospace;
  text-shadow: 0 0 30px var(--theme-primary), 0 0 10px rgba(255,255,255,0.5); /* 更强的发光 */
  line-height: 1;
  letter-spacing: -2px;
}

.hours-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  letter-spacing: 4px;
  font-weight: 600;
  margin-top: 4px;
  text-transform: uppercase;
}

.level-badge {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(79, 70, 229, 0.15));
  border: 1px solid rgba(139, 92, 246, 0.5);
  padding: 4px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
  color: var(--theme-primary);
  box-shadow: 0 0 15px rgba(139, 92, 246, 0.2);
  backdrop-filter: blur(10px);
}

/* CSS 粒子特效 (利用 box-shadow 绘制多个小圆点随核心旋转) */
.particles {
  position: absolute;
  width: 100%; height: 100%;
  border-radius: 50%;
  animation: spin 30s linear infinite;
  z-index: 5;
  pointer-events: none;
}
.particles::after {
  content: '';
  position: absolute;
  top: 50%; left: 50%;
  width: 4px; height: 4px;
  background: transparent;
  border-radius: 50%;
  /* 手指写几个坐标位置的点并发光 */
  box-shadow: 
    80px -90px 4px 1px rgba(0, 229, 255, 0.8),
    -100px 70px 3px 0px rgba(139, 92, 246, 0.9),
    110px 40px 5px 1px rgba(0, 229, 255, 0.6),
    -60px -110px 4px 0px rgba(139, 92, 246, 0.8),
    20px 130px 2px 0px #fff;
}

/* 动画定义 */
@keyframes spin { 100% { transform: rotate(360deg); } }
@keyframes rotate3d-1 {
  0% { transform: rotateX(60deg) rotateY(15deg) rotateZ(0deg); }
  100% { transform: rotateX(60deg) rotateY(15deg) rotateZ(360deg); }
}
@keyframes rotate3d-2 {
  0% { transform: rotateX(45deg) rotateY(-20deg) rotateZ(0deg); }
  100% { transform: rotateX(45deg) rotateY(-20deg) rotateZ(360deg); }
}
@keyframes breathe {
  0%, 100% { transform: scale(0.9); opacity: 0.5; }
  50% { transform: scale(1.1); opacity: 1; }
}
@keyframes pulse-glow {
  0%, 100% { transform: scale(0.95); opacity: 0.7; box-shadow: 0 0 20px rgba(139, 92, 246, 0.2); }
  50% { transform: scale(1.05); opacity: 1; box-shadow: 0 0 50px rgba(139, 92, 246, 0.5); }
}

.flex { display: flex; }
.flex-col { display: flex; flex-direction: column; }
.justify-center { justify-content: center; }
.items-center { align-items: center; }
.relative { position: relative; }
.z-10 { z-index: 10; }
.mt-2 { margin-top: 8px; }
</style>
