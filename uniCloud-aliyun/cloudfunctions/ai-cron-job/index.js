'use strict';
const db = uniCloud.database()
const dbCmd = db.command

// ================= 全局核心配置 =================
const DEEPSEEK_API_KEY = 'sk-961f7bfc38ed422a9ca9648deec15941' // DeepSeek 大模型访问密钥

// 旧有静态 Unsplash 图池已废处理，全面采用 Picsum 动态高级 Seed 算法防止死链与封面碰撞

// ================= 大发散词库组合 (AI 防雷同因子) =================
const CREATIVE_SEEDS = [
    '极简禁欲', '间歇断食与饥饿感', '多巴胺耐受底线', '冷水唤醒机制',
    '赤足接地的物理学', '数字排毒协议', '延迟满足的复利', '清晨5点的心流网络',
    '筋膜黏连释放', '无糖实验与炎性反应', '太阳凝视与褪黑素', '突触的物理重塑',
    '皮质醇毒性清理', '前额叶的执行控制', '孤独感与默认网络', '体态重构'
];

// ================= 大模型通讯核心 =================
async function askDeepSeek(jsonPrompt) {
    console.log("-> 准备向 DeepSeek 网关遣送请求包...");
    const reqBody = {
        model: 'deepseek-chat',
        messages: [{ role: 'system', content: jsonPrompt }],
        temperature: 0.8,
        max_tokens: 3500
    };

    let res;
    try {
        res = await uniCloud.httpclient.request('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            data: reqBody,
            contentType: 'json',
            dataType: 'json',
            headers: { 'Authorization': `Bearer ${DEEPSEEK_API_KEY}` },
            timeout: 150000 // 150 秒单次会话极限，应对 DeepSeek 吐字高峰期
        });
        console.log("<- 收到 DeepSeek 网关物理层返回，Status:", res.status);
    } catch (httpErr) {
        console.error("!! 发起 HTTP 请求时即刻崩溃:", httpErr);
        throw new Error('物理层网卡发包崩溃');
    }

    if (res.status !== 200) {
        console.error("!! HTTP 状态码非 200:", res.data);
        throw new Error('大模型网关连线失败，返回码: ' + res.status);
    }

    let responseData = res.data;
    // 防御阿里云环境返回原始 Buffer 直接解构报错引发雪崩
    if (Buffer.isBuffer(responseData)) {
        console.log("-> 检测到底层返回为 Buffer，开始硬解码...");
        responseData = JSON.parse(responseData.toString('utf-8'));
    }

    if (!responseData || !responseData.choices || !responseData.choices[0]) {
        console.error("!! 返回载荷异常解构失败:", responseData);
        throw new Error('大模型载荷格式变异或限流');
    }

    const reply = responseData.choices[0].message?.content;
    console.log("-> 成功剥离第一层回答，准备解构核心 JSON 矩阵");

    // 强制正则剃除 markdown 的 ```json 前后缀，使其成为裸 JSON
    const jsonStr = reply.replace(/```json/g, '').replace(/```/g, '').trim();
    try {
        const parsedData = JSON.parse(jsonStr);
        console.log("✅ JSON 矩阵安全序列化完毕，条数:", Array.isArray(parsedData) ? parsedData.length : 1);
        return parsedData;
    } catch (e) {
        console.error("!! JSON清洗后仍崩断，原文留存：", jsonStr);
        throw new Error('AI 未能归还可序列化的 JSON 数组矩阵');
    }
}

