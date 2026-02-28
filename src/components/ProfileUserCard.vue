<template>
  <view>
  <view class="header flex items-center" @click="openEditModal" hover-class="header-hover">
    <!-- 头像区 -->
    <view class="avatar flex justify-center items-center">
      <image v-if="avatar" :src="avatar" class="avatar-img" mode="aspectFill"></image>
      <text v-else class="avatar-text">{{ avatarInitial }}</text>
    </view>
    
    <!-- 文本区 -->
    <view class="user-info ml-4 flex-col justify-center">
      <view class="flex items-center">
        <text class="username tracking-wider">{{ userName }}</text>
        <text class="edit-icon ml-2">✎</text>
      </view>
      <text v-if="signature" class="signature-text mt-1">{{ signature }}</text>
      <view class="status-badge flex items-center mt-2">
        <view class="status-dot offline"></view>
        <text class="status-text ml-1">{{ userDesc }}</text>
      </view>
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
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  userName: { type: String, default: '探索者' },
  userDesc: { type: String, default: '系统干预：已停用' },
  avatar: { type: String, default: '' },
  signature: { type: String, default: '' }
})
const emit = defineEmits(['updateProfile', 'modalStateChange'])

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

const chooseAvatar = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      editAvatar.value = res.tempFilePaths[0]
    }
  })
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
.ml-1 { margin-left: 4px; }
.ml-2 { margin-left: 8px; }
.ml-4 { margin-left: 16px; }
.mr-2 { margin-right: 8px; }
.mt-2 { margin-top: 8px; }
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
  padding: calc(var(--status-bar-height) + 30px) 20px 16px 20px;
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
.username { font-size: 20px; color: #f4f4f5; font-weight: 900; }
.edit-icon { font-size: 14px; color: #52525b; }
.signature-text { font-size: 11px; color: #a1a1aa; font-family: monospace; }

.status-badge { background: rgba(239, 68, 68, 0.1); padding: 4px 8px; border-radius: 4px; border: 1px solid rgba(239, 68, 68, 0.2); align-self: flex-start;}
.status-dot { width: 6px; height: 6px; border-radius: 3px; }
.status-dot.offline { background-color: #ef4444; box-shadow: 0 0 5px #ef4444;}
.status-text { font-size: 10px; color: #ef4444; font-weight: bold; font-family: monospace;}

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
.btn-save { background: linear-gradient(135deg, var(--theme-primary-grad-start) 0%, var(--theme-primary-grad-end) 100%); color: #fff; box-shadow: 0 5px 15px var(--theme-shadow-primary);}
</style>
