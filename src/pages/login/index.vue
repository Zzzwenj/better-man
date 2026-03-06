<template>
  <view class="login-container flex-col" :style="themeStore.themeCssVars">
    
    <!-- 1. 顶部状态栏 - 对齐主控页风格 -->
    <view class="login-header flex justify-between items-center">
      <view class="title-wrap">
        <text class="title tracking-wider">觉醒空间</text>
        <text class="subtitle block mt-1">终端接入协议 v1.0 - 身份核验中</text>
      </view>
      <view class="status-chip flex items-center justify-center">
        <text class="chip-dot"></text>
        <text class="chip-text ml-1">待接入</text>
      </view>
    </view>

    <view class="auth-box flex-1 px-6 mt-10">
      <!-- 账号 (手机号/邮箱) -->
      <view class="input-group mb-6">
        <text class="label">神经元溯源 ID</text>
        <view class="input-wrapper flex items-center mt-2" :class="{ 'focused': isAccountFocused }">
          <input 
            class="input-field flex-1" 
            type="text" 
            v-model="form.account" 
            @focus="isAccountFocused = true"
            @blur="isAccountFocused = false"
            placeholder="输入手机号或邮箱" 
          />
        </view>
      </view>

      <!-- 图形验证码 -->
      <view class="input-group mb-6" v-if="mode === 'login' || mode === 'register'">
        <text class="label">图形校验序列</text>
        <view class="input-wrapper flex items-center justify-between mt-2">
          <input class="input-field flex-1" type="text" v-model="form.captchaInput" placeholder="输入校验字符" maxlength="4" />
          <view class="captcha-box" @click="generateCaptcha">
            <text class="captcha-text">{{ captchaText }}</text>
          </view>
        </view>
      </view>

      <!-- 动态验证码 -->
      <view class="input-group mb-6" v-if="mode === 'register' || mode === 'forgot'">
        <text class="label">动态安全指令</text>
        <view class="input-wrapper flex items-center justify-between mt-2">
          <input class="input-field flex-1" type="text" v-model="form.verifyCode" placeholder="输入指令" maxlength="6" />
          <view class="btn-code" :class="{ disabled: countdown > 0 }" @click="sendVerifyCode">
            <text class="btn-code-text">{{ countdown > 0 ? `${countdown}s 后重试` : '拉取指令' }}</text>
          </view>
        </view>
      </view>

      <!-- 密码 -->
      <view class="input-group mb-8">
        <text class="label">访问密钥</text>
        <view class="input-wrapper flex items-center mt-2">
          <input class="input-field flex-1" type="text" password v-model="form.password" placeholder="输入密钥" />
        </view>
      </view>

      <view class="btn-login flex items-center justify-center" hover-class="btn-hover" @click="submit">
        <text class="btn-text">{{ btnText }}</text>
      </view>

      <!-- 模式切换 -->
      <view class="switch-mode mt-8 flex justify-between px-2">
        <text v-if="mode !== 'login'" class="nav-text" @click="switchMode('login')">返回接入终端</text>
        <text v-if="mode === 'login'" class="nav-text" @click="switchMode('register')">激活新节点</text>
        <text v-if="mode === 'login'" class="nav-text" @click="switchMode('forgot')">密钥丢失</text>
      </view>

      <!-- 🍎 苹果审核合规防线 (Apple Login) -->
      <!-- #ifdef APP-PLUS -->
      <view class="third-party-login mt-6" v-if="mode === 'login' && isIOS">
         <view class="apple-btn flex items-center justify-center mx-10" hover-class="btn-hover" @click="appleLogin">
             <text class="platform-icon text-2xl font-bold"></text>
             <text class="ml-2 Apple-text text-sm tracking-wider font-bold">通过 Apple 安全握手</text>
         </view>
      </view>
      <!-- #endif -->
      
      <CyberFooter />
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useThemeStore } from '@/store/theme.js'
import CyberFooter from '@/components/common/CyberFooter.vue'

const themeStore = useThemeStore()
const mode = ref('login') // 'login', 'register', 'forgot'
const isIOS = computed(() => uni.getSystemInfoSync().platform === 'ios')

const form = reactive({
  account: '',
  password: '',
  captchaInput: '',
  verifyCode: ''
})

