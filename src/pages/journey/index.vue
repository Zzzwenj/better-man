<template>
  <view class="container flex-col" :style="themeStore.themeCssVars">
    <view class="header flex justify-between items-center">
      <view class="room-info flex-col">
          <text class="title tracking-wider">观测图谱</text>
          <text class="subtitle block mt-1">神经可塑性观测图谱</text>
      </view>
    </view>
    
    <!-- 1. 神经战报雷达图 (核心资产置顶) -->
    <view class="radar-section-wrap mt-4">
      <NeuroRadarChart />
    </view>
    
    <!-- 2. 里程碑 (紧随其后) -->
    <view class="benefits-container mx-4 mt-2">
       <view class="badges-area">
           <text class="section-title block mb-4">神经重塑里程碑</text>
           <scroll-view scroll-x class="badge-scroll-view" :show-scrollbar="false">
               <NeuroBadge 
                 v-for="badge in milestoneBadges" 
                 :key="badge.day"
                 :badge="badge"
                 :status="getBadgeStatus(badge.day)"
                 :progress="getGoalProgress(badge.day)"
                 :currentDays="daysClean"
                 @clickBadge="handleBadgeClick"
               />
           </scroll-view>
       </view>
    </view>

    <!-- 3. 热力图模块 (修行为径) -->
    <view class="card-outline mt-2 mx-4">
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
      
      <!-- 带坐标轴的热力图 — 动态 12 列铺满卡片全宽 -->
      <view class="heatmap-wrapper mt-2">
        <!-- X轴：月份标签行 -->
        <view class="heatmap-x-row flex">
          <view class="y-axis-spacer"></view>
          <view class="heatmap-x-labels flex flex-1">
            <view class="x-label-cell flex-1" v-for="(col, i) in heatmapCols" :key="'xl'+i">
              <text class="axis-text">{{ col.xLabel }}</text>
            </view>
          </view>
        </view>
        <!-- Y轴 + 热力格子主体 -->
        <view class="heatmap-main flex mt-1">
          <!-- Y轴 (完整 7 天) -->
          <view class="y-axis flex-col mr-1">
            <view class="y-cell" v-for="day in ['日','一','二','三','四','五','六']" :key="day">
              <text class="axis-text">{{ day }}</text>
            </view>
          </view>
          <!-- 格子区 — flex 弹性撑满剩余宽度 -->
          <view class="heatmap-grid flex flex-1">
            <view class="week-col flex-col flex-1" v-for="(col, wi) in heatmapCols" :key="'wc'+wi">
              <view
                v-for="(level, di) in col.cells"
                :key="di"
                :class="['heat-cell', level]"
              ></view>
            </view>
          </view>
        </view>
      </view>
      
      <text class="analysis-hint block mt-3">▶ 连续 14 天未熔断，基底神经节逐渐脱敏。</text>
    </view>
    
    <!-- 4. 评估数据模块 -->
    <view class="card-outline mt-4 mx-4">
      <text class="section-title block mb-4">自律数据分析</text>
      
      <view class="stat-row flex items-center justify-between mb-4">
        <view class="flex-col">
            <text class="stat-label">前额极皮层受体修复率 (根据持续天数换算)</text>
            <view class="progress-bar mt-2">
                <view class="progress-fill" :style="{ width: repairRate + '%', background: 'linear-gradient(90deg, var(--theme-primary-grad-start) 0%, var(--theme-primary-grad-end) 100%)' }"></view>
            </view>
        </view>
        <text class="stat-val text-cyan text-right ml-4">{{ repairRate }}%</text>
      </view>
      
      <view class="stat-row flex items-center justify-between mb-2">
        <view class="flex-col">
            <text class="stat-label">边缘系统异常渴求频次评估</text>
            <view class="progress-bar mt-2">
                <view class="progress-fill" :style="{ 
                    width: cravingLevel === '极高' ? '80%' : cravingLevel === '中等' ? '40%' : '10%', 
                    background: cravingLevel === '极高' ? 'linear-gradient(90deg, #F43F5E, #9F1239)' : cravingLevel === '中等' ? 'linear-gradient(90deg, #F59E0B, #B45309)' : 'linear-gradient(90deg, var(--theme-primary-grad-start), var(--theme-primary-grad-end))' 
                }"></view>
            </view>
        </view>
        <text class="stat-val text-right ml-4" :style="{ 
            color: cravingLevel === '极高' ? '#ef4444' : cravingLevel === '中等' ? '#f59e0b' : 'var(--theme-primary)' 
        }">{{ cravingLevel }}</text>
      </view>
    </view>
    
    <!-- 全屏高光分享卡片组件 -->
    <MilestoneShareCard :show="showShareOverlay" :milestone="selectedMilestone" @close="closeShareOverlay" />
    
    <CyberFloatBall />
    <CustomTabBar :current="1" />
  </view>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import MilestoneShareCard from '../../components/journey/MilestoneShareCard.vue'
