<template>
  <view class="article-container" :style="themeStore.themeCssVars">
    <CyberNavBar :title="pageTitle" :blur="true" />
    
    <scroll-view class="content-scroll" scroll-y @scrolltolower="loadMore">
       <view class="pt-header px-4">
          <!-- Feed-style Cards -->
          <view class="article-card flex-col align-stretch" v-for="(link, index) in currentLinks" :key="index" @click="openExternal(link)" hover-class="card-hover">
             <view class="card-cover-wrap">
               <image v-if="link.cover" :src="link.cover" mode="aspectFill" class="card-cover" />
               <view v-else class="card-cover-placeholder flex items-center justify-center">
                 <text class="placeholder-icon">{{ link.icon }}</text>
               </view>
               <view class="card-badge" :class="link.type">{{ link.type === 'video' ? 'VIDEO' : 'ARTICLE' }}</view>
             </view>
             <view class="card-content">
                 <text class="card-title block">{{ link.title }}</text>
                 <view class="card-meta flex items-center mt-2">
                   <text class="meta-item">{{ link.author }}</text>
                   <text class="meta-divider">·</text>
                   <text class="meta-item">{{ link.readTime }}</text>
                 </view>
             </view>
          </view>
       </view>
       
       <view class="empty-state flex-col items-center justify-center mt-12" v-if="loading && page === 1">
         <view class="loading-ripple"></view>
         <text class="empty-text mt-4">同步云端突触网络...</text>
       </view>
       <view class="empty-state flex-col items-center justify-center mt-12" v-else-if="!currentLinks.length">
         <text class="empty-text">该区块暂无可用记录</text>
         <view class="sync-btn mt-6 flex items-center justify-center" @click="handleInitData(false)" v-if="!loading">
           <text class="sync-icon mr-2">⚡</text>
           <text class="sync-text">手动接驳图谱库</text>
         </view>
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
const hasAutoInited = ref(false)
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
            
            // 自动化冷启动/升级逻辑：如果列表为空 OR 首条数据缺少封面（老旧数据），自动触发重构初始化
            const needsUpgrade = list.length > 0 && !list[0].cover;
            if (isRefresh && (list.length === 0 || needsUpgrade) && !hasAutoInited.value) {
                console.log('[AUTO-INIT/UPGRADE] 监测到库为空或数据版本过低，启动重构协议...');
                hasAutoInited.value = true;
                await handleInitData(true);
                return;
            }

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

const handleInitData = async (isAuto = false) => {
    if (!isAuto) uni.showLoading({ title: '突触网络初始化...' })
    try {
        const res = await uniCloud.callFunction({
            name: 'user-center',
            data: {
                action: 'initLibraryData',
                token: uni.getStorageSync('uni_id_token')
            }
        })
        if (res.result.code === 0) {
            if (!isAuto) uni.showToast({ title: '同步成功', icon: 'success' })
            await fetchCloudList(true) // 重新拉取列表
        } else {
            if (!isAuto) uni.showToast({ title: res.result.msg, icon: 'none' })
        }
    } catch (err) {
        console.error('初始化失败', err)
        if (!isAuto) uni.showToast({ title: '初始化失败', icon: 'none' })
    } finally {
        if (!isAuto) uni.hideLoading()
    }
}

const loadMore = () => {
    if (!loading.value && hasMore.value) {
        fetchCloudList()
    }
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
.content-scroll {
   flex: 1;
   height: 100vh;
}
.pt-header {
   padding-top: 24px;
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
.article-card {
    background: #18181b;
    border: 1px solid #27272a;
    border-radius: 20px;
    margin-bottom: 24px;
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}
.card-hover {
    transform: translateY(-4px) scale(1.01);
    border-color: var(--theme-primary);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4);
}
.card-cover-wrap {
    width: 100%;
    height: 180px;
    position: relative;
    background: #27272a;
}
.card-cover {
    width: 100%;
    height: 100%;
}
.card-cover-placeholder {
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #18181b 0%, #27272a 100%);
}
.placeholder-icon {
    font-size: 40px;
    opacity: 0.3;
}
.card-badge {
    position: absolute;
    top: 12px;
    right: 12px;
    padding: 4px 10px;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(8px);
    border-radius: 8px;
    font-size: 10px;
    font-weight: 900;
    color: #fff;
    letter-spacing: 1px;
    border: 1px solid rgba(255, 255, 255, 0.1);
}
.card-badge.video { border-color: #ef4444; color: #fca5a5; }
.card-badge.article { border-color: #3b82f6; color: #93c5fd; }

.card-content {
    padding: 20px 16px;
}
.card-title {
    font-size: 18px;
    font-weight: 800;
    color: #f4f4f5;
    line-height: 1.4;
}
.card-meta {
    font-family: monospace;
}
.meta-item {
    font-size: 12px;
    color: #71717a;
}
.meta-divider {
    font-size: 12px;
    color: #3f3f46;
    margin: 0 8px;
}

.empty-text {
    color: #52525b;
    font-family: monospace;
    font-size: 14px;
}
.loading-ripple {
    width: 40px;
    height: 40px;
    border: 3px solid var(--theme-primary);
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.sync-btn {
    background: rgba(0, 229, 255, 0.05);
    border: 1px solid rgba(0, 229, 255, 0.2);
    padding: 12px 24px;
    border-radius: 12px;
    transition: all 0.2s;
}
.sync-btn:active {
    transform: scale(0.95);
    background: rgba(0, 229, 255, 0.1);
}
.sync-text {
    color: var(--theme-primary);
    font-size: 13px;
    font-weight: bold;
    letter-spacing: 1px;
}
.sync-icon {
    font-size: 14px;
}
.mt-12 { margin-top: 48px; }
.mr-2 { margin-right: 8px; }
.justify-center { justify-content: center; }
.flex-col { display: flex; flex-direction: column; }
.align-stretch { align-items: stretch; }
</style>
