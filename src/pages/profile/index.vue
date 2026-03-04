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
      <view class="flex items-center justify-between relative z-10 w-full">
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
    
    <!-- 2. 黑金通行证 (Black Gold Pass) 展位 -->
    <view :class="['premium-card mx-4', userStore.isVipActive ? 'active-contract' : '']">
        <!-- 会员订阅主体区 -->
        <view @click="upgradePremium" hover-class="card-hover" class="contract-main">
            <view class="flex justify-between items-center">
                <text class="premium-title">{{ userStore.isVipActive ? '👑 黑金权限生效中' : '🔥 黑金通行证 (全量特权)' }}</text>
                <view class="price-chip" v-if="!userStore.isVipActive">
                    <text>1500 神经币 / 月</text>
                </view>
            </view>
            
            <text class="premium-desc block mt-2" v-if="!userStore.isVipActive">
              解锁深网最高权限。破戒月费<text style="color: #00e5ff; font-weight: bold;">首3次免单原谅</text>，
              绝版皇冠标识，专属实体结衣礼盒，以及每月最高 1500 神经币战略储备金！
            </text>
            
            <view class="contract-progress mt-4 flex-col" v-else>
               <text class="timer-text">黑金链路维持天数: {{ userStore.vipDaysLeft }} 天</text>
               <view class="progress-bar mt-2">
                 <!-- 模拟 30 天为一个周期的进度视觉 -->
                 <view class="progress-fill" :style="{ width: ((userStore.vipDaysLeft % 30) / 30 * 100) + '%' }"></view>
               </view>
            </view>
    
            <view class="premium-footer flex items-center mt-4" v-if="!userStore.isVipActive">
                <text class="unlock-text">建立特权连接</text>
                <text class="arrow ml-1">→</text>
            </view>
        </view>

        <!-- 临时越权体验 (看广告, 仅显示一次) -->
        <view class="ad-trial-zone mt-4" v-if="!userStore.isVipActive && !userStore.hasUsedTrial" @click.stop="watchAdForTrial" hover-class="ad-hover">
            <view class="ad-content flex items-center justify-center">
                 <text class="ad-icon">📺</text>
                 <text class="ad-text ml-2">_ 获取24H 残破特权节点 (仅限1次)</text>
            </view>
        </view>
    </view>
    
    <!-- 5. 荣誉资产长廊 (资产化展示) -->
    <HonorCarousel />
    
    <!-- 3. 整合列表区：资料与设置 -->
    <ProfileSettingsList 
      title="" 
      :list="integratedList" 
      :hideNative="isModalOpen || showThemeSheet"
      @itemClick="handleSettingClick" 
    />

    <!-- 4. 系统底层控制区 (视觉隔离) -->
    <view class="system-control-zone flex-col items-center w-full pb-10 mt-8">
      <view class="divider w-full mb-6 relative">
        <view class="absolute inset-x-4 h-full" style="background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.05), transparent);"></view>
      </view>
      
      <!-- 高危操作与基础流出区 (同样低调的样式，平缓向下排列) -->
      <view class="flex-col items-center gap-5 w-full">
        <!-- 引流信标入口 (动态判定显示) -->
        <view class="control-item" v-if="hasBeaconAccess" @click="showBeacon = true" hover-class="text-glow">
          <text class="control-text" style="color: #00e5ff; font-weight: bold; text-shadow: 0 0 8px rgba(0,229,255,0.4);">[ 解锁：地球驻扎地信标 ]</text>
        </view>

        <!-- 一行展示退出登录与注销 -->
        <view class="flex items-center justify-center w-full px-2">
          <view class="control-item" style="padding: 10px 4px;" @click="handleSettingClick({id: 'wipe'})" hover-class="text-glow">
            <text class="control-text" style="font-size: 12px;">中断神经连接 (退出登录)</text>
          </view>
          
          <text class="link-divider mx-1">|</text>
          
          <view class="control-item" style="padding: 10px 4px;" @click="confirmDeleteAccount" hover-class="text-glow">
            <text class="control-text" style="font-size: 12px;">完全焚毁档案 (注销账号)</text>
          </view>
        </view>
      </view>

      <!-- 绝对的页面最底端 -->
      <view class="bottom-footer flex-col items-center mt-12 gap-5 w-full">
        <view class="legal-links flex justify-center items-center">
          <text class="link-text" @click="goAgreement('terms')">《用户协议》</text>
          <text class="link-divider">|</text>
          <text class="link-text" @click="goAgreement('privacy')">《隐私政策》</text>
        </view>

        <!-- OS版本追踪号 -->
        <text class="version-text">OS Version: Better-Man 2026.3.2</text>
      </view>
    </view>
    
    <CyberFloatBall />
    <CustomTabBar :current="3" />
    
    <!-- 全局主题色选择弹窗 -->
    <ThemeActionSheet 
      :show="showThemeSheet" 
      :themes="themeStore.themes" 
      :currentTheme="themeStore.currentTheme"
      @close="showThemeSheet = false"
      @select="onThemeSelect"
    />

    <!-- 私域引流信标弹窗 -->
    <SecretBeacon :show="showBeacon" @close="showBeacon = false" />

    <!-- 伪装锁密码修改赛博弹窗 -->
    <CyberDialog 
      v-model:show="showPinModal"
      title="修改量子伪装密码"
      confirmText="覆写系统"
      cancelText="终止操作"
      :showCancel="true"
      @confirm="confirmPinChange"
      @cancel="showPinModal = false"
    >
       <view class="flex-col w-full mt-4">
          <text class="text-xs text-gray-400 mb-2">请输入由数字组成的 4-6 位暗门密码:</text>
          <input 
             class="styled-input text-center font-mono text-xl text-primary" 
             type="number" 
             v-model="tempPin" 
             maxlength="6"
             placeholder="8972"
          />
          <text class="text-xs text-red-500 mt-2 text-center" v-if="pinError">{{pinError}}</text>
       </view>
    </CyberDialog>

    <!-- 通用赛博弹窗 -->
    <CyberDialog 
      v-model:show="dialogState.show"
      :title="dialogState.title"
      :content="dialogState.content"
      :confirmText="dialogState.confirmText"
      :cancelText="dialogState.cancelText"
      :showCancel="dialogState.showCancel"
      :color="dialogState.color"
      @confirm="handleDialogConfirm"
      @cancel="handleDialogCancel"
    />
  </view>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useThemeStore } from '../../store/theme.js'
