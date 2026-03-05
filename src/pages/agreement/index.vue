<template>
  <!-- 通用协议展示页 —— 接收 type=privacy|terms 参数 -->
  <view class="agreement-page" :style="themeStore.themeCssVars">
    <CyberNavBar :title="pageTitle" />

    <scroll-view scroll-y class="content-scroll hide-scrollbar">
      <!-- 用户协议内容 -->
      <view v-if="type === 'terms'" class="content-body">
        <text class="section-title">一、服务说明</text>
        <text class="section-text">
          欢迎使用「觉醒空间」（以下简称"本应用"）。本应用由觉醒空间科技团队（以下简称"我们"）开发并运营。在使用本应用之前，请您仔细阅读并充分理解本协议的全部条款。您通过网络页面点击确认或以其他方式选择接受本协议，即表示您已充分阅读、理解并接受本协议。

          本应用是一款面向中国用户的自律辅助工具，旨在通过行为干预、认知训练和社交监督机制，帮助用户建立积极健康的生活习惯。本应用不属于医疗器械或处方性质的治疗产品，所有干预仅供辅助参考。
        </text>

        <text class="section-title">二、用户资格</text>
        <text class="section-text">
          1. 您确认您已年满 18 周岁，具有完全民事行为能力。若未满 18 周岁，请在法定监护人的指导下使用本应用。
          2. 您应以真实身份注册，不得冒用他人信息。
          3. 每位用户仅允许注册一个账号。
        </text>

        <text class="section-title">三、神经币与虚拟资产</text>
        <text class="section-text">
          1. 神经币（NeuroCoins）是本应用内的虚拟货币，仅可在应用内使用，不具有任何法定货币属性，不可提现、转让或兑换。
          2. 虚拟商品（头像框、称号等）均有使用时效，到期后自动回收。
          3. 因用户主动注销账号或违反本协议被封禁导致的虚拟资产损失，我们不承担补偿责任。
        </text>

        <text class="section-title">四、行为干预免责声明</text>
        <text class="section-text">
          1. 本应用包含红屏震动、倒计时压迫、AI 语音鞭策等强感官刺激设计，属于行为干预辅助手段。若您患有心脏疾病、癫痫或其他因强感官刺激可能加重的病症，请勿使用本功能或提前咨询医生。
          2. AI 导师（Nova）生成的所有内容均由大语言模型自动生成，不代表专业医学或心理咨询建议。如您有严重的心理健康问题，请立即寻求专业医疗机构的帮助。
          3. 战区社交模块中的"连坐惩罚"机制纯属游戏化设计，不涉及任何真实财务损失。
        </text>

        <text class="section-title">五、用户行为规范</text>
        <text class="section-text">
          1. 禁止发布涉及色情、暴力、反动、赌博、毒品等违法违规内容。
          2. 禁止进行人身攻击、辱骂、骚扰等不当行为。
          3. 禁止利用技术手段非法获取虚拟资产、篡改数据。
          4. 违反以上规范的账号将被永久封禁且不予退款。
        </text>

        <text class="section-title">六、知识产权</text>
        <text class="section-text">
          本应用的所有内容（包括但不限于界面设计、代码、文案、图标、动画）均受中华人民共和国著作权法及国际版权公约保护。未经授权，不得复制、修改、分发或用于商业用途。
        </text>

        <text class="section-title">七、协议变更</text>
        <text class="section-text">
          我们有权根据法律法规变化或业务需要修订本协议。修订后的协议将通过应用内公告等方式通知您。若您在协议变更后继续使用本应用，即视为您已接受变更后的协议。
        </text>

        <text class="section-title">八、联系方式</text>
        <text class="section-text">
          如您对本协议有任何疑问，请通过以下方式联系我们：
          邮箱：support@rewire-app.com
        </text>

        <text class="update-date">更新日期：2026年2月28日</text>
      </view>

      <!-- 隐私政策内容 -->
      <view v-if="type === 'privacy'" class="content-body">
        <text class="section-title">一、我们收集的信息</text>
        <text class="section-text">
          为了向您提供服务，我们可能会收集以下个人信息：
          1.【注册信息】手机号码或电子邮箱地址、密码（加密存储）。
          2.【行为数据】您在应用内的使用时长、打卡天数、坚持时长等统计数据。
          3.【基线评估数据】您在首次引导问卷中填写的年龄段、多巴胺侵蚀史等匿名数据（用于 AI 个性化干预）。
          4.【设备信息】设备型号、操作系统版本（用于兼容性适配和技术排障）。

          我们不会收集：通讯录、短信内容、通话记录、相册（除非您主动选择头像）、精确地理位置等超出服务必需范围的信息。
        </text>

        <text class="section-title">二、信息的使用方式</text>
        <text class="section-text">
          1. 提供核心服务功能（登录验证、数据同步、AI 个性化干预）。
          2. 产品分析与改进（匿名化后的统计数据）。
          3. 安全风控（防刷机制、违规行为检测）。
          我们不会将您的个人信息出售给第三方。
        </text>

        <text class="section-title">三、信息存储与安全</text>
        <text class="section-text">
          1. 数据存储在阿里云（中国大陆境内）的 uniCloud 云端服务器上。
          2. 密码采用不可逆的 SHA256 加盐哈希存储，即使数据库泄露也无法还原明文。
          3. 敏感通信（如 SMTP 邮件、短信接口）的凭证通过云函数环境变量注入，不在代码中明文存储。
          4. 我们采取合理的技术和管理措施保护您的信息安全，但互联网传输不能保证绝对安全。
        </text>

        <text class="section-title">四、第三方服务说明</text>
        <text class="section-text">
          本应用可能使用以下第三方服务：
          1.【短信宝】用于发送手机短信验证码。
          2.【QQ 邮箱 SMTP】用于发送邮件验证码。
          3.【DeepSeek AI】用于 AI 导师对话功能，对话上下文经截断处理后发送。
          4.【uni-ad 广告联盟】用于激励视频广告展示。
          以上第三方服务的数据处理受其各自隐私政策约束。
        </text>

        <text class="section-title">五、您的权利</text>
        <text class="section-text">
          根据《个人信息保护法》，您享有以下权利：
          1.【查询权】您可随时在"系统中心"查看您的个人信息。
          2.【更正权】您可修改昵称、头像、个性签名等个人资料。
          3.【删除权】您可通过"完全焚毁档案"功能注销账号并永久删除所有数据。
          4.【撤回同意权】您可通过操作系统设置撤回相关权限授权。
        </text>

        <text class="section-title">六、未成年人保护</text>
        <text class="section-text">
          本应用的目标用户为 18 周岁及以上成年人。如果我们发现 14 周岁以下未成年人在未取得监护人同意的情况下注册使用，我们将主动删除该账户相关信息。
        </text>

        <text class="section-title">七、隐私政策更新</text>
        <text class="section-text">
          本政策可能不定期更新，更新后的版本将在应用内发布。重大变更将通过弹窗方式提示您重新确认。
        </text>

        <text class="section-title">八、联系方式</text>
        <text class="section-text">
          隐私保护相关问题请联系：
          邮箱：privacy@rewire-app.com

          如您认为我们未妥善处理您的个人信息，您有权向网信部门或消费者权益保护机构投诉举报。
        </text>

        <text class="update-date">更新日期：2026年2月28日</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
