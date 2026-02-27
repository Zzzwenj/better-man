<script>
export default {
  onLaunch: function () {
    console.log('App Launch - 特工隐秘模式已激活 (伪装: 计算器)')
    // 之前在这里有路由强制跳转到 /pages/dashboard 的逻辑，现在为了展示伪装首屏，必须去除。
    // 我们将所有业务逻辑转移到 calculator 页面验证隐秘代码 (8972=) 后跳转。
  },
  onShow: function () {
    console.log('App Show')
  },
  onHide: function () {
    console.log('App Hide')
  }
}
</script>

<style lang="scss">
/* 全局样式表 */
page {
  background-color: #121212;
  color: #E0E0E0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

view {
  box-sizing: border-box;
}

.text-primary { color: #00E676; } /* 霓虹绿，用于正向、成功、天数 */
.text-danger { color: #FF3D00; }  /* 霓虹红，用于急救、警报 */
.bg-surface { background-color: #1E1E1E; }
.bg-dark { background-color: #121212; }

/* Flex 快捷工具类 */
.flex { display: flex; }
.flex-col { display: flex; flex-direction: column; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
</style>
