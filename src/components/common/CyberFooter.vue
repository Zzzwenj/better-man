<template>
  <!-- 装饰性全息底座 -->
  <view class="cyber-footer flex-col items-center justify-end pb-8 mt-10">
    <view class="cyber-line"></view>
    <text class="cyber-text mt-2 block">REWIRE AI ENGINE V1.0</text>
  </view>
</template>

<script setup>
</script>

<style lang="scss" scoped>
.cyber-footer {
  width: 100%;
  opacity: 0.4;
  pointer-events: none;
}
.cyber-line {
  width: 120px;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--theme-primary, #00e5ff), transparent);
  box-shadow: 0 0 10px var(--theme-primary, #00e5ff);
}
.cyber-text {
  font-family: monospace;
  font-size: 10px;
  letter-spacing: 2px;
  color: #71717a;
}
.flex-col { display: flex; flex-direction: column; }
.items-center { align-items: center; }
.justify-end { justify-content: flex-end; }
.pb-8 { padding-bottom: 32px; }
.mt-10 { margin-top: 40px; }
.mt-2 { margin-top: 8px; }
.block { display: block; }
</style>
