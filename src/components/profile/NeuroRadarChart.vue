<template>
  <view class="radar-container mx-4 mt-6">
    <view class="radar-header flex justify-between items-center mb-4">
      <text class="radar-title">神经漫游战报</text>
      <text class="radar-subtitle">近 7 天突触性能评估</text>
    </view>
    <view class="radar-svg-wrapper flex items-center justify-center">
      <!-- 采用原生 SVG 渲染多边形雷达图，保持极客感并消除第三方图表库体积负担 -->
      <svg :width="size" :height="size" :viewBox="`0 0 ${size} ${size}`">
        <defs>
          <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="var(--theme-primary, #00e5ff)" stop-opacity="0.3" />
            <stop offset="100%" stop-color="var(--theme-primary, #00e5ff)" stop-opacity="0" />
          </radialGradient>
        </defs>
        
        <!-- 背景雷达网格 - 渲染5层 -->
        <g stroke="rgba(255,255,255,0.06)" stroke-width="1" fill="none">
          <polygon v-for="i in 5" :key="'bg'+i" :points="getPolygonPoints(i * 20)" />
        </g>
        
        <!-- 获取最高阈值向外的交叉轴线 -->
        <g stroke="rgba(255,255,255,0.15)" stroke-width="1" stroke-dasharray="2 4">
          <line v-for="(point, index) in getPolygonPoints(100, true)" :key="'line'+index"
            :x1="center" :y1="center" :x2="point.x" :y2="point.y" />
        </g>
        
        <!-- 核心数据覆盖面 (填充发光渐变) -->
        <polygon 
          :points="dataPolygonPoints" 
          fill="url(#radarGlow)" 
          stroke="var(--theme-primary, #00e5ff)" 
          stroke-width="2" 
          class="data-polygon"
        />
        
        <!-- 核心数据节点圆点及可点击热区 -->
        <g v-for="(point, index) in dataPointsCoords" :key="'g-dot'+index" @click="handleStatClick(index)" class="stat-click-area">
            <circle 
              :cx="point.x" :cy="point.y" :r="activeIndex === index ? 6 : 4" 
              :fill="activeIndex === index ? 'var(--theme-primary, #00e5ff)' : '#09090b'" 
              stroke="var(--theme-primary, #00e5ff)" 
              stroke-width="2"
              style="transition: all 0.3s;"
            />
            <!-- 外围隐形扩大点击热区 -->
            <circle :cx="point.x" :cy="point.y" r="20" fill="transparent" />
        </g>
          
        <!-- 维度文案标签 (已合并中文和数据) -->
        <text v-for="(point, index) in getLabelPoints()" :key="'label'+index"
          @click="handleStatClick(index)"
          :x="point.x" :y="point.y" 
          :text-anchor="point.anchor" 
          alignment-baseline="middle"
          :fill="activeIndex === index ? '#ffffff' : '#a1a1aa'" 
          :font-weight="activeIndex === index ? 'bold' : 'normal'"
          font-size="11" font-family="monospace" letter-spacing="1"
          style="transition: all 0.3s;"
          class="stat-click-area">
          {{ statLabels[index] }} ({{ dataValues[index] }}%)
        </text>
      </svg>
    </view>
    
    <!-- 交互式中文含义解析容器 -->
    <view class="radar-legend mt-4" v-if="activeIndex !== -1">
      <view class="legend-box flex-col">
        <text class="legend-title flex items-center">
            <text class="dot mr-2"></text>
            {{ statLabels[activeIndex] }} 指数解析
        </text>
        <text class="legend-desc mt-2">{{ statDescriptions[activeIndex] }}</text>
      </view>
    </view>
    <view class="radar-legend-empty mt-4 flex items-center justify-center" v-else>
        <text class="hint-text">点击雷达图节点查看各项神经性能说明</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'

// 交互状态
const activeIndex = ref(-1)

// SVG 渲染视口约束
const size = 300
const center = size / 2
const radius = 90 // 控制网格最大半径，留给文字边距

