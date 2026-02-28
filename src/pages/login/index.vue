<template>
  <view class="login-container flex-col">
    <view class="header pt-10 px-6">
      <text class="title block">{{ modeTitle }}</text>
      <text class="subtitle block mt-2">Dopamine Reset 档案库接入</text>
    </view>

    <view class="auth-box flex-1 px-6 mt-10">
      <!-- 账号 (手机号/邮箱) -->
      <view class="input-group mb-6">
        <text class="label">神经元溯源 ID (手机号或邮箱)</text>
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

      <!-- 图形验证码 (登录和注册时使用) -->
      <view class="input-group mb-6" v-if="mode === 'login' || mode === 'register'">
        <text class="label">图形指令 (防重放验证)</text>
        <view class="input-wrapper flex items-center justify-between mt-2">
          <input class="input-field flex-1" type="text" v-model="form.captchaInput" placeholder="输入图形字符" maxlength="4" />
          <view class="captcha-box" @click="generateCaptcha">
            <text class="captcha-text" :style="{ transform: 'rotate(' + (Math.random() * 20 - 10) + 'deg)' }">{{ captchaText }}</text>
          </view>
        </view>
      </view>

      <!-- 动态验证码 (注册和忘记密码时使用) -->
      <view class="input-group mb-6" v-if="mode === 'register' || mode === 'forgot'">
        <text class="label">动态安全指令 (验证码)</text>
        <view class="input-wrapper flex items-center justify-between mt-2">
          <input class="input-field flex-1" type="text" v-model="form.verifyCode" placeholder="输入验证码" maxlength="6" />
          <view class="btn-code" :class="{ disabled: countdown > 0 }" @click="sendVerifyCode">
            <text class="btn-code-text">{{ countdown > 0 ? `${countdown}s 后重试` : '获取指令' }}</text>
          </view>
        </view>
      </view>

      <!-- 密码 -->
      <view class="input-group mb-8">
        <text class="label">密钥 (密码)</text>
        <view class="input-wrapper flex items-center mt-2">
          <input class="input-field flex-1" type="text" password v-model="form.password" placeholder="输入密码" />
        </view>
      </view>

      <view class="btn-login flex items-center justify-center" hover-class="btn-hover" @click="submit">
        <text class="btn-text">{{ btnText }}</text>
      </view>

      <!-- 模式切换 -->
      <view class="switch-mode mt-6 flex justify-between px-2">
        <text v-if="mode !== 'login'" class="text-gray-400 text-sm" @click="switchMode('login')">返回接入</text>
        <text v-if="mode === 'login'" class="text-gray-400 text-sm" @click="switchMode('register')">激活新节点 (注册)</text>
        <text v-if="mode === 'login'" class="text-gray-400 text-sm" @click="switchMode('forgot')">密钥重置 (忘记密码)</text>
      </view>
    </view>

    <!-- 隐藏的开发者免密入口 -->
    <view class="dev-entry pb-bottom px-6 flex justify-center mt-10" @longpress="devLogin">
        <text class="dev-text opacity-10">长按此处 激活最高权限 (Dev Only)</text>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'

const mode = ref('login') // 'login', 'register', 'forgot'

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
  if (mode.value === 'login') return '身份覆写 (OVERRIDE)'
  if (mode.value === 'register') return '节点注册 (REGISTER)'
  return '协议重置 (RESET)'
})

const btnText = computed(() => {
  if (mode.value === 'login') return '接入矩阵 (LOGIN)'
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
})

