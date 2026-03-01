<template>
  <view class="article-container" :style="themeStore.themeCssVars">
    <!-- header -->
    <view class="header fixed-top flex items-center px-4" @click="goBack">
      <text class="back-icon">←</text>
      <text class="header-title ml-3">{{ pageTitle }}</text>
    </view>
    
    <scroll-view class="content-scroll" scroll-y @scrolltolower="loadMore">
       <view class="pt-header px-4">
          <view class="link-card" v-for="(link, index) in currentLinks" :key="index" @click="openExternal(link)" hover-class="link-hover">
             <view class="flex items-center">
                 <view class="icon-box flex justify-center items-center">
                    <text class="icon-emoji">{{ link.icon }}</text>
                 </view>
                 <view class="flex-1 ml-3">
                    <text class="link-title block">{{ link.title }}</text>
                    <text class="link-desc block mt-1">{{ link.desc }}</text>
                 </view>
                 <text class="arrow-right ml-2">→</text>
             </view>
          </view>
       </view>
       
       <view class="empty-state flex-col items-center justify-center mt-8" v-if="loading && page === 1">
         <text class="empty-text">同步云端突触网络...</text>
       </view>
       <view class="empty-state flex-col items-center justify-center mt-8" v-else-if="!currentLinks.length">
         <text class="empty-text">该区块暂无可用记录</text>
       </view>
       <view class="empty-state flex-col items-center justify-center mt-4 mb-4" v-if="!hasMore && currentLinks.length > 0">
         <text class="empty-text" style="font-size: 12px; opacity: 0.6;">没有更多记录了</text>
       </view>
       <view class="empty-state flex-col items-center justify-center mt-4 mb-4" v-if="loading && page > 1">
         <text class="empty-text" style="font-size: 12px; opacity: 0.6;">加载中...</text>
       </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useThemeStore } from '../../store/theme.js'

const themeStore = useThemeStore()
const pageType = ref('')

const pageTitles = {
  'video': '神经重塑精选视频',
  'article': '认知觉醒深度长文'
}

const pageTitle = computed(() => {
   return pageTitles[pageType.value] || '前额叶进阶资料库'
})

const currentLinks = ref([])
const loading = ref(true)
const page = ref(1)
const hasMore = ref(true)
const cacheKey = computed(() => `library_${pageType.value}`)

onLoad((options) => {
   if (options.type) {
       pageType.value = options.type
       const cached = uni.getStorageSync(cacheKey.value)
       if (cached && cached.length > 0) {
           currentLinks.value = cached
       }
       fetchCloudList(true)
   }
})

const fetchCloudList = async (isRefresh = false) => {
    if (isRefresh) {
        page.value = 1
        hasMore.value = true
    }
    if (!hasMore.value) return

    loading.value = true
    try {
        const token = uni.getStorageSync('uni_id_token')
        const res = await uniCloud.callFunction({
            name: 'user-center',
            data: {
                action: 'getLibraryList',
                token,
                payload: { type: pageType.value, page: page.value, pageSize: 15 }
            }
        })
        if (res.result.code === 0) {
            const list = res.result.data
            if (isRefresh) {
                currentLinks.value = list
                uni.setStorageSync(cacheKey.value, list)
            } else {
                currentLinks.value = [...currentLinks.value, ...list]
            }
            if (list.length < 15) {
                hasMore.value = false
            } else {
                page.value++
            }
        } else {
            uni.showToast({ title: res.result.msg, icon: 'none' })
        }
    } catch(err) {
        console.error('拉取资料库失败', err)
        if (!currentLinks.value.length) {
            uni.showToast({ title: '网络连接异常', icon: 'none' })
        }
    } finally {
        loading.value = false
    }
}

const loadMore = () => {
    if (!loading.value && hasMore.value) {
        fetchCloudList()
    }
}

const goBack = () => {
   uni.navigateBack()
}

const openExternal = (link) => {
    if (link.type === 'video') {
         uni.navigateTo({ url: '/pages/video/index?id=' + link._id })
    } else {
         uni.navigateTo({ url: '/pages/article_detail/index?id=' + link._id })
    }
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
   /* 增加充裕的 paddingTop，完美避开自定义导航栏可能出现的计算误差或刘海屏 */
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
.items-center { align-items: center; }
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
.link-card {
    background: #18181b;
    border: 1px solid #27272a;
    border-radius: 16px;
    padding: 20px 16px;
    margin-bottom: 16px;
    transition: all 0.2s;
}
.link-hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    border-color: rgba(255, 255, 255, 0.1);
}
.icon-box {
    width: 44px;
    height: 44px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 12px;
}
.icon-emoji {
    font-size: 20px;
}
.link-title {
    font-size: 15px; /* 减小标题字号 */
    font-weight: 600; /* 去掉粗体，改为半粗体减轻压迫感 */
    color: #e4e4e7;  /* 柔和文字颜色避免发光 */
    letter-spacing: 0.5px;
}
.link-desc {
    font-size: 12px;
    color: #a1a1aa;
    line-height: 1.5;
    margin-top: 5px; /* 和标题拉开一点空间 */
}
.arrow-right {
    color: var(--theme-primary);
    font-weight: bold;
    font-size: 16px;
}
.empty-text {
    color: #52525b;
    font-family: monospace;
    font-size: 14px;
}
</style>
