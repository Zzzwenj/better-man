<template>
  <view class="container flex-col" :style="themeStore.themeCssVars">
    <ProfileUserCard 
      :userName="userName" 
      :userDesc="userDesc" 
      :avatar="userAvatar"
      :signature="userSignature"
      :isProActive="userStore.isProActive"
      :hasBlackGoldCrown="userStore.hasBlackGoldCrown"
      :formattedCoins="userStore.formattedCoins"
      @updateProfile="onUpdateProfile" 
      @modalStateChange="onModalStateChange"
    />
    
    <!-- 1.5 神经元 AI 导师入口 (NEW) -->
    <view class="ai-mentor-card mx-4" @click="goToAI" hover-class="card-hover">
      <view class="ai-glow"></view>
      <view class="flex items-center justify-between relative z-10">
        <view class="flex items-center">
          <view class="ai-avatar-wrap">
            <text class="ai-icon">⎔</text>
            <view class="pulse-ring"></view>
          </view>
          <view class="ml-3">
            <text class="ai-name block">神经元导师 (Nova)</text>
            <text class="ai-status block">状态: 实时监控中...</text>
          </view>
        </view>
        <view class="ai-btn flex items-center justify-center">
          <text class="ai-btn-text">接入终端</text>
        </view>
      </view>
    </view>
    
    <!-- 2. 平台服务契约模幅 (对赌质押区) -->
    <view :class="['premium-card mx-4', userStore.isProActive ? 'active-contract' : '']" @click="upgradePremium" hover-class="card-hover">
        <view class="flex justify-between items-center">
            <text class="premium-title">{{ userStore.isProActive ? '🛡️ 绝对意志契约生效中' : '⚡ 神经重铸契约 (质押挑战)' }}</text>
            <view class="price-chip" v-if="!userStore.isProActive">
                <text>￥50 / 30天</text>
            </view>
        </view>
        
        <text class="premium-desc block mt-2" v-if="!userStore.isProActive">
          支付 50 元质押金，立即解锁全站高级防御与大模型。
          若 30 天未破戒，<text style="color: #00e5ff; font-weight: bold;">50元全额退还</text>并奖励黑金头衔与 10000 神经币。破戒则作为平台服务费扣除。
        </text>
        
        <view class="contract-progress mt-4 flex-col" v-else>
           <text class="timer-text">契约解禁倒计时: {{ userStore.contractDaysLeft }} 天</text>
           <view class="progress-bar mt-2">
             <view class="progress-fill" :style="{ width: ((30 - userStore.contractDaysLeft) / 30 * 100) + '%' }"></view>
           </view>
        </view>

        <view class="premium-footer flex items-center mt-4" v-if="!userStore.isProActive">
            <text class="unlock-text">立下生死状 (立刻开启)</text>
            <text class="arrow ml-1">→</text>
        </view>
    </view>
    
    <!-- 3. 整合列表区：资料与设置 -->
    <ProfileSettingsList 
      title="" 
      :list="integratedList" 
      :hideNative="isModalOpen || showThemeSheet"
      @itemClick="handleSettingClick" 
    />
    
    <CustomTabBar :current="3" />
    
    <!-- 全局主题色选择弹窗 -->
    <ThemeActionSheet 
      :show="showThemeSheet" 
      :themes="themeStore.themes" 
      :currentTheme="themeStore.currentTheme"
      @close="showThemeSheet = false"
      @select="onThemeSelect"
    />
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useThemeStore } from '../../store/theme.js'
import { useUserStore } from '../../store/user.js'
import ProfileUserCard from '../../components/profile/ProfileUserCard.vue'
import ProfileSettingsList from '../../components/profile/ProfileSettingsList.vue'
import CustomTabBar from '../../components/common/CustomTabBar.vue'
import ThemeActionSheet from '../../components/common/ThemeActionSheet.vue'

const themeStore = useThemeStore()
const userStore = useUserStore()
const showThemeSheet = ref(false)

// --- 用户状态 ---
const userName = ref('探索者_8972')
const userDesc = ref('系统干预：已停用')
const userAvatar = ref('')
const userSignature = ref('')
const isModalOpen = ref(false)
let localProfileData = {}

