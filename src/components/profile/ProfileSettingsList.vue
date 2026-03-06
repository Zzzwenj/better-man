<template>
  <view class="settings-list mt-2 px-4">
    <!-- 视觉分界线 -->
    <view class="divider my-4 flex items-center justify-center">
      <view class="line flex-1"></view>
      <text class="divider-text mx-3">SYSTEM CONTROLS</text>
      <view class="line flex-1"></view>
    </view>
    
    <view class="list-group flex-col">
       <view class="list-item" hover-class="item-hover" @click="$emit('handleSettingClick', 'lock')">
          <view class="flex items-center">
             <view class="item-icon-wrap lock-icon"><text class="icon">⚿</text></view>
             <text class="item-title ml-3">隐私视界锁</text>
          </view>
          <view class="flex items-center">
             <text class="item-status mr-2" :class="{ 'active': privacyLockEnabled }">{{ privacyLockEnabled ? 'ACTIVE' : 'OFF' }}</text>
             <switch :checked="privacyLockEnabled" color="#00e5ff" style="transform:scale(0.7)" @change="e => $emit('togglePrivacyLock', e.detail.value)" @click.stop/>
          </view>
       </view>

       <view class="list-item" hover-class="item-hover" @click="$emit('handleSettingClick', 'theme')">
          <view class="flex items-center">
             <view class="item-icon-wrap theme-icon"><text class="icon">⌬</text></view>
             <text class="item-title ml-3">神经接入舱主题</text>
          </view>
          <text class="item-arrow">></text>
       </view>

       <view class="list-item" hover-class="item-hover" @click="$emit('handleSettingClick', 'article')">
          <view class="flex items-center">
             <view class="item-icon-wrap article-icon"><text class="icon">☷</text></view>
             <text class="item-title ml-3">突触知识库</text>
          </view>
          <text class="item-arrow">></text>
       </view>
       
       <view class="list-item" hover-class="item-hover" @click="$emit('handleSettingClick', 'video')">
          <view class="flex items-center">
             <view class="item-icon-wrap video-icon"><text class="icon">▶</text></view>
             <text class="item-title ml-3">重塑影像集</text>
          </view>
          <text class="item-arrow">></text>
       </view>

       <!-- 隐藏的信标输入（开发调试/彩蛋） -->
       <view class="list-item" hover-class="item-hover" @click.stop="$emit('handleSettingClick', 'beacon')">
          <view class="flex items-center">
             <view class="item-icon-wrap" style="background: rgba(255,255,255,0.02);"><text class="icon" style="color: #3f3f46">⌖</text></view>
             <text class="item-title ml-3" style="color: #52525b">输入信标坐标...</text>
          </view>
       </view>
    </view>

    <!-- 协议区 -->
    <view class="legal-links flex justify-center mt-6 mb-8">
       <text class="legal-text" @click="$emit('goToAgreement', 'terms')">服务协议</text>
       <text class="legal-divider mx-3">|</text>
       <text class="legal-text" @click="$emit('goToAgreement', 'privacy')">防线政策</text>
    </view>

    <!-- 危险操作区 -->
    <view class="danger-zone flex-col items-center mt-8 pb-8">
       <view class="btn-logout flex items-center justify-center mb-4" hover-class="btn-pressed" @click="$emit('handleSettingClick', 'logout')">
          <text class="logout-text">切断当前连接序列</text>
       </view>
       <text class="delete-account-text" @click="$emit('handleSettingClick', 'delete_account')">申请粉碎档案记录</text>
       
       <!-- 开发者后门清除入口：未来云端开关审查 -->
       <text class="mt-4" style="font-size: 10px; color: #3f3f46; font-family: monospace;" @click.stop="$emit('handleSettingClick', 'clear_cache')">SYS.CLEAR_CACHE()</text>
       
       <!-- 主理人绝密通道：视频弹药库手动装填 -->
       <text v-if="isSuperAdmin" class="mt-2" style="font-size: 10px; color: #10b981; font-family: monospace;" @click.stop="$emit('handleSettingClick', 'inject_video')">[+] SYS.INJECT_VIDEO()</text>

       <text class="mt-1" style="font-size: 10px; color: #3f3f46; font-family: monospace;">UUID: {{ deviceId }}</text>
    </view>
  </view>
</template>

<script setup>
defineProps({
  privacyLockEnabled: { type: Boolean, default: false },
  deviceId: { type: String, default: 'UNKNOWN' },
  isSuperAdmin: { type: Boolean, default: false } // 新增超级管理员标识传入
})

defineEmits(['handleSettingClick', 'togglePrivacyLock', 'goToAgreement'])
</script>

<style lang="scss" scoped>
.my-4 { margin-top: 16px; margin-bottom: 16px; }
.mt-2 { margin-top: 8px; }
.mt-4 { margin-top: 16px; }
.mt-6 { margin-top: 24px; }
.mt-8 { margin-top: 32px; }
.mb-4 { margin-bottom: 16px; }
.mb-8 { margin-bottom: 32px; }
.ml-3 { margin-left: 12px; }
.mr-2 { margin-right: 8px; }
.mx-3 { margin-left: 12px; margin-right: 12px; }
.px-4 { padding: 0 16px; }
.pb-8 { padding-bottom: 32px; }

.flex { display: flex; }
.flex-col { display: flex; flex-direction: column; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
.flex-1 { flex: 1; }

.divider { width: 100%; opacity: 0.8;}
.line { height: 1px; background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent); }
.divider-text { font-size: 10px; color: #52525b; font-family: monospace; letter-spacing: 2px; }

.list-group {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  overflow: hidden;
}
.list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
  transition: background 0.2s;
}
.list-item:last-child { border-bottom: none; }
.item-hover { background: rgba(255, 255, 255, 0.05); }

.item-icon-wrap {
  width: 32px; height: 32px;
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
}
.lock-icon { background: rgba(0, 229, 255, 0.1); }
.lock-icon .icon { color: var(--theme-primary, #00e5ff); }
.theme-icon { background: rgba(139, 92, 246, 0.1); }
.theme-icon .icon { color: #8b5cf6; }
.article-icon { background: rgba(16, 185, 129, 0.1); }
.article-icon .icon { color: #10b981; }
.video-icon { background: rgba(239, 68, 68, 0.1); }
.video-icon .icon { color: #ef4444; }

.icon { font-size: 16px; }
.item-title { font-size: 15px; color: #e4e4e7; font-weight: 500; }
.item-arrow { color: #52525b; font-size: 16px; font-weight: bold; }
.item-status { font-size: 11px; font-family: monospace; color: #52525b; font-weight: bold;}
.item-status.active { color: var(--theme-primary, #00e5ff); text-shadow: 0 0 8px rgba(0,229,255,0.4);}

.legal-links { opacity: 0.8; }
.legal-text { font-size: 12px; color: #71717a; text-decoration: underline; text-underline-offset: 2px; }
.legal-text:active { color: var(--theme-primary, #00e5ff); }
.legal-divider { color: #3f3f46; font-size: 12px; }

.danger-zone { width: 100%; border-top: 1px dashed rgba(255,255,255,0.1); padding-top: 32px;}
.btn-logout {
  width: 80%;
  height: 48px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 24px;
  transition: all 0.2s;
}
.logout-text { font-size: 15px; color: #a1a1aa; font-weight: bold; letter-spacing: 1px; }
.btn-pressed { transform: scale(0.96); background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.2);}

.delete-account-text { font-size: 13px; color: #ef4444; font-weight: bold; opacity: 0.8; transition: opacity 0.2s;}
.delete-account-text:active { opacity: 1; text-decoration: underline; }
</style>
