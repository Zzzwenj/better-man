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
    
    <!-- 1.5 神经元 AI 导师入口 -->
    <view class="ai-mentor-card mx-4" @click="goToAI" hover-class="card-hover">
      <view class="ai-glow"></view>
      <view class="flex items-center justify-between relative z-10 w-full">
        <view class="flex items-center">
          <view class="ai-avatar-wrap">
            <text class="ai-icon">⎔</text>
            <view class="pulse-ring"></view>
          </view>
          <view class="ml-3">
            <text class="ai-name block">神经元核心 (Nova)</text>
            <text class="ai-status block">状态: 神经网络连通正常...</text>
          </view>
        </view>
        <view class="ai-btn flex items-center justify-center">
          <text class="ai-btn-text">接入终端</text>
        </view>
      </view>
    </view>

    <!-- 2. 黑金通行证 (Black Gold Pass) -->
    <view class="mx-4">
      <PremiumCard 
        :isVip="userStore.isVipActive"
        :vipExpireTime="userStore.formattedVipExpire"
        :vipDaysLeft="userStore.vipDaysLeft"
        :userCoins="userStore.coins"
        @openStore="handleSettingClick({url: '/pages/store/index'})"
        @watchAd="watchAdForTrial"
      />
    </view>
    
    <!-- 3. 荣誉资产长廊 (资产化展示) -->
    <HonorCarousel 
      :currentThemeName="currentThemeName"
      :ownedItems="userStore.ownedItems"
      :equippedItems="userStore.equippedItems"
      @navigateToStore="handleSettingClick({url: '/pages/store/index'})"
    />
    
    <!-- 4. 系统控制区 -->
    <ProfileSettingsList 
      :privacyLockEnabled="userStore.privacyLock.enabled"
      :deviceId="deviceId"
      :isSuperAdmin="isSuperAdmin"
      @handleSettingClick="handleUnifiedSettingClick"
      @togglePrivacyLock="handlePrivacyToggle"
      @goToAgreement="goAgreement"
    />
    
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
          <text class="text-xs text-gray-400 mb-2">请输入由数字组成的 4-6 位隐私密码:</text>
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
    
    <!-- [纯净原生层] 最底层的独立原生 View 防止 WebView 焦点阻断 -->
    <view class="native-inject-mask" v-if="showInjectModal" @click="showInjectModal = false">
      <view class="native-popup-content flex-col" @click.stop>
         <view class="flex justify-between items-center pb-3 mb-2" style="border-bottom: 1px solid rgba(255,255,255,0.05);">
            <text class="dialog-title text-white font-bold" style="font-size: 15px;">录入影像弹药库 [-SYS-]</text>
         </view>
         
         <text class="text-xs text-gray-400 mb-2 mt-2">直链输入 (仅限 .mp4 无水印链):</text>
         <!-- 使用最高的层叠和不透明包裹保证系统键盘探测 -->
         <input class="native-input mb-4" type="text" v-model="injectForm.url" placeholder="https://..." cursor-spacing="20" maxlength="-1" />
         
         <text class="text-xs text-gray-400 mb-2">影像标题 (极简):</text>
         <input class="native-input mb-4" type="text" v-model="injectForm.title" placeholder="破晓时刻，自律即自由" cursor-spacing="20" maxlength="50" />

         <text class="text-xs text-gray-400 mb-2">核心摘要 (可选):</text>
         <input class="native-input mb-4" type="text" v-model="injectForm.desc" placeholder="一句话解析精神特质..." cursor-spacing="20" maxlength="-1" />
         
         <text class="text-xs text-gray-400 mt-2 mb-4 text-center" style="color:#00e5ff">数据将直接压入核心地位</text>

         <view class="flex justify-between mt-4">
            <view class="btn cancel-btn flex items-center justify-center flex-1 mr-2" @click="closeInjectVideo">
               <text class="text-gray-300 font-bold" style="font-size: 14px;">撤销装填</text>
            </view>
            <view class="btn confirm-btn flex items-center justify-center flex-1 ml-2" @click="confirmInjectVideo">
               <text class="text-white font-bold" style="font-size: 14px;">执行灌入</text>
            </view>
         </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useThemeStore } from '../../store/theme.js'
