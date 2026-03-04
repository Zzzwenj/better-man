'use strict';
const nodemailer = require('nodemailer');
const CryptoJS = require("crypto-js");

const db = uniCloud.database();

// 💡 【配置：QQ 邮箱发送方案】
// 敏感凭证通过云函数环境变量注入，避免代码泄露即凭证泄露
const mailConfig = {
    host: 'smtp.qq.com',     // QQ 邮箱的 SMTP 服务器地址
    port: 465,               // 端口号 465
    secure: true,            // 开启 SSL 安全连接
    auth: {
        user: process.env.SMTP_USER || '1850680525@qq.com',
        // 🔒 SMTP 授权码必须从环境变量读取，HBuilderX → uniCloud → 云函数详情 → 环境变量配置
        pass: process.env.SMTP_PASS || ''
    }
};

const transporter = nodemailer.createTransport(mailConfig);

// 💡 【配置：短信宝发送方案】
// 🔒 同样通过环境变量注入，防止源码泄露凭证
const smsConfig = {
    username: process.env.SMS_USER || 'Camille07_',
    password: process.env.SMS_PASS || '',
    sign: '【觉醒空间科技】'
};

exports.main = async (event, context) => {
    const { action, params } = event;

    switch (action) {
        case 'sendEmailCode':
            return await sendEmailCode(params);
        case 'sendSmsCode':
            return await sendSmsCode(params);
        case 'register':
            return await register(params);
        case 'login':
            return await login(params);
        case 'resetPassword':
            return await resetPassword(params);
        default:
            return { code: 400, message: 'Invalid action' };
    }
};

// 密码加密
function hashPassword(password) {
    return CryptoJS.SHA256(password + 'better-man-salt-2026').toString();
}

// MD5 加密 (用于短信宝密码)
// ⚠️ 重要：短信宝官方接口要求 MD5 加密后的字符串必须是【全小写】
function md5(str) {
    return CryptoJS.MD5(str).toString().toLowerCase();
}

// 1. 发送邮箱验证码
async function sendEmailCode({ email }) {
    if (!email) return { code: 1, message: '邮箱不能为空' };

    // 【防刷拦截】同一邮箱 60 秒内禁止重复发送
    const recentCode = await db.collection('uni-verify-codes')
        .where({ email, createdAt: db.command.gt(Date.now() - 60 * 1000) })
        .limit(1).get()
    if (recentCode.data.length > 0) {
        return { code: 10, message: '请勿频繁操作，60秒后再试' }
    }

    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

    try {
        await transporter.sendMail({
            from: `"Dopamine Reset" <${mailConfig.auth.user}>`,
            to: email,
            subject: '您的注册安全验证码',
            text: `您的验证码是: ${verifyCode}，有效期为 5 分钟。请勿泄露给他人。`,
            html: `<b>您的验证码是: <h2>${verifyCode}</h2></b><br>有效期为 5 分钟。请勿泄露给他人。`
        });
    } catch (e) {
        console.error('Send mail error:', e);
        return { code: 2, message: '邮件发送失败，请检查配置', error: e.message };
    }

    const expiredAt = Date.now() + 5 * 60 * 1000;
    await db.collection('uni-verify-codes').add({
        email,
        code: verifyCode,
        type: 'register',
        expiredAt,
        createdAt: Date.now()
    });

    return { code: 0, message: '验证码已发送' };
}

// 2. 发送手机短信验证码 (接入短信宝)
async function sendSmsCode({ phone }) {
    if (!phone) return { code: 1, message: '手机号不能为空' };

    // 【防刷拦截】同一手机号 60 秒内禁止重复发送
    const recentCode = await db.collection('uni-verify-codes')
        .where({ phone, createdAt: db.command.gt(Date.now() - 60 * 1000) })
        .limit(1).get()
    if (recentCode.data.length > 0) {
        return { code: 10, message: '请勿频繁操作，60秒后再试' }
    }

    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    const content = `${smsConfig.sign}您的验证码是${verifyCode}。如非本人操作，请忽略本短信。`;
    const passwordMd5 = md5(smsConfig.password);

    // 调用短信宝 HTTP 接口 (修复密码含特殊符号导致的请求解析错误)
    const url = `https://api.smsbao.com/sms`;

    try {
        const res = await uniCloud.httpclient.request(url, {
            method: 'GET',
            data: {
                u: smsConfig.username,
                p: passwordMd5,
                m: phone,
                c: content
            },
            dataType: 'text'
        });

        // 0 代表发送成功，其他错误码参考短信宝文档
        if (res.data === '0') {
            const expiredAt = Date.now() + 5 * 60 * 1000;
            // 存入云数据库验证表
            await db.collection('uni-verify-codes').add({
                phone,
                code: verifyCode,
                type: 'register',
                expiredAt,
                createdAt: Date.now()
            });
            return { code: 0, message: '短信验证码已发送' };
        } else {
            console.error('Smsbao response error code:', res.data);
            return { code: 2, message: '短信发送失败，错误码：' + res.data };
        }
    } catch (e) {
        console.error('Send SMS error:', e);
        return { code: 3, message: '短信接口网络请求异常' };
    }
}

