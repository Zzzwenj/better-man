<template>
  <view class="container flex-col">
    <!-- 顶部用户信息 -->
    <view class="header px-4 flex items-center">
      <view class="avatar flex justify-center items-center">
        <text class="avatar-text">8972</text>
      </view>
      <view class="user-info ml-4 flex-col justify-center">
        <text class="username tracking-wider">{{ userName }}</text>
        <view class="status-badge flex items-center mt-2">
            <view class="status-dot offline"></view>
            <text class="status-text ml-1">{{ userDesc }}</text>
        </view>
      </view>
    </view>
    
    <!-- 订阅特权模幅 -->
    <view class="premium-card mt-8 mx-4" @click="upgradePremium" hover-class="card-hover">
        <view class="flex justify-between items-center">
            <text class="premium-title">⚡ 强制护城河 (系统级防御)</text>
            <view class="price-chip">
                <text>￥9.9 / 月</text>
            </view>
        </view>
        <text class="premium-desc block mt-2">开启设备底层的无障碍劫持防御。\n在理智被吞噬前，让系统接管你的设备控制权。</text>
        <view class="premium-footer flex items-center mt-4">
            <text class="unlock-text">立即解锁终极防御</text>
            <text class="arrow ml-1">→</text>
        </view>
    </view>
    
    <!-- 设置列表 -->
    <view class="settings-group mt-6 mx-4">
        <text class="group-title block px-2 mb-2">隐私与安全阻断</text>
        <view class="settings-list">
            <view class="list-item flex justify-between items-center" hover-class="item-hover">
                <view class="item-left flex items-center">
                    <text class="item-icon">👁️</text>
                    <text class="item-label ml-3">系统级无障碍白名单</text>
                </view>
                <text class="arrow-right">></text>
            </view>
            <view class="list-item flex justify-between items-center" hover-class="item-hover">
                <view class="item-left flex items-center">
                    <text class="item-icon">🥷</text>
                    <text class="item-label ml-3">App 图标伪装 (伪装为计算器)</text>
                </view>
                <switch color="#10b981" style="transform: scale(0.8);" />
            </view>
        </view>
    </view>
    
    <view class="settings-group mt-6 mx-4">
        <text class="group-title block px-2 mb-2">数据与资料库</text>
        <view class="settings-list">
            <view class="list-item flex justify-between items-center" hover-class="item-hover">
                <view class="item-left flex items-center">
                    <text class="item-icon">🧠</text>
                    <text class="item-label ml-3">神经可塑性模型资料库</text>
                </view>
                <text class="arrow-right">></text>
            </view>
            <view class="list-item flex justify-between items-center" hover-class="item-hover" @click="retakeTest">
                <view class="item-left flex items-center">
                    <text class="item-icon">🔄</text>
                    <text class="item-label ml-3">重新进行基线物理评估</text>
                </view>
                <text class="arrow-right">></text>
            </view>
            <view class="list-item flex justify-between items-center" hover-class="item-hover">
                <view class="item-left flex items-center">
                    <text class="item-icon">💾</text>
                    <text class="item-label ml-3">本地数据抹除/导出</text>
                </view>
                <text class="arrow-right">></text>
            </view>
        </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const userName = ref('探索者_8972')
const userDesc = ref('系统干预：已停用')

onMounted(() => {
    const data = uni.getStorageSync('neuro_baseline')
    if (data) {
        const profile = JSON.parse(data)
        userName.value = '探索者_' + (profile.age || '未知')
        userDesc.value = '成瘾史: ' + (profile.history || '未知')
    }
})

const upgradePremium = () => {
    uni.showModal({
        title: '开启终极防御',
        content: '只需 9.9 元/月，即可获得系统底层的强制接管权限。当你不受理智控制时，系统将成为你最后一道门槛。',
        confirmText: '立刻开启',
        confirmColor: '#10b981'
    })
}

