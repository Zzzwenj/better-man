<template>
  <view class="container flex-col">
    <view class="header px-4">
      <text class="title tracking-wider">观测图谱</text>
      <text class="subtitle block mt-1">神经可塑性观测图谱</text>
    </view>
    
    <!-- 热力图模块 -->
    <view class="card-outline mt-6 mx-4">
      <view class="flex justify-between items-center mb-4">
        <text class="section-title">重塑突触</text>
        <view class="flex items-center">
            <view class="legend-dot lvl-0"></view>
            <view class="legend-dot lvl-1 ml-1"></view>
            <view class="legend-dot lvl-2 ml-1"></view>
            <view class="legend-dot lvl-3 ml-1"></view>
            <text class="legend-text ml-2">活跃度</text>
        </view>
      </view>
      
      <!-- Git 风格模拟热力图 -->
      <view class="heatmap-grid pb-2">
        <view class="week-col" v-for="w in 6" :key="w">
          <view v-for="d in 7" :key="d" :class="['heat-cell', getMockLevel(w, d)]"></view>
        </view>
      </view>
      <text class="analysis-hint block mt-3">▶ 连续 14 天未熔断，基底神经节逐渐脱敏。</text>
    </view>
    
    <!-- 信息流原生广告占位 -->
    <view class="native-ad-placeholder mt-4 mx-4 flex items-center">
      <view class="ad-cover"></view>
      <view class="ad-info ml-3 flex-1 flex-col justify-between">
        <text class="ad-title">《多巴胺国度》：如何在这个纵欲时代找到平衡？</text>
        <view class="flex justify-between items-center">
            <text class="ad-tag">科学专栏 赞助</text>
            <text class="ad-btn">→</text>
        </view>
      </view>
    </view>
    
    <!-- 评估数据模块 -->
    <view class="card-outline mt-4 mx-4">
      <text class="section-title block mb-4">临床生理学预估</text>
      
      <view class="stat-row flex items-center justify-between mb-4">
        <view class="flex-col">
            <text class="stat-label">前额叶皮层受体修复率 (根据持续天数换算)</text>
            <view class="progress-bar mt-2">
                <view class="progress-fill" :style="{ width: repairRate + '%', background: '#10b981' }"></view>
            </view>
        </view>
        <text class="stat-val text-green ml-4">{{ repairRate }}%</text>
      </view>
      
      <view class="stat-row flex items-center justify-between mb-2">
        <view class="flex-col">
            <text class="stat-label">边缘系统异常渴求频次评估</text>
            <view class="progress-bar mt-2">
                <view class="progress-fill" :style="{ 
                    width: cravingLevel.includes('极高') ? '80%' : cravingLevel.includes('中等') ? '40%' : '10%', 
                    background: cravingLevel.includes('极高') ? '#ef4444' : cravingLevel.includes('中等') ? '#f59e0b' : '#10b981' 
                }"></view>
            </view>
        </view>
        <text class="stat-val ml-4" :style="{ 
            color: cravingLevel.includes('极高') ? '#ef4444' : cravingLevel.includes('中等') ? '#f59e0b' : '#10b981' 
        }">{{ cravingLevel }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const daysClean = ref(0)
const repairRate = ref(10)
const cravingLevel = ref('极高 (High)')

onMounted(() => {
  // 1. 获取本地持久化的重塑记录起点
  let startTimestamp = uni.getStorageSync('neuro_start_date')
  if (!startTimestamp) {
    // 这是一个 Mock：如果用户还没设置，我们默认为他设置一个 5 天前的日期，便于呈现丰富图表
    startTimestamp = Date.now() - (5 * 24 * 60 * 60 * 1000)
    uni.setStorageSync('neuro_start_date', startTimestamp)
  }
  
  const diffTime = Date.now() - startTimestamp
  daysClean.value = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  // 2. 核心动态算法：基于坚持天数的受体修复率预估
  // 基础受损算底分 10%，每天恢复 1.5%（这个冷酷的慢速恢复能让破戒成本变得极大）
  let rate = 10 + (daysClean.value * 1.5)
  repairRate.value = Math.min(Math.floor(rate), 100)
  
  // 3. 渴求频次多巴胺预估
  if (daysClean.value < 7) {
      cravingLevel.value = '极高 (High)'
  } else if (daysClean.value < 21) {
      cravingLevel.value = '中等 (Medium)'
  } else {
      cravingLevel.value = '平稳 (Low)'
  }
})

