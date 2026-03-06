'use strict';
const db = uniCloud.database()
const dbCmd = db.command

/**
 * payment-center 云函数
 * 统一处理微信/支付宝下单、IAP收据校验、支付回调确认
 * 上架前需配置真实的微信/支付宝商户参数
 */
exports.main = async (event, context) => {
    const { action, token } = event

    // --- 鉴权 ---
    let uid = ''
    if (token) {
        try {
            const authRes = await uniCloud.callFunction({
                name: 'uni-id-cf',
                data: { action: 'checkToken', token }
            })
            if (authRes.result.code !== 0) {
                return { code: 401, msg: '身份验证失败，请重新登录' }
            }
            uid = authRes.result.uid
        } catch (e) {
            return { code: 401, msg: '鉴权服务不可用' }
        }
    } else {
        return { code: 401, msg: '缺少身份凭证' }
    }

    const usersCol = db.collection('uni-id-users')
    const ordersCol = db.collection('payment-orders')

    switch (action) {
        case 'createOrder':
            return await createOrder(ordersCol, uid, event)
        case 'verifyIAP':
            return await verifyIAP(ordersCol, usersCol, uid, event)
        case 'confirmPayment':
            return await confirmPayment(ordersCol, usersCol, uid, event)
        default:
            return { code: 400, msg: '未知操作' }
    }
}

/**
 * 创建支付订单（微信/支付宝）
 * 上线前需替换为真实的商户签名逻辑
 */
async function createOrder(ordersCol, uid, event) {
    const { productId, provider, price } = event

    // 商品ID → 天数映射表（与前端 Premium 页保持一致）
    const PRODUCT_MAP = {
        'vip_month': { days: 30, priceFen: 1800, name: '黑金通行证 - 30天' },
        'vip_quarter': { days: 90, priceFen: 4500, name: '黑金通行证 - 90天' },
        'vip_forever': { days: 36500, priceFen: 16800, name: '黑金通行证 - 永久' }
    }

    const product = PRODUCT_MAP[productId]
    if (!product) {
        return { code: 400, msg: '无效的商品ID' }
    }

    // 创建订单记录
    const orderId = `PAY_${Date.now()}_${uid.slice(-6)}`
    await ordersCol.add({
        _id: orderId,
        user_id: uid,
        product_id: productId,
        product_name: product.name,
        price_fen: product.priceFen,
        vip_days: product.days,
        provider: provider, // 'wxpay' | 'alipay'
        status: 'pending',  // pending → paid → fulfilled
        created_at: Date.now(),
        updated_at: Date.now()
    })

    /**
     * ⚠️ 上线前必须替换：
     * 
     * 微信支付：需调用微信统一下单接口获取 prepay_id，
     *   然后用商户密钥签名返回给前端 orderInfo
     * 
     * 支付宝：需调用支付宝 trade.app.pay 接口获取 orderString
     * 
     * 当前返回模拟数据用于开发调试
     */
    return {
        code: 0,
        msg: '订单创建成功',
        orderId: orderId,
        orderInfo: {
            // 模拟的订单签名信息，上线前替换为真实签名
            orderId: orderId,
            provider: provider,
            totalFee: product.priceFen,
            body: product.name,
            _mock: true // 标记为模拟数据
        }
    }
}

/**
 * iOS IAP 收据校验
 * 上线前需对接 Apple 的 verifyReceipt 接口
 */
async function verifyIAP(ordersCol, usersCol, uid, event) {
    const { receipt, productId } = event

    if (!receipt) {
        return { code: 400, msg: '缺少 IAP 收据' }
    }

    // IAP 商品ID → VIP天数映射
    const IAP_MAP = {
        'vip_month': { days: 30 },
        'vip_quarter': { days: 90 },
        'vip_forever': { days: 36500 }
    }

    /**
     * ⚠️ 上线前必须替换：
     * 
     * 需要向 Apple 服务器发送收据验证请求
     * 生产环境: https://buy.itunes.apple.com/verifyReceipt
     * 沙箱环境: https://sandbox.itunes.apple.com/verifyReceipt
     * 
     * 当前直接信任收据（仅开发阶段）
     */
    const product = IAP_MAP[productId] || { days: 30 }

    // 记录订单
    const orderId = `IAP_${Date.now()}_${uid.slice(-6)}`
    await ordersCol.add({
        _id: orderId,
        user_id: uid,
        product_id: productId,
        provider: 'appleiap',
        price_fen: 0, // IAP 不走人民币
        vip_days: product.days,
        status: 'paid',
        iap_receipt: receipt.substring(0, 200), // 只存前200字符用于溯源
        created_at: Date.now(),
        updated_at: Date.now()
    })

    // 直接激活VIP
    const now = Date.now()
    const userRes = await usersCol.where({ _id: uid }).get()
    const currentExpire = (userRes.data[0] && userRes.data[0].vip_expire) || 0
    const durationMs = product.days * 24 * 60 * 60 * 1000
    const newExpire = currentExpire > now ? currentExpire + durationMs : now + durationMs

    await usersCol.where({ _id: uid }).update({
        vip_expire: newExpire,
        updated_at: now
    })

    await ordersCol.doc(orderId).update({
        status: 'fulfilled',
        updated_at: now
    })

    return {
        code: 0,
        msg: 'IAP 校验通过，VIP 已激活',
        vipExpire: newExpire,
        vipDays: product.days
    }
}

/**
 * 支付回调确认（微信/支付宝异步通知后前端主动确认）
 * 上线后应配合服务端异步回调（notify_url）自动确认
 */
async function confirmPayment(ordersCol, usersCol, uid, event) {
    const { orderId } = event

    if (!orderId) {
        return { code: 400, msg: '缺少订单号' }
    }

    // 查找订单
    const orderRes = await ordersCol.doc(orderId).get()
    if (!orderRes.data || orderRes.data.length === 0) {
        return { code: 404, msg: '订单不存在' }
    }

    const order = orderRes.data[0] || orderRes.data
    if (order.user_id !== uid) {
        return { code: 403, msg: '订单所属异常' }
    }

    if (order.status === 'fulfilled') {
        return { code: 0, msg: '订单已完成', vipExpire: 0 }
    }

    // 激活VIP
    const now = Date.now()
    const userRes = await usersCol.where({ _id: uid }).get()
    const currentExpire = (userRes.data[0] && userRes.data[0].vip_expire) || 0
    const durationMs = (order.vip_days || 30) * 24 * 60 * 60 * 1000
    const newExpire = currentExpire > now ? currentExpire + durationMs : now + durationMs

    await usersCol.where({ _id: uid }).update({
        vip_expire: newExpire,
        updated_at: now
    })

    await ordersCol.doc(orderId).update({
        status: 'fulfilled',
        fulfilled_at: now,
        updated_at: now
    })

    return {
        code: 0,
        msg: '支付确认成功，VIP 已激活',
        vipExpire: newExpire,
        vipDays: order.vip_days
    }
}