// 3. 注册
async function register({ email, phone, password, verifyCode }) {
    const account = email || phone;
    if (!account || !password || !verifyCode) return { code: 1, message: '参数不完整' };

    // 校验统验逻辑 (同时支持手机和邮箱)
    const codeQuery = email ? { email, type: 'register' } : { phone, type: 'register' };

    const codes = await db.collection('uni-verify-codes')
        .where(codeQuery)
        .orderBy('createdAt', 'desc')
        .limit(1)
        .get();

    if (codes.data.length === 0) return { code: 2, message: '验证码不存在或未发送' };

    const record = codes.data[0];
    if (Date.now() > record.expiredAt) return { code: 3, message: '验证码已过期' };
    if (record.code !== verifyCode) return { code: 4, message: '验证码错误' };

    // 验证通过，作废当前验证码
    await db.collection('uni-verify-codes').doc(record._id).remove();

    // 检查账号是否已存在
    const users = await db.collection('uni-id-users').where(
        db.command.or([
            { email: account },
            { mobile: account }
        ])
    ).get();

    if (users.data.length > 0) return { code: 5, message: '该账号已存在' };

    // 插入新用户
    const result = await db.collection('uni-id-users').add({
        email: email || '',
        mobile: phone || '',
        password: hashPassword(password),
        register_date: Date.now(),
        register_ip: ''
    });

    return { code: 0, message: '注册成功', uid: result.id };
}

// 4. 登录
async function login({ account, password }) {
    if (!account || !password) return { code: 1, message: '账号和密码不能为空' };

    // 匹配邮箱或手机号
    const users = await db.collection('uni-id-users').where(
        db.command.or([
            { email: account },
            { mobile: account }
        ])
    ).get();

    if (users.data.length === 0) return { code: 2, message: '账号不存在，请先注册' };

    const user = users.data[0];
    const inputHash = hashPassword(password);

    if (user.password !== inputHash) return { code: 3, message: '密码错误' };

    // 生成安全 token（加密随机串，不可预测）
    const tokenRaw = user._id + '_' + Date.now() + '_' + Math.random().toString(36)
    const token = CryptoJS.SHA256(tokenRaw).toString()
    const tokenExpired = Date.now() + 30 * 24 * 3600 * 1000 // 30天有效

    // 将 token 写入用户记录，便于后续服务端校验
    await db.collection('uni-id-users').doc(user._id).update({
        token,
        token_expired: tokenExpired,
        last_login_date: Date.now()
    })

    return {
        code: 0,
        message: '登录成功',
        token,
        uid: user._id,
        tokenExpired
    };
}

// 5. 重置密码（忘记密码闭环）
async function resetPassword({ email, phone, password, verifyCode }) {
    const account = email || phone
    if (!account || !password || !verifyCode) return { code: 1, message: '参数不完整' }

    // 校验验证码（复用注册验证码类型 'register'，也可单独用 'reset'）
    const codeQuery = email
        ? { email, type: db.command.in(['register', 'reset']) }
        : { phone, type: db.command.in(['register', 'reset']) }

    const codes = await db.collection('uni-verify-codes')
        .where(codeQuery)
        .orderBy('createdAt', 'desc')
        .limit(1)
        .get()

    if (codes.data.length === 0) return { code: 2, message: '验证码不存在或未发送' }

    const record = codes.data[0]
    if (Date.now() > record.expiredAt) return { code: 3, message: '验证码已过期' }
    if (record.code !== verifyCode) return { code: 4, message: '验证码错误' }

    // 验证通过，作废验证码
    await db.collection('uni-verify-codes').doc(record._id).remove()

    // 查找账号是否存在
    const users = await db.collection('uni-id-users').where(
        db.command.or([
            { email: account },
            { mobile: account }
        ])
    ).get()

    if (users.data.length === 0) return { code: 5, message: '该账号不存在' }

    // 更新密码
    const user = users.data[0]
    await db.collection('uni-id-users').doc(user._id).update({
        password: hashPassword(password)
    })

    return { code: 0, message: '密码重置成功，请使用新密码登录' }
}
