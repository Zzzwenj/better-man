<template>
  <view>
  <view class="header flex items-center" @click="openEditModal" hover-class="header-hover">
    <!-- 头像区 -->
    <view class="avatar flex justify-center items-center" :class="{
        'frame-plasma': userStore.equipped.avatarFrame === 'f_01',
        'frame-glitch': userStore.equipped.avatarFrame === 'f_02'
    }">
      <image v-if="avatar" :src="avatar" class="avatar-img" mode="aspectFill"></image>
      <text v-else class="avatar-text">{{ avatarInitial }}</text>
    </view>
    
    <!-- 文本区 -->
    <view class="user-info ml-4 flex-col justify-center flex-1">
      <view class="name-row flex items-center">
        <!-- 动态称号 / 黑金皇冠 -->
        <text class="crown-icon mr-1" v-if="hasBlackGoldCrown">👑</text>
        <view class="profile-title-wrapper flex-shrink-1" v-if="userStore.equipped.title">
          <text class="profile-title mr-1">
            {{ userStore.equipped.title === 't_01' ? '[深渊行者]' : (userStore.equipped.title === 't_02' ? '[绝命赌徒]' : '') }}
          </text>
        </view>
        <text :class="['username', 'flex-1', hasBlackGoldCrown ? 'gold-text' : '']">{{ userName }}</text>
        <text class="edit-icon ml-2 flex-shrink-0">✎</text>
      </view>
      <text v-if="signature" class="signature-text mt-1">{{ signature }}</text>
      <view class="status-badge flex items-center mt-2">
        <view :class="['status-dot', isProActive ? 'online' : 'offline']"></view>
        <text :class="['status-text', 'ml-1', isProActive ? 'text-online' : '']">{{ userDesc }}</text>
      </view>
    </view>

    <!-- 神经币快捷入口 (嵌入头像栏右侧) -->
    <view class="wallet-chip flex items-center" @click.stop="goStore" hover-class="wallet-hover">
      <NeuroCoinIcon :size="18" />
      <text class="wallet-val ml-1">{{ formattedCoins }}</text>
    </view>
  </view>

  <!-- 弹窗：编辑资料 (赛博朋克风) -->
    <view class="modal-overlay" v-if="showModal" @click.stop="closeEditModal">
      <view class="modal-content flex-col" @click.stop>
        <text class="modal-title mb-4">修改档案资料</text>
        
        <!-- 弹窗：头像修改区 -->
        <view class="modal-avatar-area flex-col items-center mb-4" @click="chooseAvatar">
          <view class="modal-avatar flex justify-center items-center">
            <image v-if="editAvatar" :src="editAvatar" class="avatar-img" mode="aspectFill"></image>
            <text v-else class="avatar-text">{{ avatarInitial }}</text>
            <view class="edit-badge">📷</view>
          </view>
          <text class="modal-avatar-hint mt-2">提取新的物理特征 (点击更换)</text>
        </view>

        <!-- 弹窗：名称修改 -->
        <view class="input-group mb-4">
          <text class="label">探员代号</text>
          <input class="input-field mt-2" v-model="editName" placeholder="输入新的代号" maxlength="12" />
        </view>
        
        <!-- 弹窗：签名修改 -->
        <view class="input-group mb-2">
          <text class="label">个人箴言 (签名)</text>
          <input class="input-field mt-2" v-model="editSignature" placeholder="输入你的戒断信条" maxlength="20" />
        </view>
        
        <view class="modal-actions flex justify-between mt-6">
          <view class="btn btn-cancel flex justify-center items-center flex-1 mr-2" @click="closeEditModal">取消</view>
          <view class="btn btn-save flex justify-center items-center flex-1 ml-2" @click="saveProfile">确立 (SAVE)</view>
        </view>
      </view>
    </view>

    <!-- 弹窗：60 个系统级内置头像选择器 (Cyber Avatars) -->
    <view class="avatar-selector-overlay" v-if="showAvatarSelector" @click.stop="showAvatarSelector = false">
      <view class="avatar-selector-content flex-col" @click.stop>
        <text class="selector-title mb-4">系统物理特征库 (60)</text>
        <scroll-view scroll-y class="avatar-grid-scroll">
          <view class="avatar-grid">
            <view class="avatar-grid-item" v-for="i in 60" :key="i" @click="selectSystemAvatar(i)">
              <!-- 恢复最初的极简机器人/黑客头像风格 -->
              <image :src="`https://api.dicebear.com/7.x/bottts/svg?seed=${i}`" mode="aspectFill" class="grid-avatar-img"></image>
            </view>
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script setup>
/**
 * @component ProfileUserCard
 * @description 系统自检(我的)模块顶部用户卡片组件，展示头像、动态称号、签名并在原位提供编辑入口。
 */

