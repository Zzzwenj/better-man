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
    <view class="premium-card mx-4" @click="upgradePremium" hover-class="card-hover">
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
    
    <CustomTabBar :current="3" />
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import ProfileUserCard from '../../components/ProfileUserCard.vue'
import ProfileSettingsList from '../../components/ProfileSettingsList.vue'
import CustomTabBar from '../../components/CustomTabBar.vue'

// --- 用户状态 ---
const userName = ref('探索者_8972')
const userDesc = ref('系统干预：已停用')
const userAvatar = ref('')
const userSignature = ref('')
const isModalOpen = ref(false)
let localProfileData = {}

// --- 设置列表配置表 ---
const securityList = ref([
  { id: 'appLock', icon: '[SEC]', label: '启动锁 (面容/指纹核验)', type: 'switch', value: false },
  { id: 'disguise', icon: '[SYS]', label: 'App 图标隐匿伪装', type: 'switch', value: false }
])

const databaseList = ref([
  { id: 'logs', icon: '[LOG]', label: '拦截与阻断日志表', type: 'arrow' },
  { id: 'wipe', icon: '[DEL]', label: '执行终端数据焚毁', type: 'arrow' }
])

// --- 初始化钩子 ---
onMounted(() => {
    uni.hideTabBar()
    
    // 拦截鉴权
    const token = uni.getStorageSync('uni_id_token')
    if (!token) {
      uni.redirectTo({ url: '/pages/login/index' })
      return
    }

    const data = uni.getStorageSync('neuro_baseline')
    if (data) {
        localProfileData = JSON.parse(data)
        userName.value = localProfileData.nickname || ('探索者_' + (localProfileData.age || '未知'))
        userAvatar.value = localProfileData.avatar || ''
        userSignature.value = localProfileData.signature || ''
        userDesc.value = '成瘾史: ' + (localProfileData.history || '未知')
    }
    
    // 静默在后台重新握手拉取最新资料
    fetchCloudProfile()
})

const fetchCloudProfile = async () => {
    const token = uni.getStorageSync('uni_id_token')
    if (!token) return
    
    try {
        const res = await uniCloud.callFunction({
            name: 'user-center',
            data: { action: 'getUserProfile', token }
        })
        
        if (res.result.code === 0 && res.result.data) {
            const cloudUser = res.result.data
            if (cloudUser.nickname) userName.value = cloudUser.nickname
            if (cloudUser.avatar) userAvatar.value = cloudUser.avatar
            if (cloudUser.signature) userSignature.value = cloudUser.signature
            
            localProfileData.nickname = cloudUser.nickname || localProfileData.nickname
            localProfileData.avatar = cloudUser.avatar || localProfileData.avatar
            localProfileData.signature = cloudUser.signature || localProfileData.signature
            uni.setStorageSync('neuro_baseline', JSON.stringify(localProfileData))
        }
    } catch (err) {
        console.error('云端中枢档案同步失败', err)
    }
}

// --- 交互事件回传响应 ---

const onUpdateProfile = async ({ newName, newAvatar, newSignature }) => {
  const token = uni.getStorageSync('uni_id_token')
  uni.showLoading({ title: '连接总控覆写...' })
  
  try {
      const res = await uniCloud.callFunction({
        name: 'user-center',
        data: {
          action: 'updateProfile',
          token,
          payload: {
            nickname: newName,
            avatar: newAvatar,
            signature: newSignature
          }
        }
      })
      
      uni.hideLoading()
      
      if (res.result.code === 0) {
          userName.value = newName
          userAvatar.value = newAvatar
          userSignature.value = newSignature
          
          localProfileData.nickname = newName
          localProfileData.avatar = newAvatar
          localProfileData.signature = newSignature
          uni.setStorageSync('neuro_baseline', JSON.stringify(localProfileData))
          
          uni.showToast({ title: '档案已合法覆写', icon: 'success' })
      } else {
          uni.showModal({
              title: '系统级阻断',
              content: res.result.msg,
              showCancel: false,
              confirmText: '明确',
              confirmColor: '#ef4444'
          })
          fetchCloudProfile() // 回滚
      }
  } catch(err) {
      uni.hideLoading()
      console.error('覆写异常', err)
      uni.showToast({ title: '总控终端未连接', icon: 'none' })
  }
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
        confirmColor: '#00e5ff'
    })
}

// 统一处理所有通用设置行的点击分发
const handleSettingClick = (originItem) => {
  const { id } = originItem

  if (id === 'logs') {
    uni.showToast({ title: '日志网络节点未接通', icon: 'none' })
  } else if (id === 'appLock' || id === 'disguise') {
    // Switch Toggle 处理
    const newValue = originItem.value
    // 修改原数组状态
    const target = securityList.value.find(item => item.id === id)
    if (target) {
        target.value = newValue
        uni.showToast({ title: newValue ? '底层协议已注入' : '底层协议已撤销', icon: 'none' })
    }
  } else if (id === 'wipe') {
    // 本地数据焚毁
    uni.showModal({
        title: '警告：自毁协议',
        content: '这将抹除本地所有神经连接痕迹，断开总服务器，并将你强制踢回登录舱。',
        confirmText: '确认焚毁',
        confirmColor: '#ef4444',
        success: (res) => {
            if (res.confirm) {
                uni.clearStorageSync()
                uni.reLaunch({ url: '/pages/login/index' })
            }
        }
    })
  }
}
</script>

<style lang="scss" scoped>
page {
  height: 100%;
}

.container {
  height: 100%;
  width: 100%;
  overflow-x: hidden;
  background-color: #09090b;
  box-sizing: border-box;
  padding-bottom: calc(88px + env(safe-area-inset-bottom));
  overflow-y: auto;
}

.mx-4 { margin: 0 20px; }
.mt-2 { margin-top: 8px; }
.mt-4 { margin-top: 16px; }
.mt-8 { margin-top: 32px; }
.ml-1 { margin-left: 4px; }
.flex { display: flex; }
.flex-col { display: flex; flex-direction: column; }
.justify-between { justify-content: space-between; }
.items-center { align-items: center; }
.block { display: block; }

/* 订阅特权模幅 */
.premium-card {
    margin-top: 24px;
    background: rgba(255, 255, 255, 0.03);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 16px;
    padding: 24px 20px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    transition: all 0.2s ease;
}
.card-hover { transform: translateY(2px); box-shadow: 0 5px 15px rgba(0, 229, 255, 0.15); }
.premium-title { font-size: 16px; font-weight: 900; color: #00e5ff; }
.price-chip { background: #00e5ff; color: #09090b; padding: 2px 8px; border-radius: 10px; font-size: 12px; font-weight: bold;}
.premium-desc { font-size: 13px; color: #a1a1aa; line-height: 1.5; }
.premium-footer { border-top: 1px dashed rgba(0, 229, 255, 0.2); padding-top: 12px;}
.unlock-text { color: #f4f4f5; font-size: 14px; font-weight: bold; }
.arrow { color: #00e5ff; font-weight: bold; font-size: 18px;}
</style>
