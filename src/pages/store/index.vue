<template>
  <view class="store-container flex-col">
    <!-- 定制的高斯模糊导航栏 (统一使用 CyberNavBar) -->
    <CyberNavBar title="暗网黑市" :blur="true" />

    <scroll-view scroll-y class="store-scroll flex-1" :show-scrollbar="false">
      <!-- 资产展现区 -->
      <view class="asset-dashboard mt-6 mx-4 flex-col items-center">
        <text class="dashboard-title">未解密资产</text>
        <view class="coin-display flex items-end mt-2">
          <NeuroCoinIcon :size="40" class="mr-3" />
          <text class="coin-amount">{{ formattedCoins }}</text>
        </view>
        
        <!-- 激励视频入口：能源补给 -->
        <view class="ad-reward-box mt-4 flex items-center justify-center" @click="handleAdReward">
          <text class="ad-icon mr-2">⚡</text>
          <text class="ad-btn-text">信号拦截：获取能源补给 ({{ userStore.dailyAdCount }}/3)</text>
        </view>

        <text class="warning-text mt-4">>> 规则：黑市交易不退不换，量力而为。纯视觉与炫耀属性，无算力加持。 <<</text>
      </view>

      <!-- 顶部分类 Tab -->
      <scroll-view scroll-x class="tab-scroll mt-6" :show-scrollbar="false">
        <view class="tab-list flex mx-4">
          <view 
            v-for="(tab, index) in tabs" :key="index"
            class="tab-item flex items-center justify-center mr-3"
            :class="{ active: currentTab === index }"
            @click="switchTab(index)"
          >
            <text class="tab-text">{{ tab.name }}</text>
          </view>
        </view>
      </scroll-view>

      <!-- 商品展示矩阵 -->
      <view class="product-grid mx-4 mt-6">
        <StoreItemCard 
          v-for="item in currentProducts" 
          :key="item.id"
          :id="item.id"
          :title="item.title"
          :description="item.description"
          :price="item.price"
          :icon="item.icon"
          :typeTag="item.typeTag"
          :duration="item.duration"
          @purchase="handlePurchaseClick"
        />
        
        <!-- 空状态 -->
        <view v-if="currentProducts.length === 0" class="empty-state flex-col items-center justify-center mt-12">
          <text class="empty-icon">📂</text>
          <text class="empty-text mt-4">该分类下暂无可用黑市数据</text>
        </view>
      </view>
      
      <!-- 底部留白带 -->
      <view class="bottom-spacer"></view>
    </scroll-view>

    <!-- 赛博弹窗注入 -->
    <CyberTransactionModal 
      :visible="showModal"
      :product="selectedProduct"
      :currentBalance="userStore.neuroCoins"
      @cancel="showModal = false"
      @confirm="executeTransaction"
    />
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onLoad, onUnload } from '@dcloudio/uni-app'
import { useUserStore } from '@/store/user'
import { adManager } from '@/utils/adManager'

const userStore = useUserStore()

const formattedCoins = computed(() => userStore.formattedCoins)

onMounted(() => {
  // 预加载广告信号
  adManager.initRewardedVideo()
  
  // 监听奖励发放
  uni.$on('ad-reward-success', () => {
    userStore.earnAdReward()
  })
})

onUnload(() => {
  uni.$off('ad-reward-success')
  // 退出黑市页面时，由于大概率发生过消费，静默进行一波 T+1 资产上报对账以节约 RU
  userStore.syncAssetsToCloud()
})

const handleAdReward = () => {
  uni.vibrateShort()
  adManager.showRewardedVideo()
}

const goBack = () => {
  uni.navigateBack()
}

