/**
 * adManager.js (Rewire 信号拦截管理中枢)
 * 基于 uni-ad 封装，负责激励视频与信号注入的生命周期管理。
 * @author Antigravity (2026)
 */

class AdManager {
    constructor() {
        this.rewardedVideoAd = null;
        this.isAdLoading = false;
    }

    /**
     * 初始化并拉取激励视频信号
     * @param {string} adpid - 广告位 ID (uni-ad 提供)
     */
    async initRewardedVideo(adpid = '1507000689') { // 默认一个测试 ID
        if (this.rewardedVideoAd) return this.rewardedVideoAd;

        // #ifdef APP-PLUS || MP-WEIXIN
        if (uni.createRewardedVideoAd) {
            this.rewardedVideoAd = uni.createRewardedVideoAd({ adpid });

            this.rewardedVideoAd.onLoad(() => {
                console.log('[AdManager] 激励信号已锁定 (Load Success)');
                this.isAdLoading = false;
            });

            this.rewardedVideoAd.onError((err) => {
                console.error('[AdManager] 信号拦截失败 (Error):', err);
                this.isAdLoading = false;
                uni.showToast({ title: '信号场较弱，请稍后再试', icon: 'none' });
            });

            this.rewardedVideoAd.onClose((res) => {
                // 用户点击了关闭广告按钮
                if (res && res.isEnded) {
                    // 给予奖励
                    uni.$emit('ad-reward-success');
                } else {
                    // 播放中途退出
                    uni.showToast({ title: '信号拦截中断：补给未完全送达', icon: 'none' });
                }
            });
        }
        // #endif

        return this.rewardedVideoAd;
    }

    /**
     * 展示激励视频
     */
    async showRewardedVideo() {
        if (!this.rewardedVideoAd) {
            await this.initRewardedVideo();
        }

        if (this.rewardedVideoAd) {
            this.rewardedVideoAd.show().catch(() => {
                // 失败重试
                this.rewardedVideoAd.load()
                    .then(() => this.rewardedVideoAd.show())
                    .catch(err => {
                        console.error('[AdManager] 调取失败:', err);
                        uni.showToast({ title: '能量场波动，请重试', icon: 'none' });
                    });
            });
        } else {
            uni.showToast({ title: '当前终端不支持能量注入', icon: 'none' });
        }
    }
}

export const adManager = new AdManager();
