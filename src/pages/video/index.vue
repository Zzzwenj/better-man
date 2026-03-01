<template>
  <view class="video-page" :style="themeStore.themeCssVars">
    <CyberNavBar title="系统级视觉注入" :blur="true" />

    <!-- Content Area -->
    <view class="content-area mt-top">
      <view class="loading-state flex-col items-center justify-center pt-10" v-if="loading">
         <text class="glitch-text" style="animation: none;">视频流解码中...</text>
      </view>
      <view class="error-state flex-col items-center justify-center pt-10" v-else-if="!videoData">
         <text class="glitch-text" style="color: #ef4444;">终端神经连接失败</text>
      </view>
      
      <view v-else class="playback-area fade-in">
         <!-- 原生全屏沉浸播放器 -->
         <view class="video-container">
            <video 
              id="myVideo"
              class="sys-video"
              :src="videoData.contentUrl"
              :poster="videoData.cover"
              :title="videoData.title"
              autoplay="true"
              controls="true"
              object-fit="contain"
              play-btn-position="center"
              enable-play-gesture="true"
              vslide-gesture-in-fullscreen="true"
            ></video>
         </view>
         
         <view class="info-panel px-5 mt-6">
            <text class="v-title block">{{ videoData.title }}</text>
            <view class="v-meta flex items-center mt-3">
               <text class="meta-tag">SOURCE: {{ videoData.author }}</text>
               <text class="meta-tag ml-3">TIMELINE: {{ videoData.readTime }}</text>
            </view>
            <text class="v-desc block mt-4">{{ videoData.desc }}</text>
            
            <view class="warning-box mt-8 p-4">
              <text class="warning-title block mb-2">⚠ 系统级隔离提示</text>
              <text class="warning-desc block">此通道已强制切断所有商业推荐算法与外链诱惑，保障前额叶处于高纯度吸收状态。</text>
            </view>
         </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useThemeStore } from '../../store/theme.js'

const themeStore = useThemeStore()
const videoId = ref('')
const videoData = ref(null)
const loading = ref(true)

onLoad((options) => {
   if (options.id) {
       videoId.value = options.id
       fetchVideoDetail()
   } else {
       loading.value = false
   }
})

const fetchVideoDetail = async () => {
    loading.value = true
    try {
        const token = uni.getStorageSync('uni_id_token')
        const res = await uniCloud.callFunction({
            name: 'user-center',
            data: {
                action: 'getArticleDetail',
                token,
                payload: { id: videoId.value }
            }
        })
        if (res.result.code === 0) {
            videoData.value = res.result.data
        } else {
            uni.showToast({ title: res.result.msg, icon: 'none' })
        }
    } catch(err) {
        console.error('拉取视频信息失败', err)
        uni.showToast({ title: '突触连接断开', icon: 'none' })
    } finally {
        loading.value = false
    }
}

const goBack = () => {
   uni.navigateBack()
}
</script>

<style lang="scss" scoped>
.video-page {
  min-height: 100vh;
  background-color: #000;
  display: flex;
  flex-direction: column;
}
.mt-top { margin-top: 24px; }
.px-4 { padding: 0 16px; }
.px-5 { padding: 0 24px; }
.mt-3 { margin-top: 12px; }
.mt-4 { margin-top: 16px; }
.mt-6 { margin-top: 24px; }
.mt-8 { margin-top: 32px; }
.ml-2 { margin-left: 8px; }
.ml-3 { margin-left: 12px; }
.mb-2 { margin-bottom: 8px; }
.p-4 { padding: 16px; }
.flex { display: flex; }
.flex-col { display: flex; flex-direction: column; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.justify-center { justify-content: center; }
.block { display: block; }

.loading-state, .error-state { height: 200px; }
.glitch-text { color: var(--theme-primary); font-family: monospace; font-size: 14px; }

.fade-in {
  opacity: 0;
  animation: fadeIn 0.8s ease-out forwards;
}
@keyframes fadeIn { to { opacity: 1; } }

.video-container {
   width: 100%;
   background: #09090b;
   border-bottom: 1px solid #27272a;
}
.sys-video {
   width: 100%;
   height: 240px; /* 控制默认展示高度，用户可点全屏 */
}

.v-title {
   font-size: 20px;
   font-weight: 900;
   color: #f4f4f5;
   line-height: 1.4;
   letter-spacing: 1px;
}
.meta-tag {
   background: rgba(255, 255, 255, 0.05);
   border: 1px solid rgba(255, 255, 255, 0.05);
   color: #a1a1aa;
   font-size: 10px;
   padding: 4px 8px;
   border-radius: 4px;
   font-family: monospace;
}
.v-desc {
   font-size: 14px;
   color: #d4d4d8;
   line-height: 1.6;
}
.warning-box {
   background: rgba(239, 68, 68, 0.05);
   border: 1px solid rgba(239, 68, 68, 0.2);
   border-radius: 8px;
}
.warning-title {
   color: #ef4444;
   font-size: 14px;
   font-weight: bold;
}
.warning-desc {
   color: #f87171;
   font-size: 12px;
   line-height: 1.5;
   opacity: 0.8;
}
</style>
