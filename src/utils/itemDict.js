/**
 * @module itemDict
 * @description 全局商品/称号/头像框 ID→名称的集中式映射字典，解耦业务组件中的魔法字符串硬编码。
 * 所有需要展示商品或称号文案的组件统一引用此模块。
 */

// 称号 ID → 展示名称
export const TITLE_MAP = {
  't_01': '[深渊行者]',
  't_02': '[破釜沉舟]',
  't_03': '[黑金守护]',
}

// 头像框 ID → 展示名称
export const FRAME_MAP = {
  'f_01': '深空等离子',
  'f_02': '故障干扰线',
}

// 商品 ID → 展示名称（可扩展价格/描述等）
export const ITEM_MAP = {
  'w_01': { name: '静音防护罩', desc: '免疫一次连坐惩罚', price: 200, duration: 1 },
  't_01': { name: '深渊行者称号', desc: '专属极客称号', price: 500, duration: 30 },
  't_02': { name: '破釜沉舟称号', desc: '专属极客称号', price: 500, duration: 30 },
  't_03': { name: '黑金守护称号', desc: 'VIP专属称号', price: 0, duration: -1, vipOnly: true },
  'f_01': { name: '深空等离子框', desc: '动态头像框', price: 300, duration: 30 },
  'f_02': { name: '故障干扰线框', desc: '动态头像框', price: 300, duration: 30 },
}

/**
 * 根据称号 ID 获取展示名称
 * @param {string} titleId - 称号 ID（如 't_01'）
 * @returns {string} 展示名称，未知 ID 返回空串
 */
export const getTitleName = (titleId) => {
  return TITLE_MAP[titleId] || ''
}