const isAccountFocused = ref(false)
const captchaText = ref('')
const countdown = ref(0)
let timer = null

const modeTitle = computed(() => {
  if (mode.value === 'login') return '身份核验'
  if (mode.value === 'register') return '节点激活'
  return '密钥重置'
})

const btnText = computed(() => {
  if (mode.value === 'login') return '建立连接'
  if (mode.value === 'register') return '提交注册'
  return '确认重置'
})

// 格式校验
const validateAccount = () => {
  const account = form.account.trim()
  if (!account) return { valid: false, msg: '请输入账号' }
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(account)
  const isPhone = /^1[3-9]\d{9}$/.test(account)
  
  if (isPhone) return { valid: true, type: 'phone', account }
  if (isEmail) return { valid: true, type: 'email', account }
  
  return { valid: false, msg: '格式不正确，请输入正确的手机号或邮箱' }
}

// 生成图形验证码
const generateCaptcha = () => {
  const chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'
  let text = ''
  for (let i = 0; i < 4; i++) {
    text += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  captchaText.value = text
}

onMounted(() => {
  generateCaptcha()
  // 记住账号：自动填充上次登录的账号
  const savedAccount = uni.getStorageSync('saved_account')
  if (savedAccount) {
      form.account = savedAccount
  }
})

const switchMode = (newMode) => {
  mode.value = newMode
  // 切换模式时保留已记住的账号，仅清空其他字段
  form.password = ''
  form.captchaInput = ''
  form.verifyCode = ''
  if (newMode === 'login' || newMode === 'register') {
    generateCaptcha()
  }
}

// 发送验证码
const sendVerifyCode = async () => {
  const check = validateAccount()
  if (!check.valid) {
    uni.showToast({ title: check.msg, icon: 'none' })
    return
  }
  if (countdown.value > 0) return

  uni.showLoading({ title: '请求下发...' })
  
  try {
    const actionName = check.type === 'email' ? 'sendEmailCode' : 'sendSmsCode'
    const params = check.type === 'email' ? { email: check.account } : { phone: check.account }

    const res = await uniCloud.callFunction({
      name: 'uni-id-cf',
      data: {
        action: actionName,
        params
      }
    })
    
    uni.hideLoading()
    if (res.result.code === 0) {
      uni.showToast({ 
        title: check.type === 'email' ? '邮件指令已发送' : '短信指令已发送', 
        icon: 'success' 
      })
      startCountdown()
    } else {
      uni.showToast({ title: res.result.message || '发送失败', icon: 'none' })
    }
  } catch (e) {
    uni.hideLoading()
    uni.showToast({ title: '网络异常，请重试', icon: 'none' })
  }
}

const startCountdown = () => {
  countdown.value = 60
  timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) clearInterval(timer)
  }, 1000)
}