import CustomTabBar from '../../components/common/CustomTabBar.vue'
import NeuroBadge from '../../components/journey/NeuroBadge.vue'
import NeuroRadarChart from '../../components/profile/NeuroRadarChart.vue' /* 借用已有的组件路径 */
import CyberFloatBall from '../../components/dashboard/CyberFloatBall.vue'
import CyberDialog from '../../components/common/CyberDialog.vue'
import { serverTime } from '@/utils/serverTime.js'
import { useThemeStore } from '../../store/theme.js'

const themeStore = useThemeStore()
const daysClean = ref(0)
const repairRate = ref(10)
const cravingLevel = ref('极高 (High)')

const showShareOverlay = ref(false)
const selectedMilestone = ref({})

// 将原先平庸的Emoji替换为赛博/科幻风格的特殊符号或几何形状
const milestoneBadges = [
  { day: 1, name: '初次抵抗', icon: '❂' },
  { day: 3, name: '生化干预', icon: '⚡' },
  { day: 7, name: '感官脱敏', icon: '۞' },
  { day: 14, name: '受体恢复', icon: '✧' },
  { day: 21, name: '通道重建', icon: '☤' },
  { day: 30, name: '额叶觉醒', icon: '👁' },
  { day: 60, name: '边缘重调', icon: '☸' },
  { day: 90, name: '神经霸体', icon: '♕' },
  { day: 120, name: '虚空行走', icon: '♅' },
  { day: 150, name: '潜意识净化', icon: '⚚' },
  { day: 180, name: '自我掌控', icon: '∞' },
  { day: 270, name: '绝对中立', icon: '⎊' },
  { day: 365, name: '化境重生', icon: '☬' }
]

onMounted(() => {
  uni.hideTabBar()

  // 1. 获取本地持久化的重塑记录起点
  let startTimestamp = uni.getStorageSync('neuro_start_date')
  if (!startTimestamp) {
    // 无记录则默认 0 天，不主动写入假数据（防止与 Dashboard 竞争）
    daysClean.value = 0
  } else {
    const diffTime = serverTime.now() - startTimestamp
    daysClean.value = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)))
  }
  
  // 2. 核心动态算法：基于坚持天数的受体修复率预估
  // 基础受损算底分 10%，每天恢复 1.5%（这个冷酷的慢速恢复能让破戒成本变得极大）
  let rate = 10 + (daysClean.value * 1.5)
  repairRate.value = Math.min(Math.floor(rate), 100)
  
  // 3. 渴求频次多巴胺预估
  if (daysClean.value < 7) {
      cravingLevel.value = '极高'
  } else if (daysClean.value < 21) {
      cravingLevel.value = '中等'
  } else {
      cravingLevel.value = '平稳'
  }
})

const handleBadgeClick = (badge, status) => {
    // 只有已解锁的里程碑才允许查看高光卡片
    if (status === 'unlocked') {
        selectedMilestone.value = badge
        showShareOverlay.value = true
    } else {
        const statusMap = {
          'locked': '里程碑处于沉睡态，等待激活',
          'progress': '正在充能中，请坚持！'
        }
        uni.showToast({ title: statusMap[status] || '尚未激活', icon: 'none' })
    }
}

// 动态判断徽章状态给子组件
const getBadgeStatus = (badgeDay) => {
    if (daysClean.value >= badgeDay) return 'unlocked'
    if (isNextGoal(badgeDay)) return 'progress'
    return 'locked'
}

const closeShareOverlay = () => {
    showShareOverlay.value = false
}

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

/**
 * 热力图数据 — 动态 12 列，铺满卡片宽度
 * 以今天为基准向前推 12 周，每列含 X 轴月份标签 + 7 天打卡等级
 */
