<template>
  <view class="container flex-col">
    <ProfileUserCard 
      :userName="userName" 
      :userDesc="userDesc" 
      :avatar="userAvatar"
      :signature="userSignature"
      @updateProfile="onUpdateProfile" 
      @modalStateChange="onModalStateChange"
    />
    
    <!-- 2. 订阅特权模幅 (保留，因其具有业务强相关性) -->
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
    
    <!-- 3. 设置列表区 (已组件化) -->
    <ProfileSettingsList 
      title="隐私与安全阻断" 
      :list="securityList" 
      :hideNative="isModalOpen"
      @itemClick="handleSettingClick" 
    />
    
    <ProfileSettingsList 
      title="数据与资料库" 
      :list="databaseList" 
      :hideNative="isModalOpen"
      @itemClick="handleSettingClick" 
    />

  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import ProfileUserCard from '../../components/ProfileUserCard.vue'
import ProfileSettingsList from '../../components/ProfileSettingsList.vue'

// --- 用户状态 ---
const userName = ref('探索者_8972')
const userDesc = ref('系统干预：已停用')
const userAvatar = ref('')
const userSignature = ref('')
const isModalOpen = ref(false)
let localProfileData = {}

// --- 设置列表配置表 ---
const securityList = ref([
  { id: 'whitelist', icon: '👁️', label: '系统级无障碍白名单', type: 'arrow' },
  { id: 'disguise', icon: '🥷', label: 'App 图标伪装 (伪装为计算器)', type: 'switch', value: false }
])

const databaseList = ref([
  { id: 'neuroModel', icon: '🧠', label: '神经可塑性模型资料库', type: 'arrow' },
  { id: 'retake', icon: '🔄', label: '重新进行基线物理评估', type: 'arrow' },
  { id: 'wipe', icon: '💾', label: '本地数据抹除/导出', type: 'arrow' }
])

// --- 初始化钩子 ---
onMounted(() => {
    // 拦截鉴权
    const token = uni.getStorageSync('uni_id_token')
    if (!token) {
      uni.redirectTo({ url: '/pages/login/index' })
      return
    }

    const data = uni.getStorageSync('neuro_baseline')
    if (data) {
        localProfileData = JSON.parse(data)
        // 优先使用用户自定义昵称，否则使用年龄段 fallback
        userName.value = localProfileData.nickname || ('探索者_' + (localProfileData.age || '未知'))
        userAvatar.value = localProfileData.avatar || ''
        userSignature.value = localProfileData.signature || ''
        userDesc.value = '成瘾史: ' + (localProfileData.history || '未知')
    }
})

// --- 交互事件回传响应 ---

// 修改用户名与资料
const onUpdateProfile = ({ newName, newAvatar, newSignature }) => {
  userName.value = newName
  userAvatar.value = newAvatar
  userSignature.value = newSignature
  
  // 同步更新缓存
  localProfileData.nickname = newName
  localProfileData.avatar = newAvatar
  localProfileData.signature = newSignature
  uni.setStorageSync('neuro_baseline', JSON.stringify(localProfileData))
}

const onModalStateChange = (state) => {
  isModalOpen.value = state
}

// 点击解锁特权
const upgradePremium = () => {
    uni.showModal({
        title: '开启终极防御',
        content: '只需 9.9 元/月，即可获得系统底层的强制接管权限。当你不受理智控制时，系统将成为你最后一道门槛。',
        confirmText: '立刻开启',
        confirmColor: '#10b981'
    })
}

// 统一处理所有通用设置行的点击分发
const handleSettingClick = (originItem) => {
  const { id } = originItem

  if (id === 'whitelist' || id === 'neuroModel' || id === 'wipe') {
    // 尚未开通的模块，统一提示，绝不出现“死按钮”
    uni.showToast({ title: '区域未解锁，等待基站信号', icon: 'none' })
  } else if (id === 'disguise') {
    // Switch Toggle 处理
    const newValue = originItem.value
    // 修改原数组状态
    securityList.value.find(item => item.id === 'disguise').value = newValue
    uni.showToast({ title: newValue ? '伪装协议已加载' : '伪装协议已撤销', icon: 'none' })
  } else if (id === 'retake') {
    retakeTest()
  }
}

// 重新评测
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
page {
  height: 100%;
}

.container {
  height: 100%;
  background-color: #09090b;
  box-sizing: border-box;
  overflow-y: auto;
  padding-bottom: 40px;
}

.mx-4 { margin: 10px 20px; }
.mt-2 { margin-top: 8px; }
.mt-4 { margin-top: 16px; }
// .mt-8 { margin-top: 32px; }
.ml-1 { margin-left: 4px; }
.flex { display: flex; }
.flex-col { display: flex; flex-direction: column; }
.justify-between { justify-content: space-between; }
.items-center { align-items: center; }
.block { display: block; }

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
</style>