const switchMode = (newMode) => {
  mode.value = newMode
  form.account = ''
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
        // 登录成功，保存 token 并跳转
        uni.setStorageSync('uni_id_token', res.result.token)
        uni.setStorageSync('uni_id_token_expired', res.result.tokenExpired)
        uni.setStorageSync('uid', res.result.uid)
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
      // 忘记密码预留，目前后还没写忘记密码的逻辑，先弹个提示并假装成功
      setTimeout(() => {
        uni.hideLoading()
        uni.showToast({ title: '重置成功(模拟)，请登录', icon: 'none' })
        switchMode('login')
      }, 1000)
    }
  } catch (e) {
    uni.hideLoading()
    console.error(e)
    uni.showToast({ title: '网络请求失败', icon: 'none' })
    generateCaptcha()
  }
}

// [特殊] 开发者免密一键登入
const devLogin = () => {
    uni.showModal({
        title: 'ROOT 权限确认',
        content: '跳过所有鉴权限制，以开发者身份进入系统？',
        confirmColor: '#00e5ff',
        success: (res) => {
            if (res.confirm) {
                storeFakeTokenAndRedirect()
            }
        }
    })
}

// 登录成功后的公共跳转逻辑
const storeFakeTokenAndRedirect = () => {
    uni.setStorageSync('uni_id_token', 'fake_token_for_dev_' + Date.now())
    uni.setStorageSync('uni_id_token_expired', Date.now() + 7200000)
    uni.showToast({ title: '接入成功', icon: 'success' })
    setTimeout(() => {
        const baseline = uni.getStorageSync('neuro_baseline')
        if (!baseline) {
            uni.redirectTo({ url: '/pages/onboarding/index' })
        } else {
            uni.switchTab({ url: '/pages/dashboard/index' })
        }
    }, 1000)
}
</script>

<style lang="scss" scoped>
.login-container {
  min-height: 100vh;
  background-color: #09090b;
  color: #fff;
}
.pt-10 { padding-top: 40px; }
.mt-10 { margin-top: 40px; }
.px-6 { padding: 0 24px; }
.mb-6 { margin-bottom: 24px; }
.mb-8 { margin-bottom: 32px; }
.flex { display: flex; }
.flex-col { display: flex; flex-direction: column; }
.flex-1 { flex: 1; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.justify-center { justify-content: center; }
.ml-3 { margin-left: 12px; }
.mt-2 { margin-top: 8px; }
.mt-6 { margin-top: 24px; }
.block { display: block; }
.px-2 { padding: 0 8px; }
.opacity-10 { opacity: 0.1; transition: opacity 0.3s; }
.opacity-10:active { opacity: 0.8; }
.pb-bottom { padding-bottom: max(30px, env(safe-area-inset-bottom)); }

.title { font-size: 28px; font-weight: 900; color: #fafafa; letter-spacing: 2px; text-shadow: 0 0 20px rgba(0, 229, 255, 0.3);}
.subtitle { font-size: 14px; color: #a1a1aa; letter-spacing: 1px;}
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
  border-color: #10b981;
}
.input-field { font-size: 16px; color: #fff; height: 100%;}
.text-gray-400 { color: #9ca3af; }
.text-sm { font-size: 14px; }

.btn-code {
  background: rgba(0, 229, 255, 0.1); border: 1px solid rgba(0, 229, 255, 0.3);
  padding: 6px 12px; border-radius: 6px;
  white-space: nowrap;
}
.btn-code.disabled { background: rgba(255,255,255,0.05); border-color: transparent;}
.btn-code-text { font-size: 12px; color: #00e5ff; font-weight: bold;}
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
  color: #10b981;
  font-weight: 900;
  letter-spacing: 3px;
  font-family: monospace;
  display: inline-block;
}

.btn-login {
  height: 56px;
  background: linear-gradient(135deg, #00C6FF 0%, #0072FF 100%);
  border-radius: 28px;
  box-shadow: 0 8px 24px rgba(0, 114, 255, 0.3);
}
.btn-text { color: #fff; font-size: 16px; font-weight: 900; letter-spacing: 2px;}

.btn-hover { transform: scale(0.96); opacity: 0.9;}

.dev-text { font-size: 12px; color: #fff; text-shadow: 0 0 5px #fff;}
</style>
