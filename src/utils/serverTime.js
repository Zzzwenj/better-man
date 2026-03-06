/**
 * 云端时间强校准中心 (反作弊核心)
 * 作用：拦截所有关键的 Date.now() 调用，防止被用户修改手机本地时间白嫖特权
 */

class ServerTime {
    constructor() {
        this.offset = 0 // 本地时间与服务器时间的偏差 (ms)
        this.isSynced = false
    }

    /**
     * 启动时或网络恢复时握手校准
     */
    async sync() {
        const localStart = Date.now()
        try {
            // 通过通用云函数接口拉取服务器时间戳
            const res = await uniCloud.callFunction({
                name: 'user-center',
                data: { action: 'getServerTime' }
            })

            if (res.result && res.result.code === 0) {
                const serverTimestamp = res.result.timestamp
                const localEnd = Date.now()
                // RTT 往返时延补偿
                const rtt = localEnd - localStart
                // 计算偏差：(服务器时间 + 通信补偿) - 当前本地时间
                this.offset = (serverTimestamp + rtt / 2) - localEnd
                this.isSynced = true
                console.log(`[Neuro-Time] 与主控云端时间同步完成, 偏差值: ${this.offset}ms`)
            }
        } catch (e) {
            console.warn('[Neuro-Time] 时间同步失败，暂时降级为设备本地时间', e)
        }
    }

    /**
     * 获取防篡改的真实当前毫秒数 T_real = T_local + Offset
     */
    now() {
        return Date.now() + this.offset
    }

    /**
     * 返回 ISO 字符串格式的真实时间
     */
    toISOString() {
        return new Date(this.now()).toISOString()
    }

    /**
     * 检查某个时间戳是否已经过期
     */
    isExpired(timestamp) {
        if (!timestamp) return true
        return timestamp < this.now()
    }

    /**
     * 计算指定时间距离现在的毫秒级倒计时差
     */
    getRemainTimes(timestamp) {
        if (!timestamp) return 0
        const remain = timestamp - this.now()
        return remain > 0 ? remain : 0
    }
}

export const serverTime = new ServerTime()