// 统一提交处理
const submit = async () => {
  const check = validateAccount()
  if (!check.valid) {
    uni.showToast({ title: check.msg, icon: 'none' })
    return
  }
  if (!form.password) {
    uni.showToast({ title: '请输入密码', icon: 'none' })
    return
  }

  if (mode.value === 'login' || mode.value === 'register') {
    if (form.captchaInput.toLowerCase() !== captchaText.value.toLowerCase()) {
      uni.showToast({ title: '图形指令不匹配', icon: 'none' })
      generateCaptcha()
      return
    }
  }

  if (mode.value === 'register' || mode.value === 'forgot') {
    if (!form.verifyCode) {
      uni.showToast({ title: '请输入动态验证码', icon: 'none' })
      return
    }
  }

  uni.showLoading({ title: mode.value === 'login' ? '验证身份中...' : '处理中...' })
  
  try {
    let res;
    if (mode.value === 'register') {
      res = await uniCloud.callFunction({
        name: 'uni-id-cf',
        data: {
          action: 'register',
          params: {
            email: check.type === 'email' ? check.account : '',
            phone: check.type === 'phone' ? check.account : '',
            password: form.password,
            verifyCode: form.verifyCode
          }
        }
      })
      uni.hideLoading()
      if (res.result.code === 0) {
        uni.showToast({ title: '注册成功，请登录', icon: 'success' })
        switchMode('login')
      } else {
        uni.showToast({ title: res.result.message || '注册失败', icon: 'none' })
        generateCaptcha()
      }
    } else if (mode.value === 'login') {
      res = await uniCloud.callFunction({
        name: 'uni-id-cf',
        data: {
          action: 'login',
          params: {
            account: check.account,
            password: form.password
          }
        }
      })
      uni.hideLoading()
      if (res.result.code === 0) {
        // 登录成功，保存 token
        const token = res.result.token
        uni.setStorageSync('uni_id_token', token)
        uni.setStorageSync('uni_id_token_expired', res.result.tokenExpired)
        uni.setStorageSync('uid', res.result.uid)
        // 记住账号（不存密码，安全合规）
        uni.setStorageSync('saved_account', check.account)
        
        // 拉取云端用户档案及状态
        try {
          const profileRes = await uniCloud.callFunction({
            name: 'user-center',
            data: {
              action: 'getUserProfile',
              token: token
            }
          })
          if (profileRes.result.code === 0 && profileRes.result.data) {
            const userData = profileRes.result.data
            if (userData.neuro_baseline) {
              // 此处混入可能更新了的 nickname, avatar, signature 到本地 baseline 中
              const baseline = userData.neuro_baseline
              baseline.nickname = userData.nickname || baseline.nickname
              baseline.avatar = userData.avatar || baseline.avatar
              baseline.signature = userData.signature || baseline.signature
              uni.setStorageSync('neuro_baseline', JSON.stringify(baseline))
            }
            if (userData.neuro_start_date) {
              uni.setStorageSync('neuro_start_date', userData.neuro_start_date)
            }
          }
        } catch (err) {
          console.error('拉取云端档案失败', err)
        }

        uni.showToast({ title: '接入成功', icon: 'success' })
        
        setTimeout(() => {
          const baseline = uni.getStorageSync('neuro_baseline')
          if (!baseline) {
            uni.redirectTo({ url: '/pages/onboarding/index' })
          } else {
            uni.switchTab({ url: '/pages/dashboard/index' })
          }
        }, 1000)
      } else {
        uni.showToast({ title: res.result.message || '登录失败', icon: 'none' })
        generateCaptcha()
      }
    } else if (mode.value === 'forgot') {
      // 忘记密码：调用云端 resetPassword 重置
      res = await uniCloud.callFunction({
        name: 'uni-id-cf',
        data: {
          action: 'resetPassword',
          params: {
            email: check.type === 'email' ? check.account : '',
            phone: check.type === 'phone' ? check.account : '',
            password: form.password,
            verifyCode: form.verifyCode
          }
        }
      })
      uni.hideLoading()
      if (res.result.code === 0) {
        uni.showToast({ title: '密码重置成功，请登录', icon: 'success' })
        switchMode('login')
      } else {
        uni.showToast({ title: res.result.message || '重置失败', icon: 'none' })
        generateCaptcha()
      }
    }
  } catch (e) {
    uni.hideLoading()
    console.error('[登录异常] 详情:', JSON.stringify(e), e.message || e)
    uni.showToast({ title: '网络请求失败(云端可能超限)', icon: 'none' })
    generateCaptcha()
  }
}

// 🍎 苹果原生接入通道 (IAP & Apple Login)
const appleLogin = () => {
    uni.login({
        provider: 'apple',
        success: async (loginRes) => {
            uni.showLoading({ title: 'Apple 链路校验中...' })
            try {
                // 将 loginRes.authResult 发送到 user-center 云函数完成换取/注册 Token
                const res = await uniCloud.callFunction({
                    name: 'uni-id-cf',
                    data: {
                        action: 'loginByApple',
                        params: { appleIdentityToken: loginRes.authResult.identityToken }
                    }
                })
                uni.hideLoading()
                if (res.result.code === 0) {
                    uni.setStorageSync('uni_id_token', res.result.token)
                    uni.setStorageSync('uid', res.result.uid)
                    uni.showToast({ title: '物理防线已穿透', icon: 'success' })
                    setTimeout(() => {
                        const baseline = uni.getStorageSync('neuro_baseline')
                        if (!baseline) uni.redirectTo({ url: '/pages/onboarding/index' })
                        else uni.switchTab({ url: '/pages/dashboard/index' })
                    }, 1000)
                } else {
                    uni.showToast({ title: 'Apple 握手被拒', icon: 'none' })
                }
            } catch (err) {
                uni.hideLoading()
                uni.showToast({ title: '云端中枢失联', icon: 'none' })
            }
        },
        fail: () => {
            uni.showToast({ title: 'Apple 授权中断', icon: 'none' })
        }
    })
}
</script>

