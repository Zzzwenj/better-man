'use strict';

exports.main = async (event, context) => {
    // event 接收前端携带的参数
    const { messages, userMsg } = event

    // 🎯 请在此处填入真实的 DeepSeek API Key
    const API_KEY = 'sk-961f7bfc38ed422a9ca9648deec15941' // FIXME: 此处需要填入真实有效的 DeepSeek API Key

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
