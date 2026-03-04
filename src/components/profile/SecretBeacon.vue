<template>
  <view class="beacon-overlay" v-if="show" catchtouchmove="preventTouchMove">
    <view class="bg-blur" @click="emit('close')"></view>
    
    <view class="beacon-content flex-col items-center">
      <!-- 顶部科幻图案 -->
      <view class="beacon-icon-wrap flex justify-center items-center mb-6">
        <view class="orbit-rings"></view>
        <text class="beacon-icon">🌍</text>
        <view class="signal-wave"></view>
      </view>

      <view class="text-center px-4">
        <text class="title block glitch-text" data-text="地球驻扎地信标">地球驻扎地信标</text>
        <view class="divider mt-4 mb-4"></view>
        
        <text class="desc block mt-2 text-justify">
          你已证明了你的意志。无论是因为连续 21 天未曾断联的坚韧，还是凭借黑金权限的高维跃迁，你已具备面见主理人的资格。
        </text>
        
        <text class="desc-highlight block mt-4">
          获取专属“强者契约钛钢戒指”，或进入斯巴达式 1V1 高压重构域。
        </text>
      </view>

      <!-- 核心微信复制区 -->
      <view class="wechat-box flex-col items-center justify-center mt-6 w-full" @click="handleCopy">
         <text class="wechat-label">长按复制坐标信道 (微信)</text>
         <text class="wechat-val mt-2">{{ wechatID }}</text>
         <view class="copy-btn mt-4">
           复制信道并前往验证
         </view>
      </view>
      
      <!-- 底部关闭 -->
      <view class="close-area mt-6" @click="emit('close')">
        <text class="close-text">[ 关闭星际频段 ]</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  show: Boolean,
  wechatID: {
    type: String,
    default: 'PM_Neo_2026' // 可以在外层传入真实微信号
  }
})

const emit = defineEmits(['close'])

const preventTouchMove = () => {}

const handleCopy = () => {
    uni.setClipboardData({
        data: props.wechatID,
        success: () => {
            uni.showToast({
                title: '信道已复制，请前往微信添加',
                icon: 'none',
                duration: 3000
            })
            // 可以选择复制完自动关闭
            setTimeout(() => {
                emit('close')
            }, 1000)
        }
    })
}
</script>

<style lang="scss" scoped>
.beacon-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.4s ease-out;
}

.bg-blur {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(4, 4, 5, 0.95);
  backdrop-filter: blur(15px);
}

.beacon-content {
  position: relative;
  z-index: 10;
  width: 85%;
  max-width: 340px;
  background: linear-gradient(180deg, #181a1f 0%, #0d0e12 100%);
  border: 1px solid rgba(0, 229, 255, 0.3);
  border-radius: 20px;
  padding: 40px 20px 30px;
  box-shadow: 0 20px 60px rgba(0, 229, 255, 0.15), inset 0 0 20px rgba(0, 229, 255, 0.05);
  overflow: hidden;
}

/* 顶部扫光效果 */
.beacon-content::before {
  content: '';
  position: absolute;
  top: 0; left: -100%;
  width: 50%; height: 2px;
  background: linear-gradient(90deg, transparent, #00e5ff, transparent);
  animation: sweepTop 3s linear infinite;
}

@keyframes sweepTop { 100% { left: 200%; } }

.beacon-icon-wrap {
  position: relative;
  width: 80px; height: 80px;
}

.beacon-icon {
  font-size: 40px;
  z-index: 5;
  filter: drop-shadow(0 0 10px rgba(0, 229, 255, 0.8));
}

.orbit-rings {
  position: absolute;
  width: 100%; height: 100%;
  border: 1px dashed rgba(0, 229, 255, 0.4);
  border-radius: 50%;
  animation: spin 10s linear infinite;
}

.signal-wave {
  position: absolute;
  width: 100%; height: 100%;
  border-radius: 50%;
  border: 2px solid #00e5ff;
  animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
}

@keyframes ping {
  75%, 100% { transform: scale(2); opacity: 0; }
}
@keyframes spin { 100% { transform: rotate(360deg); } }

.title { font-size: 20px; font-weight: 900; color: #00e5ff; letter-spacing: 2px; }
.divider { width: 40px; height: 2px; background: #00e5ff; margin: 0 auto; box-shadow: 0 0 10px #00e5ff;}
.desc { font-size: 13px; color: #a1a1aa; line-height: 1.6; }
.desc-highlight { font-size: 13px; color: #e4e4e7; font-weight: bold; background: rgba(0, 229, 255, 0.1); padding: 8px; border-left: 2px solid #00e5ff;}

.wechat-box {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  box-sizing: border-box;
}

.wechat-label { font-size: 11px; color: #71717a; font-family: monospace; }
.wechat-val { font-size: 24px; font-weight: 900; color: #fff; letter-spacing: 1px; font-family: monospace; text-shadow: 0 0 10px rgba(255,255,255,0.3);}

.copy-btn {
  background: linear-gradient(90deg, #00b4db, #0083b0);
  color: #fff;
  font-size: 14px;
  font-weight: bold;
  padding: 10px 24px;
  border-radius: 20px;
  box-shadow: 0 5px 15px rgba(0, 229, 255, 0.3);
  transition: transform 0.2s;
}
.copy-btn:active { transform: scale(0.95); }

.close-text { font-size: 12px; color: #52525b; font-family: monospace; transition: color 0.2s;}
.close-text:active { color: #ef4444; }

.px-4 { padding: 0 16px; }
.pb-6 { padding-bottom: 24px; }
.mt-2 { margin-top: 8px; }
.mt-4 { margin-top: 16px; }
.mt-6 { margin-top: 24px; }
.mb-4 { margin-bottom: 16px; }
.mb-6 { margin-bottom: 24px; }
.flex { display: flex; }
.flex-col { display: flex; flex-direction: column; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
.w-full { width: 100%; }
.text-center { text-align: center; }
.block { display: block; }

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

.glitch-text {
  position: relative;
}
.glitch-text::before, .glitch-text::after {
  content: attr(data-text);
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
}
.glitch-text::before {
  left: 2px; text-shadow: -1px 0 #ef4444; clip: rect(24px, 550px, 90px, 0); animation: glitch-anim 3s infinite linear alternate-reverse;
}
.glitch-text::after {
  left: -2px; text-shadow: -1px 0 #00e5ff; clip: rect(85px, 550px, 140px, 0); animation: glitch-anim 2.5s infinite linear alternate-reverse;
}

@keyframes glitch-anim {
  0% { clip: rect(10px, 9999px, 80px, 0); }
  20% { clip: rect(50px, 9999px, 20px, 0); }
  40% { clip: rect(20px, 9999px, 90px, 0); }
  60% { clip: rect(80px, 9999px, 30px, 0); }
  80% { clip: rect(30px, 9999px, 10px, 0); }
  100% { clip: rect(90px, 9999px, 40px, 0); }
}
</style>
