<template>
  <view class="defibrillator-overlay" v-if="show" catchtouchmove="preventTouchMove">
    <view class="overlay-bg"></view>
    
    <view class="defib-content flex-col items-center justify-center">
      <!-- 顶部警告区 -->
      <view class="warning-header flex-col items-center mb-6">
        <view class="heartbeat-ring flex items-center justify-center">
          <text class="ecg-icon">⚡</text>
        </view>
        <text class="warning-title mt-4">检测到神经链路断开</text>
        <text class="warning-subtitle mt-2">心智模型即将崩塌，当前累计 {{ currentHours }} 小时心血将清零。</text>
      </view>

      <!-- 核心除颤选项区 -->
      <view class="options-container w-full">
        <text class="section-title block mb-3 text-center">启动紧急突触除颤器？(挽救50%进度)</text>
        
        <!-- 选项1: 黑金特权免单 (如果有且有剩余) -->
        <view class="option-card vip-card flex items-center justify-between mb-3" 
              v-if="userStore.isVipActive && userStore.hasFreeRevive"
              @click="handleRevive('vip')" hover-class="card-hover">
          <view class="flex items-center">
            <text class="option-icon">👑</text>
            <view class="flex-col ml-3 text-left">
              <text class="option-name gold-text">黑金特权指令</text>
              <text class="option-desc">本月剩余 {{ 3 - userStore.monthlyFreeReviveCount }} 次免单防御</text>
            </view>
          </view>
          <view class="action-btn vip-btn">立刻起搏</view>
        </view>

        <!-- 选项2: 算力支援 (看广告) -->
        <view class="option-card ad-card flex items-center justify-between mb-3"
              @click="handleRevive('ad')" hover-class="card-hover">
          <view class="flex items-center">
            <text class="option-icon">📺</text>
            <view class="flex-col ml-3 text-left">
              <text class="option-name text-emerald">外部算力支援 (广告)</text>
              <text class="option-desc">今日剩余 {{ Math.max(0, 1 - adReviveCountToday) }} 次外网调用</text>
            </view>
          </view>
          <view class="action-btn ad-btn" :class="{ 'disabled': adReviveCountToday >= 1 }">接入信号</view>
        </view>

        <!-- 选项3: 神经币内购直击 -->
        <view class="option-card coin-card flex items-center justify-between mb-4"
              @click="handleRevive('coin')" hover-class="card-hover">
          <view class="flex items-center">
            <text class="option-icon text-cyan">⎔</text>
            <view class="flex-col ml-3 text-left">
              <text class="option-name text-cyan">军用级脉冲除颤</text>
              <text class="option-desc">消耗 600 神经币强制修复</text>
            </view>
          </view>
          <view class="action-btn coin-btn" :class="{ 'disabled': userStore.neuroCoins < 600 }">
             支付 600
          </view>
        </view>
      </view>

      <!-- 放弃治疗 (彻底清零) -->
      <view class="give-up-area mt-4 text-center">
        <text class="give-up-text" @click="handleGiveUp" hover-class="text-hover">
          [ 放弃抢救，任由心智归零 ]
        </text>
      </view>
      
      <view class="close-btn mt-6" @click="emit('close')">
        <text class="close-icon">×</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, defineProps, defineEmits, onMounted } from 'vue'
import { useUserStore } from '@/store/user'

