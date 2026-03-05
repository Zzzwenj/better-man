import { ref } from 'vue'

/**
 * 赛博空间 - 激励广告桥接组件 (无业务耦合)
 * @param {string} adpid - DCloud uni-ad 申请的广告位ID (需换为真实ID)
 */
export function useRewardAd(adpid = 'your_adpid_here') {
    const isLoaded = ref(false)
    const isPlaying = ref(false)
    let rewardedVideoAd = null

    const initAd = () => {
        // #ifdef APP-PLUS || MP-WEIXIN || H5
        // 仅在支持的端初始化
        if (uni.createRewardedVideoAd) {
            rewardedVideoAd = uni.createRewardedVideoAd({ adpid })

            rewardedVideoAd.onLoad(() => {
                isLoaded.value = true
                console.log('[Neuro-Ad] 外部算力节点已阵列完毕')
            })

            rewardedVideoAd.onError((err) => {
                console.error('[Neuro-Ad] 算力节点握手失败:', err)
                isLoaded.value = false
            })
        }
        // #endif
    }

    const showAd = () => {
        return new Promise((resolve, reject) => {
            if (!rewardedVideoAd) {
                uni.showToast({ title: '当前系统版本过低，无法接驳底层链路', icon: 'none' })
                return reject(new Error('unsupported environment'))
            }

            // 清理历史监听，防止闭包污染
            rewardedVideoAd.offClose()

            // 监听用户关闭广告
            rewardedVideoAd.onClose((res) => {
                isPlaying.value = false
                // res.isEnded 只有在完整看完视频时才为 true (部分平台/版本若是 undefined 也默认算看完，但为了严格防刷，需判定是否强退)
                if (res && res.isEnded) {
                    console.log('[Neuro-Ad] 视频流解析完毕，允许核准发货')
                    resolve(true)
                } else {
                    // 播放中途被用户强行关闭
                    uni.showToast({ title: '信息流接收中断，校验失败', icon: 'none' })
                    resolve(false) // 返回 false 代表未完成，不抛错以配合业务层静默拦截
                }
            })

            isPlaying.value = true
            rewardedVideoAd.show().catch((err) => {
                console.warn('[Neuro-Ad] 缓存池无数据，尝试强制穿透节点拉取...', err)
                // 兜底机制：show 失败立即 load 后再次 show
                rewardedVideoAd.load()
                    .then(() => rewardedVideoAd.show())
                    .catch(e => {
                        isPlaying.value = false
                        uni.showToast({ title: '高并发通道拥挤，请稍后再试', icon: 'none' })
                        reject(e)
                    })
            })
        })
    }

    return {
        initAd,
        showAd,
        isLoaded,
        isPlaying
    }
}
