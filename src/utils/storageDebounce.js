/**
 * storageDebounce.js — Storage 防抖写入模块
 * 避免高频 uni.setStorageSync 阻塞 JS 主线程导致掉帧
 * 
 * 使用方式：
 *   import { debouncedSetStorage } from '@/utils/storageDebounce.js'
 *   debouncedSetStorage('neuro_coins', 1234)  // 500ms 内同 key 合并为一次写入
 */

// 定时器缓存池
const _timers = {}
// 待写入值缓存池
const _pending = {}

/**
 * 防抖写入 Storage
 * 同一个 key 在 delay 毫秒内只执行最后一次写入
 * @param {string} key - Storage 键名
 * @param {*} value - 要写入的值
 * @param {number} delay - 防抖延迟（毫秒），默认 500ms
 */
export function debouncedSetStorage(key, value, delay = 500) {
    // 立即缓存最新值（内存中已是最新）
    _pending[key] = value

    if (_timers[key]) {
        clearTimeout(_timers[key])
    }

    _timers[key] = setTimeout(() => {
        try {
            uni.setStorageSync(key, _pending[key])
        } catch (e) {
            console.error('[StorageDebounce] 写入失败:', key, e)
        }
        delete _timers[key]
        delete _pending[key]
    }, delay)
}

/**
 * 强制刷新所有待写入的缓存（App 退出前调用）
 */
export function flushPendingStorage() {
    Object.keys(_pending).forEach(key => {
        if (_timers[key]) {
            clearTimeout(_timers[key])
            delete _timers[key]
        }
        try {
            uni.setStorageSync(key, _pending[key])
        } catch (e) {
            console.error('[StorageDebounce] flush 写入失败:', key, e)
        }
        delete _pending[key]
    })
}
