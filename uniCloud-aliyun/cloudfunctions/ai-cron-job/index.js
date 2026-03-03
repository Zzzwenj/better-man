'use strict';
const db = uniCloud.database()
const dbCmd = db.command

// ================= 全局核心配置 =================
const DEEPSEEK_API_KEY = 'sk-961f7bfc38ed422a9ca9648deec15941' // DeepSeek 大模型访问密钥

// ================= 静态高品质素材池 (分类匹配，避免“牛头不对马嘴”和 Error 1033) =================
// 彻底放弃不稳定的第三方生图 API，改用类别强绑定的高品质 Picsum 恒定精选 ID 集合
const STATIC_ASSETS = {
    nature: {
        themeStr: '自然治愈、环境保护、冥想与内心宁静',
        keywords: ['自然风光', '清晨森林', '海浪与呼吸', '阳光草地', '山峰', '冰原'],
        covers: [10, 11, 13, 14, 16, 28, 29, 36, 38, 43, 46, 57, 58, 65, 69, 70, 75, 83, 97, 104, 106, 115, 122, 129, 136, 147, 152, 163, 174, 185],
        videos: [
            { desc: '深海的壮丽波涛与宁静（海洋风光实录）', url: 'https://vjs.zencdn.net/v/oceans.mp4' },
            { desc: '海洋动物与浅滩浪花交融', url: 'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-576p.mp4' }
        ]
    },
    fitness: {
        themeStr: '运动锻炼、身体机能、多巴胺挑战、陪伴与活力',
        keywords: ['运动锻炼', '间歇断食', '户外活力', '极限核心', '肌肉撕裂', '小动物与陪伴'],
        covers: [146, 73, 225, 250, 274, 318, 513, 1058, 1073, 237, 1025, 1062, 212, 319, 355, 373, 384, 403, 417, 433, 452, 473, 501, 555],
        videos: [
            { desc: '充满活力的小狗在户外欢快地奔跑互动（体现陪伴与生命活力）', url: 'https://res.cloudinary.com/demo/video/upload/dog.mp4' }
        ]
    },
    inspiration: {
        themeStr: '极简禁欲、精神重塑、心流专注、突破自我',
        keywords: ['极简禁欲', '延迟满足的复利', '多巴胺耐受底线', '孤独感与默认网络', '数字排毒协议'],
        covers: [2, 3, 20, 60, 63, 119, 175, 180, 201, 366, 400, 370, 1, 4, 8, 9, 21, 24, 30, 42, 48, 54, 66, 76, 96, 111, 128, 145],
        videos: [
            { desc: '一部关于勇气、寻找与自我磨砺的史诗级微影预告片段', url: 'https://media.w3.org/2010/05/sintel/trailer.mp4' },
            { desc: '严酷荒野环境下生命与艰难生存的震撼镜头（野生棕熊生存实录，没有读秒）', url: 'https://media.w3.org/2010/05/video/movie_300.mp4' }
        ]
    }
}

// ============== 洗牌/随机 算法 ==============
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

// ============== 内存级与云端级双重去重校验 ==============
const usedGlobalCovers = new Set();

// 获取全网唯一封面，杜绝同批次或全库重复
async function getUniqueCoverUrl(dbCol, category) {
    const ids = STATIC_ASSETS[category].covers;
    let shuffledIds = [...ids].sort(() => 0.5 - Math.random());

    for (let id of shuffledIds) {
        let testUrl = `https://picsum.photos/id/${id}/800/800`;

        // 1. 内存同批次发文防撞
        if (usedGlobalCovers.has(testUrl)) continue;

        // 2. 云服务器已存文章防撞 (全库去重校验)
        const dbRes = await dbCol.where({ cover: testUrl }).count();
        if (dbRes.total === 0) {
            usedGlobalCovers.add(testUrl);
            return testUrl; // 找到纯净独一无二的图
        }
    }

    // 严防该主题预设 ID 被彻底耗尽导致卡死，启动备用随机 ID 自寻逻辑
    let maxTries = 100;
    while (maxTries-- > 0) {
        let fallbackId = Math.floor(Math.random() * 800) + 10;
        let testUrl = `https://picsum.photos/id/${fallbackId}/800/800`;
        if (usedGlobalCovers.has(testUrl)) continue;
        const dbRes = await dbCol.where({ cover: testUrl }).count();
        if (dbRes.total === 0) {
            usedGlobalCovers.add(testUrl);
            return testUrl;
        }
    }

    // 终极兜底（极其罕见才会走到这）
    return `https://picsum.photos/seed/${Date.now()}/800/800`;
}