import { useUserStore } from '../../store/user.js'
import ProfileUserCard from '../../components/profile/ProfileUserCard.vue'
import ProfileSettingsList from '../../components/profile/ProfileSettingsList.vue'
import HonorCarousel from '../../components/profile/HonorCarousel.vue'
import CustomTabBar from '../../components/common/CustomTabBar.vue'
import ThemeActionSheet from '../../components/common/ThemeActionSheet.vue'
import CyberDialog from '../../components/common/CyberDialog.vue'
import CyberFloatBall from '../../components/dashboard/CyberFloatBall.vue'
import SecretBeacon from '../../components/profile/SecretBeacon.vue'

const themeStore = useThemeStore()
const userStore = useUserStore()
const showThemeSheet = ref(false)
const showBeacon = ref(false)
const showPinModal = ref(false)
const tempPin = ref('')
const pinError = ref('')

// --- 弹窗状态管理 ---
const dialogState = ref({
  show: false,
  title: '',
  content: '',
  confirmText: '',
  cancelText: '',
  showCancel: false,
  color: '#ef4444',
  onConfirm: null,
  onCancel: null
})

const showDialog = (options) => {
  dialogState.value = {
    show: true,
    title: options.title || '💀 系统警告',
    content: options.content || '',
    confirmText: options.confirmText || '确认接收',
    cancelText: options.cancelText || '取消',
    showCancel: options.showCancel || false,
    color: options.color || '#ef4444',
    onConfirm: options.success || null,
    onCancel: options.cancel || null
  }
}

