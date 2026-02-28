<template>
  <view class="share-overlay" v-if="show" @click="$emit('close')">
    <view class="share-card-container flex-col items-center" @click.stop>
      <!-- 卡片主体 -->
      <view class="share-card" id="share-card-view">
        <!-- 装饰角落 -->
        <view class="cyber-corner-tl"></view>
        <view class="cyber-corner-br"></view>
        <!-- 扫描线动画 -->
        <view class="scan-line"></view>
        
        <text class="app-brand tracking-wider text-center block mt-6">BETTER MAN</text>
        <text class="sub-brand block text-center mt-1">神经元重塑实验 V1.0</text>
        
        <view class="icon-glow-box flex items-center justify-center mt-8 relative">
            <view class="icon-ring out-ring"></view>
            <view class="icon-ring in-ring"></view>
            <text class="core-icon text-glow text-center absolute">{{ milestone.icon }}</text>
        </view>
        
        <text class="milestone-name text-center block mt-10">{{ milestone.name }}</text>
        <text class="milestone-day text-center block mt-3">已坚持 {{ milestone.day }} 天达成</text>
        
        <view class="divider mt-8 mx-6"></view>
        
        <text class="quote text-center block mt-6 px-6">「多巴胺的狂潮已退，前额叶的理智重新接管高地。」</text>
        
        <!-- 底部水印印章 -->
        <view class="footer-area flex justify-between items-center mt-10 px-6 pb-6 w-full">
            <view class="flex-col">
                <text class="watermark-title">认知干预系统验证</text>
                <text class="watermark-desc mt-1">UID: {{ uid }} • 神经重塑图谱</text>
            </view>
            <view class="qr-mock flex justify-center items-center">
                <view class="qr-dot"></view>
            </view>
        </view>
      </view>
      
      <!-- 保存提示 -->
      <view class="save-btn mt-6 flex justify-center items-center" hover-class="btn-hover" @click="mockSave">
        <text class="save-icon">📸</text>
        <text class="save-text ml-2">截图保存此觉醒印记</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { defineProps, defineEmits, ref, onMounted } from 'vue'

const props = defineProps({
    show: Boolean,
    milestone: {
        type: Object,
        default: () => ({ name: '', day: 0, icon: '' })
    }
})

const emit = defineEmits(['close'])
const uid = ref('UNKNOWN')

onMounted(() => {
    // 模拟获取用户简短ID
    const profile = uni.getStorageSync('neuro_baseline')
    if (profile) {
        uid.value = '8972_XX'
    } else {
        uid.value = '8972_XX'
    }
})

const mockSave = () => {
    uni.showToast({
        title: '推荐使用系统截屏分享',
        icon: 'none',
        duration: 3000
    })
}
</script>

<style lang="scss" scoped>
.share-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(10px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.share-card-container {
    width: 100%;
}

.share-card {
    width: 320px;
    background: linear-gradient(135deg, #18181b 0%, #09090b 100%);
    border: 1px solid #27272a;
    border-radius: 12px;
    position: relative;
    overflow: hidden;
    box-shadow: 0 30px 60px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(0, 229, 255, 0.1);
}

/* 装饰角落 */
.cyber-corner-tl {
    position: absolute; top: 0; left: 0;
    width: 40px; height: 40px;
    border-top: 3px solid var(--theme-primary);
    border-left: 3px solid var(--theme-primary);
    border-top-left-radius: 12px;
}
.cyber-corner-br {
    position: absolute; bottom: 0; right: 0;
    width: 40px; height: 40px;
    border-bottom: 3px solid var(--theme-primary);
    border-right: 3px solid var(--theme-primary);
    border-bottom-right-radius: 12px;
}

/* 扫描线动画 */
.scan-line {
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 100px;
    background: linear-gradient(to bottom, transparent, rgba(0, 229, 255, 0.05), transparent);
    animation: scan 4s linear infinite;
    pointer-events: none;
}

@keyframes scan {
    0% { transform: translateY(-100%); }
    100% { transform: translateY(500%); }
}

/* 文本居中与间距 */
.text-center { text-align: center; }
.block { display: block; }
.flex { display: flex; }
.flex-col { display: flex; flex-direction: column; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
.items-center { align-items: center; }
.relative { position: relative; }
.absolute { position: absolute; }
.mt-1 { margin-top: 4px; }
.mt-3 { margin-top: 12px; }
.mt-4 { margin-top: 16px; }
.mt-6 { margin-top: 24px; }
.mt-8 { margin-top: 32px; }
.mt-10 { margin-top: 40px; }
.mx-6 { margin: 0 24px; }
.px-6 { padding: 0 24px; }
.pb-6 { padding-bottom: 24px; }
.ml-2 { margin-left: 8px; }
.w-full { width: 100%; box-sizing: border-box; }

.tracking-wider { letter-spacing: 4px; }
.app-brand { font-size: 20px; font-weight: 900; color: #fafafa; text-shadow: 0 0 15px rgba(0, 198, 255, 0.5); }
.sub-brand { font-size: 10px; color: #71717a; letter-spacing: 2px; }

/* 中心高光图标 */
.icon-glow-box {
    width: 120px;
    height: 120px;
    margin-left: auto;
    margin-right: auto;
}

.icon-ring {
    position: absolute;
    border-radius: 50%;
    border: 1px solid transparent;
}
.out-ring {
    width: 120px; height: 120px;
    border-top-color: rgba(0, 229, 255, 0.5);
    border-bottom-color: rgba(0, 229, 255, 0.2);
    animation: spin 8s linear infinite;
}
.in-ring {
    width: 90px; height: 90px;
    border-left-color: rgba(0, 229, 255, 0.4);
    border-right-color: rgba(0, 229, 255, 0.1);
    animation: spin-reverse 6s linear infinite;
}

@keyframes spin { 100% { transform: rotate(360deg); } }
@keyframes spin-reverse { 100% { transform: rotate(-360deg); } }

.core-icon {
    font-size: 50px;
    color: var(--theme-primary);
    z-index: 10;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}
.text-glow {
    text-shadow: 0 0 20px rgba(0, 198, 255, 0.6), 0 0 40px rgba(0, 114, 255, 0.3);
}

.milestone-name { font-size: 24px; color: #f4f4f5; font-weight: 900; letter-spacing: 2px; }
.milestone-day { font-size: 14px; color: var(--theme-primary); font-family: monospace; font-weight: bold; }

.divider { height: 1px; background: linear-gradient(to right, transparent, #3f3f46, transparent); }

.quote { font-size: 13px; color: #a1a1aa; line-height: 1.6; font-style: italic; }

.watermark-title { font-size: 12px; color: #e4e4e7; font-weight: bold; }
.watermark-desc { font-size: 10px; color: #71717a; font-family: monospace; }
.qr-mock { width: 36px; height: 36px; border: 1px dashed #52525b; border-radius: 4px; }
.qr-dot { width: 10px; height: 10px; background-color: #52525b; border-radius: 2px; }

.save-btn {
    margin-top: 30px;
    width: 240px;
    height: 50px;
    border-radius: 25px;
    background: linear-gradient(135deg, var(--theme-primary-grad-start) 0%, var(--theme-primary-grad-end) 100%);
    box-shadow: 0 8px 24px rgba(0, 114, 255, 0.3);
    transition: all 0.2s;
}
.btn-hover {
    transform: scale(0.97);
    box-shadow: 0 4px 12px rgba(0, 114, 255, 0.4);
}
.save-text {
    font-size: 14px;
    color: #fff;
    font-weight: bold;
    letter-spacing: 1px;
}
.save-icon { font-size: 16px; }
</style>