const heatmapCols = computed(() => {
  const historyFlags = uni.getStorageSync('neuro_checkins') || ''
  const WEEKS = 12
  const today = new Date(serverTime.now())
  const todayDow = today.getDay() // 0=日,1=一,...,6=六

  // 第 0 列(最左)首格距今天多少天
  const startOffset = (WEEKS - 1) * 7 + todayDow
  const cols = []
  let lastMonth = -1

  for (let w = 0; w < WEEKS; w++) {
    const cells = []
    let xLabel = ''

    for (let d = 0; d < 7; d++) {
      // 该格距今天多少天前 (正 = 过去, 0 = 今天)
      const daysAgo = startOffset - w * 7 - d

      // X轴标签：每列首格检测到月份切换时显示
      if (d === 0) {
        const cellDate = new Date(today)
        cellDate.setDate(today.getDate() - daysAgo)
        const m = cellDate.getMonth() + 1
        if (m !== lastMonth) {
          xLabel = `${m}月`
          lastMonth = m
        }
      }

      // 读取打卡历史位串 (最右侧 = 最新)
      let level = 'lvl-0'
      if (daysAgo >= 0 && daysAgo < historyFlags.length) {
        const flag = historyFlags[historyFlags.length - 1 - daysAgo]
        level = flag === '1' ? 'lvl-3' : 'lvl-1'
      }
      cells.push(level)
    }

    cols.push({ xLabel, cells })
  }
  return cols
})
</script>

<style lang="scss" scoped>
page {
  height: 100%;
}

.container {
  height: 100%;
  width: 100%;
  overflow-x: hidden;
  background-color: #09090b;
  box-sizing: border-box;
  padding-bottom: calc(88px + env(safe-area-inset-bottom));
  overflow-y: auto;
}
.header {
  padding: calc(var(--status-bar-height) + 24px) 20px 12px 20px;
  background: rgba(9, 9, 11, 0.65);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  position: sticky;
  top: 0;
  z-index: 50;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
  box-sizing: border-box;
  width: 100%;
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

.title { font-size: 24px; font-weight: 900; color: var(--theme-primary); text-shadow: 0 0 15px var(--theme-shadow-primary); }
.subtitle { font-size: 11px; color: #a1a1aa; letter-spacing: 1px;}
.section-title { font-size: 14px; font-weight: bold; color: #e4e4e7; font-family: monospace;}

/* 卡片样式 */
.card-outline {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 20px;
}

/* 活跃度热力图控件 — 铺满宽度 */
.heatmap-wrapper { width: 100%; }
.heatmap-x-row { align-items: flex-end; }
.y-axis-spacer { width: 18px; flex-shrink: 0; margin-right: 4px; }
.heatmap-x-labels { gap: 3px; overflow: hidden; }
.x-label-cell { min-width: 0; text-align: left; }
.axis-text { font-size: 9px; color: #71717a; font-family: monospace; }
.heatmap-main { align-items: stretch; }
.y-axis { width: 18px; flex-shrink: 0; margin-right: 4px; }
.y-cell { aspect-ratio: 1; min-height: 10px; margin-bottom: 3px; display: flex; align-items: center; }
.y-cell:last-child { margin-bottom: 0; }
.heatmap-grid { gap: 3px; align-items: stretch; }
.week-col { gap: 3px; min-width: 0; flex: 1; }
.heat-cell { width: 100%; aspect-ratio: 1; min-width: 10px; min-height: 10px; border-radius: 3px; }
.legend-dot { width: 12px; height: 12px; border-radius: 3px; flex-shrink: 0; }
.lvl-0 { background-color: #18181b; border: 1px solid #27272a; }
.lvl-1 { background-color: var(--theme-bg-highlight); }
.lvl-2 { background-color: var(--theme-shadow-primary); }
.lvl-3 { background-color: var(--theme-primary); box-shadow: 0 0 6px var(--theme-shadow-primary); }

.legend-text { font-size: 10px; color: #a1a1aa; }
.analysis-hint { font-size: 12px; color: var(--theme-primary); margin-top: 16px; font-weight: 500; }

/* 徽章列表容器 */
.badge-scroll-view { width: 100%; white-space: nowrap; padding-top: 15px; padding-bottom: 30px; margin-left: -10px; padding-left: 10px; }
::-webkit-scrollbar { display: none; width: 0; height: 0; }
.badge-list { padding-right: 20px; }
/* ==== 徽章本身的复杂 CSS 均已抽离至 NeuroBadge.vue 中 ==== */
.radar-section-wrap {
  margin-top: -10px; /* 紧贴 Header 阴影边界 */
}
.stat-row { width: 100%; }
.stat-label { font-size: 12px; color: #a1a1aa; }
.progress-bar { width: 200px; height: 6px; background-color: #27272a; border-radius: 3px; overflow: hidden;}
.progress-fill { height: 100%; border-radius: 3px; box-shadow: 0 0 10px currentColor;}
.stat-val { font-size: 18px; font-weight: 900; font-family: monospace; width: 60px; flex-shrink: 0;}
.text-right { text-align: right; }
.text-cyan { color: var(--theme-primary); }
.text-red { color: #ef4444; }
</style>
