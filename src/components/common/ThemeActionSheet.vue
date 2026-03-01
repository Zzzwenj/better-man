<template>
  <view class="cyber-action-sheet" v-if="show" @click.stop="close">
    <view class="panel-container" @click.stop="() => {}" :class="{ 'panel-up': show }">
      <!-- Decorator lines -->
      <view class="panel-deco-top"></view>
      
      <view class="panel-header flex justify-between items-center px-4 pt-4 pb-2">
        <text class="panel-title">系统视觉协议覆盖</text>
        <text class="close-btn" @click.stop="close">✕</text>
      </view>
      
      <scroll-view scroll-y class="preset-list pb-bottom">
        <view class="custom-color-container mt-2 px-4">
          
          <!-- 分区 1: 赛博觉醒 (高亮霓虹) -->
          <text class="custom-title block mb-3 mt-4">赛博觉醒 (高饱和霓虹)</text>
          <view class="color-palette-grid">
            <view 
              v-for="color in cyberColors" 
              :key="color"
              class="palette-color-block"
              :style="{ backgroundColor: color, boxShadow: customColorInput === color ? `0 0 12px ${color}` : 'none', border: customColorInput === color ? '2px solid #fff' : '2px solid transparent' }"
              @click.stop="applyCustomColor(color)"
            >
               <text v-if="customColorInput === color" class="check-mark">✓</text>
            </view>
          </view>
          
          <!-- 分区 2: 深空潜行 (暗调冷俊) -->
          <text class="custom-title block mb-3 mt-8">深空潜行 (暗黑冷调)</text>
          <view class="color-palette-grid">
            <view 
              v-for="color in darkColors" 
              :key="color"
              class="palette-color-block"
              :style="{ backgroundColor: color, boxShadow: customColorInput === color ? `0 0 12px ${color}` : 'none', border: customColorInput === color ? '2px solid #fff' : '2px solid transparent' }"
              @click.stop="applyCustomColor(color)"
            >
               <text v-if="customColorInput === color" class="check-mark">✓</text>
            </view>
          </view>

          <!-- 分区 3: 神经舒缓 (莫兰迪/护眼系) -->
          <text class="custom-title block mb-3 mt-8">神经舒缓 (莫兰迪护眼)</text>
          <view class="color-palette-grid">
            <view 
              v-for="color in softColors" 
              :key="color"
              class="palette-color-block"
              :style="{ backgroundColor: color, boxShadow: customColorInput === color ? `0 0 12px ${color}` : 'none', border: customColorInput === color ? '2px solid #fff' : '2px solid transparent' }"
              @click.stop="applyCustomColor(color)"
            >
               <text v-if="customColorInput === color" class="check-mark">✓</text>
            </view>
          </view>
          
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup>
/**
 * @component ThemeActionSheet
 * @description 全局主题控制弹窗组件，供用户选择不同风格的赛博朋克主题配色(如霓虹红、黑客绿等)。
 */

import { ref, watch, computed } from 'vue'
import { useThemeStore } from '../../store/theme.js'

const props = defineProps({
  show: Boolean,
  themes: Array,
  currentTheme: String
})

const emit = defineEmits(['close', 'select'])
const themeStore = useThemeStore()
const customColorInput = ref((themeStore.currentTheme === 'custom') ? themeStore.customColor : '')

// 分区 1: 高饱和度赛博色 (12色)
const cyberColors = [
  '#00e5ff', '#00ffaa', '#39ff14', '#ccff00', 
  '#ffd700', '#ff6600', '#ff2a2a', '#ff007f', 
  '#ff00ff', '#b500ff', '#7000ff', '#0088ff'
]

// 分区 2: 暗调深色系 (12色)
const darkColors = [
  '#0ea5e9', '#14b8a6', '#10b981', '#84cc16', 
  '#eab308', '#f97316', '#ef4444', '#f43f5e', 
  '#d946ef', '#a855f7', '#8b5cf6', '#6366f1'
]

// 分区 3: 莫兰迪低对比护眼系 (12色)
const softColors = [
  '#7dd3fc', '#5eead4', '#6ee7b7', '#d9f99d', 
  '#fde047', '#fdba74', '#fca5a5', '#fda4af', 
  '#f0abfc', '#d8b4fe', '#c4b5fd', '#a5b4fc'
]

const close = () => {
  emit('close')
}

const applyCustomColor = (color) => {
  customColorInput.value = color
  themeStore.setCustomColor(color)
  emit('select', 'custom') // 同步向上抛出事件以触发页面更新绑定
  setTimeout(() => { close() }, 200)
}
</script>

<style lang="scss" scoped>
.cyber-action-sheet {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.panel-container {
  background: #121212;
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.5);
  transform: translateY(100%);
  transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  position: relative;
  overflow: hidden;
}

.panel-up { transform: translateY(0); }

.panel-deco-top {
  position: absolute;
  top: 8px; left: 50%;
  transform: translateX(-50%);
  width: 40px; height: 4px;
  background-color: #3f3f46;
  border-radius: 2px;
}

.panel-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.panel-title { font-size: 16px; font-weight: bold; color: #f4f4f5; letter-spacing: 1px; }
.close-btn { font-size: 20px; color: #a1a1aa; padding: 10px;}

.preset-list {
  max-height: 60vh;
  padding-bottom: max(30px, env(safe-area-inset-bottom));
}

.theme-name { font-size: 16px; font-weight: 900; font-family: monospace; }
.theme-desc { font-size: 11px; color: #a1a1aa; }
.check-icon { font-size: 20px; font-weight: bold; }

.custom-title { font-size: 13px; color: #a1a1aa; border-left: 2px solid #3f3f46; padding-left: 8px;}

.color-palette-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;
  padding: 8px 0;
  width: 100%;
  box-sizing: border-box;
}

.palette-color-block {
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s, box-shadow 0.2s;
}

.palette-color-block:active {
  transform: scale(0.9);
}

.check-mark {
  color: #18181b;
  font-size: 16px;
  font-weight: 900;
  text-shadow: 0 0 2px rgba(255,255,255,0.5);
}

/* utils */
.block { display: block; }
.mb-2 { margin-bottom: 8px; }
.mb-3 { margin-bottom: 12px; }
.flex { display: flex; }
.flex-col { display: flex; flex-direction: column; }
.flex-1 { flex: 1; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.px-4 { padding-left: 16px; padding-right: 16px; box-sizing: border-box; width: 100%; }
.pt-4 { padding-top: 20px; }
.pb-2 { padding-bottom: 8px; }
.mt-1 { margin-top: 4px; }
.mt-2 { margin-top: 8px; }
.mt-3 { margin-top: 12px; }
.mt-4 { margin-top: 16px; }
.mt-8 { margin-top: 32px; }
.ml-3 { margin-left: 12px; }
</style>
