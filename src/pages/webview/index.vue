<template>
  <view class="webview-container">
    <web-view v-if="validUrl" :src="validUrl"></web-view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const validUrl = ref('')

onLoad((options) => {
  if (options.url) {
    validUrl.value = decodeURIComponent(options.url)
  }
})
</script>

<style scoped>
.webview-container {
  width: 100vw;
  height: 100vh;
}
</style>