<style lang="scss" scoped>
.login-container {
  min-height: 100vh;
  background-color: #09090b;
  color: #fff;
}

.px-6 { padding: 0 24px; }
.mt-10 { margin-top: 20px; }
.pt-12 { padding-top: 48px; }
.mb-6 { margin-bottom: 24px; }
.mb-8 { margin-bottom: 32px; }
.flex { display: flex; }
.flex-col { display: flex; flex-direction: column; }
.flex-1 { flex: 1; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.justify-center { justify-content: center; }
.block { display: block; }
.mt-1 { margin-top: 4px; }
.mt-2 { margin-top: 8px; }
.mt-8 { margin-top: 32px; }
.px-2 { padding: 0 8px; }
.pb-bottom { padding-bottom: max(30px, env(safe-area-inset-bottom)); }

/* 头部样式：对齐主控页 (Dashboard) */
.login-header {
  padding: calc(var(--status-bar-height) + 24px) 20px 12px 20px;
  background: rgba(9, 9, 11, 0.65);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  position: sticky;
  top: 0;
  z-index: 50;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
  width: 100%;
}

.title { 
  font-size: 24px; 
  font-weight: 900; 
  color: var(--theme-primary); 
  letter-spacing: 2px; 
  text-shadow: 0 0 15px var(--theme-shadow-primary);
}
.subtitle { font-size: 14px; color: #a1a1aa; letter-spacing: 1px;}

.status-chip {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 4px 10px;
  border-radius: 20px;
}

.chip-dot {
  width: 6px;
  height: 6px;
  background: #00e5ff;
  border-radius: 50%;
  box-shadow: 0 0 8px #00e5ff;
}

.chip-text { font-size: 10px; color: #a1a1aa; font-weight: bold; padding-left: 4px;}

/* 登录表单样式 (回归极简圆润) */
.label { font-size: 13px; color: #a1a1aa; font-family: monospace;}

.input-wrapper {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  height: 56px;
  padding: 0 16px;
  transition: border-color 0.3s;
}

.input-wrapper.focused {
  border-color: var(--theme-primary, #00e5ff);
}

.input-field { font-size: 16px; color: #fff; height: 100%;}

.btn-code {
  background: var(--theme-bg-highlight); border: 1px solid var(--theme-shadow-primary);
  padding: 6px 12px; border-radius: 6px;
  white-space: nowrap;
}
.btn-code.disabled { background: rgba(255,255,255,0.05); border-color: transparent;}
.btn-code-text { font-size: 12px; color: var(--theme-primary); font-weight: bold;}
.btn-code.disabled .btn-code-text { color: #6b7280; }

.captcha-box {
  background: #1e1e24;
  padding: 4px 12px;
  border-radius: 6px;
  min-width: 80px;
  text-align: center;
  border: 1px dashed rgba(255,255,255,0.2);
}
.captcha-text {
  font-size: 18px;
  color: var(--theme-primary);
  font-weight: 900;
  letter-spacing: 3px;
  font-family: monospace;
}

.btn-login {
  height: 56px;
  background: linear-gradient(135deg, var(--theme-primary-grad-start) 0%, var(--theme-primary-grad-end) 100%);
  border-radius: 28px;
  box-shadow: 0 8px 24px var(--theme-shadow-primary);
}

.btn-text { color: #fff; font-size: 16px; font-weight: 900; letter-spacing: 2px;}

.btn-hover { transform: scale(0.96); opacity: 0.9; box-shadow: 0 2px 10px var(--theme-shadow-primary); }

.nav-text { font-size: 14px; color: #9ca3af; transition: color 0.2s; }
.nav-text:active { color: #fff; }

.dev-text { font-size: 12px; color: #fff; opacity: 0.1; }

.apple-btn {
    background: #ffffff;
    color: #000000;
    height: 48px;
    border-radius: 24px;
    box-shadow: 0 4px 15px rgba(255, 255, 255, 0.2);
    transition: all 0.3s ease;
}
.apple-btn:active {
    transform: scale(0.96);
}
.Apple-text { color: #000000; }
</style>