import { useUserStore } from '../../store/user.js'
import { useRewardAd } from '../../composables/useRewardAd.js'
import ProfileUserCard from '../../components/profile/ProfileUserCard.vue'
import ProfileSettingsList from '../../components/profile/ProfileSettingsList.vue'
import HonorCarousel from '../../components/profile/HonorCarousel.vue'
import PremiumCard from '../../components/profile/PremiumCard.vue'
import CustomTabBar from '../../components/common/CustomTabBar.vue'
import ThemeActionSheet from '../../components/common/ThemeActionSheet.vue'
import CyberDialog from '../../components/common/CyberDialog.vue'
import CyberFloatBall from '../../components/dashboard/CyberFloatBall.vue'
import SecretBeacon from '../../components/profile/SecretBeacon.vue'
import { onShow, onLoad, onUnload } from '@dcloudio/uni-app'
import { paymentManager } from '@/utils/paymentManager.js'

const themeStore = useThemeStore()
const userStore = useUserStore()
const showThemeSheet = ref(false)
const showBeacon = ref(false)
const showPinModal = ref(false)
const tempPin = ref('')
const pinError = ref('')

const isSuperAdmin = ref(false)
const showInjectModal = ref(false)
const injectForm = ref({ url: '', title: '', desc: '' })

const isPendingDelete = ref(false)
const deleteAt = ref(0)

const { initAd, showAd } = useRewardAd('1507000689') // [开发测试专用ID] DCloud 官方保底激励视频，全网皆可调起，无收益。上线前请替换为你的真实 ID

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

// --- 数据挂载池 ---
let localProfileData = {}

// --- 用户状态 ---
const userName = ref('探索者_8972')
const userDesc = ref('系统干预：已停用')
const userAvatar = ref('')
const userSignature = ref('')
// --- 动态数据 (传给组件) ---
const currentThemeName = computed(() => {
    return themeStore.themes.find(t => t.id === themeStore.currentTheme)?.name || '未知系统'
})
const deviceId = ref('UNKNOWN')