// ================= 算力工厂分集 =================
async function generateBatchArticles(batchSize, seedKeywords) {
    const prompt = `你是《觉醒空间》App的正向激励内容核心。请生成 ${batchSize} 篇高质量短文。
内容配比与灵感源（极其重要）：
- 当前批次你必须从中引入这几个独特视角作为灵感核心：【${seedKeywords}】。
- 在总体输出中：80% 的文章主题为养生、运动锻炼、自律励志等正能量日常实操。
- 剩下 20% 的文章必须是硬核神经学或脑科学科普，用接地气的语言解析其生理机制。

标题防雷同与排版要求：
1. 标题必须有极致的力量感、冷峻、克制。不要带任何“啊、呢、了”等常见口语后缀。禁止套路化的“早起的意义”之类，要像一把锐利的刀，例如《修剪你的废弃突触》、《多巴胺断崖后的冷静期》。
2. 每篇字数在 400 字左右，不要过长，段落呈现必须方便阅读。
3. 严格按照纯净的 JSON 数组格式返回，绝不包含任何开头结尾的废话或 Markdown 代码块标识：
[
  {
    "t": "文章标题，必须极简冷峻且不套路",
    "c": "四百字左右的正文，段落清晰，可以是健康饮食、跑步心法、自律感悟等",
    "guide": "一句极简直白并具操作性的行动指南（例如：今晚睡前远离屏幕拉伸五分钟）",
    "sections": [
      {
        "text": "第一部分正文内容..."
      },
      {
         "imgPlaceholder": true,
         "text": "第二部分正文内容..."
      },
      {
         "text": "第三部分正文内容..."
      }
    ]
  }
]
注意：在 JSON 的 sections 数组中，随意挑 1 或者 2 个 section 增加 "imgPlaceholder": true 字段。每个部分必须是一段完整的自然段文字。不要生成多余字段。`;
    return await askDeepSeek(prompt);
}

// ================= 影像工坊分集 =================
async function generateBatchVideos(batchSize, seedKeywords) {
    const prompt = `你是《觉醒空间》App的正向激励内容核心。请生成 ${batchSize} 个高质量短视频流文案。
内容配比与灵感源（极其重要）：
- 当前批次你必须从中引入这几个独特视角作为灵感源头：【${seedKeywords}】。
- 80% 的视频文案主题为高质量养生、健身实操、自律励志等正能量日常片段。
- 20% 的视频文案必须涉及神经学/脑科学硬核原理解析（例如：多巴胺渴求回路、习惯突触修剪等）。

标题去重与语言格式要求：
1. 标题必须有极致的力量感与克制感。禁止使用常见陈词滥调（例如不要出现“跑出健康人生”），标题应当高度凝练，像手术刀一样精准。
2. 一句话摘要要物理、客观，禁止纯鸡汤。
3. 严格按照纯净的 JSON 数组格式返回，绝不包含任何开头结尾的废话或 Markdown 代码块标识：
[
  {
    "t": "视频标题，极简的力量，例如：额叶的重建协议",
    "d": "一句话摘要（纯硬核或具像化动作的50字总结，例如：一次晨跑如何在物理上增加海马体中的脑源性神经营养因子。）",
    "author": "创作者标识，如 '晨间能量'、'极简行者' 等"
  }
]`;
    return await askDeepSeek(prompt);
}

// ================= 洗牌算法去重 =================
function shuffleArray(array) {
    let currentIndex = array.length, randomIndex;
    let _arr = [...array];
    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [_arr[currentIndex], _arr[randomIndex]] = [_arr[randomIndex], _arr[currentIndex]];
    }
    return _arr;
}