function getRandomInnerImgUrl(category) {
    const ids = STATIC_ASSETS[category].covers;
    const randomId = ids[Math.floor(Math.random() * ids.length)];
    return `https://picsum.photos/id/${randomId}/800/500?grayscale`;
}

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
            timeout: 150000
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
    if (Buffer.isBuffer(responseData)) {
        responseData = JSON.parse(responseData.toString('utf-8'));
    }

    if (!responseData || !responseData.choices || !responseData.choices[0]) {
        throw new Error('大模型载荷格式变异或限流');
    }

    const reply = responseData.choices[0].message?.content;
    const jsonStr = reply.replace(/```json/g, '').replace(/```/g, '').trim();
    try {
        return JSON.parse(jsonStr);
    } catch (e) {
        throw new Error('AI 未能归还可序列化的 JSON 数组矩阵');
    }
}

// ================= 算力工厂分集 (长文) =================
async function generateBatchArticles(batchSize, categoryCode, categoryWords) {
    const prompt = `你是《觉醒空间》App的正向激励内容核心。请严格生成 ${batchSize} 篇高质量短文。
当前这批次文章所在的【核心大类】为：${STATIC_ASSETS[categoryCode].themeStr}。
这批次文章的具体切入点必须围绕这几个关键词展开：【${categoryWords.join(' | ')}】。

标题防雷同与排版要求：
1. 标题必须有极致的力量感、冷峻、克制。不要带任何“啊、呢、了”等常见口语后缀。
2. 每篇字数在 400 字左右，不要过长，段落呈现必须方便阅读。
3. 严格按照纯净的 JSON 数组格式返回，绝不包含任何开头结尾的废话或 Markdown 代码块标识：
[
  {
    "t": "文章标题，必须极简冷峻且不套路",
    "c": "四百字左右的纯文本简短摘要",
    "guide": "一句极简直白并具操作性的行动指南（例如：今晚睡前远离屏幕拉伸五分钟）",
    "sections": [
      { "text": "第一部分正文内容..." },
      { "imgPlaceholder": true, "text": "第二部分正文内容..." },
      { "text": "第三部分正文内容..." }
    ]
  }
]
注意：在 JSON 的 sections 数组中，随意挑 1 或者 2 个 section 增加 "imgPlaceholder": true 字段。`;
    return await askDeepSeek(prompt);
}

// ================= 有源影像工坊分集 (短视频) =================
async function generateBatchVideos(batchSize, categoryCode) {
    const videosForCat = STATIC_ASSETS[categoryCode].videos;
    const materialJson = JSON.stringify(videosForCat.map((m, idx) => ({ id: idx, desc: m.desc })));

    const prompt = `你是《觉醒空间》App的正向激励内容核心。现在需要你根据真实的视频库素材来撰写匹配的绝佳短视频文案集。
当前这批次视频思想所在的【核心大类】为：${STATIC_ASSETS[categoryCode].themeStr}。
目前系统里仅有以下几段视频画面可供调用：
${materialJson}

请你从中随心挑选素材（可随机重复，以凑够指定的生成篇数！），精准生成 ${batchSize} 个高质量搭配文案。
必须根据素材画面的客观内容（desc），去结合神经学、自律、习惯养成、心流等方面重构并升华文案。绝对不能出现文案和客观描述（desc）毫无关联的图文不配情况！

语言格式要求：
1. 标题必须有极致的力量感与克制感。像手术刀一样精准。
2. 摘要包含 50 字的极简陈述，例如解析画面的神经学意义。
3. 严格按照纯净的 JSON 数组格式返回，不包含任何头尾废话或 Markdown 代码块标识：
[
  {
    "m_id": 0, 
    "t": "视频标题，例如：额叶的重建协议",
    "d": "一句话极简摘要摘要",
    "author": "创作者标识"
  }
]`;
    return await askDeepSeek(prompt);
}

