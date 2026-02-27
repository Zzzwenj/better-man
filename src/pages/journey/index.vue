<template>
  <scroll-view scroll-y class="container flex-col">
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
    
    <!-- 里程碑 -->
    <view class="benefits-container mx-4 mt-6">
       <view class="badges-area">
           <text class="section-title block mb-4">神经重塑里程碑</text>
           <scroll-view scroll-x class="badge-scroll-view" :show-scrollbar="false">
               <view class="badge-list flex">
                   <view class="badge-item flex-col items-center" 
                         v-for="badge in milestoneBadges" :key="badge.day"
                         :class="{ 'unlocked': daysClean >= badge.day, 'next-goal': daysClean < badge.day && isNextGoal(badge.day) }">
                       
                       <view class="badge-icon-wrapper">
                           <!-- 进度外环 (如果在进行中) -->
                           <svg v-if="daysClean < badge.day && isNextGoal(badge.day)" class="progress-ring" viewBox="0 0 60 60">
                               <circle class="ring-bg" cx="30" cy="30" r="28" />
                               <circle class="ring-fill" cx="30" cy="30" r="28" :stroke-dasharray="175" :stroke-dashoffset="175 - (175 * getGoalProgress(badge.day))" />
                           </svg>
                           
                           <view class="badge-icon" :style="{ filter: daysClean >= badge.day ? 'none' : 'grayscale(100%) opacity(30%)' }">{{ badge.icon }}</view>
                           
                           <!-- 解锁发光特效 -->
                           <view class="glow-effect" v-if="daysClean >= badge.day"></view>
                       </view>
                       
                       <text class="badge-day">{{ badge.day }} 天</text>
                       <text class="badge-name">{{ badge.name }}</text>
                       
                       <!-- 进度文字提示 -->
                       <text class="badge-progress" v-if="daysClean < badge.day && isNextGoal(badge.day)">
                           {{ daysClean }} / {{ badge.day }}
                       </text>
                   </view>
               </view>
           </scroll-view>
       </view>
    </view>
  </scroll-view>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const daysClean = ref(0)
const repairRate = ref(10)
const cravingLevel = ref('极高 (High)')

const milestoneBadges = [
  { day: 1, name: '初次抵抗', icon: '🔋' },
  { day: 3, name: '生化干预', icon: '🩸' },
  { day: 7, name: '感官脱敏', icon: '🛡️' },
  { day: 14, name: '受体恢复', icon: '🔌' },
  { day: 21, name: '通道重建', icon: '🧬' },
  { day: 30, name: '额叶觉醒', icon: '👁️' },
  { day: 60, name: '边缘重调', icon: '⚖️' },
  { day: 90, name: '神经霸体', icon: '👑' },
  { day: 180, name: '自我掌控', icon: '🌌' },
  { day: 365, name: '化境重生', icon: '✨' }
]

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

// 计算下一个目标里程碑
const isNextGoal = (badgeDay) => {
    const nextBadge = milestoneBadges.find(b => b.day > daysClean.value)
    return nextBadge && nextBadge.day === badgeDay
}

// 计算当前正在进行的里程碑进度百分比 (0-1)
const getGoalProgress = (badgeDay) => {
    // 找到上一个解锁的里程碑天数
    const unlockedBadges = milestoneBadges.filter(b => b.day <= daysClean.value)
    const prevDay = unlockedBadges.length > 0 ? unlockedBadges[unlockedBadges.length - 1].day : 0
    
    const totalRequired = badgeDay - prevDay
    const currentProgress = daysClean.value - prevDay
    
    return currentProgress / totalRequired
}

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
  min-height: 100vh;
  background-color: #09090b;
  padding-bottom: 40px;
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

/* 徽章列表 */
.badge-scroll-view { width: 100%; white-space: nowrap; padding-bottom: 16px; margin-left: -10px; padding-left: 10px; }
::-webkit-scrollbar { display: none; width: 0; height: 0; }
.badge-list { gap: 20px; justify-content: flex-start; display: inline-flex; padding-right: 20px;}
.badge-item {
    width: 72px; /* 固定宽度以适应滚动 */
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    position: relative;
    padding-top: 6px;
}
.badge-item.unlocked {
    transform: translateY(-4px);
}
.badge-item.next-goal {
    transform: scale(1.05);
}

.badge-icon-wrapper {
    position: relative;
    width: 60px; height: 60px;
    display: flex; justify-content: center; align-items: center;
    margin-bottom: 8px;
}

.badge-icon {
    width: 52px; height: 52px;
    background: linear-gradient(145deg, #18181b, #27272a); 
    border: 1px solid #3f3f46;
    border-radius: 26px;
    display: flex; align-items: center; justify-content: center;
    font-size: 24px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.6), inset 0 2px 4px rgba(255,255,255,0.05);
    z-index: 2;
    transition: all 0.5s ease;
}

.badge-item.unlocked .badge-icon {
    border-color: #10b981;
    background: linear-gradient(145deg, #064e3b, #047857);
    color: #fff;
    box-shadow: 0 0 20px rgba(16, 185, 129, 0.4), inset 0 0 10px rgba(16, 185, 129, 0.8);
}

.glow-effect {
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    width: 60px; height: 60px;
    background: radial-gradient(circle, rgba(16, 185, 129, 0.6) 0%, transparent 70%);
    border-radius: 50%;
    z-index: 1;
    animation: slow-pulse 3s infinite alternate;
}

.progress-ring {
    position: absolute;
    top: 0; left: 0;
    width: 60px; height: 60px;
    transform: rotate(-90deg);
    z-index: 3;
}
.ring-bg {
    fill: none;
    stroke: #27272a;
    stroke-width: 2;
}
.ring-fill {
    fill: none;
    stroke: #10b981;
    stroke-width: 2.5;
    stroke-linecap: round;
    transition: stroke-dashoffset 1s ease-out;
}

.badge-day { font-size: 11px; color: #10b981; font-weight: 900; font-family: monospace; }
.badge-name { font-size: 12px; color: #e4e4e7; font-weight: bold; margin-top: 4px; letter-spacing: 1px;}
.badge-progress { font-size: 9px; color: #a1a1aa; font-family: monospace; margin-top: 4px; background: #27272a; padding: 2px 6px; border-radius: 8px;}

.badge-item:not(.unlocked):not(.next-goal) .badge-day { color: #52525b; }
.badge-item:not(.unlocked):not(.next-goal) .badge-name { color: #52525b; }

@keyframes slow-pulse {
    0% { transform: translate(-50%, -50%) scale(0.9); opacity: 0.5; }
    100% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.8; }
}

/* 数据分析模块 */
.stat-row { width: 100%; }
.stat-label { font-size: 12px; color: #a1a1aa; }
.progress-bar { width: 200px; height: 6px; background-color: #27272a; border-radius: 3px; overflow: hidden;}
.progress-fill { height: 100%; border-radius: 3px; box-shadow: 0 0 10px currentColor;}
.stat-val { font-size: 18px; font-weight: 900; font-family: monospace;}
.text-green { color: #10b981; }
.text-red { color: #ef4444; }
</style>
