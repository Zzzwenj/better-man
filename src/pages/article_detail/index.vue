<template>
  <view class="article-container" :style="themeStore.themeCssVars">
    <CyberNavBar :title="pageTitle" :blur="true" />
    
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
        // 第一层拦截：查探本地是否存在硬核缓存
        const cacheKey = 'article_cache_' + articleId.value
        const localCache = uni.getStorageSync(cacheKey)
        
        if (localCache) {
            currentArticle.value = localCache
            loading.value = false
            return // 命中缓存，直接掐断网络层通讯
        }

        // 本地无缓存，向云数据库请求轻量记录（不含庞大富文本，只含 OSS URL）
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
            const articleMeta = res.result.data
            
            // 是否包含旧式的直接存储文本？兼容处理
            if (articleMeta.textContent) {
                 currentArticle.value = articleMeta
                 uni.setStorageSync(cacheKey, articleMeta)
            } 
            // 如果是最新的通过云存储外链存储的长图文
            else if (articleMeta.contentUrl) {
                // 原生 GET 获取云端长文档的真实文本
                const docRes = await uni.request({
                    url: articleMeta.contentUrl,
                    method: 'GET'
                })
                
                // 将拉取到的长代码拼接到对象组作为临时属性
                // 注意：uni.request 返回的结构根据平台可能有所差异，一般是 res.data
                articleMeta.textContent = docRes.data || docRes[1]?.data 
                
                currentArticle.value = articleMeta
                // 将拼装好的最终形态植入住本地 SQLite 缓存
                uni.setStorageSync(cacheKey, articleMeta)
            }
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
.flex-col { display: flex; flex-direction: column; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
.block { display: block; }
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
