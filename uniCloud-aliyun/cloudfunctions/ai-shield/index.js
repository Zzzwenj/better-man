'use strict';

exports.main = async (event, context) => {
    // event 接收前端携带的参数
    const { messages, userMsg } = event

    // 🔐 从环境变量读取 DeepSeek API Key（在 uniCloud 控制台 → 云函数详情 → 环境变量中配置 DEEPSEEK_API_KEY）
    const API_KEY = process.env.DEEPSEEK_API_KEY || ''

    if (!API_KEY) {
        return {
            code: 400,
            msg: "未配置有效的 DeepSeek API Key",
            data: "⚠️ 检测到未经授权的大脑防御机制启动。请指挥官前往云后台注入合法的核心密钥 (API Key)。"
        }
    }

    try {
        const payload = {
            model: 'deepseek-chat',
            messages: messages, // 前端传过来的应当是截断后的消息数组
            temperature: 0.7,
            max_tokens: 350 // 放宽回答长度，以适应温和型导师更长篇的情感开导
        }

        const res = await uniCloud.httpclient.request('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            data: payload,
            contentType: 'json', // 自动用 application/json stringify data
            dataType: 'json',    // 自动将响应转为 json
            headers: {
                'Authorization': `Bearer ${API_KEY}`
            }
        });

        if (res.status !== 200) {
            console.error('DeepSeek API Error:', res.data);
            return {
                code: res.status,
                msg: "模型响应异常",
                data: "连接量子心理学数据库超时，请稍后重试。"
            }
        }

        const aiReply = res.data?.choices?.[0]?.message?.content || 'API 调用异常，无法获取协议指令。'

        return {
            code: 0,
            msg: "success",
            data: aiReply
        }

    } catch (error) {
        console.error("ai-shield execution error", error);
        return {
            code: 500,
            msg: "云函数执行失败",
            data: "脑机接口异常波动，连接断开。"
        }
    }
};
