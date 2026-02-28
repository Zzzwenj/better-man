'use strict';
const nodemailer = require('nodemailer');
const CryptoJS = require("crypto-js");

const db = uniCloud.database();

// 💡 【配置：QQ 邮箱发送方案】
// 这是你目前测试使用的配置，注意密码处必须填写 SMTP 授权码
const mailConfig = {
    host: 'smtp.qq.com',     // QQ 邮箱的 SMTP 服务器地址
    port: 465,               // 端口号 465
    secure: true,            // 开启 SSL 安全连接
    auth: {
        // 你的 QQ 发件邮箱
        user: '1850680525@qq.com',
        // 🚨 这里的密码必须是你在 QQ 邮箱设置里生成的【SMTP授权码】，千万不能是你的 QQ 登录密码！
        pass: 'ukvajjvsirqgefha'
    }
};

const transporter = nodemailer.createTransport(mailConfig);

// 💡 【配置：短信宝发送方案】
const smsConfig = {
    username: 'Camille07_', // 短信宝注册账号
    password: 'QQandYC99!', // 短信宝平台密码 (此处云函数会自动给它做 MD5 混淆)
    sign: '【觉醒空间科技】' // 你的短信签名，短信宝规定必须带【】
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

    // 生成 token (兼容旧逻辑)
    const token = 'fake_token_for_dev_' + user._id;

    return {
        code: 0,
        message: '登录成功',
        token,
        uid: user._id,
        tokenExpired: Date.now() + 7200000 // 2小时
    };
}