// 生成热力图的动态数据 (点亮用户连续坚持的天数)
const getMockLevel = (w, d) => {
    // 假设 42 天的总表格
    const totalCellIndex = (w - 1) * 7 + (d - 1)
    const maxCells = 42
    
    // 如果用户坚持了 5 天，我们在表末尾点亮 5 个格子
    const activeStart = maxCells - daysClean.value
    
    if (totalCellIndex >= activeStart && totalCellIndex < maxCells) {
        // 越高天数，格子的绿色会越有生机
        return 'lvl-3'
    } else if (totalCellIndex >= maxCells) {
        return 'lvl-0'
    }
    
    // 前面为坚持之前的暗色
    return 'lvl-0'
}
</script>

<style lang="scss" scoped>
.container {
  height: 100vh;
  background-color: #09090b;
  padding-bottom: 20px;
}
.header {
  padding-top: calc(var(--status-bar-height) + 20px);
}
.px-4 { padding: 0 20px; }
.mx-4 { margin: 0 20px; }
.mt-1 { margin-top: 4px; }
.mt-2 { margin-top: 8px; }
.mt-3 { margin-top: 12px; }
.mt-4 { margin-top: 16px; }
.mt-6 { margin-top: 24px; }
.mb-2 { margin-bottom: 8px; }
.mb-4 { margin-bottom: 16px; }
.ml-1 { margin-left: 4px; }
.ml-2 { margin-left: 8px; }
.ml-3 { margin-left: 12px; }
.ml-4 { margin-left: 16px; }
.pb-2 { padding-bottom: 8px; }
.flex { display: flex; }
.flex-col { display: flex; flex-direction: column; }
.flex-1 { flex: 1; }
.justify-between { justify-content: space-between; }
.items-center { align-items: center; }
.block { display: block; }
.tracking-wider { letter-spacing: 4px; }

.title { font-size: 20px; font-weight: 900; color: #10b981; }
.subtitle { font-size: 11px; color: #71717a; letter-spacing: 1px;}
.section-title { font-size: 14px; font-weight: bold; color: #e4e4e7; font-family: monospace;}

/* 卡片样式 */
.card-outline {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 20px;
}

/* 活跃度热力图控件 */
.heatmap-grid {
    display: flex;
    overflow-x: auto;
    gap: 4px;
}
.week-col {
    display: flex;
    flex-direction: column;
    gap: 4px;
}
.heat-cell, .legend-dot {
    width: 14px; height: 14px;
    border-radius: 3px;
}
.lvl-0 { background-color: #18181b; border: 1px solid #27272a; }
.lvl-1 { background-color: rgba(16, 185, 129, 0.3); }
.lvl-2 { background-color: rgba(16, 185, 129, 0.6); }
.lvl-3 { background-color: rgba(16, 185, 129, 1); box-shadow: 0 0 8px rgba(16, 185, 129, 0.6); }

.legend-text { font-size: 10px; color: #a1a1aa; }
.analysis-hint { font-size: 12px; color: #10b981; margin-top: 16px; font-weight: 500;}

/* 信息流广告占位 */
.native-ad-placeholder {
    background: #18181b;
    border-radius: 12px;
    padding: 12px;
    border: 1px solid #27272a;
}
.ad-cover {
    width: 70px; height: 70px;
    background: #27272a;
    border-radius: 8px;
    background-image: linear-gradient(45deg, #18181b 25%, transparent 25%, transparent 75%, #18181b 75%, #18181b), 
                      linear-gradient(45deg, #18181b 25%, transparent 25%, transparent 75%, #18181b 75%, #18181b);
    background-size: 10px 10px;
    background-position: 0 0, 5px 5px;
}
.ad-info { height: 70px; }
.ad-title { font-size: 14px; color: #d4d4d8; font-weight: bold; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;}
.ad-tag { font-size: 10px; color: #71717a; border: 1px solid #3f3f46; padding: 2px 6px; border-radius: 4px;}
.ad-btn { color: #10b981; font-weight: bold; }

/* 数据分析模块 */
.stat-row { width: 100%; }
.stat-label { font-size: 12px; color: #a1a1aa; }
.progress-bar { width: 200px; height: 6px; background-color: #27272a; border-radius: 3px; overflow: hidden;}
.progress-fill { height: 100%; border-radius: 3px; box-shadow: 0 0 10px currentColor;}
.stat-val { font-size: 18px; font-weight: 900; font-family: monospace;}
.text-green { color: #10b981; }
.text-red { color: #ef4444; }
</style>
