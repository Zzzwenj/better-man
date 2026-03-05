/**
 * paymentManager.js (Rewire 商业化支付管线)
 * 抽象微信/支付宝/Apple IAP，提供统一支付接口。
 * @author Antigravity (2026)
 */

class PaymentManager {
    constructor() {
        this.platform = uni.getSystemInfoSync().platform;
        this.iapChannel = null;
        this.initIAP();
    }

    // iOS 内购初始化
    initIAP() {
        // #ifdef APP-PLUS
        if (this.platform === 'ios') {
            plus.payment.getChannels((channels) => {
                this.iapChannel = channels.find(c => c.id === 'appleiap');
                if (this.iapChannel) {
                    this.iapChannel.requestOrder(['recharge_6', 'recharge_68', 'vip_1month'], (res) => {
                        console.log('[IAP] 商品列表已就绪', res);
                    }, (err) => {
                        console.error('[IAP] 获取商品失败', err);
                    });
                }
            }, (e) => {
                console.error('[IAP] 获取支付通道失败', e);
            });
        }
        // #endif
    }

    /**
     * 发起统一支付
     * @param {Object} options 
     * @param {string} options.productId - 商品ID
     * @param {string} options.provider - 支付商 ('wxpay' | 'alipay' | 'appleiap')
     * @param {number} options.price - 价格（分）
     */
    async requestPayment(options) {
        return new Promise((resolve, reject) => {
            // #ifdef APP-PLUS
            if (this.platform === 'ios' && options.provider === 'appleiap') {
                if (!this.iapChannel) return reject(new Error('IAP 通道未就绪'));
                uni.requestPayment({
                    provider: 'appleiap',
                    orderInfo: { productid: options.productId },
                    success: (res) => {
                        console.log('[IAP] 支付成效', res);
                        // 需提交至云端进行收据校验 (App Store Receipt Validation)
                        this.verifyReceipt(res.transactionReceipt).then(resolve).catch(reject);
                    },
                    fail: (err) => {
                        console.error('[IAP] 支付中断', err);
                        reject(err);
                    }
                });
                return;
            }

            // Android (WeChat / Alipay)
            // 这里通常需要先调用后端获取 orderInfo（签名后的订单流）
            // 假设我们有一个云函数负责统一下单
            uniCloud.callFunction({
                name: 'payment-center',
                data: { action: 'createOrder', ...options }
            }).then(({ result }) => {
                if (result.code !== 0) return reject(new Error(result.msg));
                uni.requestPayment({
                    provider: options.provider,
                    orderInfo: result.orderInfo,
                    success: () => resolve({ msg: '接入成功' }),
                    fail: (err) => reject(new Error('充值中断:' + err.errMsg))
                });
            }).catch(reject);
            // #endif

            // #ifndef APP-PLUS
            reject(new Error('当前环境不支持呼出原生支付系统'));
            // #endif
        });
    }

    async verifyReceipt(receipt) {
        const { result } = await uniCloud.callFunction({
            name: 'payment-center',
            data: { action: 'verifyIAP', receipt }
        });
        if (result.code === 0) return true;
        throw new Error('IAP 收据校验未通过');
    }
}

export const paymentManager = new PaymentManager();
