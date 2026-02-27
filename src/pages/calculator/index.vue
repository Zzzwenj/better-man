<template>
  <view class="calc-container">
    <!-- 顶部显示屏 -->
    <view class="display-area">
      <text class="equation">{{ equation }}</text>
      <text class="result">{{ current }}</text>
    </view>
    
    <!-- 按键区 -->
    <view class="keypad">
      <!-- 横列 1 -->
      <view class="btn action" hover-class="btn-hover" @click="clear">AC</view>
      <view class="btn action" hover-class="btn-hover" @click="del">DEL</view>
      <view class="btn action" hover-class="btn-hover" @click="append('%')">%</view>
      <view class="btn operator" hover-class="op-hover" @click="append('/')">÷</view>
      
      <!-- 横列 2 -->
      <view class="btn number" hover-class="btn-hover" @click="append('7')">7</view>
      <view class="btn number" hover-class="btn-hover" @click="append('8')">8</view>
      <view class="btn number" hover-class="btn-hover" @click="append('9')">9</view>
      <view class="btn operator" hover-class="op-hover" @click="append('*')">×</view>
      
      <!-- 横列 3 -->
      <view class="btn number" hover-class="btn-hover" @click="append('4')">4</view>
      <view class="btn number" hover-class="btn-hover" @click="append('5')">5</view>
      <view class="btn number" hover-class="btn-hover" @click="append('6')">6</view>
      <view class="btn operator" hover-class="op-hover" @click="append('-')">-</view>
      
      <!-- 横列 4 -->
      <view class="btn number" hover-class="btn-hover" @click="append('1')">1</view>
      <view class="btn number" hover-class="btn-hover" @click="append('2')">2</view>
      <view class="btn number" hover-class="btn-hover" @click="append('3')">3</view>
      <view class="btn operator" hover-class="op-hover" @click="append('+')">+</view>
      
      <!-- 横列 5 -->
      <view class="btn zero number" hover-class="btn-hover" @click="append('0')">0</view>
      <view class="btn number" hover-class="btn-hover" @click="append('.')">.</view>
      <view class="btn operator" hover-class="op-hover" @click="calculate">=</view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

const current = ref('0')
const equation = ref('')

// 【核心暗门逻辑】 
// 特工代码: 输入 8972 并按下 = 号，将直接劫持进入真实的 App 内部
const STEALTH_CODE = '8972'

const append = (val) => {
  if (current.value === '0' && val !== '.') {
    current.value = val
  } else {
    current.value += val
  }
}

const clear = () => {
  current.value = '0'
  equation.value = ''
}

const del = () => {
  if (current.value.length > 1) {
    current.value = current.value.slice(0, -1)
  } else {
    current.value = '0'
  }
}

const calculate = () => {
  // 拦截层: 暗网密令判定
  if (current.value === STEALTH_CODE) {
    uni.vibrateLong() // 震动反馈，表示密令被识别
    uni.showLoading({ title: '连接神经网络...' }) // 故意营造黑客氛围
    setTimeout(() => {
        uni.hideLoading()
        // 核心跳转逻辑：检查是否做过基线评估
        const baseline = uni.getStorageSync('neuro_baseline')
        if (baseline) {
            uni.switchTab({ url: '/pages/dashboard/index' })
        } else {
            uni.redirectTo({ url: '/pages/onboarding/index' })
        }
    }, 1200)
    return
  }

  // 普通计算器逻辑
  try {
    equation.value = current.value + '='
    // 注意: eval在生产环境中有安全隐患，此处仅为一个简单的拟态计算器原型实现
    // 实际项目中可以引入专业的 math.js 或使用安全的算术解析器
    let result = eval(current.value.replace('×', '*').replace('÷', '/'))
    
    // 处理精度溢出
    if (result.toString().length > 10) {
      result = parseFloat(result.toPrecision(10))
    }
    current.value = result.toString()
  } catch (e) {
    current.value = 'Error'
  }
}
</script>

<style lang="scss" scoped>
/* 整个容器高度撑满，绝对的纯黑背景，没有任何破绽 */
.calc-container {
  height: 100vh;
  background-color: #000;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

/* 顶部显示屏尽可能的克制、干净 */
.display-area {
  padding: 40px 20px 20px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: flex-end;
  min-height: 200px;
}
.equation {
  font-size: 24px;
  color: #a1a1aa;
  margin-bottom: 10px;
}
.result {
  font-size: 72px;
  color: #fff;
  font-weight: 300;
  word-break: break-all;
  line-height: 1.1;
}

/* 按键区采用经典的 iOS 风格网格 */
.keypad {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  padding: 20px;
  padding-bottom: max(30px, env(safe-area-inset-bottom));
}

.btn {
  height: 80px;
  border-radius: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 32px;
  font-weight: normal;
  transition: all 0.1s;
}

.zero {
  grid-column: span 2;
  border-radius: 40px;
  justify-content: flex-start;
  padding-left: 30px;
}

/* 深灰色数字键 */
.number {
  background-color: #333;
  color: #fff;
}
/* 浅灰色动作键 */
.action {
  background-color: #a5a5a5;
  color: #000;
}
/* 橙色操作键 */
.operator {
  background-color: #ff9f0a;
  color: #fff;
}

/* 按钮点击反馈 */
.btn-hover {
  opacity: 0.7;
}
.op-hover {
  background-color: #f08c00;
}
</style>
