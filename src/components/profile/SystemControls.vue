<template>
    <view class="system-control-zone flex-col items-center w-full pb-4 mt-4">
      <view class="divider w-full mb-6 relative">
        <view class="absolute inset-x-4 h-full" style="background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.05), transparent);"></view>
      </view>
      
      <!-- 高危操作与基础流出区 -->
      <view class="flex-col items-center gap-5 w-full">
        <!-- 引流信标入口 (动态判定显示) -->
        <view class="control-item" v-if="hasBeaconAccess" @click="$emit('openBeacon')" hover-class="text-glow">
          <text class="control-text" style="color: #00e5ff; font-weight: bold; text-shadow: 0 0 8px rgba(0,229,255,0.4);">[ 解锁：地球驻扎地信标 ]</text>
        </view>

      <!-- 警告：如果处于流放倒计时，则独立显示高亮恢复卡片 -->
      <view class="w-full px-4 mb-2" v-if="isPendingDelete">
        <view class="danger-warning border-l-4">
          <text class="warning-text">您的档案正在焚毁流放期，将于 {{ formatDeleteTime(deleteAt) }} 彻底从深渊抹除。</text>
          <view class="action-btn cancel-delete-action flex justify-between items-center mt-3" @click="$emit('cancelDelete')" hover-class="btn-pressed">
            <view>
              <text class="action-name">中止焚毁程序 (恢复账号)</text>
              <text class="action-desc block mt-1">终止倒计时，恢复系统所有功能</text>
            </view>
            <text class="icon-arrow">↺</text>
          </view>
        </view>
      </view>

      <!-- 绝对的页面最底端 -->
      <view class="bottom-footer flex-col items-center mt-6 gap-4 w-full">
        <!-- 退出与注销 (极其低调的深灰色无边框纯文本链接) -->
        <view class="flex items-center justify-center gap-3 w-full" v-if="!isPendingDelete">
           <text class="subtle-link" @click="$emit('settingClick', {id: 'wipe'})">退出登录</text>
           <text class="link-divider">|</text>
           <text class="subtle-link" @click="$emit('confirmDelete')">注销账号</text>
        </view>

        <!-- 法律合规协议 -->
        <view class="legal-links flex justify-center items-center mt-2">
          <text class="link-text" @click="$emit('goAgreement', 'terms')">《用户协议》</text>
          <text class="link-divider">|</text>
          <text class="link-text" @click="$emit('goAgreement', 'privacy')">《隐私政策》</text>
        </view>

        <!-- OS版本追踪号 -->
        <text class="version-text mt-1">OS Version: Better-Man 2026.3.2</text>
      </view>
    </view>
    </view>
</template>

<script setup>
defineProps({
  hasBeaconAccess: {
    type: Boolean,
    default: false
  },
  isPendingDelete: {
    type: Boolean,
    default: false
  },
  deleteAt: {
    type: [Number, String],
    default: 0
  }
})

defineEmits(['openBeacon', 'settingClick', 'cancelDelete', 'confirmDelete', 'goAgreement'])

// 格式化时间输出
const formatDeleteTime = (timestamp) => {
    if (!timestamp) return '未知时间'
    const d = new Date(timestamp)
    return `${d.getMonth() + 1}月${d.getDate()}日 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
</script>

<style lang="scss" scoped>
.flex { display: flex; }
.flex-col { display: flex; flex-direction: column; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
.w-full { width: 100%; }
.mt-1 { margin-top: 4px; }
.mt-8 { margin-top: 32px; }
.mt-12 { margin-top: 48px; }
.mb-4 { margin-bottom: 16px; }
.mb-6 { margin-bottom: 24px; }
.pb-10 { padding-bottom: 40px; }
.px-2 { padding: 0 8px; }
.mx-1 { margin: 0 4px; }
.gap-5 { gap: 20px; }
.block { display: block; }
.absolute { position: absolute; }
.relative { position: relative; }
.h-full { height: 100%; }

/* 系统控制区 */
.system-control-zone { margin-bottom: 0px; }
.divider { height: 1px; background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.05), transparent); }
.control-item { padding: 10px 20px; }
.control-text { font-size: 13px; color: #71717a; letter-spacing: 1px; transition: all 0.3s; }
.text-glow .control-text { color: #f4f4f5; text-shadow: 0 0 8px rgba(255, 255, 255, 0.3); }

/* 极其低调的文字操作区 */
.subtle-link {
  font-size: 12px;
  color: #3f3f46; /* 非常暗的灰色 */
  text-decoration: underline;
  text-decoration-color: #27272a;
  text-underline-offset: 2px;
  transition: color 0.2s;
}
.subtle-link:active {
  color: #ef4444; /* 点击时才稍微红一下 */
}

/* 底部链接与版本信息 */
.bottom-footer { gap: 16px; }
.legal-links { gap: 12px; }
.link-text { font-size: 13px; color: #71717a; text-decoration: none; padding: 4px; transition: color 0.2s; letter-spacing: 0.5px;}
.link-text:active { color: #f4f4f5; }
.link-divider { font-size: 13px; color: #3f3f46; }
.version-text { font-size: 11px; color: #3f3f46; font-family: monospace; }

/* 注销警告区 */
.zone-card { width: 100%; box-sizing: border-box; }
.danger-warning { background: rgba(239, 68, 68, 0.1); padding: 12px 16px; border-radius: 8px; border-left: 4px solid #ef4444; }
.warning-text { font-size: 13px; color: #fca5a5; line-height: 1.5; }
.action-btn { padding: 4px; transition: all 0.2s; }
.btn-pressed { transform: scale(0.98); opacity: 0.8; }
.action-name { font-size: 14px; font-weight: bold; }
.action-desc { font-size: 11px; color: #71717a; }

.delete-action .action-name { color: #ef4444; }
.delete-action .icon-arrow { color: #ef4444; opacity: 0.5; }

.cancel-delete-action .action-name { color: #00e5ff; font-weight: 900; }
.cancel-delete-action .action-desc { color: #a1a1aa; }
.cancel-delete-action .icon-arrow { color: #00e5ff; opacity: 0.8; font-size: 20px;}
</style>