// --- 整合列表配置表 (资料在上，系统设置在下) ---
const integratedList = ref([
  { id: 'v', icon: '🎥', label: '神经重塑精选视频库', type: 'arrow', url: '/pages/article/index?type=video' },
  { id: 'a', icon: '💡', label: '认知觉醒深度长文库', type: 'arrow', url: '/pages/article/index?type=article' },
  { id: 'theme', icon: '🎨', label: '视觉干预协议 (系统主题色)', type: 'arrow' },
  { id: 'wipe', icon: '🔥', label: '执行终端数据焚毁', type: 'arrow' }
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
            
            // 同步资产到前端（覆盖合并本地）
            userStore.initAssetsFromCloud({
                neuro_coins: cloudUser.neuro_coins,
                owned_items: cloudUser.owned_items,
                equipped: cloudUser.equipped
            })
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

// 点击解锁特权（测试质押入口）
const upgradePremium = () => {
    if (userStore.isProActive) {
        uni.showModal({
            title: '重制契约违约',
            content: '你正在履行 30 天的绝对意志契约。如果此时放弃，你的 50 元质押金将被立即扣除！',
            confirmText: '我要放弃',
            cancelText: '继续坚持',
            confirmColor: '#ef4444',
            success: (res) => {
                if (res.confirm) {
                    userStore.failContract()
                    uni.showToast({ title: '契约终结，押金已入账服务费', icon: 'none' })
                }
            }
        })
        return
    }

    uni.showModal({
        title: '签署神经重铸生死状',
        content: '预付 50 元。\n30天后未破戒，全额原路退还并奖励 10000 神经币 + 黑金皇冠荣耀。\n破戒或中途放弃，不予退还。',
        confirmText: '确认微信支付',
        cancelText: '我再想想',
        confirmColor: themeStore.activeThemeData.primary,
        success: (res) => {
            if (res.confirm) {
                // 模拟支付成功
                uni.showLoading({ title: '拉起收银台...' })
                setTimeout(() => {
                    uni.hideLoading()
                    userStore.startPlatformContract()
                    uni.showToast({ title: '契约成立！祝你生还。', icon: 'success' })
                }, 1000)
            }
        }
    })
}

// 统一处理所有通用设置行的点击分发
const handleSettingClick = (originItem) => {
  const { id, url } = originItem

  if (url) {
      uni.navigateTo({ url })
      return
  }

  if (id === 'theme') {
    showThemeSheet.value = true
  } else if (id === 'logs') {
    uni.showToast({ title: '日志网络节点未接通', icon: 'none' })
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

const onThemeSelect = (themeId) => {
  themeStore.setTheme(themeId)
}

const goToAI = () => {
  uni.vibrateShort()
  uni.navigateTo({ url: '/pages/companion/index' })
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
.ml-3 { margin-left: 12px; }
.z-10 { z-index: 10; }
.relative { position: relative; }

/* AI 导师卡片样式 */
.ai-mentor-card {
  margin-top: 24px;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(9, 9, 11, 0.8) 100%);
  border: 1px solid rgba(139, 92, 246, 0.2);
  border-radius: 16px;
  padding: 16px 20px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.ai-glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle at center, rgba(139, 92, 246, 0.15) 0%, transparent 50%);
  animation: rotateGlow 10s linear infinite;
}

@keyframes rotateGlow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.ai-avatar-wrap {
  position: relative;
  width: 44px;
  height: 44px;
  background: rgba(139, 92, 246, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(139, 92, 246, 0.3);
}

.ai-icon {
  font-size: 24px;
  color: #a78bfa;
  text-shadow: 0 0 10px #8b5cf6;
  padding-bottom: 3px;
}

.pulse-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 2px solid #8b5cf6;
  border-radius: 12px;
  animation: pulse 2s cubic-bezier(0.24, 0, 0.38, 1) infinite;
}

@keyframes pulse {
  0% { transform: scale(0.95); opacity: 0.8; }
  50% { transform: scale(1.2); opacity: 0; }
  100% { transform: scale(0.95); opacity: 0; }
}

.ai-name {
  font-size: 16px;
  font-weight: 800;
  color: #f4f4f5;
  letter-spacing: 1px;
}

.ai-status {
  font-size: 11px;
  color: #a78bfa;
  margin-top: 2px;
  opacity: 0.8;
}

.ai-btn {
  background: rgba(139, 92, 246, 0.2);
  border: 1px solid rgba(139, 92, 246, 0.4);
  padding: 6px 12px;
  border-radius: 10px;
  backdrop-filter: blur(4px);
}

.ai-btn-text {
  font-size: 12px;
  color: #d8b4fe;
  font-weight: bold;
}

/* 订阅特权模幅 */
.premium-card {
    margin-top: 24px;
    margin-bottom: 0px;
    background: rgba(255, 255, 255, 0.03);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 16px;
    padding: 24px 20px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    transition: all 0.2s ease;
}
.card-hover { transform: translateY(2px); box-shadow: 0 5px 15px var(--theme-shadow-primary); }
.premium-title { font-size: 16px; font-weight: 900; color: var(--theme-primary); }
.price-chip { background: var(--theme-primary); color: #09090b; padding: 2px 8px; border-radius: 10px; font-size: 12px; font-weight: bold;}
.premium-desc { font-size: 13px; color: #a1a1aa; line-height: 1.5; }
.premium-footer { border-top: 1px dashed var(--theme-shadow-primary); padding-top: 12px;}
.unlock-text { color: #f4f4f5; font-size: 14px; font-weight: bold; }
.arrow { color: var(--theme-primary); font-weight: bold; font-size: 18px;}

/* 契约进行中状态 */
.active-contract {
    border-color: rgba(0, 229, 255, 0.4);
    box-shadow: 0 0 20px rgba(0, 229, 255, 0.1);
    background: linear-gradient(180deg, rgba(0, 229, 255, 0.05) 0%, rgba(24, 24, 27, 0.9) 100%);
}
.contract-progress { width: 100%; }
.timer-text { font-size: 16px; color: #00e5ff; font-family: monospace; font-weight: bold; text-shadow: 0 0 10px rgba(0,229,255,0.5);}
.progress-bar { width: 100%; height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden; }
.progress-fill { height: 100%; background: #00e5ff; box-shadow: 0 0 10px #00e5ff; border-radius: 3px; transition: width 0.5s ease-out; }
</style>
