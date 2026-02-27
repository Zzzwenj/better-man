<template>
  <view class="login-container flex-col">
    <view class="header pt-10 px-6">
      <text class="title block">身份覆写 (OVERRIDE)</text>
      <text class="subtitle block mt-2">Dopamine Reset 档案库接入</text>
    </view>

    <view class="auth-box flex-1 px-6 mt-10">
      <!-- 手机号登录/注册 -->
      <view class="input-group mb-6">
        <text class="label">神经元溯源 ID (手机号)</text>
        <view class="input-wrapper flex items-center mt-2">
          <text class="prefix text-gray-400">+86</text>
          <input class="input-field flex-1 ml-3" type="number" v-model="mobile" placeholder="输入手机号" maxlength="11" />
        </view>
      </view>

      <view class="input-group mb-8">
        <text class="label">安全验证码</text>
        <view class="input-wrapper flex items-center justify-between mt-2">
          <input class="input-field flex-1" type="number" v-model="code" placeholder="输入验证码" maxlength="6" />
          <view class="btn-code" :class="{ disabled: countdown > 0 }" @click="sendSmsCode">
            <text class="btn-code-text">{{ countdown > 0 ? `${countdown}s 后重试` : '获取指令' }}</text>
          </view>
        </view>
      </view>

      <view class="btn-login flex items-center justify-center" hover-class="btn-hover" @click="loginWithSms">
        <text class="btn-text">接入矩阵 (LOGIN)</text>
      </view>

      <!-- 第三方一键登录 -->
      <view class="oauth-section mt-10 flex-col items-center">
        <text class="divider-text text-gray-500 text-sm mb-6">— 或使用其他外部协议 —</text>
        <view class="oauth-buttons flex justify-center gap-6">
          <view class="oauth-btn wx-btn flex items-center justify-center" hover-class="icon-hover" @click="loginWithWeChat">
            <text class="icon-text">WX</text>
          </view>
          <view class="oauth-btn qq-btn flex items-center justify-center" hover-class="icon-hover" @click="loginWithQQ">
            <text class="icon-text">QQ</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 隐藏的开发者免密入口 -->
    <view class="dev-entry pb-bottom px-6 flex justify-center mt-10" @longpress="devLogin">
        <text class="dev-text opacity-10">长按此处 激活最高权限 (Dev Only)</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

const mobile = ref('')
const code = ref('')
const countdown = ref(0)
let timer = null

// [模拟] 发送短信验证码
const sendSmsCode = () => {
  if (mobile.value.length !== 11) {
    uni.showToast({ title: '手机号格式错误', icon: 'none' })
    return
  }
  if (countdown.value > 0) return

  uni.showLoading({ title: '请求下发...' })
  // TODO: 后续对接真实的 uniCloud 短信下发云函数
  setTimeout(() => {
    uni.hideLoading()
    uni.showToast({ title: '动态指令已发送 (模拟 123456)', icon: 'none' })
    countdown.value = 60
    timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) clearInterval(timer)
    }, 1000)
  }, 1000)
}

// [模拟] 手机号登录
const loginWithSms = () => {
  if (mobile.value.length !== 11 || !code.value) {
    uni.showToast({ title: '完整输入参数', icon: 'none' })
    return
  }
  uni.showLoading({ title: '验证身份中...' })
  // TODO: 后续对接真实的 uniCloud 登录云函数 (uni-id-co)
  setTimeout(() => {
    uni.hideLoading()
    storeFakeTokenAndRedirect()
  }, 1500)
}

// [预留] 微信/QQ 登录
const loginWithWeChat = () => {
    uni.showToast({ title: '微信协议暂未对接 AppID', icon: 'none' })
}
const loginWithQQ = () => {
    uni.showToast({ title: 'QQ协议暂未对接 AppID', icon: 'none' })
}

// [特殊] 开发者免密一键登入
const devLogin = () => {
    uni.showModal({
        title: 'ROOT 权限确认',
        content: '跳过所有鉴权限制，以开发者身份进入系统？',
        confirmColor: '#10b981',
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
        // 重定向回主图
        uni.switchTab({ url: '/pages/dashboard/index' })
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
.block { display: block; }
.gap-6 { gap: 24px; }
.opacity-10 { opacity: 0.1; transition: opacity 0.3s; }
.opacity-10:active { opacity: 0.8; }
.pb-bottom { padding-bottom: max(30px, env(safe-area-inset-bottom)); }

.title { font-size: 28px; font-weight: 900; color: #10b981; letter-spacing: 2px;}
.subtitle { font-size: 14px; color: #a1a1aa; letter-spacing: 1px;}
.label { font-size: 13px; color: #a1a1aa; font-family: monospace;}

.input-wrapper {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  height: 56px;
  padding: 0 16px;
}
.input-field { font-size: 16px; color: #fff; height: 100%;}
.text-gray-400 { color: #9ca3af; }
.text-gray-500 { color: #6b7280; }

.btn-code {
  background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3);
  padding: 6px 12px; border-radius: 6px;
}
.btn-code.disabled { background: rgba(255,255,255,0.05); border-color: transparent;}
.btn-code-text { font-size: 12px; color: #10b981; font-weight: bold;}
.btn-code.disabled .btn-code-text { color: #6b7280; }

.btn-login {
  height: 56px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 28px;
  box-shadow: 0 10px 20px rgba(16, 185, 129, 0.2);
}
.btn-text { color: #000; font-size: 16px; font-weight: 900; letter-spacing: 2px;}

.oauth-btn {
  width: 50px; height: 50px; border-radius: 25px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
}
.icon-text { font-size: 14px; font-weight: bold; color: #a1a1aa;}

.icon-hover, .btn-hover { transform: scale(0.96); opacity: 0.9;}

.dev-text { font-size: 12px; color: #fff; text-shadow: 0 0 5px #fff;}
</style>