const props = defineProps({
  show: Boolean,
  currentHours: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['close', 'reviveSuccess', 'giveUp'])
const userStore = useUserStore()

// 独立控制广告除颤的每日次数 (每天仅 1 次)
const adReviveCountToday = ref(0)
const lastAdReviveTime = ref(uni.getStorageSync('neuro_ad_revive_time') || 0)

onMounted(() => {
  const lastStr = lastAdReviveTime.value ? new Date(lastAdReviveTime.value).toDateString() : ''
  if (lastStr === new Date().toDateString()) {
    adReviveCountToday.value = Number(uni.getStorageSync('neuro_ad_revive_cnt')) || 0
  } else {
    adReviveCountToday.value = 0
    uni.setStorageSync('neuro_ad_revive_cnt', 0)
  }
})

const preventTouchMove = () => {}

const handleGiveUp = () => {
    uni.showModal({
        title: '最后的警告',
        content: '放弃除颤将导致您这段时间建立的所有神经突触链接彻底断裂 (进度清零)，确认放弃吗？',
        confirmText: '含泪重开',
        cancelText: '我再想想',
        confirmColor: '#ef4444',
        success: (res) => {
            if (res.confirm) {
                emit('giveUp')
            }
        }
    })
}

const dispatchRevive = () => {
    uni.showToast({ title: '心脏起搏成功！神经链已挽救 50%', icon: 'success' })
    emit('reviveSuccess')
}

const handleRevive = (type) => {
    uni.vibrateShort()
    
    if (type === 'vip') {
        if (userStore.consumeFreeRevive()) {
            dispatchRevive()
        }
    } else if (type === 'ad') {
        if (adReviveCountToday.value >= 1) {
            uni.showToast({ title: '今日外网支援额度已耗尽', icon: 'none' })
            return
        }
        uni.showLoading({ title: '加载激励视频...' })
        // 模拟广告播放成功
        setTimeout(() => {
            uni.hideLoading()
            adReviveCountToday.value = 1
            lastAdReviveTime.value = Date.now()
            uni.setStorageSync('neuro_ad_revive_cnt', 1)
            uni.setStorageSync('neuro_ad_revive_time', lastAdReviveTime.value)
            dispatchRevive()
        }, 1500)
    } else if (type === 'coin') {
        if (userStore.neuroCoins < 600) {
            uni.showModal({
                title: '神经币不足',
                content: '您的算力资产不足以支付本次紧急除颤。是否前往黑市充能？',
                confirmText: '立即前往',
                success: (res) => {
                    if (res.confirm) uni.navigateTo({ url: '/pages/store/index' })
                }
            })
            return
        }
        
        userStore.spendCoins(600, '紧急突触除颤器')
        dispatchRevive()
    }
}
</script>

<style lang="scss" scoped>
.defibrillator-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease-out;
}

.overlay-bg {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background-color: rgba(9, 9, 11, 0.95);
  backdrop-filter: blur(20px);
}

.defib-content {
  position: relative;
  z-index: 10;
  width: 85%;
  max-width: 360px;
  background: #18181b;
  border: 1px solid #3f3f46;
  border-radius: 24px;
  padding: 32px 24px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(239,68,68,0.2) inset;
}

.warning-header {
  text-align: center;
}

.heartbeat-ring {
  width: 72px; height: 72px;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.1);
  border: 2px solid rgba(239, 68, 68, 0.4);
  box-shadow: 0 0 20px rgba(239, 68, 68, 0.2);
  animation: pulse-ring 1.5s infinite;
}

.ecg-icon {
  font-size: 32px;
  color: #ef4444;
  text-shadow: 0 0 10px #ef4444;
}

@keyframes pulse-ring {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 15px rgba(239, 68, 68, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
}

.warning-title { font-size: 20px; font-weight: 900; color: #ef4444; letter-spacing: 1px; }
.warning-subtitle { font-size: 13px; color: #a1a1aa; line-height: 1.5; }

.section-title { font-size: 14px; font-weight: bold; color: #e4e4e7; font-family: monospace; }
.w-full { width: 100%; }

.option-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 12px 16px;
  transition: transform 0.2s, background 0.2s;
}

.card-hover { transform: scale(0.98); background: rgba(255, 255, 255, 0.05); }

.option-name { font-size: 15px; font-weight: bold; color: #e4e4e7; font-family: monospace; }
.option-desc { font-size: 11px; color: #71717a; margin-top: 2px; }
.option-icon { font-size: 24px; width: 32px; text-align: center; }

.gold-text { color: #facc15; text-shadow: 0 0 8px rgba(250, 204, 21, 0.4); }
.text-cyan { color: #00e5ff; text-shadow: 0 0 8px rgba(0, 229, 255, 0.4); }
.text-emerald { color: #10b981; }

.action-btn {
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: bold;
  color: #fff;
}

.vip-btn { background: linear-gradient(135deg, #ca8a04, #854d0e); }
.ad-btn { background: #059669; border: 1px solid #10b981; }
.coin-btn { background: rgba(0, 229, 255, 0.2); border: 1px solid #00e5ff; color: #00e5ff; }

.disabled { opacity: 0.4; filter: grayscale(1); pointer-events: none; }

.give-up-text { font-size: 13px; color: #52525b; font-family: monospace; text-decoration: underline; transition: color 0.2s; }
.text-hover { color: #ef4444; }

.close-btn { width: 40px; height: 40px; border-radius: 20px; border: 1px solid #3f3f46; display: flex; align-items: center; justify-content: center; margin: 0 auto; color: #71717a; font-size: 24px;}

.flex { display: flex; }
.flex-col { display: flex; flex-direction: column; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
.mt-2 { margin-top: 8px; }
.mt-4 { margin-top: 16px; }
.mt-6 { margin-top: 24px; }
.mb-3 { margin-bottom: 12px; }
.mb-4 { margin-bottom: 16px; }
.mb-6 { margin-bottom: 24px; }
.ml-3 { margin-left: 12px; }
.block { display: block; }
.text-center { text-align: center; }
.text-left { text-align: left; }

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
</style>