// ================= 主控守护进程 =================
exports.main = async (event, context) => {
    const col = db.collection('better-articles')
    const now = Date.now()
    const allData = []

    // 剥离老旧池配置，引入时间锚点随机作为 Picsum Seed 的底层根源
    const globalSalt = Math.random().toString(36).substr(2, 6);

    // 初始化创意打散因子
    const shuffledSeeds = shuffleArray(CREATIVE_SEEDS);
    let seedPointer = 0;

    try {
        console.log("🚀 [AI-Cron-Job] 定时触发：开始批量铸造 20 篇图文协议...");
        // 将大促切碎为小碎步，单次只生成 2 篇以抗击大模型超时风暴，一共生成 10 轮
        for (let i = 0; i < 10; i++) {
            let batch = [];
            try {
                // 每次组装 3 个独一无二的话题因子，强行掰正 AI 的语境
                const roundKeywords = [
                    shuffledSeeds[(seedPointer++) % shuffledSeeds.length],
                    shuffledSeeds[(seedPointer++) % shuffledSeeds.length],
                    shuffledSeeds[(seedPointer++) % shuffledSeeds.length]
                ].join(' | ');

                batch = await generateBatchArticles(2, roundKeywords);
            } catch (err) {
                console.warn(`⚠️ 第 ${i + 1} 轮长文引擎故障，主动丢弃本轮产能并强行继续:`, err.message);
                continue; // 捕获异常，容许少量断档，绝不让整条产能链雪崩
            }

            for (let j = 0; j < batch.length; j++) {
                const item = batch[j];

                let bodyHtml = '';
                if (item.sections && Array.isArray(item.sections)) {
                    item.sections.forEach(sec => {
                        if (sec.imgPlaceholder) {
                            const innerSeed = `BM_${now}_${i}_${j}_${Math.random().toString(36).substr(2, 4)}`;
                            // 直接调用基于内容定位且具有黑白/极简灰度的 Seed 参数网络接口
                            const currentImg = `https://picsum.photos/seed/${innerSeed}/800/500?grayscale`;
                            bodyHtml += `<img src="${currentImg}" style="width: 100%; border-radius: 12px; margin: 15px 0; object-fit: cover;" />`;
                        }
                        if (sec.text) {
                            bodyHtml += `<p style="margin-bottom: 15px; text-indent: 2em; color: #f4f4f5;">${sec.text}</p>`;
                        }
                    })
                } else {
                    bodyHtml = `<p style="margin-bottom: 15px; text-indent: 2em; color: #f4f4f5;">${item.c}</p>`;
                }

                // 使用绿底的治愈色系渲染组件替代原本极具压迫感的设计
                const htmlContent = `<div style="color:#d4d4d8; font-size:16px; line-height: 1.8; letter-spacing: 0.5px;">
                    <p style="font-weight:bold; font-size: 18px; color:#fff; border-bottom: 1px solid #3f3f46; padding-bottom: 8px; margin-bottom: 15px;">能量汇聚</p>
                    ${bodyHtml}
                    <p style="margin-bottom: 15px; background: rgba(16, 185, 129, 0.1); padding: 12px; border-radius: 8px; border-left: 3px solid #10b981;">行动指南：${item.guide}</p>
                    <div style="font-size:12px; color:#52525b; text-align:center; margin-top: 40px; border-top:1px dashed #27272a; padding-top:10px;">—— 核心中枢 AI 数字生态动态推演生成</div>
                </div>`;

                const actCoverSeed = `B_Cove_${now}_${globalSalt}_${i}_${j}`;
                const randomCover = `https://picsum.photos/seed/${actCoverSeed}/800/800`;

                allData.push({
                    type: 'article', icon: '📖', title: item.t,
                    desc: '系统 AI 热力引擎实时重构的暖心自律日志。',
                    cover: randomCover,
                    author: '数字伴侣', readTime: '能量注入',
                    textContent: htmlContent, // 直接将内容存入 DB
                    status: 1,
                    // 利用微小时间差使其与文章混合呈现，错落分布
                    publish_date: now + (20 - (i * 2 + j)) * 1000,
                    version: 1
                });
            }
            console.log(`✅ 第 ${i + 1} 轮大模型长文神经树组装完毕`);
        }

        // ================= 视频算力引擎接驳 =================
        console.log("🎬 [AI-Cron-Job] 影像挂载：开始批量铸造 20 条健康励志视频流...");
        // 此处暂采用高清可用公网流代替 Pexels/Pixabay 等 API 动态拉取，避免额外的 Key 约束，确保 100% 播放可用率
        const PEXELS_VIDEOS = [
            'http://vjs.zencdn.net/v/oceans.mp4',
            'https://media.w3.org/2010/05/sintel/trailer.mp4',
            'http://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4',
            'https://www.w3schools.com/html/mov_bbb.mp4',
            'https://www.w3schools.com/html/horse.mp4'
        ];
        // 视频源防重
        const shuffledVideos = shuffleArray(PEXELS_VIDEOS);
        let vidPointer = 0;

        for (let i = 0; i < 4; i++) { // 将 2 轮单次 10 条的策略切碎，改为 4 轮每轮 5 条
            let batch = [];
            try {
                const roundKeywords = [
                    shuffledSeeds[(seedPointer++) % shuffledSeeds.length],
                    shuffledSeeds[(seedPointer++) % shuffledSeeds.length]
                ].join(' | ');

                batch = await generateBatchVideos(5, roundKeywords);
            } catch (err) {
                console.warn(`⚠️ 第 ${i + 1} 轮影像核心引擎超时断连，降频跳过...`);
                continue;
            }

            for (let j = 0; j < batch.length; j++) {
                const item = batch[j];
                const vidCoverSeed = `V_Cove_${now}_${globalSalt}_${i}_${j}`;
                const currentCover = `https://picsum.photos/seed/${vidCoverSeed}/800/1200?blur=1`;
                const currentVideo = shuffledVideos[vidPointer % shuffledVideos.length];
                vidPointer++;

                allData.push({
                    type: 'video', icon: '🎥', title: item.t,
                    desc: item.d,
                    cover: currentCover,
                    author: item.author || '能量体', readTime: '实录视频流',
                    contentUrl: currentVideo,
                    status: 1,
                    // 利用微小时间差使其与文章混合呈现，错落分布
                    publish_date: now + (20 - (i * 5 + j)) * 1000 + 500,
                    version: 1
                });
            }
            console.log(`✅ 第 ${i + 1} 轮大模型影像节点挂载完毕`);
        }

        if (allData.length > 0) {
            // [重构防腐协议]: 全局覆盖模式 (三天一次更新，抹除所有 AI 的历史资产)
            console.log("🧹 [AI-Cron-Job] 启动彻底抹除协议以避免冗余...");

            // 因为 AI 数据的特征标是通过 AI 引擎创建，最稳妥的方案是提取所有这类记录的分词 id 再暴破
            try {
                let hasMoreObj = true;
                let deadBodiesCount = 0;
                // 循环分片删除，绕开单次删除的封顶流量拦截
                while (hasMoreObj) {
                    const targetDocsRes = await col.where(
                        dbCmd.or([
                            { type: 'article' },
                            { type: 'video' }
                        ])
                    ).limit(500).field({ _id: 1 }).get();

                    if (targetDocsRes.data.length > 0) {
                        const deadIds = targetDocsRes.data.map(d => d._id);
                        await col.where({ _id: dbCmd.in(deadIds) }).remove();
                        deadBodiesCount += deadIds.length;
                    } else {
                        hasMoreObj = false; // 已全数抽空
                    }
                }
                console.log(`✅ MongoDB 成功扫荡并释放了旧约时空的 ${deadBodiesCount} 条动态残影！`);
            } catch (clearErr) {
                console.error("⚠️ 本次粉碎协议遇阻流控断开，这不影响新档案的写录", clearErr);
            }

            // 存入最新的全量库
            await col.add(allData);
            console.log(`✅ 成功将本次流水线产能打入数据库：共 ${allData.length} 份心流资产取代了全部旧档案`);
        }

        return { code: 0, msg: '自动化数字流媒体线编撰全量完成！并已清理前代缓存。' };

    } catch (err) {
        console.error("❌ 致命异常：AI 引擎抛出内核错误:", err);
        return { code: 500, msg: err.message || '内部未知崩溃' };
    }
};
