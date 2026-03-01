<template>
  <view class="article-container" :style="themeStore.themeCssVars">
    <!-- header -->
    <view class="header fixed-top flex items-center px-4" @click="goBack">
      <text class="back-icon">←</text>
      <text class="header-title ml-3">{{ pageTitle }}</text>
    </view>
    
    <scroll-view class="content-scroll" scroll-y>
      <view class="loading-state flex-col items-center justify-center" v-if="loading" style="height: 400px;">
         <text class="glitch-text" style="color: var(--theme-primary);">文字协议解码中...</text>
      </view>
      <view class="error-state flex-col items-center justify-center" v-else-if="!currentArticle" style="height: 400px;">
         <text class="glitch-text" style="color: #ef4444;">404 突触连接断开</text>
      </view>
      <view v-else class="fade-in">
        <view class="article-header pt-header px-5">
           <text class="article-title block">{{ currentArticle.title }}</text>
           <text class="article-meta block mt-2">SOURCE: {{ currentArticle.author }} · TIMELINE: {{ currentArticle.readTime }}</text>
        </view>

        <view class="article-body px-5 pb-8 mt-6">
           <rich-text :nodes="currentArticle.textContent" class="rich-content"></rich-text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useThemeStore } from '../../store/theme.js'

const themeStore = useThemeStore()
const articleId = ref('')
const currentArticle = ref(null)
const loading = ref(true)

const pageTitle = computed(() => {
   return currentArticle.value ? '资料解析系统' : '网络接驳中'
})

onLoad((options) => {
   if (options.id) {
       articleId.value = options.id
       fetchArticleDetail()
   } else {
       loading.value = false
   }
})

const fetchArticleDetail = async () => {
    loading.value = true
    try {
        const token = uni.getStorageSync('uni_id_token')
        const res = await uniCloud.callFunction({
            name: 'user-center',
            data: {
                action: 'getArticleDetail',
                token,
                payload: { id: articleId.value }
            }
        })
        if (res.result.code === 0) {
            currentArticle.value = res.result.data
        } else {
            uni.showToast({ title: res.result.msg, icon: 'none' })
        }
    } catch(err) {
        console.error('拉取图文信息失败', err)
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
.article-container {
   min-height: 100vh;
   background-color: #09090b;
   display: flex;
   flex-direction: column;
}
.fixed-top {
   position: fixed;
   top: 0;
   left: 0;
   width: 100%;
   height: calc(var(--status-bar-height) + 54px);
   padding-top: var(--status-bar-height);
   background: rgba(9, 9, 11, 0.85);
   backdrop-filter: blur(15px);
   z-index: 100;
   border-bottom: 1px solid rgba(255,255,255,0.05);
   box-sizing: border-box;
}
.content-scroll {
   flex: 1;
   height: 100vh;
}
.pt-header {
   padding-top: calc(var(--status-bar-height) + 120px);
}
.pb-8 {
   padding-bottom: 40px;
}
.px-4 { padding: 0 16px; }
.px-5 { padding: 0 24px; }
.mt-2 { margin-top: 8px; }
.mt-6 { margin-top: 24px; }
.ml-3 { margin-left: 12px; }
.flex { display: flex; }
.flex-col { display: flex; flex-direction: column; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
.block { display: block; }

.back-icon {
   color: #e4e4e7;
   font-size: 20px;
   font-weight: bold;
   padding: 10px 10px 10px 0;
}
.header-title {
   color: #a1a1aa;
   font-size: 15px;
   font-family: monospace;
   font-weight: bold;
}
.article-title {
   font-size: 24px;
   font-weight: 900;
   color: #fff;
   line-height: 1.4;
   letter-spacing: 1px;
}
.article-meta {
   font-size: 12px;
   color: #52525b;
   font-family: monospace;
}
.rich-content {
   color: #d4d4d8;
}
.fade-in {
  opacity: 0;
  animation: fadeIn 0.6s ease-out forwards;
}
@keyframes fadeIn { to { opacity: 1; } }
</style>