const handleDialogConfirm = () => {
  if (dialogState.value.onConfirm) {
    dialogState.value.onConfirm({ confirm: true, cancel: false })
  }
  dialogState.value.show = false
}

const handleDialogCancel = () => {
  if (dialogState.value.onCancel) {
    dialogState.value.onCancel({ confirm: false, cancel: true })
  }
  dialogState.value.show = false
}

// --- 用户状态 ---
const userName = ref('探索者_8972')
const userDesc = ref('系统干预：已停用')
const userAvatar = ref('')
const userSignature = ref('')
const isModalOpen = ref(false)
let localProfileData = {}

// 计算是否有资格查阅地球驻扎地信标 (引流微信)
const hasBeaconAccess = computed(() => {
    // 门槛 1: 黑金会员直接展示
    if (userStore.isVipActive) return true
    
    // 门槛 2: 连续活了 21 天的强迫症硬汉
    const startTimestamp = uni.getStorageSync('neuro_start_date') || Date.now()
    const diffDays = (Date.now() - startTimestamp) / (1000 * 60 * 60 * 24)
    if (diffDays >= 21) return true
    
    return false
})

const goAgreement = (type) => {
  uni.navigateTo({ url: `/pages/agreement/index?type=${type}` })
}

// --- 整合列表配置表 (资料在上，系统设置在下) ---
// 为了应对 switch 的强制拦截复原 (computed 的话子组件拿不回去)，增加 trigger 计数器强制刷新
const refreshTrigger = ref(0)
const integratedList = computed(() => {
  /* eslint-disable no-unused-expressions */
  refreshTrigger.value // 强制加入依赖
  return [
    { id: 'v', icon: '🎥', label: '神经重塑精选视频库', type: 'arrow', url: '/pages/article/index?type=video' },
    { id: 'a', icon: '💡', label: '认知觉醒深度长文库', type: 'arrow', url: '/pages/article/index?type=article' },
    { id: 'theme', icon: '🎨', label: '视觉干预协议 (系统主题色)', type: 'arrow' },
    { id: 'privacy', icon: '🔒', label: '量子伪装计算器锁 (黑金专属)', type: 'switch', value: userStore.privacyLock.enabled }
  ]
})

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
          showDialog({
              title: '系统级阻断',
              content: res.result.msg,
              showCancel: false,
              confirmText: '明确',
              color: '#ef4444'
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

// 点击解锁黑金VIP特权
const upgradePremium = () => {
    if (userStore.isVipActive) {
        showDialog({
            title: '黑金权限已激活',
            content: `你的数据连通性无损维持，剩余 ${userStore.vipDaysLeft} 天。今日赠送的 50 算力点已空投。`,
            showCancel: false,
            confirmText: '明确',
            color: '#10b981'
        })
        return
    }

    showDialog({
        title: '建立黑金特权通讯网',
        content: '订阅费：1500 神经币/31天。\n解锁每月 3 次“免代价无损折跃（除颤防坠落）”，专属高级称号与主理人直通频道信标。',
        confirmText: '极速接入',
        cancelText: '暂不需要',
        showCancel: true,
        color: '#f59e0b', // 琥珀/金色色调
        success: (res) => {
            if (res.confirm) {
                // 利用虚拟货币实现内部商业闭环
                if (userStore.neuroCoins < 1500) {
                    uni.showToast({ title: '神经币余额不足(需1500)', icon: 'none' })
                    return
                }

                uni.showLoading({ title: '接驳神经网络...' })
                setTimeout(() => {
                    uni.hideLoading()
                    const success = userStore.spendCoins(1500, '订阅包月黑金档案')
                    if (success) {
                        userStore.purchaseVip(31, '包月黑金开通')
                        userStore.claimDailyVipGift()
                        uni.showToast({ title: '特权链已接通', icon: 'success' })
                    } else {
                        uni.showToast({ title: '账单回滚', icon: 'error' })
                    }
                }, 1000)
            }
        }
    })
}

// 模拟看广告体验一天
const watchAdForTrial = () => {
    showDialog({
        title: '拦截：非安全频段',
        content: '这是本系统唯一一次开放底层漏洞的机会。\n是否授权接入视网膜 30 秒 (观看视频广告) ?\n我们将为你无损注入 24 小时的大模型降维打击权限。',
        confirmText: '建立连接',
        cancelText: '拒绝接入',
        showCancel: true,
        color: '#10b981',
        success: (res) => {
            if (res.confirm) {
                uni.showLoading({ title: '解析影像中...' })
                setTimeout(() => {
                    uni.hideLoading()
                    userStore.claimTrialPermission() // 记录为已使用
                    uni.showToast({ title: '权限覆写成功 (剩 23:59:59)', icon: 'none', duration: 3000 })
                }, 2000)
            }
        }
    })
}

// 统一处理所有通用设置行的点击分发
const handleSettingClick = (originItem) => {
  const { id, url, value } = originItem

  if (url) {
      uni.navigateTo({ url })
      return
  }

  // 点击/切换 隐私伪装锁
  if (id === 'privacy') {
     if (value) {
         // 尝试开启
         if (!userStore.isVipActive) {
             // 阻断：非 VIP 拦截弹窗
             showDialog({
                 title: '🚨 权限缺失',
                 content: '量子伪装锁属于高阶黑金特权，可将系统重塑为计算器并支持自定 6 位暗门密码。\n\n是否立即注入黑金算力？',
                 confirmText: '连接黑金特权',
                 cancelText: '放弃权限',
                 showCancel: true,
                 color: '#f59e0b',
                 success: (res) => {
                     // 无论是否开通成功，由于数据是响应式的，当前并未写入 storage，重新渲染会强拉回 false
                     if (res.confirm) {
                         upgradePremium() // Changed from buyVip() to upgradePremium()
                    }
                     refreshTrigger.value++
                 }
             })
             // 通知子组件强制刷新 switch 的视图状态，避免其变蓝
             refreshTrigger.value++
             return
         }
         
         const success = userStore.togglePrivacyLock(true)
         if (success) {
            tempPin.value = userStore.privacyLock.pin
            pinError.value = ''
            showPinModal.value = true
         }
     } else {
         // 关闭
         userStore.togglePrivacyLock(false)
         uni.showToast({ title: '伪装层已卸载', icon: 'none' })
     }
     return
  }

  if (id === 'theme') {
    showThemeSheet.value = true
  } else if (id === 'logs') {
    uni.showToast({ title: '日志网络节点未接通', icon: 'none' })
  } else if (id === 'wipe') {
    // 本地数据焚毁
    showDialog({
        title: '警告：自毁协议',
        content: '这将抹除本地所有神经连接痕迹，断开总服务器，并将你强制踢回登录舱。',
        confirmText: '确认焚毁',
        showCancel: true,
        color: '#ef4444',
        success: (res) => {
            if (res.confirm) {
                uni.clearStorageSync()
                uni.reLaunch({ url: '/pages/login/index' })
            }
        }
    })
  }
}

// 确认修改 PIN 码
const confirmPinChange = () => {
   if (!tempPin.value || tempPin.value.length < 4) {
      pinError.value = '密码不能少于 4 位数字'
      return
   }
   if (!/^\d+$/.test(tempPin.value)) {
      pinError.value = '量子协议仅支持纯数字组合'
      return
   }
   
   userStore.togglePrivacyLock(true, tempPin.value)
   showPinModal.value = false
   uni.showToast({ title: '暗门重构完成', icon: 'success' })
}

// 云端数据彻底销毁
const confirmDeleteAccount = () => {
    showDialog({
        title: '高危警告：深渊销毁',
        content: '该操作将永久删除您的云端神经连接档案及所有数字资产（包含不可逆的重铸史和神经币）。是否确认完全销毁本账号？',
        confirmText: '坚决销毁',
        cancelText: '撤回指令',
        showCancel: true,
        color: '#ef4444',
        success: async (res) => {
            if (res.confirm) {
                uni.showLoading({ title: '执行云端粉碎...' })
                try {
                    const token = uni.getStorageSync('uni_id_token')
                    const r = await uniCloud.callFunction({
                        name: 'user-center',
                        data: {
                            action: 'deleteAccount',
                            token
                        }
                    })
                    if (r.result.code === 0) {
                        uni.showToast({ title: '档案已从深渊抹除', icon: 'success' })
                        setTimeout(() => {
                            uni.clearStorageSync()
                            uni.reLaunch({ url: '/pages/login/index' })
                        }, 1000)
                    } else {
                        uni.showToast({ title: r.result.msg || '销毁失败', icon: 'none' })
                    }
                } catch (e) {
                    uni.showToast({ title: '网络异常，未销毁', icon: 'none' })
                } finally {
                    uni.hideLoading()
                }
            }
        }
    })
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
  padding-bottom: calc(100px + env(safe-area-inset-bottom));
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
  margin-top: 16px;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(9, 9, 11, 0.9) 100%);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 16px;
  padding: 18px 20px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  min-height: 80px;
  display: flex;
  flex-direction: column; /* Changed to column to accommodate bottom-actions */
  align-items: center;
}

.ai-glow {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 20% 20%, rgba(139, 92, 246, 0.25) 0%, transparent 70%);
  pointer-events: none;
}

