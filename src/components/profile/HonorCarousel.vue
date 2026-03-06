<template>
  <view class="honor-carousel mt-6 relative">
    <!-- 极光装饰 -->
    <view class="ambient-glow"></view>
    
    <view class="flex items-center justify-between px-4 mb-3">
      <view class="flex items-center">
         <view class="section-title-line mr-2"></view>
         <text class="section-title">神经元重塑资产</text>
      </view>
      <text class="more-text" hover-class="text-hover" @click="$emit('navigateToStore')">接入终端 ></text>
    </view>
    
    <scroll-view scroll-x class="scroll-view px-4" :show-scrollbar="false">
      <view class="flex pb-2">
         <!-- 当前正在启用的极光主题卡 -->
         <view class="asset-card active-theme flex-col mr-4">
           <view class="card-cover theme-cover relative overflow-hidden flex items-center justify-center">
              <view class="glitch-line"></view>
              <text class="cover-icon">⎈</text>
              <view class="badge equipped">IN USE</view>
           </view>
           <view class="mt-2 px-1 flex-col">
              <text class="asset-name">核心引擎：</text>
              <text class="asset-val">{{ currentThemeName }}</text>
           </view>
         </view>
         
         <!-- 已拥有的特殊物品 (动态渲染 ownedItems 字典) -->
         <template v-for="(expireTime, itemId) in ownedItems" :key="itemId">
            <view class="asset-card item-card flex-col mr-4" v-if="isValidItem(expireTime)">
              <view class="card-cover item-cover relative flex items-center justify-center">
                 <text class="cover-icon">{{ getItemIcon(itemId) }}</text>
                 <view class="badge" v-if="isEquipped(itemId)">EQUIPPED</view>
                 <view class="badge time" v-else>{{ getTimeLeft(expireTime) }}</view>
              </view>
              <view class="mt-2 px-1 flex-col">
                 <text class="asset-name">{{ getItemName(itemId) }}</text>
                 <text class="asset-val">{{ getItemType(itemId) }}</text>
              </view>
            </view>
         </template>

         <!-- 默认骨架槽位 -->
         <view class="asset-card empty-card flex-col" hover-class="card-hover" @click="$emit('navigateToStore')">
            <view class="card-cover empty-cover flex items-center justify-center">
               <text class="cover-icon add">+</text>
            </view>
            <view class="mt-2 px-1 flex-col items-center">
               <text class="asset-val" style="color: #71717a">拓展算力槽</text>
            </view>
         </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { serverTime } from '@/utils/serverTime.js'

const props = defineProps({
  currentThemeName: { type: String, default: '默认碳基' },
  ownedItems: { type: Object, default: () => ({}) },
  equippedItems: { type: Array, default: () => [] }
})

defineEmits(['navigateToStore'])

// 判断道具是否有效 (过期时间大于当前时间)
// 【修正防伪】：全部统一采用全球唯一的云端心跳
const isItemValid = (itemId) => {
    const expireTime = props.ownedItems[itemId]
    if (!expireTime) return false
    return expireTime > serverTime.now()
}

const isEquipped = (itemId) => {
    return props.equippedItems.includes(itemId)
}