const statLabels = ['绝对专注', '欲望切割', '抗压韧性', '突触可塑', '活跃共振']
const statDescriptions = [
    '前额叶皮层对无关刺激的物理屏蔽能力。数值越高，越不容易被外界娱乐信息打断心流。',
    '面对高敏触发源（如情绪低落、深夜独处）时的下意识刹车速度，反映潜意识的脱敏程度。',
    '在极高皮质醇环境下的回稳时间。决定了你在遭遇现实重大挫折破防后，是否会走向报复性放纵。',
    '大脑接纳新习惯及建立全新执行神经回路的效率。极客式生活重建的关键指标。',
    '在战区空间与全球其他联机终端的心流同频度，反映社交连接带来的正向催产素补充能力。'
]

// Mock 演示数据。实装可由父组件传入 user 历史计算状态
const dataValues = [88, 76, 92, 65, 80]

// 将极坐标转换为笛卡尔坐标系的数学计算
const polarToCartesian = (r, angle) => {
  return {
    x: center + r * Math.cos(angle),
    y: center + r * Math.sin(angle)
  }
}

// 获取各分层雷达网格的多边形顶点
const getPolygonPoints = (val, returnArray = false) => {
  const r = (val / 100) * radius
  const points = []
  for (let i = 0; i < 5; i++) {
    const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2
    points.push(polarToCartesian(r, angle))
  }
  if (returnArray) return points
  return points.map(p => `${p.x},${p.y}`).join(' ')
}

// 计算五芒星外围文本的位置
const getLabelPoints = (isVal = false) => {
  // 值在文案下方或内侧做些微调
  const r = isVal ? radius + 10 : radius + 28
  return statLabels.map((_, i) => {
    const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2
    let anchor = 'middle'
    // 动态判断文字居左还是居右锚点，避免超出边界
    if (Math.cos(angle) > 0.1) anchor = 'start'
    else if (Math.cos(angle) < -0.1) anchor = 'end'
    
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
      anchor
    }
  })
}

// 计算用户真实数据的坐标集合
const dataPointsCoords = computed(() => {
  return dataValues.map((val, i) => {
    const r = (val / 100) * radius
    const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2
    return polarToCartesian(r, angle)
  })
})

const dataPolygonPoints = computed(() => {
  return dataPointsCoords.value.map(p => `${p.x},${p.y}`).join(' ')
})

const handleStatClick = (index) => {
    uni.vibrateShort({
        success() {
            // iOS 默认反馈较佳，如果不响也没关系
        }
    })
    activeIndex.value = index
}
</script>

<style scoped>
.radar-container {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.mx-4 { margin: 0 20px; }
.mt-6 { margin-top: 24px; }
.mb-4 { margin-bottom: 20px; }
.flex { display: flex; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.justify-center { justify-content: center; }

.radar-title {
  font-size: 16px; 
  font-weight: 900; 
  color: var(--theme-primary, #00e5ff);
}
.radar-subtitle {
  font-size: 12px;
  color: #a1a1aa;
}

/* 多边形描边动画，给足极客科技感 */
.data-polygon {
  stroke-dasharray: 2000;
  stroke-dashoffset: 2000;
  animation: drawPolygon 2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes drawPolygon {
  to {
    stroke-dashoffset: 0;
  }
}

/* 交互区 */
.stat-click-area {
  cursor: pointer;
}

/* 动态图注样式 */
.radar-legend {
  padding-top: 16px;
  border-top: 1px dashed rgba(0, 229, 255, 0.2);
  min-height: 80px;
}

.radar-legend-empty {
  padding-top: 16px;
  border-top: 1px dashed rgba(255, 255, 255, 0.05);
  min-height: 80px;
}

.hint-text {
  font-size: 11px;
  color: #52525b;
  font-family: monospace;
  letter-spacing: 1px;
}

.legend-box {
  background: linear-gradient(90deg, rgba(0, 229, 255, 0.05) 0%, transparent 100%);
  border-left: 2px solid var(--theme-primary, #00e5ff);
  padding: 12px;
  border-radius: 4px;
  animation: slideIn 0.3s ease-out forwards;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateX(-10px); }
  to { opacity: 1; transform: translateX(0); }
}

.legend-title {
  font-size: 13px;
  color: #e4e4e7;
  font-weight: bold;
}

.legend-desc {
  font-size: 12px;
  color: #a1a1aa;
  line-height: 1.5;
}

.dot {
  width: 6px;
  height: 6px;
  background: var(--theme-primary, #00e5ff);
  border-radius: 50%;
  box-shadow: 0 0 8px var(--theme-primary, #00e5ff);
}

.mr-2 { margin-right: 8px; }
.mt-2 { margin-top: 8px; }
</style>