// ================= 主控守护进程 =================
exports.main = async (event, context) => {
    const col = db.collection('better-articles')
    const now = Date.now()
    const allData = []

    try {
        console.log("🚀 [AI-Cron-Job] 定时触发：开始基于强映射图库批量铸造图文协议...");

        // 将长文打散为小碎步，每轮 2 篇，共 10 轮
        // 为了确保分类均衡，轮询基础分类
        const categories = Object.keys(STATIC_ASSETS);

        for (let i = 0; i < 10; i++) {
            const currentCat = categories[i % categories.length];
            const catWords = shuffleArray(STATIC_ASSETS[currentCat].keywords).slice(0, 3);

            let batch = [];
            try {
                batch = await generateBatchArticles(2, currentCat, catWords);
            } catch (err) {
                console.warn(`⚠️ 第 ${i + 1} 轮长文引擎故障跳过:`, err.message);
                continue;
            }

            for (let j = 0; j < batch.length; j++) {
                const item = batch[j];
                let bodyHtml = '';

                if (item.sections && Array.isArray(item.sections)) {
                    item.sections.forEach(sec => {
                        if (sec.imgPlaceholder) {
                            const innerImgUrl = getRandomInnerImgUrl(currentCat);
                            bodyHtml += `<img src="${innerImgUrl}" style="width: 100%; border-radius: 12px; margin: 15px 0; object-fit: cover;" />`;
                        }
                        if (sec.text) {
                            bodyHtml += `<p style="margin-bottom: 15px; text-indent: 2em; color: #f4f4f5;">${sec.text}</p>`;
                        }
                    })
                } else {
                    bodyHtml = `<p style="margin-bottom: 15px; text-indent: 2em; color: #f4f4f5;">${item.c || ''}</p>`;
                }

                const htmlContent = `<div style="color:#d4d4d8; font-size:16px; line-height: 1.8; letter-spacing: 0.5px;">
                    <p style="font-weight:bold; font-size: 18px; color:#fff; border-bottom: 1px solid #3f3f46; padding-bottom: 8px; margin-bottom: 15px;">能量汇聚</p>
                    ${bodyHtml}
                    <p style="margin-bottom: 15px; background: rgba(16, 185, 129, 0.1); padding: 12px; border-radius: 8px; border-left: 3px solid #10b981;">行动指南：${item.guide}</p>
                    <div style="font-size:12px; color:#52525b; text-align:center; margin-top: 40px; border-top:1px dashed #27272a; padding-top:10px;">—— 核心中枢 AI 数字生态动态推演生成</div>
                </div>`;

                const actCover = await getUniqueCoverUrl(col, currentCat);

                allData.push({
                    type: 'article', icon: '📖', title: item.t,
                    desc: '系统 AI 热力引擎实时重构的暖心自律日志。',
                    cover: actCover,
                    author: '数字伴侣', readTime: '能量注入',
                    textContent: htmlContent,
                    status: 1,
                    publish_date: now + (20 - (i * 2 + j)) * 1000,
                    version: 1,
                    _theme: currentCat
                });
            }
            console.log(`✅ 第 ${i + 1} 轮大模型长文神经树 (${currentCat}) 组装完毕`);
        }

        console.log("🎬 [AI-Cron-Job] 影像挂载：开始根据视觉素材池铸造精准匹配的视频流...");

        for (let i = 0; i < 4; i++) { // 4轮 x 5条 = 20条
            const currentCat = categories[i % categories.length];
            let batch = [];
            try {
                batch = await generateBatchVideos(5, currentCat);
            } catch (err) {
                console.warn(`⚠️ 第 ${i + 1} 轮影像核心引擎超时断连跳过...`);
                continue;
            }

            for (let j = 0; j < batch.length; j++) {
                const item = batch[j];
                const matchedMaterial = STATIC_ASSETS[currentCat].videos.find((v, idx) => idx === item.m_id) || STATIC_ASSETS[currentCat].videos[0];
                const currentVideo = matchedMaterial.url;
                const actCover = await getUniqueCoverUrl(col, currentCat);

                allData.push({
                    type: 'video', icon: '🎥', title: item.t,
                    desc: item.d,
                    cover: actCover,
                    author: item.author || '能量体', readTime: '实录视频流',
                    contentUrl: currentVideo,
                    status: 1,
                    publish_date: now + (20 - (i * 5 + j)) * 1000 + 500,
                    version: 1,
                    _theme: currentCat
                });
            }
            console.log(`✅ 第 ${i + 1} 轮大模型影像节点挂载完毕`);
        }

        if (allData.length > 0) {
            console.log("🧹 [AI-Cron-Job] 启动彻底抹除协议以避免冗余...");
            try {
                let hasMoreObj = true;
                let deadBodiesCount = 0;
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
                        hasMoreObj = false;
                    }
                }
                console.log(`✅ 成功扫荡 ${deadBodiesCount} 条动态残影！`);
            } catch (clearErr) {
                console.error("⚠️ 本次粉碎协议遇阻流控断开", clearErr);
            }

            await col.add(allData);
            console.log(`✅ 成功将本次流水线产能打入数据库：共 ${allData.length} 份心流资产取代了全部旧档案`);
        }

        return { code: 0, msg: '全量内容（分类映射防崩版）撰写并发放完毕！视频、封面不会再出现错乱和失效。' };

    } catch (err) {
        console.error("❌ 致命异常：AI 引擎抛出内核错误:", err);
        return { code: 500, msg: err.message || '内部未知崩溃' };
    }
};
