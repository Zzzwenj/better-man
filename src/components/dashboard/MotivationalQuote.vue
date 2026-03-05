<template>
  <view class="quote-card">
    <view class="flex items-start">
      <text class="quote-icon mr-3">🧠</text>
      <view class="flex-col flex-1">
        <text class="quote-title">每日认知强化 (Daily Affirmation)</text>
        <view class="quote-content mt-2">
          <text class="quote-text">"{{ currentQuote.text }}"</text>
        </view>
        <text class="quote-author mt-2">— {{ currentQuote.author }}</text>
      </view>
    </view>
    <view class="flex justify-end mt-2">
      <view class="refresh-btn flex items-center" hover-class="refresh-hover" @click="refreshQuote">
        <text class="refresh-icon">↻</text>
        <text class="refresh-text ml-1">重新注入</text>
      </view>
    </view>
  </view>
</template>

<script setup>
/**
 * @component MotivationalQuote
 * @description 觉醒空间随机引言组件，为用户提供心理暗示、激励箴言。
 */

import { ref, onMounted } from 'vue'

const quotes = [
  { text: '多巴胺的本质不是奖励，而是对奖励的“预期”。掌控预期，你就掌控了欲望。', author: '神经生物学事实' },
  { text: '每一次拒绝冲动，都会让你的前额叶皮层（理智中枢）变得更厚、更强。', author: '神经可塑性 (Neuroplasticity)' },
  { text: '当前的痛苦和焦躁，是你的基底神经节正在解除顽固旧习惯的物理连结。', author: '戒断反应原理' },
  { text: '你并非软弱。你的大脑奖励系统曾被超常刺激劫持，但它现在正在自我修复。', author: '神经科学常识' },
  { text: '欲望最强烈的时刻也是神经回路重组效率最高的时刻，挺过去，你就完成了升级。', author: '习惯的破茧' },
  { text: '冲动在脑皮层的传递只需几毫秒，但前额叶的干预需要半秒。深呼吸，让理智追上冲动。', author: '延迟满足训练' },
  { text: '连续 14 天的脱敏训练，能让长期暴露于超常刺激的大脑奖励回路开始恢复平衡。', author: '神经科学常识' },
  { text: '自律不是惩罚，而是避免大脑因过度刺激而产生“快感枯竭（Anhedonia）”的保护伞。', author: '奖赏回路保护' },
  { text: '真正的快乐来自于微小目标的连续达成，而非瞬间剧烈的多巴胺峰值洪流。', author: '多巴胺稳态平衡' },
  { text: '你现在感到的毫无干劲，是因为大脑正在重新建立对“正常阈值”活动的兴趣。', author: '戒断后脑雾现象修复' }
]

const currentQuote = ref(quotes[0])

const refreshQuote = () => {
  let newIndex
  do {
    newIndex = Math.floor(Math.random() * quotes.length)
  } while (quotes[newIndex].text === currentQuote.value.text)
  currentQuote.value = quotes[newIndex]
}

onMounted(() => {
  // 初始化随机格言
  currentQuote.value = quotes[Math.floor(Math.random() * quotes.length)]
})
</script>

<style lang="scss" scoped>
.quote-card {
  background: var(--theme-bg-highlight);
  border: 1px solid var(--theme-shadow-primary);
  border-radius: 16px;
  padding: 20px;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: radial-gradient(circle at top right, var(--theme-bg-highlight) 0%, transparent 60%);
    pointer-events: none;
  }
}
.items-start { align-items: flex-start; }
.mr-3 { margin-right: 12px; }
.mt-2 { margin-top: 8px; }
.ml-1 { margin-left: 4px; }
.flex { display: flex; }
.flex-col { display: flex; flex-direction: column; }
.flex-1 { flex: 1; }
.justify-end { justify-content: flex-end; }
.items-center { align-items: center; }

.quote-icon { font-size: 24px; filter: drop-shadow(0 0 5px var(--theme-shadow-primary)); }
.quote-title { font-size: 11px; color: var(--theme-primary); font-weight: bold; letter-spacing: 1px; font-family: monospace; }
.quote-content { border-left: 2px solid var(--theme-shadow-primary); padding-left: 10px; margin-left: 2px; }
.quote-text { font-size: 13px; color: #e4e4e7; line-height: 1.5; font-style: italic; }
.quote-author { font-size: 10px; color: #71717a; text-align: right; font-family: monospace; }

.refresh-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 4px 10px;
  border-radius: 12px;
  transition: all 0.2s;
  cursor: pointer;
}
.refresh-hover { background: var(--theme-bg-highlight); border-color: var(--theme-shadow-primary); }
.refresh-icon { font-size: 12px; color: var(--theme-primary); font-weight: bold; }
.refresh-text { font-size: 10px; color: #a1a1aa; }
</style>
