<template>
  <view class="badge-item" 
        :class="[statusClass, { 'is-clickable': status === 'unlocked' }]"
        @click="onClick">
        
      <view class="flex-col items-center">
          <view class="badge-icon-wrapper">
              
              <!-- 充能态：SVG 环形呼吸进度条 -->
              <svg v-if="status === 'progress'" class="progress-ring" viewBox="0 0 60 60">
                  <circle class="ring-bg" cx="30" cy="30" r="28" />
                  <circle 
                    class="ring-fill" 
                    cx="30" cy="30" r="28" 
                    :stroke-dasharray="175" 
                    :stroke-dashoffset="175 - (175 * progress)" 
                  />
              </svg>
              
              <!-- 核心徽章图标区 -->
              <view class="badge-icon">
                <text class="icon-text">{{ badge.icon }}</text>
              </view>
              
              <!-- 爆发态：解锁后的弥散光效与底部投射 -->
              <view class="glow-effect" v-if="status === 'unlocked'"></view>
          </view>
          
          <text class="badge-day">{{ badge.day }} 天</text>
          <text class="badge-name">{{ badge.name }}</text>
          
          <!-- 进度提示文字 (仅充能态显示) -->
          <text class="badge-progress" v-if="status === 'progress'">
              {{ currentDays }} / {{ badge.day }}
          </text>
      </view>
  </view>
</template>

<script setup>
/**
 * @component NeuroBadge
 * @description 神经元徽章组件，展示用户在不同成就阶段解锁的徽章状态及解锁条件。
 */

import { computed } from 'vue'