/**
 * @component 协议展示页
 * @description 通用协议/隐私政策展示页，接收 type 参数区分内容
 */
import { ref, onMounted } from 'vue'
import { useThemeStore } from '@/store/theme.js'

const themeStore = useThemeStore()
const type = ref('terms') // 默认用户协议
const pageTitle = ref('用户协议')

onMounted(() => {
  // 从路由参数获取类型
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = currentPage.$page?.options || currentPage.options || {}
  
  if (options.type === 'privacy') {
    type.value = 'privacy'
    pageTitle.value = '隐私政策'
  } else {
    type.value = 'terms'
    pageTitle.value = '用户协议'
  }
})
</script>

<style lang="scss" scoped>
.agreement-page {
  min-height: 100vh;
  background-color: #09090b;
  display: flex;
  flex-direction: column;
}

.content-scroll {
  flex: 1;
  height: 0; /* 配合 flex: 1 撑满 */
  padding: 0 24px;
  box-sizing: border-box;
  width: 100%;
}

.content-body {
  padding-top: 16px;
  padding-bottom: env(safe-area-inset-bottom);
  box-sizing: border-box;
  width: 100%;
}

.section-title {
  display: block;
  font-size: 16px;
  font-weight: 900;
  color: var(--theme-primary, #00e5ff);
  margin-top: 24px;
  margin-bottom: 8px;
  letter-spacing: 1px;
}

.section-text {
  display: block;
  font-size: 14px;
  color: #a1a1aa;
  line-height: 1.8;
  margin-bottom: 8px;
}

.update-date {
  display: block;
  font-size: 12px;
  color: #3f3f46;
  margin-top: 32px;
  margin-bottom: 24px;
  text-align: center;
  font-family: monospace;
}
</style>