// 模拟数据库商品
const allProducts = ref([
  // 赛博装扮
  // 赛博装扮 - 30天周期
  { id: 'f_01', category: 0, title: '深空等离子边框', description: '装配后你的头像将被高温等离子射线环绕。', price: 500, icon: '🌌', typeTag: '视觉系', duration: '30天有效' },
  { id: 'f_02', category: 0, title: '故障干扰线边框', description: '模拟信号被强制截断的红色雪花屏幕效果。', price: 500, icon: '📺', typeTag: '视觉系', duration: '30天有效' },
  { id: 't_01', category: 0, title: '称号：深渊行者', description: '在所有的战区聊天显示，象征极限承压能力。', price: 300, icon: '🦇', typeTag: '社交展示', duration: '15天有效' },
  { id: 't_02', category: 0, title: '称号：绝命赌徒', description: '只有在生死契约中沉浮过的人才敢佩戴。', price: 300, icon: '🃏', typeTag: '社交展示', duration: '15天有效' },
  { id: 't_03', category: 0, title: '称号：赛博精神病', description: '精神承载力过载的象征，极度危险。', price: 800, icon: '🧠', typeTag: '社交展示', duration: '30天有效' },
  
  // 战区武装
  { id: 'w_01', category: 1, title: '全频 EMP 脉冲电报', description: '在公共频道发出的消息附带血红色EMP边框，并高亮悬置 15 分钟，全服瞩目。', price: 150, icon: '📢', typeTag: '消耗品(单次)', duration: '15分钟 / 发送1次' },
  { id: 'w_02', category: 1, title: '赛博坦之怒', description: '发送一个震动全群的强制特效（开发中）。', price: 500, icon: '🤖', typeTag: '消耗品(单次)', duration: '仅限1场战区' },
  { id: 'shield_01', category: 1, title: '静音防护罩', description: '战区连坐免死金牌。携带并在战区激活后，你的破戒将不会导致战区解散和队友连坐，仅你自己出局并扣除等量押金。', price: 1280, icon: '🛡️', typeTag: '战略保障', duration: '消耗品(单次)' },
  
  // 盲盒与彩蛋
  { id: 'e_01', category: 2, title: '视觉打卡：数据流雨', description: '阻断成功时的红屏将替换为骇客帝国代码瀑布。', price: 800, icon: '💻', typeTag: '全局彩蛋', duration: '7天有效' },
  { id: 'b_01', category: 2, title: '神经元盲盒', description: '搏一搏单车变摩托。可能开出极品装扮碎片、谢谢参与，或者...系统病毒扣钱。', price: 50, icon: '🎲', typeTag: '概率深坑', duration: '即时生效' }
])

const tabs = ref([
  { name: '赛博装扮' },
  { name: '战区武装' },
  { name: '盲盒与彩蛋' }
])
const currentTab = ref(0)

const currentProducts = computed(() => {
  return allProducts.value.filter(p => p.category === currentTab.value)
})

const switchTab = (index) => {
  currentTab.value = index
  uni.vibrateShort()
}

// 交易逻辑
const showModal = ref(false)
const selectedProduct = ref(null)

const handlePurchaseClick = (productPayload) => {
  selectedProduct.value = productPayload
  showModal.value = true
  uni.vibrateShort()
}

const transactionLoading = ref(false)

const executeTransaction = async (product) => {
  if (transactionLoading.value) return
  transactionLoading.value = true
  
  // 神经脉冲鉴权反馈 (防抖 800ms)
  uni.showLoading({ title: '神经网络鉴权中...' })
  
  await new Promise(resolve => setTimeout(resolve, 800))
  uni.hideLoading()

  // 执行购买
  const success = userStore.purchaseItem(product)
  if (success) {
    showModal.value = false
    
    // 盲盒逻辑真实抽奖
    if (product.id === 'b_01') {
      const roll = Math.random()
      if (roll < 0.05) {
         userStore.earnCoins(500, '盲盒大奖')
         uni.showToast({ title: '🔥 暴击！开出 500 神经币', icon: 'none', duration: 3000 })
      } else if (roll < 0.25) {
         userStore.earnCoins(100, '盲盒回本')
         uni.showToast({ title: '👏 运气不错，开出 100 神经币', icon: 'none' })
      } else if (roll > 0.85) {
         userStore.spendCoins(100, '盲盒病毒扣款')
         uni.showToast({ title: '💀 遭遇赛博病毒，你的账户流失了 100 币', icon: 'none', duration: 3000 })
         uni.vibrateLong()
      } else {
         uni.showToast({ title: '📦 里面空空如也...谢谢参与', icon: 'none' })
      }
    }
  } else {
    uni.showToast({ title: '余额异常', icon: 'error' })
  }
  
  // 交易完成后冷却 200ms 完全解除锁定
  setTimeout(() => {
    transactionLoading.value = false
  }, 200)
}
</script>