const retakeTest = () => {
    uni.showModal({
        title: '重置神经基线',
        content: '这将清除你当前的生理评估画像，并重新进入科学基线体检流。',
        confirmText: '确认重置',
        confirmColor: '#ef4444',
        success: (res) => {
            if (res.confirm) {
                uni.removeStorageSync('neuro_baseline')
                uni.redirectTo({ url: '/pages/onboarding/index' })
            }
        }
    })
}
</script>

<style lang="scss" scoped>
/* 限定外层包裹的滚动高度为主屏 100%，防止 vh 计算越界 */
page {
  height: 100%;
}

.container {
  height: 100%;
  background-color: #09090b;
  box-sizing: border-box;
  overflow-y: auto;
}
.header {
  padding-top: calc(var(--status-bar-height) + 30px);
}
.px-2 { padding: 0 8px; }
.px-4 { padding: 0 20px; }
.mx-4 { margin: 0 20px; }
.mt-2 { margin-top: 8px; }
.mt-4 { margin-top: 16px; }
.mt-6 { margin-top: 24px; }
.mt-8 { margin-top: 32px; }
.mb-2 { margin-bottom: 8px; }
.ml-1 { margin-left: 4px; }
.ml-3 { margin-left: 12px; }
.ml-4 { margin-left: 16px; }
.flex { display: flex; }
.flex-col { display: flex; flex-direction: column; }
.justify-between { justify-content: space-between; }
.justify-center { justify-content: center; }
.items-center { align-items: center; }
.block { display: block; }
.tracking-wider { letter-spacing: 2px; }

/* 顶部用户信息 */
.avatar {
    width: 64px; height: 64px;
    border-radius: 20px;
    background: #18181b;
    border: 1px solid #3f3f46;
    box-shadow: 0 0 20px rgba(0,0,0,0.5);
}
.avatar-text { font-family: monospace; color: #a1a1aa; font-weight: bold; }
.username { font-size: 20px; color: #f4f4f5; font-weight: 900; }
.status-badge { background: rgba(239, 68, 68, 0.1); padding: 4px 8px; border-radius: 4px; border: 1px solid rgba(239, 68, 68, 0.2);}
.status-dot { width: 6px; height: 6px; border-radius: 3px; }
.status-dot.offline { background-color: #ef4444; box-shadow: 0 0 5px #ef4444;}
.status-text { font-size: 10px; color: #ef4444; font-weight: bold; font-family: monospace;}

/* 订阅特权模幅 */
.premium-card {
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%);
    border: 1px solid rgba(16, 185, 129, 0.3);
    border-radius: 16px;
    padding: 24px 20px;
    box-shadow: 0 10px 30px rgba(16, 185, 129, 0.1);
    transition: all 0.2s ease;
}
.card-hover { transform: translateY(2px); box-shadow: 0 5px 15px rgba(16, 185, 129, 0.15); }
.premium-title { font-size: 16px; font-weight: 900; color: #10b981; }
.price-chip { background: #10b981; color: #09090b; padding: 2px 8px; border-radius: 10px; font-size: 12px; font-weight: bold;}
.premium-desc { font-size: 13px; color: #a1a1aa; line-height: 1.5; }
.premium-footer { border-top: 1px dashed rgba(16, 185, 129, 0.2); padding-top: 12px;}
.unlock-text { color: #f4f4f5; font-size: 14px; font-weight: bold; }
.arrow { color: #10b981; font-weight: bold; font-size: 18px;}

/* 设置列表 */
.group-title { font-size: 12px; color: #71717a; font-family: monospace; font-weight: bold;}
.settings-list {
    background: #18181b;
    border-radius: 16px;
    padding: 0 16px;
    border: 1px solid #27272a;
}
.list-item {
    padding: 16px 0;
    border-bottom: 1px solid #27272a;
}
.list-item:last-child { border-bottom: none; }
.item-hover { opacity: 0.7; }
.item-icon { font-size: 18px; }
.item-label { font-size: 14px; color: #d4d4d8; font-weight: 500;}
.arrow-right { color: #52525b; font-size: 16px; font-family: monospace;}
</style>