.styled-input {
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid #3f3f46;
  border-radius: 8px;
  padding: 12px;
  color: #fff;
  width: 100%;
  box-sizing: border-box;
}
.styled-input:focus { border-color: #ef4444; }

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
    padding: 20px 16px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}
.contract-main {
    padding: 4px;
    border-radius: 12px;
    transition: all 0.2s ease;
}
.card-hover { transform: translateY(2px); text-shadow: 0 0 5px var(--theme-shadow-primary); }
.premium-title { font-size: 16px; font-weight: 900; color: var(--theme-primary); }
.price-chip { background: var(--theme-primary); color: #09090b; padding: 2px 8px; border-radius: 10px; font-size: 12px; font-weight: bold;}
.premium-desc { font-size: 13px; color: #a1a1aa; line-height: 1.5; }
.premium-footer { border-top: 1px dashed var(--theme-shadow-primary); padding-top: 12px;}
.unlock-text { color: #f4f4f5; font-size: 14px; font-weight: bold; }
.arrow { color: var(--theme-primary); font-weight: bold; font-size: 18px;}

/* -------------------------------
   底部操作区结构重构
--------------------------------- */
.bottom-footer {
  gap: 16px; 
}

.legal-links { gap: 12px; }
.link-text { font-size: 13px; color: #71717a; text-decoration: none; padding: 4px; transition: color 0.2s; letter-spacing: 0.5px;}
.link-text:active { color: #f4f4f5; }
.link-divider { font-size: 13px; color: #3f3f46; }

.version-text {
  font-size: 11px;
  color: #3f3f46;
  font-family: monospace;
}

.dev-entry { text-align: center; }
.ad-text { color: #10b981; font-size: 13px; font-family: monospace; text-shadow: 0 0 5px rgba(16, 185, 129, 0.2); }

/* 广告体验栏位 */
.ad-trial-zone {
    margin-top: 16px;
    padding: 12px;
    background: rgba(16, 185, 129, 0.05);
    border: 1px dashed rgba(16, 185, 129, 0.3);
    border-radius: 8px;
    transition: all 0.2s ease;
}
.ad-hover { background: rgba(16, 185, 129, 0.1); border-color: rgba(16, 185, 129, 0.6); }


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

/* 系统控制区 */
.system-control-zone {
  margin-bottom: 0px;
}
.divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.05), transparent);
}
.control-item {
  padding: 10px 20px;
}
.control-text {
  font-size: 13px;
  color: #71717a;
  letter-spacing: 1px;
  transition: all 0.3s;
  
  &.secondary {
    font-size: 11px;
    opacity: 0.6;
  }
}
.text-glow {
  .control-text {
    color: #f4f4f5;
    text-shadow: 0 0 8px rgba(255, 255, 255, 0.3);
  }
}
.version-text {
  font-size: 10px;
  color: #3f3f46;
  font-family: monospace;
}
</style>