// --- 初始化钩子 ---
onMounted(() => {
    uni.hideTabBar()
    initAd() // 提前加载广告配置节点
    
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

onLoad(() => {
    // 监听子组件发出的支付意图（例如充值、办卡）
    uni.$on('trigger-android-pay', handleAndroidPay)
    // 监听已是 VIP 时的信息展示事件
    uni.$on('vip-info-click', showVipInfo)
})

onUnload(() => {
    uni.$off('trigger-android-pay')
    uni.$off('vip-info-click')
})

onShow(() => {
    // 每次显示页面更新判定
    isPendingDelete.value = uni.getStorageSync('user_account_status') === 'pending_delete'
    deleteAt.value = uni.getStorageSync('account_delete_at') || 0
})

// 格式化时间输出
const formatDeleteTime = (timestamp) => {
    if (!timestamp) return '未知时间'
    const d = new Date(timestamp)
    return `${d.getMonth() + 1}月${d.getDate()}日 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

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
            
            // 超级管理员鉴权（基于云端硬编码标识或特殊称号）
            if (cloudUser._id === '69a2b37b8a5c785fa801e691') {
                isSuperAdmin.value = true
            }

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
      // 若非业务报错而是代码报错(如ReferenceError)，确保Loading被关闭，但不再写死 hideLoading 导致重复
      // 这里增加防御性检测或简单包抄
      try { uni.hideLoading() } catch(e){} 
      console.error('覆写异常', err)
      uni.showToast({ title: '总控终端未连接', icon: 'none' })
  }
}

const onModalStateChange = (state) => {
  isModalOpen.value = state
}

// 已是VIP点击展示信息
const showVipInfo = () => {
    showDialog({
        title: '黑金权限已激活',
        content: `你的数据连通性无损维持，剩余 ${userStore.vipDaysLeft} 天。今日赠送的 50 算力点已空投。`,
        showCancel: false,
        confirmText: '明确',
        color: '#10b981'
    })
}

// Android/H5 处理第三方支付分流
const handleAndroidPay = ({ price, type }) => {
    showDialog({
        title: '建立黑金特权通讯网',
        content: '订阅费：15 元/31天。\n解锁每月 3 次“免代价无损折跃（除颤防坠落）”，专属高级称号与主理人直通频道信标。',
        confirmText: '微信支付',
        cancelText: '支付宝支付',
        showCancel: true,
        color: '#10b981', // 琥珀/金色色调 -> 改为微信绿以作引导
        success: async (res) => {
            const provider = res.confirm ? 'wxpay' : 'alipay'
            
            uni.showLoading({ title: '接驳加密网关...' })
            try {
                await paymentManager.requestPayment({
                    productId: type,
                    provider: provider,
                    price: price
                })
                uni.hideLoading()
                // 本地假造赋权，线上需配合回调
                userStore.purchaseVip(31, '包月黑金开通')
                userStore.claimDailyVipGift()
                uni.showToast({ title: '特权链已接通', icon: 'success' })
            } catch (err) {
                uni.hideLoading()
                uni.showToast({ title: err.message || '支付通道阻断', icon: 'error' })
            }
        }
    })
}

// 真实的拉取并等待激励广告播完体验一天
const watchAdForTrial = () => {
    showDialog({
        title: '拦截：非安全频段',
        content: '这是本系统唯一一次开放底层漏洞的机会。\n是否授权接入视网膜 30 秒 (观看视频广告) ?\n我们将为你无损注入 24 小时的大模型降维打击全量权限。',
        confirmText: '建立连接',
        cancelText: '拒绝接入',
        showCancel: true,
        color: '#10b981',
        success: async (res) => {
            if (res.confirm) {
                try {
                    uni.showLoading({ title: '视频流握手中...' })
                    const isCompleted = await showAd()
                    uni.hideLoading()
                    
                    if (isCompleted) {
                        userStore.claimTrialPermission() // 真实触发资产下发
                        uni.showToast({ title: '权限覆写成功 (剩 23:59:59)', icon: 'none', duration: 3000 })
                    }
                } catch(e) {
                   uni.hideLoading()
                   console.error('播放器调度失败', e)
                }
            }
        }
    })
}

// 统一处理组件点击
const handleUnifiedSettingClick = (type) => {
  switch (type) {
    case 'theme':
      showThemeSheet.value = true
      break
    case 'article':
      uni.navigateTo({ url: '/pages/article/index?type=article' })
      break
    case 'video':
      uni.navigateTo({ url: '/pages/article/index?type=video' })
      break
    case 'beacon':
      checkBeaconAccess()
      break
    case 'logout':
      confirmLogout()
      break
    case 'delete_account':
      confirmDeleteAccount()
      break
    case 'inject_video':
      showInjectModal.value = true
      break
    case 'clear_cache':
      uni.clearStorageSync()
      uni.reLaunch({ url: '/pages/login/index' })
      break
  }
}

// 通用的老版本方法保留以支持上面
const handleSettingClick = ({ url }) => {
    if(url) uni.navigateTo({ url })
}
const goAgreement = (type) => {
  uni.navigateTo({ url: `/pages/agreement/index?type=${type}` })
}

const checkBeaconAccess = () => {
    // ...
}

const confirmInjectVideo = async () => {
    if (!injectForm.value.url) {
        uni.showToast({ title: '拒绝：影像直链为空', icon: 'none' })
        return
    }
    uni.showLoading({ title: '封装冷藏库弹药...' })
    try {
        const token = uni.getStorageSync('uni_id_token')
        const r = await uniCloud.callFunction({
            name: 'user-center',
            data: { action: 'injectVideo', token, payload: injectForm.value }
        })
        if (r.result.code === 0) {
            showInjectModal.value = false
            uni.showToast({ title: '弹药装填成功', icon: 'success' })
            injectForm.value = { url: '', title: '', desc: '' }
        } else {
            uni.showToast({ title: r.result.msg || '写入失败', icon: 'none' })
        }
    } catch (e) {
        uni.showToast({ title: '终端拦截', icon: 'none' })
    } finally {
        uni.hideLoading()
    }
}

const closeInjectVideo = () => {
    showInjectModal.value = false
    injectForm.value = { url: '', title: '', desc: '' }
}

const confirmLogout = () => {
    showDialog({
        title: '物理切断连接',
        content: '登出后，你将失去当前的神经同步流，直到你再次进行量子验证。',
        confirmText: '坚决切断',
        showCancel: true,
        color: '#ef4444',
        success: (res) => {
            if (res.confirm) {
                uni.removeStorageSync('uni_id_token')
                uni.reLaunch({ url: '/pages/login/index' })
            }
        }
    })
}

// 代理 Privacy 切换
const handlePrivacyToggle = (val) => {
      if (val) {
         // 尝试开启
         if (!userStore.isVipActive) {
             // 阻断：非 VIP 拦截弹窗
             showDialog({
                 title: '🚨 权限缺失',
                 content: '量子伪装锁属于高阶黑金特权，可将系统重塑为计算器并支持自定 6 位隐私密码。\n\n是否立即注入黑金算力？',
                 confirmText: '连接黑金特权',
                 cancelText: '放弃权限',
                 showCancel: true,
                 color: '#f59e0b',
                 success: (res) => {
                     // 非 VIP 前往支付面板触发
                     if (res.confirm) {
                         if (uni.getSystemInfoSync().platform === 'ios') {
                             // iOS 无需选微信支付宝，直接调用苹果
                             paymentManager.requestPayment({ productId: 'vip_1month', provider: 'appleiap', price: 1500 })
                               .then(() => userStore.purchaseVip(31, '包月黑金开通'))
                         } else {
                             handleAndroidPay({ price: 1500, type: 'vip_1month' })
                         }
                    }
                 }
             })
             // 关闭原组件里面的 switch，这里靠 Vue 单向响应式可能压不住，但组件内可以通过 $forceUpdate 或 watch 同步
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
}

// 发起云端流放销毁
const confirmDeleteAccount = () => {
    showDialog({
        title: '高危警告：开启强流放程序',
        content: '该操作将锁定您的云端档案并进入 7 天的流放冷却期。如果您在 7 天内未中止程序，您的所有数字资产（重铸史和神经币）将不可逆地坠入深渊。是否确认？',
        confirmText: '坚决流放',
        cancelText: '撤回指令',
        showCancel: true,
        color: '#ef4444',
        success: async (res) => {
            if (res.confirm) {
                uni.showLoading({ title: '执行流放指令...' })
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
                        uni.showToast({ title: '已进入 7 天流放冷却倒计时', icon: 'success' })
                        // 本地打标
                        uni.setStorageSync('user_account_status', 'pending_delete')
                        uni.setStorageSync('account_delete_at', r.result.delete_at)
                        isPendingDelete.value = true
                        deleteAt.value = r.result.delete_at
                    } else {
                        uni.showToast({ title: r.result.msg || '执行失败', icon: 'none' })
                    }
                } catch (e) {
                    uni.showToast({ title: '网络异常，未执行', icon: 'none' })
                } finally {
                    uni.hideLoading()
                }
            }
        }
    })
}

// 撤回注销指令
const cancelDeleteAccount = () => {
    showDialog({
        title: '指令覆写验证',
        content: '您是否确认要中止当前的账号流放焚毁程序，恢复全面接入特权？',
        confirmText: '确认中止',
        cancelText: '放弃操作',
        showCancel: true,
        color: '#00e5ff',
        success: async (res) => {
            if (res.confirm) {
                uni.showLoading({ title: '修补神经元连接...' })
                try {
                    const token = uni.getStorageSync('uni_id_token')
                    const r = await uniCloud.callFunction({
                        name: 'user-center',
                        data: {
                            action: 'cancelDeleteAccount',
                            token
                        }
                    })
                    if (r.result.code === 0) {
                        uni.showToast({ title: '档案已成功抢救', icon: 'success' })
                        uni.removeStorageSync('user_account_status')
                        uni.removeStorageSync('account_delete_at')
                        isPendingDelete.value = false
                        deleteAt.value = 0
                    } else {
                        uni.showToast({ title: r.result.msg || '修补失败', icon: 'none' })
                    }
                } catch (e) {
                    uni.showToast({ title: '网络异常，未修补', icon: 'none' })
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
  padding-bottom: calc(40px + env(safe-area-inset-bottom));
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

.native-inject-mask {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(12px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.native-popup-content {
  width: 85vw;
  max-width: 340px;
  background: linear-gradient(145deg, #18181b 0%, #09090b 100%);
  border: 1px solid rgba(239, 68, 68, 0.4);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6), inset 0 0 20px rgba(239, 68, 68, 0.05);
}

.native-input {
  background: rgba(0, 0, 0, 0.7);
  border: 1px solid #3f3f46;
  border-radius: 8px;
  padding: 10px 14px;
  color: #fff;
  width: auto;
  font-size: 14px;
}
.native-input:focus { border-color: #ef4444; }

.btn { height: 44px; border-radius: 8px; transition: all 0.2s; }
.btn:active { transform: scale(0.96); opacity: 0.8; }
.cancel-btn { background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); }
.confirm-btn { background: #ef4444; box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3); }
</style>
```