<style scoped>
.store-container {
  width: 100vw;
  height: 100vh;
  background: #09090b;
  overflow: hidden;
}

.nav-bar {
  display: none;
}

.store-scroll { height: 100%; box-sizing: border-box; }

.asset-dashboard {
  background: radial-gradient(circle at center, rgba(39, 39, 42, 0.8) 0%, rgba(24, 24, 27, 0.9) 100%);
  border: 1px solid #3f3f46;
  border-radius: 24px;
  padding: 32px 20px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
}
.asset-dashboard::before {
  content: ''; top: -50%; left: -50%; width: 200%; height: 200%; position: absolute;
  background: conic-gradient(from 0deg, transparent 0%, rgba(0, 229, 255, 0.05) 25%, transparent 50%, rgba(139, 92, 246, 0.05) 75%, transparent 100%);
  animation: rotate 20s linear infinite; /* 减慢速度减少渲染压力 */
  pointer-events: none;
}
@keyframes rotate { 100% { transform: rotate(360deg); } }

.dashboard-title { font-size: 14px; color: #a1a1aa; font-family: monospace; letter-spacing: 1px; z-index: 1;}
.coin-display { z-index: 1; align-items: center; justify-content: center; }
.coin-amount { font-size: 48px; font-weight: 900; color: #fff; font-family: monospace; text-shadow: 0 0 20px rgba(255, 255, 255, 0.3); line-height: 1;}
.warning-text { 
  font-size: 11px; 
  color: #ef4444; 
  font-family: monospace; 
  text-align: center; 
  opacity: 0.8; 
  z-index: 1;
  margin-top: 16px;
  line-height: 1.6;
  padding: 0 10px;
}

.ad-reward-box {
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.3);
  padding: 8px 16px;
  border-radius: 12px;
  transition: all 0.2s;
  cursor: pointer;
}
.ad-reward-box:active {
  transform: scale(0.95);
  background: rgba(245, 158, 11, 0.2);
}
.ad-icon { color: #f59e0b; font-size: 14px; }
.ad-btn-text { color: #f59e0b; font-size: 12px; font-weight: bold; font-family: monospace; letter-spacing: 1px;}

.tab-scroll {
  width: 100%;
  white-space: nowrap;
}
.tab-list { display: flex; flex-wrap: nowrap; padding-bottom: 4px; }
.tab-item {
  padding: 10px 20px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.03);
  transition: all 0.3s;
  white-space: nowrap;
  flex-shrink: 0;
}
.tab-item.active {
  background: rgba(0, 229, 255, 0.15);
  border-color: #00e5ff;
  box-shadow: 0 0 15px rgba(0, 229, 255, 0.2);
}
.tab-text { font-size: 14px; color: #a1a1aa; font-weight: bold; white-space: nowrap; }
.tab-item.active .tab-text { color: #00e5ff; text-shadow: 0 0 5px rgba(0, 229, 255, 0.8); }

.product-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 16px;
}

.empty-icon { font-size: 48px; opacity: 0.5; }
.empty-text { font-size: 14px; color: #71717a; font-family: monospace;}

.bottom-spacer { height: 100px; }

.flex { display: flex; }
.flex-col { display: flex; flex-direction: column; }
.flex-1 { flex: 1; }
.items-center { align-items: center; }
.items-end { align-items: flex-end; }
.justify-center { justify-content: center; }
.mx-4 { margin-left: 16px; margin-right: 16px; }
.ml-4 { margin-left: 16px; }
.mr-2 { margin-right: 8px; }
.mr-3 { margin-right: 12px; }
.mt-2 { margin-top: 8px; }
.mt-4 { margin-top: 16px; }
.mt-6 { margin-top: 24px; }
.mt-12 { margin-top: 48px; }
.mb-1 { margin-bottom: 4px; }
</style>
