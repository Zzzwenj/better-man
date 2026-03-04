<template>
  <view class="privacy-mask" v-if="show" @touchmove.stop.prevent="() => {}">
    <view class="privacy-modal flex-col pb-safe">
      <view class="modal-header">
        <text class="modal-title">神经网络接入声明</text>
      </view>
      <scroll-view scroll-y class="modal-content hide-scrollbar">
        <text class="content-text">
          欢迎使用「觉醒空间 (REWIRE)」。在此次深潜入网前，请您务必仔细阅读《产品服务协议》与《隐私防线政策》。
          
          <text class="highlight">「核心预警」：</text>
          1. <text class="highlight">极端情绪干预</text>：本系统包含极客沉浸式红屏震动、AI 毒舌鞭策等强感官/情绪干涉设计。请确认您处于可承受的心理阈值内。
          2. <text class="highlight">生物图谱采集</text>：我们将采集您的多巴胺失控史、坚持天数等匿名数据用于绘制疗法图谱数据池。
          3. <text class="highlight">无物理伤害保证</text>：我们绝不会收集通讯录、短信等越权信息，您的数据经不可逆混淆后储存在高防云端。
          
          点击“强制连接”即表示您已阅知并受此契约约束。
        </text>
        <view class="link-group mt-4">
          <text class="link-text" @click="goAgreement">《产品服务协议》</text>
          <text class="link-text" @click="goPrivacy">《隐私防线政策》</text>
        </view>
      </scroll-view>
      <view class="modal-footer flex mt-6">
        <view class="btn-refuse flex-1 flex items-center justify-center mr-3" @click="handleRefuse" hover-class="btn-hover">
          <text class="refuse-text">拒绝并断开</text>
        </view>
        <view class="btn-accept flex-1 flex items-center justify-center" @click="handleAccept" hover-class="btn-hover">
          <text class="accept-text">强制连接</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const show = ref(false)

onMounted(() => {
  const isAgreed = uni.getStorageSync('privacy_agreed')
  if (!isAgreed) {
    show.value = true
    // 隐藏TabBar（如果在有TabBar的页面被呼出）
    uni.hideTabBar()
  }
})

const handleAccept = () => {
  uni.setStorageSync('privacy_agreed', true)
  show.value = false
  // 通知父组件
  uni.$emit('privacy_agreed')
  uni.showTabBar()
}

const handleRefuse = () => {
  uni.showToast({ title: '已断开连接。您必须同意契约才能进入空间', icon: 'none', duration: 3000 })
  // 原生 App 可以调用 plus.runtime.quit() 退出，此处仅给提示
  // #ifdef APP-PLUS
  setTimeout(() => {
    plus.runtime.quit();
  }, 1500)
  // #endif
}

// 跳转到用户协议页面
const goAgreement = () => {
  uni.navigateTo({ url: '/pages/agreement/index?type=terms' })
}

// 跳转到隐私政策页面
const goPrivacy = () => {
  uni.navigateTo({ url: '/pages/agreement/index?type=privacy' })
}
</script>

<style lang="scss" scoped>
.privacy-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(10px);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  justify-content: flex-end; /* 底部弹窗风格 */
}

.privacy-modal {
  background: linear-gradient(180deg, #18181b 0%, #09090b 100%);
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  border-top: 1px solid rgba(0, 229, 255, 0.2);
  padding: 24px 20px;
  box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.8);
  max-height: 80vh;
}

.pb-safe { padding-bottom: max(24px, env(safe-area-inset-bottom)); }

.modal-header {
  margin-bottom: 20px;
  text-align: center;
}

.modal-title {
  color: var(--theme-primary, #00e5ff);
  font-size: 18px;
  font-weight: 900;
  letter-spacing: 2px;
  text-shadow: 0 0 10px rgba(0, 229, 255, 0.3);
}

.modal-content {
  max-height: 40vh; /* 避免文字过多撑爆 */
}

.content-text {
  font-size: 14px;
  color: #a1a1aa;
  line-height: 1.6;
}

.highlight {
  color: #f4f4f5;
  font-weight: bold;
}

.link-group {
  display: flex;
  flex-direction: column;
}

.link-text {
  color: var(--theme-primary, #00e5ff);
  font-size: 14px;
  margin-top: 8px;
  text-decoration: underline;
  opacity: 0.8;
}

.mt-4 { margin-top: 16px; }
.mt-6 { margin-top: 24px; }
.mr-3 { margin-right: 12px; }
.flex { display: flex; }
.flex-col { display: flex; flex-direction: column; }
.flex-1 { flex: 1; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }

.btn-refuse {
  height: 48px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
}

.refuse-text {
  color: #a1a1aa;
  font-size: 15px;
  font-weight: bold;
}

.btn-accept {
  height: 48px;
  background: rgba(0, 229, 255, 0.1);
  border: 1px solid var(--theme-primary, #00e5ff);
  border-radius: 12px;
  box-shadow: 0 0 15px rgba(0, 229, 255, 0.2);
}

.accept-text {
  color: var(--theme-primary, #00e5ff);
  font-size: 15px;
  font-weight: bold;
  letter-spacing: 1px;
}

.btn-hover {
  transform: scale(0.97);
  opacity: 0.9;
}
</style>