const getItemDaysLeft = (itemId) => {
    const expireTime = props.ownedItems[itemId]
    if (!expireTime || !isItemValid(itemId)) return 0
    const diff = expireTime - serverTime.now()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

// 简易字典，实际应由源数据驱动，这里为了解耦做了轻量提取
const getItemName = (id) => {
    const map = {
        'theme_cyberpunk': '霓虹夜枭',
        'theme_matrix': '矩阵源代码',
        'theme_evangelion': '神经元暴走',
        'theme_dark_knight': '黑武士',
        'shield_01': '防波盾 I型',
        'shield_02': '力场护盾 β'
    }
    return map[id] || '未知资产'
}

const getItemType = (id) => {
    if (id.startsWith('theme_')) return '全息皮质'
    if (id.startsWith('shield_')) return '防御结界'
    return '消耗品'
}

const getItemIcon = (id) => {
    if (id.startsWith('theme_')) return '⎔'
    if (id.startsWith('shield_')) return '🛡️'
    return '✧'
}
</script>

<style lang="scss" scoped>
.honor-carousel { z-index: 10; padding-bottom: 20px;}
.px-4 { padding: 0 20px; }
.px-1 { padding: 0 4px; }
.mb-3 { margin-bottom: 12px; }
.mt-6 { margin-top: 24px; }
.mt-2 { margin-top: 8px; }
.mr-2 { margin-right: 8px; }
.mr-4 { margin-right: 16px; }
.pb-2 { padding-bottom: 8px; }

.flex { display: flex; }
.flex-col { display: flex; flex-direction: column; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.justify-center { justify-content: center; }
.relative { position: relative; }
.absolute { position: absolute; }
.overflow-hidden { overflow: hidden; }

.ambient-glow {
  position: absolute;
  top: 0; left: 0;
  width: 150px; height: 100px;
  background: radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%);
  pointer-events: none;
  z-index: -1;
}

.section-title-line { height: 14px; width: 3px; background: var(--theme-primary, #00e5ff); border-radius: 2px; box-shadow: 0 0 8px var(--theme-shadow-primary); }
.section-title { font-size: 15px; font-weight: 900; color: #f4f4f5; letter-spacing: 1px;}
.more-text { font-size: 12px; color: #71717a; font-family: monospace; font-weight: bold;}
.text-hover { color: var(--theme-primary, #00e5ff); }

.scroll-view {
  width: 100%;
  white-space: nowrap;
  box-sizing: border-box;
}

.asset-card {
  width: 100px;
  flex-shrink: 0;
  display: inline-flex;
}
.card-cover {
  width: 100px; height: 100px;
  border-radius: 16px;
  background: #18181b;
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  transition: all 0.3s;
}
.cover-icon { font-size: 32px; color: #52525b; text-shadow: 0 2px 10px rgba(0,0,0,0.5); }

.theme-cover { background: linear-gradient(135deg, rgba(8, 145, 178, 0.2) 0%, rgba(24, 24, 27, 0.8) 100%); border-color: rgba(0, 229, 255, 0.3); }
.theme-cover .cover-icon { color: var(--theme-primary, #00e5ff); text-shadow: 0 0 15px rgba(0, 229, 255, 0.4); }

.item-cover { background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(24, 24, 27, 0.8) 100%); border-color: rgba(139, 92, 246, 0.2);}
.item-cover .cover-icon { color: #8b5cf6; text-shadow: 0 0 15px rgba(139, 92, 246, 0.3);}

.empty-cover { border: 1px dashed rgba(255, 255, 255, 0.1); background: transparent; box-shadow: none;}
.empty-cover .cover-icon.add { font-size: 24px; color: #3f3f46; font-weight: 300;}

.card-hover .card-cover { border-color: var(--theme-primary, #00e5ff); background: rgba(0, 229, 255, 0.05); }
.card-hover .add { color: var(--theme-primary, #00e5ff); text-shadow: 0 0 10px rgba(0, 229, 255, 0.5);}

.badge { position: absolute; top: 6px; right: 6px; padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: 900; font-family: monospace; letter-spacing: 0.5px; backdrop-filter: blur(4px); }
.badge.equipped { background: rgba(0, 229, 255, 0.15); color: var(--theme-primary, #00e5ff); border: 1px solid rgba(0, 229, 255, 0.3); }
.badge.time { background: rgba(245, 158, 11, 0.15); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.3); }

.asset-name { font-size: 11px; color: #a1a1aa; font-family: monospace;}
.asset-val { font-size: 13px; font-weight: 900; color: #e4e4e7; margin-top: 2px;}

.active-theme .asset-val { color: var(--theme-primary, #00e5ff); text-shadow: 0 0 8px rgba(0, 229, 255, 0.2); }

/* Glitch Effect for active card */
.glitch-line {
  position: absolute;
  top: 0; left: 0; right: 0; height: 2px;
  background: var(--theme-primary, #00e5ff);
  opacity: 0.5;
  box-shadow: 0 0 10px var(--theme-shadow-primary);
  animation: scanline 3s linear infinite;
}
@keyframes scanline {
  0% { transform: translateY(-10px); opacity: 0; }
  10% { opacity: 0.5; }
  90% { opacity: 0.5; }
  100% { transform: translateY(110px); opacity: 0; }
}
</style>
