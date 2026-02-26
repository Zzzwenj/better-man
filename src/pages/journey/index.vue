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
            <text class="stat-label">前额叶皮层受体修复率</text>
            <view class="progress-bar mt-2">
                <view class="progress-fill" style="width: 35%; background: #10b981;"></view>
            </view>
        </view>
        <text class="stat-val text-green ml-4">35%</text>
      </view>
      
      <view class="stat-row flex items-center justify-between mb-2">
        <view class="flex-col">
            <text class="stat-label">边缘系统异常渴求频次 / 周</text>
            <view class="progress-bar mt-2">
                <view class="progress-fill" style="width: 60%; background: #ef4444;"></view>
            </view>
        </view>
        <text class="stat-val text-red ml-4">High</text>
      </view>
    </view>
  </view>
</template>

<script setup>
// 生成热力图的模拟活跃度层级
const getMockLevel = (w, d) => {
    const random = Math.random();
    if (w === 6 && d > 3) return 'lvl-0'; // 未来的天数
    if (random > 0.8) return 'lvl-3';
    if (random > 0.5) return 'lvl-2';
    if (random > 0.3) return 'lvl-1';
    return 'lvl-0';
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