import { ref, computed } from 'vue'
import { useUserStore } from '@/store/user'
import NeuroCoinIcon from '@/components/common/NeuroCoinIcon.vue'

const userStore = useUserStore()

const props = defineProps({
  userName: { type: String, default: '探索者' },
  userDesc: { type: String, default: '系统干预：已停用' },
  avatar: { type: String, default: '' },
  signature: { type: String, default: '' },
  isProActive: { type: Boolean, default: false },
  hasBlackGoldCrown: { type: Boolean, default: false },
  formattedCoins: { type: String, default: '0' }
})
const emit = defineEmits(['updateProfile', 'modalStateChange'])

const goStore = () => {
    uni.vibrateShort()
    // 延迟 50ms 跳转，确保视觉反馈（点击态）与物理反馈（震动）优先处理，消除感官卡顿
    setTimeout(() => {
        uni.navigateTo({ url: '/pages/store/index' })
    }, 50)
}

const showModal = ref(false)
const editName = ref('')
const editAvatar = ref('')
const editSignature = ref('')

const avatarInitial = computed(() => {
  if (!props.userName) return '?'
  // 取最后几个字符显示在头像框
  const str = String(props.userName)
  if (str.includes('_')) return str.split('_').pop().substring(0,4)
  return str.substring(str.length - 4)
})

const openEditModal = () => {
  editName.value = props.userName
  editAvatar.value = props.avatar
  editSignature.value = props.signature
  showModal.value = true
  emit('modalStateChange', true)
  uni.vibrateShort()
}

const showAvatarSelector = ref(false)

const chooseAvatar = () => {
  showAvatarSelector.value = true
  uni.vibrateShort()
}

const selectSystemAvatar = (index) => {
  // 恢复最初的极简机器人/黑客头像风格
  editAvatar.value = `https://api.dicebear.com/7.x/bottts/svg?seed=${index}`
  showAvatarSelector.value = false
  uni.showToast({ title: '特征提取成功', icon: 'none' })
}

const closeEditModal = () => {
  showModal.value = false
  emit('modalStateChange', false)
}

const saveProfile = () => {
  if (!editName.value.trim()) {
    uni.showToast({ title: '代号不能为空', icon: 'none' })
    return
  }
  emit('updateProfile', { 
    newName: editName.value.trim(),
    newAvatar: editAvatar.value,
    newSignature: editSignature.value.trim()
  })
  showModal.value = false
  emit('modalStateChange', false)
  uni.showToast({ title: '档案已覆写', icon: 'success' })
}
</script>