const props = defineProps({
  badge: {
    type: Object,
    required: true
  },
  // 'locked' | 'progress' | 'unlocked'
  status: {
    type: String,
    default: 'locked'
  },
  // 0 - 1
  progress: {
    type: Number,
    default: 0
  },
  currentDays: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['clickBadge'])

const statusClass = computed(() => {
  return `status-${props.status}`
})

const onClick = () => {
  emit('clickBadge', props.badge, props.status)
}
</script>

<style lang="scss" scoped>
/* 
  高内聚徽章组件样式：
  必须使用 flex-shrink: 0 极其关键，防止在外层横向 scroll-view 中被挤压变形。
*/
.badge-item {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    width: 72px; /* 固定跨度 */
    margin-right: 20px;
    flex-shrink: 0; 
    transition: all 0.5s cubic-bezier(0.25, 1, 0.5, 1);
    position: relative;
    padding-top: 8px;
    vertical-align: top;
}
.flex-col { display: flex; flex-direction: column; }
.items-center { align-items: center; }

.badge-icon-wrapper {
    position: relative;
    width: 60px; height: 60px;
    display: flex; justify-content: center; align-items: center;
    margin-bottom: 8px;
}

/* 基础图标：生铁/未激活质感 */
.badge-icon {
    width: 52px; height: 52px;
    background: linear-gradient(145deg, #121214, #18181b); 
    border: 1px solid #27272a;
    border-radius: 26px;
    display: flex; align-items: center; justify-content: center;
    box-shadow: inset 0 2px 4px rgba(255,255,255,0.02), 0 4px 6px rgba(0,0,0,0.8);
    transition: all 0.6s ease;
    z-index: 2;
    overflow: hidden;
}
.icon-text {
    font-size: 24px;
    color: #3f3f46; /* 暗淡无光 */
    transition: all 0.6s ease;
}

/* 基础文字 */
.badge-day { font-size: 11px; color: #52525b; font-family: monospace; font-weight: 900; transition: color 0.3s; }
.badge-name { font-size: 12px; color: #52525b; font-weight: bold; margin-top: 4px; letter-spacing: 1px; transition: color 0.3s;}
.badge-progress { 
    font-size: 9px; color: #a1a1aa; font-family: monospace; 
    margin-top: 6px; background: rgba(39, 39, 42, 0.8); 
    border: 1px solid var(--theme-shadow-primary);
    padding: 2px 6px; border-radius: 8px;
}

/* =========================================
   状态 1: 沉睡态 (Locked)
   ========================================= */
.status-locked {
    filter: grayscale(100%) opacity(0.4) blur(0.5px);
    transform: scale(0.9);
}
.status-locked .badge-icon {
    box-shadow: inset 0 4px 15px rgba(0,0,0,0.9);
    border-color: #18181b;
}


/* =========================================
   状态 2: 充能态 (Progress) 
   ========================================= */
.status-progress {
    transform: scale(1.05);
}
.status-progress .badge-icon {
    border-color: var(--theme-shadow-primary);
    background: linear-gradient(145deg, #18181b, #0f172a); 
    box-shadow: 0 0 15px var(--theme-shadow-primary), inset 0 0 8px var(--theme-bg-highlight);
}
.status-progress .icon-text {
    color: var(--theme-primary);
    text-shadow: 0 0 8px var(--theme-shadow-primary);
    animation: icon-pulse 2s infinite alternate;
}
.status-progress .badge-day { color: var(--theme-primary); opacity: 0.8; }
.status-progress .badge-name { color: #e4e4e7; opacity: 0.9; }

/* SVG 进度条环绕机制 */
.progress-ring {
    position: absolute;
    top: 0; left: 0;
    width: 60px; height: 60px;
    transform: rotate(-90deg);
    z-index: 3;
    animation: ring-breathe 3s ease-in-out infinite alternate;
}
.ring-bg { fill: none; stroke: rgba(39, 39, 42, 0.5); stroke-width: 2; }
.ring-fill {
    fill: none;
    stroke: var(--theme-primary);
    stroke-width: 2.5;
    stroke-linecap: round;
    transition: stroke-dashoffset 1.5s cubic-bezier(0.25, 1, 0.5, 1);
    filter: drop-shadow(0 0 4px var(--theme-shadow-primary));
}

@keyframes ring-breathe {
    0% { transform: rotate(-90deg) scale(0.98); opacity: 0.8; }
    100% { transform: rotate(-90deg) scale(1.02); opacity: 1; filter: drop-shadow(0 0 6px var(--theme-primary)); }
}
@keyframes icon-pulse {
    0% { opacity: 0.6; transform: scale(0.95); }
    100% { opacity: 1; transform: scale(1.05); }
}

/* =========================================
   状态 3: 爆发态/已解锁 (Unlocked) 
   ========================================= */
.status-unlocked {
    transform: translateY(-6px);
    animation: float-super 4s ease-in-out infinite;
}
.status-unlocked .badge-icon {
    border-color: var(--theme-primary);
    /* 强烈的玻璃高光切割感 */
    background: linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, var(--theme-shadow-primary) 100%);
    box-shadow: 
        0 10px 20px rgba(0, 0, 0, 0.8), /* 底部深阴影拔高体积感 */
        0 0 20px var(--theme-shadow-primary), /* 中层颜色辐射 */
        inset 0 2px 2px rgba(255, 255, 255, 0.3), /* 顶部玻璃高光 */
        inset 0 -4px 10px var(--theme-shadow-primary); /* 底部内反射光 */
    color: #fff;
}
.status-unlocked .icon-text {
    color: #fff;
    text-shadow: 0 0 15px rgba(255, 255, 255, 0.8), 0 0 30px var(--theme-primary);
}
/* 解锁后的外溢流光特效 */
.glow-effect {
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    width: 60px; height: 60px;
    background: radial-gradient(circle, var(--theme-bg-highlight) 0%, transparent 70%);
    border-radius: 50%;
    z-index: 1;
    animation: slow-glow 3s infinite alternate;
    mix-blend-mode: screen; /* 赛博朋克融合光核心属性 */
}
.status-unlocked .badge-day { color: var(--theme-primary); text-shadow: 0 0 8px var(--theme-shadow-primary); }
.status-unlocked .badge-name { color: #f4f4f5; text-shadow: 0 0 4px rgba(255, 255, 255, 0.2); }

@keyframes float-super {
    0%, 100% { transform: translateY(-6px); }
    50% { transform: translateY(-12px); }
}
@keyframes slow-glow {
    0% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
    100% { transform: translate(-50%, -50%) scale(1.3); opacity: 1; }
}

.is-clickable {
    cursor: pointer;
}
.is-clickable:active .badge-icon {
    transform: scale(0.92);
    box-shadow: 0 0 10px var(--theme-shadow-primary);
}
</style>
