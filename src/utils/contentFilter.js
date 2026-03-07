/**
 * @module contentFilter
 * @description 前端内容合规预审核模块，供昵称/聊天/宣言等所有用户输入场景复用。
 * 采用正则匹配 + 关键词列表双重策略，拦截政治敏感、色情、辱骂、广告等违规内容。
 * 注意：此为前端预过滤层，云端应做二次校验（接入阿里云内容安全 API）。
 */

// ========== 敏感词库（分类维护，便于扩展）==========

// 政治敏感类
const POLITICAL_WORDS = [
    '习近平', '共产党', '反党', '反政府', '天安门', '六四', '法轮功',
    '台独', '港独', '藏独', '疆独', '邪教', '颠覆',
    '政变', '暴动', '专制', '独裁',
]

// 色情/低俗类
const PORN_WORDS = [
    '色情', '裸体', '做爱', '性交', '约炮', '一夜情', '嫖',
    '卖淫', '鸡巴', '阴茎', '阴道', '乳房', '胸罩',
    '自慰', '手淫', 'porn', 'sex', 'nude', 'nsfw',
    '黄片', 'av女', '成人视频', '福利视频', '18禁',
]

// 辱骂/人身攻击类
const ABUSE_WORDS = [
    '草泥马', '操你', '日你', '他妈的', '妈逼', '傻逼', '煞笔',
    '脑残', '智障', '废物', '去死', '弱智', '贱人', '婊子',
    '狗日', '王八蛋', '混蛋', '滚蛋', '你妈', '尼玛',
]

// 广告/引流类
const AD_WORDS = [
    '加微信', '加QQ', '➕V', '+V', '➕v',
    '免费领', '扫码', '点击链接', '优惠券', '兼职',
    '日赚', '月入', '代理', '刷单', '网赚',
]

// 违禁品/危险品类
const ILLEGAL_WORDS = [
    '毒品', '冰毒', '大麻', '海洛因', '摇头丸', 'K粉',
    '枪支', '弹药', '炸药', '自杀', '自残',
]

// 应用商店合规类（不适合在App内展示的表述）
const STORE_COMPLIANCE_WORDS = [
    '赌博', '赌场', '下注', '开奖', '彩票', '博彩',
]

// 合并所有分类为一个总词库
const ALL_BLOCK_WORDS = [
    ...POLITICAL_WORDS,
    ...PORN_WORDS,
    ...ABUSE_WORDS,
    ...AD_WORDS,
    ...ILLEGAL_WORDS,
    ...STORE_COMPLIANCE_WORDS,
]

// 正则模式匹配（捕获变体绕过，如用符号/空格分隔）
const REGEX_PATTERNS = [
    /https?:\/\/[^\s]+/i,                    // 外部链接
    /\b\d{5,11}\b/,                          // 连续5-11位数字（手机号/QQ号嫌疑）
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,  // 邮箱
    /\/v\//i,                                // 视频链接片段
]

/**
 * 检查文本是否包含敏感内容
 * @param {string} text - 待检查的文本
 * @param {Object} options - 配置项
 * @param {boolean} options.allowLinks - 是否允许链接（昵称场景不允许，聊天看情况）
 * @param {number} options.maxLength - 最大长度限制
 * @returns {{ safe: boolean, reason: string, word: string }}
 */
export const checkContent = (text, options = {}) => {
    if (!text || typeof text !== 'string') {
        return { safe: true, reason: '', word: '' }
    }

    const { allowLinks = false, maxLength = 500 } = options

    // 长度检查
    if (text.length > maxLength) {
        return { safe: false, reason: 'length', word: `超过${maxLength}字` }
    }

    // 纯空白检查
    if (!text.trim()) {
        return { safe: false, reason: 'empty', word: '内容为空' }
    }

    // 关键词匹配（统一转小写比对）
    const lowerText = text.toLowerCase()
    for (const word of ALL_BLOCK_WORDS) {
        if (lowerText.includes(word.toLowerCase())) {
            return { safe: false, reason: 'blocked_word', word }
        }
    }

    // 正则模式匹配
    if (!allowLinks) {
        for (const pattern of REGEX_PATTERNS) {
            if (pattern.test(text)) {
                return { safe: false, reason: 'pattern', word: pattern.source }
            }
        }
    }

    return { safe: true, reason: '', word: '' }
}

/**
 * 检查昵称合规性（更严格：不允许链接、手机号、长度限20字）
 * @param {string} nickname
 * @returns {{ safe: boolean, reason: string, word: string }}
 */
export const checkNickname = (nickname) => {
    return checkContent(nickname, { allowLinks: false, maxLength: 20 })
}

/**
 * 检查聊天消息合规性
 * @param {string} message
 * @returns {{ safe: boolean, reason: string, word: string }}
 */
export const checkMessage = (message) => {
    return checkContent(message, { allowLinks: false, maxLength: 500 })
}

/**
 * 获取屏蔽词列表（供云函数同步使用）
 * @returns {string[]}
 */
export const getBlockWordList = () => {
    return [...ALL_BLOCK_WORDS]
}