<style lang="scss" scoped>
.px-4 { padding: 0 20px; }
.mx-4 { margin-left: 20px; margin-right: 20px; }
.ml-1 { margin-left: 4px; }
.ml-2 { margin-left: 8px; }
.ml-3 { margin-left: 12px; }
.ml-4 { margin-left: 16px; }
.mr-1 { margin-right: 4px; }
.mr-2 { margin-right: 8px; }
.mt-2 { margin-top: 8px; }
.mt-4 { margin-top: 16px; }
.mt-6 { margin-top: 24px; }
.mb-4 { margin-bottom: 16px; }
.mb-6 { margin-bottom: 24px; }
.flex { display: flex; }
.flex-col { display: flex; flex-direction: column; }
.flex-1 { flex: 1; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
.tracking-wider { letter-spacing: 2px; }

/* 头部卡片本身 */
.header {
  padding: calc(var(--status-bar-height) + 24px) 20px 16px 20px;
  background: rgba(9, 9, 11, 0.65);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  position: sticky;
  top: 0;
  z-index: 50;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
  transition: opacity 0.2s;
  box-sizing: border-box;
  width: 100%;
}
.header-hover { opacity: 0.7; }

.avatar {
  width: 64px; height: 64px;
  border-radius: 20px;
  background: #18181b;
  border: 1px solid #3f3f46;
  box-shadow: 0 0 20px rgba(0,0,0,0.5);
  flex-shrink: 0;
}
.avatar-img { width: 100%; height: 100%; border-radius: 20px; }
.avatar-text { font-family: monospace; color: #a1a1aa; font-weight: bold; font-size: 14px;}
.user-info { min-width: 0; }
.username { font-size: 20px; color: #f4f4f5; font-weight: 900; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; min-width: 0; }
.name-row { width: 100%; overflow: hidden; min-width: 0; flex: 1; }
.flex-shrink-0 { flex-shrink: 0; }
.edit-icon { font-size: 14px; color: #52525b; }
.signature-text { font-size: 11px; color: #a1a1aa; font-family: monospace; }
.crown-icon { font-size: 16px; text-shadow: 0 0 10px rgba(250, 204, 21, 0.8); }
.gold-text { color: #facc15; text-shadow: 0 0 15px rgba(250, 204, 21, 0.4); }

.status-badge { background: rgba(255, 255, 255, 0.05); padding: 4px 8px; border-radius: 4px; border: 1px solid rgba(255, 255, 255, 0.1); align-self: flex-start;}
.status-dot { width: 6px; height: 6px; border-radius: 3px; }
.status-dot.offline { background-color: #ef4444; box-shadow: 0 0 5px #ef4444;}
.status-dot.online { background-color: var(--theme-primary); box-shadow: 0 0 8px var(--theme-shadow-primary); animation: pulse 2s infinite;}
.status-text { font-size: 10px; color: #a1a1aa; font-weight: bold; font-family: monospace;}
.status-text.text-online { color: var(--theme-primary); }

@keyframes pulse { 0% { opacity: 0.5; } 50% { opacity: 1; transform: scale(1.2); } 100% { opacity: 0.5; } }

/* 动态称号 */
.profile-title-wrapper {
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.profile-title {
  font-size: 13px;
  color: #a78bfa;
  font-weight: 900;
  font-family: monospace;
  text-shadow: 0 0 8px rgba(139, 92, 246, 0.6);
  letter-spacing: 1px;
}

/* 动态头像框 - 深空等离子 */
.frame-plasma {
  border: none !important;
  box-shadow: 0 0 15px rgba(139, 92, 246, 0.8), 0 0 5px inset rgba(139, 92, 246, 0.5) !important;
  position: relative;
}
.frame-plasma::after {
  content: '';
  position: absolute;
  top: -2px; left: -2px; right: -2px; bottom: -2px;
  border-radius: 22px;
  background: conic-gradient(from 0deg, transparent 0%, rgba(139, 92, 246, 0.8) 25%, transparent 50%, rgba(0, 229, 255, 0.8) 75%, transparent 100%);
  z-index: -1;
  animation: rotatePlasma 3s linear infinite;
}
@keyframes rotatePlasma { 100% { transform: rotate(360deg); } }

/* 动态头像框 - 故障干扰线 */
.frame-glitch {
  border: 2px solid rgba(239, 68, 68, 0.8) !important;
  box-shadow: 0 0 15px rgba(239, 68, 68, 0.4) !important;
  animation: glitchBorder 1s infinite alternate;
}
@keyframes glitchBorder {
  0% { transform: translate(0) skew(0deg); }
  20% { transform: translate(-2px, 1px) skew(2deg); }
  40% { transform: translate(1px, -1px) skew(-2deg); }
  60% { transform: translate(0) skew(0deg); }
  80% { transform: translate(2px, 0) skew(1deg); }
  100% { transform: translate(0) skew(0deg); }
}

/* 神经币快捷入口 (头像栏右侧内嵌) */
.wallet-chip {
  margin-left: 12px;
  flex-shrink: 0;
  background: rgba(139, 92, 246, 0.08);
  border: 1px solid rgba(139, 92, 246, 0.2);
  border-radius: 20px;
  padding: 4px 10px;
  transition: all 0.2s;
}
.wallet-hover { background: rgba(139, 92, 246, 0.15); transform: scale(0.95); }
.wallet-val { font-size: 12px; color: #e4e4e7; font-family: monospace; font-weight: 900; white-space: nowrap; }
.wallet-arrow { font-size: 14px; color: #71717a; font-weight: bold; }

/* 修改资料弹窗 */
.modal-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.8); backdrop-filter: blur(8px);
  z-index: 9999;
  display: flex; align-items: center; justify-content: center;
}
.modal-content {
  width: 300px;
  background: #18181b;
  border: 1px solid #3f3f46;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 15px 40px rgba(0,0,0,0.6);
  animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
@keyframes popIn {
  0% { transform: scale(0.9); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

.modal-title { font-size: 18px; font-weight: bold; color: #fafafa; text-align: center; text-shadow: 0 0 10px rgba(0, 198, 255, 0.3); }

.modal-avatar-area { position: relative; }
.modal-avatar { 
  width: 72px; height: 72px; 
  border-radius: 22px; 
  background: #27272a; 
  border: 1px dashed #52525b; 
  position: relative;
}
.modal-avatar .avatar-img { border-radius: 22px; }
.edit-badge {
  position: absolute; right: -5px; bottom: -5px;
  background: linear-gradient(135deg, var(--theme-primary-grad-start) 0%, var(--theme-primary-grad-end) 100%); border-radius: 12px;
  width: 24px; height: 24px;
  display: flex; align-items: center; justify-content: center;
  font-size: 10px; box-shadow: 0 0 10px rgba(0, 114, 255, 0.5);
  color: #fff;
}
.modal-avatar-hint { font-size: 11px; color: #71717a; font-family: monospace; }

.label { font-size: 12px; color: #a1a1aa; font-family: monospace;}
.input-field {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  height: 44px; padding: 0 12px;
  color: #fff; font-size: 16px;
}
.input-field:focus { border-color: var(--theme-primary); box-shadow: 0 0 8px var(--theme-shadow-primary); }

.btn { height: 44px; border-radius: 22px; font-size: 14px; font-weight: bold; transition: all 0.2s;}
.btn:active { transform: scale(0.95); }
.btn-cancel { background: #27272a; color: #e4e4e7; }
.btn-save { background: linear-gradient(135deg, var(--theme-primary-grad-start, #00C6FF) 0%, var(--theme-primary-grad-end, #0072FF) 100%); color: #fff; box-shadow: 0 5px 15px var(--theme-shadow-primary, rgba(0, 114, 255, 0.3));}
.avatar-selector-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.85); backdrop-filter: blur(10px);
  z-index: 10000;
  display: flex; align-items: flex-end; /* 底部弹出 */
}
.avatar-selector-content {
  width: 100%; height: 60vh;
  background: #18181b;
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;
  border-top: 1px solid #3f3f46;
  padding: 24px 20px 40px;
  box-sizing: border-box;
  animation: slideUp 0.3s cubic-bezier(0.25, 1, 0.5, 1);
}
@keyframes slideUp {
  0% { transform: translateY(100%); }
  100% { transform: translateY(0); }
}
.selector-title { font-size: 16px; font-weight: bold; color: #00e5ff; text-align: center; font-family: monospace; letter-spacing: 1px;}
.avatar-grid-scroll { height: calc(100% - 40px); margin-top: 16px; }
.avatar-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 16px;
}
.avatar-grid-item {
  width: 60px; height: 60px;
  border-radius: 16px;
  background: #27272a;
  border: 1px solid #3f3f46;
  padding: 8px;
  box-sizing: border-box;
  display: flex; justify-content: center; align-items: center;
}
.avatar-grid-item:active { transform: scale(0.9); border-color: #00e5ff; }
.grid-avatar-img { width: 100%; height: 100%; border-radius: 8px;}
</style>
