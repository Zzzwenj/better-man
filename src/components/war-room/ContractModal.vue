<template>
  <!--
    双层结构：
    - mask-bg: 全屏背景层，负责点击关闭，与内容平级
    - modal-content: 内容层，父链上无任何 @click/@tap 拦截，input 可正常聚焦
  -->
  <view class="modal-mask flex items-center justify-center fade-in" v-if="show">
    <!-- 蒙层背景：单独负责点击关闭，不作为 input 的祖先节点 -->
    <view class="mask-bg" @click="closeModal"></view>
    <!-- 内容层：不再包在任何有事件拦截的父层里 -->
    <view class="modal-content pop-in flex-col">
      <view class="modal-header flex justify-between items-center pb-3">
        <text class="modal-title">🛡️ 部署斯巴达小队</text>
        <text class="close-btn" @click="closeModal">✕</text>
      </view>
      
      <view class="modal-body py-4">

        <view class="form-group mb-4">
          <text class="label">目标天数 (Days)</text>
          <view class="flex items-center space-x-2">
            <view class="day-btn" :class="{ active: form.days === 7 }" @click="form.days = 7">7天</view>
            <view class="day-btn" :class="{ active: form.days === 21 }" @click="form.days = 21">21天</view>
            <view class="day-btn" :class="{ active: form.days === 30 }" @click="form.days = 30">30天</view>
            <view class="day-btn" :class="{ active: form.days === 90 }" @click="form.days = 90">90天</view>
          </view>
        </view>

        <view class="form-group mb-4">
          <text class="label">小队连坐惩罚条款 (不可修改)</text>
          <view class="styled-input text-red text-center font-bold" style="background: rgba(239, 68, 68, 0.1); border-color: rgba(239, 68, 68, 0.3);">
             一人破戒 · 全队倒退 20% 进度
          </view>
          <text class="hint-text mt-2 text-xs block text-center">⚠️ 任何队员防线崩溃，全队将立即锁屏并接受物理级强制干预</text>
        </view>
        
        <view class="form-group mb-2">
          <text class="label">最大招募人数</text>
          <view class="flex items-center space-x-2">
            <view 
              v-for="num in rangeArray" 
              :key="num" 
              class="day-btn" 
              :class="{ active: form.maxUsers === num }" 
              @click="form.maxUsers = num"
            >
              {{ num }}
            </view>
          </view>
          <text class="hint-text mt-1 text-xs block">招募战友越多，平摊生存概率越高</text>
        </view>

        <view class="form-group mb-4">
          <text class="label">征召时限 (过期自动解散)</text>
          <view class="flex items-center space-x-2">
            <view class="day-btn" :class="{ active: form.recruitDeadline === 1 }" @click="form.recruitDeadline = 1">1小时</view>
            <view class="day-btn" :class="{ active: form.recruitDeadline === 6 }" @click="form.recruitDeadline = 6">6小时</view>
            <view class="day-btn" :class="{ active: form.recruitDeadline === 12 }" @click="form.recruitDeadline = 12">12小时</view>
            <view class="day-btn" :class="{ active: form.recruitDeadline === 24 }" @click="form.recruitDeadline = 24">24小时</view>
          </view>
          <text class="hint-text mt-1 text-xs block">⏰ 若在此时限内未满员，对决将失效并退回保密金</text>
        </view>
      </view><!-- /modal-body -->

      <view class="modal-footer pt-3 flex justify-center items-center">
        <view class="confirm-btn" @click="submitContract" style="width: 100%; text-align: center;">
          <text class="btn-text">发布招募信标</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
/**
 * @component ContractModal
 * @description 战区(破釜沉舟契约)模块弹出层组件，用于签署对战契约或选择匹配模式。
 * 2026 优化：全自定义 UI 替代原生 Picker 以保证视觉统一性。
 */

import { reactive, computed } from 'vue'

const props = defineProps({
  show: { type: Boolean, default: false }
})

const emit = defineEmits(['update:show', 'confirm'])

const rangeArray = [2, 3, 4, 5]

const closeModal = () => {
  emit('update:show', false)
}

const form = reactive({
  days: 21,
  maxUsers: 3,
  recruitDeadline: 6
})

const submitContract = () => {
  emit('confirm', { ...form, deposit: 0 })
  closeModal()
}
</script>

<style scoped>
.modal-mask {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}
/* 蒙层背景：绝对定位，与内容层平级，专职处理点击关闭 */
.mask-bg {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
}
.modal-content {
  width: 85%;
  max-width: 340px;
  background: #18181b;
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5), inset 0 0 20px rgba(239, 68, 68, 0.05);
  position: relative; /* 层叠上下文，确保在 mask-bg 之上 */
  z-index: 1;
}
.modal-header { border-bottom: 1px solid rgba(255, 255, 255, 0.05); }
.modal-title { font-size: 18px; font-weight: 900; color: #ef4444; letter-spacing: 1px; }
.close-btn { color: #52525b; font-size: 20px; padding: 4px; }
.modal-body { width: 100%; box-sizing: border-box; }
.label { font-size: 13px; color: #a1a1aa; margin-bottom: 8px; display: block; }
.styled-input {
  background: #09090b;
  border: 1px solid #3f3f46;
  border-radius: 8px;
  padding: 10px 14px;
  color: #fff;
  font-size: 14px;
  width: 100%;
  box-sizing: border-box;
}
.styled-input:focus { border-color: #ef4444; }
.space-x-2 { display: flex; gap: 8px; flex-wrap: wrap; }
.day-btn {
  flex: 1;
  min-width: 50px;
  text-align: center;
  padding: 8px 0;
  background: #09090b;
  border: 1px solid #3f3f46;
  border-radius: 8px;
  color: #a1a1aa;
  font-size: 13px;
  transition: all 0.2s;
}
.day-btn.active {
  background: rgba(239, 68, 68, 0.1);
  border-color: #ef4444;
  color: #ef4444;
  font-weight: bold;
}
.hint-text { color: #f59e0b; }

.modal-footer { border-top: 1px solid rgba(255, 255, 255, 0.05); }
.pool-label { font-size: 11px; color: #a1a1aa; }
.pool-value { font-size: 16px; font-weight: bold; color: #facc15; font-family: monospace; }
.confirm-btn {
  background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
  padding: 10px 24px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}
.confirm-btn:active { transform: scale(0.95); }
.btn-text { color: #fff; font-size: 14px; font-weight: bold; letter-spacing: 1px; }

.flex { display: flex; }
.flex-col { display: flex; flex-direction: column; }
.justify-between { justify-content: space-between; }
.items-center { align-items: center; }
.mb-4 { margin-bottom: 16px; }
.mb-2 { margin-bottom: 8px; }
.mt-1 { margin-top: 4px; }
.pb-3 { padding-bottom: 12px; }
.pt-3 { padding-top: 12px; }
.py-4 { padding-top: 16px; padding-bottom: 16px; }
.block { display: block; }
.text-xs { font-size: 12px; }

.fade-in { animation: fadeIn 0.3s forwards; }
.pop-in { animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes popIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
</style>
