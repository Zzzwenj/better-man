/**
 * timeGuard.js — 全局服务端时间校准模块
 * 防止用户篡改本地系统时间来作弊（刷签到、VIP永生、广告重置等）
 * 
 * 使用方式：
 *   import { initTimeGuard, getRealTime, getRealDateString } from '@/utils/timeGuard.js'
 *   await initTimeGuard(token)   // App 启动时调一次
 *   getRealTime()                // 替代 Date.now()
 *   getRealDateString()          // 替代 new Date().toDateString()
 */

// 服务端与本地的时间偏移量（毫秒）
let _offset = 0
// 是否已完成校准
let _calibrated = false

/**
 * 初始化时间校准（App 启动时调用一次）
 * @param {string} token - 用户 token
 */
export async function initTimeGuard(token) {
    if (!token) return

    try {
        const res = await uniCloud.callFunction({
            name: 'user-center',
            data: { action: 'getServerTime', token }
        })
        if (res.result && res.result.serverTime) {
            _offset = res.result.serverTime - Date.now()
            _calibrated = true
            console.log('[TimeGuard] 时间校准完成，偏移量:', _offset, 'ms')
        }
    } catch (e) {
        // 网络异常降级为本地时钟，不阻塞启动流程
        console.warn('[TimeGuard] 云端时间校准失败，降级使用本地时钟')
    }
}

/**
 * 获取校准后的当前时间戳（替代 Date.now()）
 * @returns {number}
 */
export function getRealTime() {
    return Date.now() + _offset
}

/**
 * 获取校准后的日期字符串（替代 new Date().toDateString()）
 * @returns {string}
 */
export function getRealDateString() {
    return new Date(getRealTime()).toDateString()
}

/**
 * 是否已成功完成云端校准
 * @returns {boolean}
 */
export function isCalibrated() {
    return _calibrated
}
