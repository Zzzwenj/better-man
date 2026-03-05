<template>
  <view class="radar-container mx-4 mt-6">
    <view class="radar-header flex justify-between items-center mb-4">
      <text class="radar-title">神经漫游战报</text>
      <text class="radar-subtitle">近 7 天突触性能评估</text>
    </view>
    <view class="radar-svg-wrapper flex items-center justify-center">
      <!-- 采用 renderjs 渲染多边形雷达图，完美适配 App 真机视图层原生限制 -->
      <view class="render-container" :prop="renderData" :change:prop="radarUI.updateRadar" @touchstart="radarUI.handleTouch" @click="radarUI.handleTouch" id="radar-chart"></view>
    </view>
    
    <!-- 交互式中文含义解析容器 -->
    <view class="radar-legend mt-4" v-if="activeIndex !== -1">
      <view class="legend-box flex-col">
        <text class="legend-title flex items-center">
            <text class="dot mr-2"></text>
            {{ statLabels[activeIndex] }} ({{ dataValues[activeIndex] }}%) 指数解析
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

const activeIndex = ref(-1)

const statLabels = ['绝对专注', '欲望切割', '抗压韧性', '突触可塑', '活跃共振']
const statDescriptions = [
    '前额叶皮层对无关刺激的物理屏蔽能力。数值越高，越不容易被外界娱乐信息打断心流。',
    '面对高敏触发源（如情绪低落、深夜独处）时的下意识刹车速度，反映潜意识的脱敏程度。',
    '在极高皮质醇环境下的回稳时间。决定了你在遭遇现实重大挫折破防后，是否会走向报复性放纵。',
    '大脑接纳新习惯及建立全新执行神经回路的效率。极客式生活重建的关键指标。',
    '在战区空间与全球其他联机终端的心流同频度，反映社交连接带来的正向催产素补充能力。'
]

const dataValues = [88, 76, 92, 65, 80]

const renderData = computed(() => {
    return {
        values: dataValues,
        labels: statLabels,
        activeIndex: activeIndex.value
    }
})

// 被 renderjs 调用的点击回调
const handleStatClick = (index) => {
    uni.vibrateShort({
        success() { }
    })
    activeIndex.value = index
}
</script>

<script module="radarUI" lang="renderjs">
export default {
    methods: {
        updateRadar(newValue, oldValue, ownerInstance, instance) {
            if (!newValue || !newValue.values) return;
            const { values, labels, activeIndex } = newValue;

            const size = 300;
            const center = size / 2;
            const radius = 90;

            const polar = (r, angle) => ({
                x: center + r * Math.cos(angle),
                y: center + r * Math.sin(angle)
            });

            let svg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
                <defs>
                    <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stop-color="#00e5ff" stop-opacity="0.3" />
                        <stop offset="100%" stop-color="#00e5ff" stop-opacity="0" />
                    </radialGradient>
                    <style>
                        .data-polygon {
                            stroke-dasharray: 2000;
                            stroke-dashoffset: 2000;
                            animation: drawPolygon 2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                        }
                        @keyframes drawPolygon { to { stroke-dashoffset: 0; } }
                        .stat-click-area { cursor: pointer; }
                    </style>
                </defs>`;

            // 背景雷达网格
            svg += `<g stroke="rgba(255,255,255,0.06)" stroke-width="1" fill="none">`;
            for (let i = 1; i <= 5; i++) {
                const r = (i * 20 / 100) * radius;
                const points = [];
                for (let j = 0; j < 5; j++) {
                    const angle = (Math.PI * 2 * j) / 5 - Math.PI / 2;
                    const p = polar(r, angle);
                    points.push(`${p.x},${p.y}`);
                }
                svg += `<polygon points="${points.join(' ')}" />`;
            }
            svg += `</g>`;

            // 交叉轴线
            svg += `<g stroke="rgba(255,255,255,0.15)" stroke-width="1" stroke-dasharray="2 4">`;
            for (let j = 0; j < 5; j++) {
                const angle = (Math.PI * 2 * j) / 5 - Math.PI / 2;
                const p = polar(radius, angle); // 100% radius
                svg += `<line x1="${center}" y1="${center}" x2="${p.x}" y2="${p.y}" />`;
            }
            svg += `</g>`;

            // 核心数据多边形
            const dataPts = values.map((val, i) => {
                const r = (val / 100) * radius;
                const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
                return polar(r, angle);
            });
            const pStr = dataPts.map(p => `${p.x},${p.y}`).join(' ');

            svg += `<polygon points="${pStr}" fill="url(#radarGlow)" stroke="#00e5ff" stroke-width="2" class="data-polygon" />`;

            // 交互热区 (只有点，无文字标签)
            for (let i = 0; i < 5; i++) {
                const p = dataPts[i];
                const isActive = activeIndex === i;
                
                svg += `<g class="stat-click-area" data-index="${i}">`;
                svg += `<circle data-index="${i}" cx="${p.x}" cy="${p.y}" r="${isActive ? 6 : 4}" fill="${isActive ? '#00e5ff' : '#09090b'}" stroke="#00e5ff" stroke-width="2" style="transition: all 0.3s;" />`;
                // 扩大透明点击热区，直接加上 data-index 以防冒泡失败
                svg += `<circle data-index="${i}" cx="${p.x}" cy="${p.y}" r="25" fill="transparent" />`;
                svg += `</g>`;
            }

            svg += `</svg>`;

            const container = instance.$el || document.getElementById('radar-chart');
            if (container) {
                container.innerHTML = svg;
            }
        },
        // 通过数学坐标系直接计算点击位置，彻底无视 SVG DOM 原生事件传递的黑盒 BUG
        handleTouch(e, ownerInstance) {
            // 获取触摸点的屏幕坐标
            let touch = e.touches ? e.touches[0] : e;
            if (!touch) return;
            
            // 获取容器的边界信息
            const container = e.currentTarget || e.target;
            if (!container) return;
            
            // 由于 renderjs 无法直接调用 uni.createSelectorQuery，必须直接操作 DOM API
            const rect = container.getBoundingClientRect();
            
            // 计算在 300x300 画布内的相对坐标
            // 考虑外层可能存在的缩放比例 (CSS Transform 等)，做比例尺换算
            const scaleX = 300 / rect.width;
            const scaleY = 300 / rect.height;
            
            const x = (touch.clientX - rect.left) * scaleX;
            const y = (touch.clientY - rect.top) * scaleY;
            
            const size = 300;
            const center = size / 2;
            const radius = 90;
            
            // 遍历所有5个数据点，用勾股定理算距离
            for (let i = 0; i < 5; i++) {
                const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
                // 注意：这里用的是 100% 半径的坐标点用于点击判定，还是依据当前真实数据的点？
                // 按照此前的逻辑，点击外围的文字和内部真实数据应该都能触发。
                // 统一只算该维度在外圈的最大理论半径（文本热区），让点击更容易触发
                const px = center + (radius + 15) * Math.cos(angle);
                const py = center + (radius + 15) * Math.sin(angle);
                
                // 给一个极大的容错半径 45px，因为去掉了文字，纯靠盲点
                if (Math.hypot(x - px, y - py) < 45) {
                    ownerInstance.callMethod('handleStatClick', i);
                    return;
                }
                
                // 额外检查具体数据点位置 (处理如果真实点离外圈太远的情况)
                // 取个近似值，假设 values 暂时拿不到，只按固定 100/100 半径区域检测
            }
        }
    }
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
