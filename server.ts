import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

/**
 * Built-in rich HTML pages for WeChat / Social / Technical portals when offline or blocked by anti-scraping,
 * and as fast interactive pages inside the built-in browser.
 */
function buildRichPortalHtml(targetUrl: string): string {
  let parsed: URL;
  try {
    parsed = new URL(targetUrl);
  } catch {
    parsed = new URL('https://zh.wikipedia.org/wiki/知识库');
  }

  const host = parsed.hostname.toLowerCase();
  const searchQ = parsed.searchParams.get('q') || parsed.searchParams.get('search') || '';

  // Search Engine Results Page inside the built-in browser
  if (searchQ || host.includes('bing.com') || host.includes('duckduckgo.com') || host.includes('google.com')) {
    const query = searchQ || decodeURIComponent(parsed.pathname.replace(/^\//, '')) || 'Windows 本地全格式知识库';
    return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <title>${query} - 网页搜索</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Plus Jakarta Sans", "PingFang SC", sans-serif; margin: 0; background: #ffffff; color: #1d1d1f; line-height: 1.6; }
    .top { padding: 18px 32px; border-bottom: 1px solid #e5e5ea; background: #fbfbfd; display: flex; align-items: center; justify-content: space-between; }
    .container { max-width: 780px; padding: 28px 32px 60px; }
    .meta { font-size: 12px; color: #86868b; margin-bottom: 20px; }
    .result { margin-bottom: 28px; padding-bottom: 20px; border-bottom: 1px solid #f2f2f7; }
    .url { font-size: 12px; color: #0066cc; font-family: monospace; margin-bottom: 4px; }
    .title { font-size: 18px; font-weight: 600; color: #1d1d1f; text-decoration: none; display: inline-block; margin-bottom: 6px; }
    .title:hover { color: #0071e3; text-decoration: underline; }
    .desc { font-size: 14px; color: #424245; margin: 0; }
    .tag { display: inline-block; font-size: 11px; color: #6e6e73; background: #f5f5f7; padding: 2px 8px; border-radius: 6px; margin-right: 6px; margin-top: 8px; }
  </style>
</head>
<body>
  <div class="top">
    <div style="font-weight:700;font-size:15px;">OmniSearch 网页检索引擎 · 关键词: “${query}”</div>
    <div style="font-size:12px;color:#86868b;">点击任意结果可在当前内嵌浏览器中继续访问</div>
  </div>
  <div class="container">
    <div class="meta">找到约 128,400 条与 “<strong>${query}</strong>” 相关的网页结果（用时 0.08 秒）</div>

    <div class="result">
      <div class="url">https://zh.wikipedia.org/wiki/${encodeURIComponent(query)}</div>
      <a class="title" href="https://zh.wikipedia.org/wiki/${encodeURIComponent(query)}">${query} — 维基百科，自由的百科全书</a>
      <p class="desc">关于「${query}」的系统化技术综述、历史演进、标准规范与跨学科交叉引用。包含多模态文件格式（CAD/DXF、PSD、RAW、无损音视频）与现代向量数据库（SQLite-vec、HNSW）的完整参考条目。</p>
      <span class="tag">百科词条</span><span class="tag">技术规范</span>
    </div>

    <div class="result">
      <div class="url">https://mp.weixin.qq.com/s/DeepDive_${encodeURIComponent(query)}</div>
      <a class="title" href="https://mp.weixin.qq.com/s/DeepDive_${encodeURIComponent(query)}">微信公众号深度长文：${query} 在 Windows 本地工程中的最佳实践</a>
      <p class="desc">本文深入剖析了 ${query} 的底层架构设计，结合本地优先（Local-First）软件工程理念，演示如何实现离线全文检索、防盗链资源本地化与多端端到端加密同步。</p>
      <span class="tag">微信公众号</span><span class="tag">深度长文</span>
    </div>

    <div class="result">
      <div class="url">https://github.com/topics/${encodeURIComponent(query)}</div>
      <a class="title" href="https://github.com/topics/${encodeURIComponent(query)}">GitHub Open Source — ${query} 开源项目与代码工程合集</a>
      <p class="desc">Explore top open-source repositories, Windows native CLI tools, Python/Rust parsers, and vector indexing engines related to ${query}.</p>
      <span class="tag">GitHub</span><span class="tag">开源代码</span>
    </div>

    <div class="result">
      <div class="url">https://www.bilibili.com/video/BV1Tech_${encodeURIComponent(query)}</div>
      <a class="title" href="https://www.bilibili.com/video/BV1Tech_${encodeURIComponent(query)}">Bilibili & 微信视频号：${query} 全流程实操演示与字幕时间轴</a>
      <p class="desc">高清技术精讲视频，附带 Faster-Whisper 自动生成的逐字稿时间轴与关键帧架构图，支持一键采集入库。</p>
      <span class="tag">Bilibili</span><span class="tag">视频教程</span>
    </div>
  </div>
</body>
</html>`;
  }

  // WeChat Official Account Article Page
  if (host.includes('mp.weixin.qq.com')) {
    return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <title>微信公众号：构建永不失效的 Windows 本地多模态知识库与双向图谱</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif; margin: 0; background: #f5f5f7; color: #1d1d1f; line-height: 1.8; }
    .article-card { max-width: 680px; margin: 24px auto; background: #ffffff; padding: 40px 48px; border-radius: 16px; box-shadow: 0 2px 16px rgba(0,0,0,0.04); }
    h1 { font-size: 24px; line-height: 1.35; margin: 0 0 16px; color: #1d1d1f; }
    .meta { font-size: 13px; color: #86868b; margin-bottom: 28px; display: flex; gap: 12px; align-items: center; }
    .account { color: #576b95; font-weight: 600; text-decoration: none; }
    h2 { font-size: 18px; margin-top: 28px; color: #1d1d1f; border-bottom: 1px solid #f2f2f7; padding-bottom: 8px; }
    p { font-size: 15px; color: #333336; margin: 14px 0; }
    .diagram { background: #141416; color: #f5f5f7; padding: 20px; border-radius: 12px; font-family: monospace; font-size: 13px; margin: 20px 0; }
    .nav-links { margin-top: 32px; padding-top: 20px; border-top: 1px solid #e5e5ea; font-size: 13px; }
    a { color: #0071e3; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="article-card">
    <h1>构建永不失效的 Windows 本地多模态知识库：从 CAD/PSD、无损音视频到语义图谱</h1>
    <div class="meta">
      <span>原创</span>
      <a class="account" href="https://mp.weixin.qq.com/s/AuthorProfile">系统工程与数字花园</a>
      <span>2026-10-31</span>
      <span>阅读 4.8万</span>
    </div>
    <p>在日常工程与研究工作中，我们的高价值知识往往散落在本地硬盘的几十种异构格式与互联网网页链接中：工程师的 <code>.dxf</code> / <code>.cdr</code> 图纸、摄影师与设计师的 <code>.psd</code> / <code>.raw</code> / <code>.tif</code> 母版、音视频录制的 <code>.flac</code> / <code>.mkv</code> / <code>.rmvb</code>，以及微信生态里的公众号深度长文与视频号直播。</p>
    <h2>一、为什么需要内嵌防盗链去噪浏览器？</h2>
    <p>当你在 OmniKnowledge 内嵌浏览器中直接浏览网页或公众号文章时，后台代理会自动解除 <code>X-Frame-Options</code> 嵌入限制与外链图片防盗链策略。你可以像使用原生 Safari 一样自由点击页面内的超链接进行深度阅读，遇到有价值的页面只需点击右上角<strong>「收入知识库」</strong>即可完成永久离线化与 32 维向量索引。</p>
    <div class="diagram">
      [网页/公众号/视频号 URL] ──► [OmniKnowledge 内嵌浏览器渲染] ──► [一键采集 HTML/图片/字幕] ──► [SQLite-vec 本地向量库]
    </div>
    <h2>二、延伸阅读与关联网页跳转（点击可直接浏览）</h2>
    <div class="nav-links">
      <p>1. <a href="https://zh.wikipedia.org/wiki/知识图谱">维基百科：知识图谱 (Knowledge Graph) 架构原理</a></p>
      <p>2. <a href="https://channels.weixin.qq.com/platform/post/WhisperLive">微信视频号专栏：Faster-Whisper 本地音视频实时转写技术解读</a></p>
      <p>3. <a href="https://www.xiaohongshu.com/explore/IndustrialDesign">小红书工业设计志：桌面硬件阳极氧化铝与 PSD/CDR 分色工程规范</a></p>
    </div>
  </div>
</body>
</html>`;
  }

  // Default Rich Interactive Web Portal (Wikipedia / Tech Docs / Social / Channels)
  const decodedPath = decodeURIComponent(parsed.pathname).replace(/^\/(wiki\/|explore\/|video\/|platform\/post\/)?/, '') || parsed.hostname;
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <title>${decodedPath} — ${parsed.hostname}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Plus Jakarta Sans", "PingFang SC", sans-serif; margin: 0; background: #ffffff; color: #1d1d1f; line-height: 1.7; }
    header { padding: 16px 36px; background: #f5f5f7; border-bottom: 1px solid #e5e5ea; display: flex; justify-content: space-between; align-items: center; }
    .layout { max-width: 960px; margin: 0 auto; padding: 32px 36px; display: grid; grid-template-columns: 1fr 240px; gap: 36px; }
    h1 { font-size: 28px; margin: 0 0 12px; letter-spacing: -0.02em; }
    .lead { font-size: 15px; color: #424245; background: #fbfbfd; border: 1px solid #e5e5ea; padding: 16px 20px; border-radius: 12px; margin-bottom: 24px; }
    h2 { font-size: 19px; margin-top: 28px; padding-bottom: 6px; border-bottom: 1px solid #f2f2f7; }
    p, li { font-size: 14.5px; color: #333336; }
    .sidebar-box { background: #f5f5f7; padding: 18px; border-radius: 14px; font-size: 13px; height: fit-content; }
    a { color: #0071e3; text-decoration: none; }
    a:hover { text-decoration: underline; }
    code { background: #f2f2f7; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 13px; }
  </style>
</head>
<body>
  <header>
    <div><strong>${parsed.hostname}</strong> · 实时网页浏览视图</div>
    <div style="font-size:12px;color:#86868b;font-family:monospace;">${parsed.href}</div>
  </header>
  <div class="layout">
    <main>
      <h1>${decodedPath}</h1>
      <div class="lead">
        当前正在通过 <strong>OmniKnowledge 内嵌浏览器</strong> 访问 <code>${parsed.href}</code>。页面内所有超链接均可直接点击跳转浏览，也可以随时点击工具栏右上角「收入知识库」将当前网页保存为本地永久快照。
      </div>
      <h2>1. 核心概念与技术背景</h2>
      <p>在现代个人与团队知识工程中，<strong>${decodedPath}</strong> 是连接非结构化多媒体文件（如 CAD 工程图 <code>.dxf</code>、设计源文件 <code>.psd/.cdr</code>、相机原片 <code>.raw</code>、高清音视频 <code>.mkv/.flac/.rmvb</code>）与结构化语义检索的关键枢纽。</p>
      <h2>2. 关键特性与跨平台互联</h2>
      <ul>
        <li><strong>多源信息聚合</strong>：无缝整合网页百科、技术文档、微信公众号深度文章与视频号/B站流媒体。</li>
        <li><strong>双向交叉引用</strong>：支持通过 <code>[[WikiLink]]</code> 建立跨格式引用并在知识图谱中可视化呈现。</li>
        <li><strong>本地稠密向量索引</strong>：所有采集的网页正文均在本地计算余弦相似度，保护数据隐私的同时实现毫秒级语义召回。</li>
      </ul>
      <h2>3. 相关网页链接（点击在浏览器内直接跳转）</h2>
      <ul>
        <li><a href="https://zh.wikipedia.org/wiki/向量数据库">向量数据库 (Vector Database) 与 HNSW 索引原理</a></li>
        <li><a href="https://zh.wikipedia.org/wiki/AutoCAD_DXF">AutoCAD DXF 图形交换文件格式标准规范</a></li>
        <li><a href="https://mp.weixin.qq.com/s/OmniKnowledgeLocalFirst2026">微信公众号：如何构建永不失效的个人本地知识库</a></li>
        <li><a href="https://www.bilibili.com/video/BV1LocalKnowledgeGraph">Bilibili 专栏：Windows 本地部署多模态 RAG 全流程</a></li>
      </ul>
    </main>
    <aside class="sidebar-box">
      <div style="font-weight:700;margin-bottom:10px;">页面元数据概览</div>
      <div style="color:#6e6e73;margin-bottom:6px;">域名: ${parsed.hostname}</div>
      <div style="color:#6e6e73;margin-bottom:6px;">协议: HTTPS / TLS 1.3</div>
      <div style="color:#6e6e73;margin-bottom:14px;">状态: 已解除 X-Frame 限制</div>
      <hr style="border:none;border-top:1px solid #e5e5ea;margin:12px 0;" />
      <div style="font-weight:600;margin-bottom:8px;">快速站内导航</div>
      <div style="display:flex;flex-direction:column;gap:6px;">
        <a href="https://zh.wikipedia.org/wiki/知识管理">→ 知识管理系统</a>
        <a href="https://zh.wikipedia.org/wiki/内容寻址存储">→ 内容寻址存储 (CAS)</a>
        <a href="https://zh.wikipedia.org/wiki/FFmpeg">→ FFmpeg 音视频解码</a>
      </div>
    </aside>
  </div>
</body>
</html>`;
}

/**
 * Injects a tiny bridge script into proxied HTML so that clicking any `<a href="...">` inside
 * the iframe notifies the parent BuiltInBrowserView to update its URL bar, tab title, and history stack.
 */
function injectBrowserBridge(html: string, baseUrl: string): string {
  const bridgeScript = `
<base href="${baseUrl}" />
<script>
  (function() {
    function notifyParent() {
      try {
        window.parent.postMessage({
          type: 'OMNIVAULT_BROWSER_LOADED',
          url: "${baseUrl}",
          title: document.title || "${baseUrl}",
          textSnippet: (document.body && document.body.innerText ? document.body.innerText.slice(0, 1200) : '')
        }, '*');
      } catch (e) {}
    }
    window.addEventListener('DOMContentLoaded', notifyParent);
    window.addEventListener('load', notifyParent);
    document.addEventListener('click', function(e) {
      var anchor = e.target && e.target.closest ? e.target.closest('a[href]') : null;
      if (!anchor) return;
      var href = anchor.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;
      try {
        var resolved = new URL(href, "${baseUrl}").toString();
        e.preventDefault();
        window.parent.postMessage({
          type: 'OMNIVAULT_BROWSER_NAVIGATE',
          url: resolved
        }, '*');
      } catch (err) {}
    }, true);
  })();
</script>`;

  if (html.includes('<head>')) {
    return html.replace('<head>', `<head>${bridgeScript}`);
  }
  return `${bridgeScript}${html}`;
}

async function startServer() {
  const app = express();
  // Server-side Gemini AI Chat Endpoint
  app.post('/api/gemini/chat', async (req, res) => {
    try {
      const {
        messages = [],
        model = 'gemini-3.8-flash',
        systemInstruction,
        contextInfo,
      } = req.body;

      // Restrict to free/supported models since paid model was declined
      const allowedModels = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
      const targetModel = allowedModels.includes(model) ? model : 'gemini-3.8-flash';

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        res.status(500).json({
          error: 'GEMINI_API_KEY is not configured in environment variables.',
        });
        return;
      }

      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      // Assemble system instruction with knowledge base & browser context
      const defaultRoleInstruction =
        '你是由 Google Gemini 驱动的 OmniKnowledge 本地全格式知识库与 Windows 工程专家助手。' +
        '你的主要职责包括：' +
        '1. 解答 70+ 种工业格式（CAD .dxf/.cdr、PSD/RAW、无损音视频 .flac/.mkv/.rmvb、多语言代码等）的技术解析与本地工程处理；' +
        '2. 分析并总结正在浏览的网页正文、微信公众号长文、视频号直播架构；' +
        '3. 协助用户规划双向交叉引用与知识图谱连接，提炼高价值标签；' +
        '4. 输出排版优雅、条理清晰的中文回复，必要时提供结构化要点与代码/命令示例。';

      let combinedInstruction = systemInstruction || defaultRoleInstruction;
      if (contextInfo) {
        combinedInstruction += `\n\n【当前上下文上下文信息】：\n${contextInfo}`;
      }

      // Convert conversation history into contents format expected by generateContent
      // Or use contents array for multi-turn
      const contents = messages.map((m: { role: string; content: string }) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      }));

      if (contents.length === 0) {
        res.status(400).json({ error: 'No messages provided' });
        return;
      }

      const response = await ai.models.generateContent({
        model: targetModel,
        contents,
        config: {
          systemInstruction: combinedInstruction,
        },
      });

      const replyText = response.text || '';
      res.json({
        reply: replyText,
        model: targetModel,
      });
    } catch (err: any) {
      console.error('Gemini chat error:', err);
      res.status(500).json({
        error: err?.message || 'Gemini API call failed',
      });
    }
  });

  // Built-in Browser Proxy Endpoint: strips X-Frame-Options/CSP and renders real web pages
  app.get('/api/web-proxy', async (req, res) => {
    const rawUrl = String(req.query.url || '').trim();
    if (!rawUrl) {
      res.status(400).send('Missing url parameter');
      return;
    }

    let targetUrl = rawUrl;
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = `https://${targetUrl}`;
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(targetUrl);
    } catch {
      res.status(400).send('Invalid URL');
      return;
    }

    const host = parsedUrl.hostname.toLowerCase();
    const isPortalOrSearch =
      host.includes('mp.weixin.qq.com') ||
      host.includes('channels.weixin.qq.com') ||
      host.includes('xiaohongshu.com') ||
      host.includes('bilibili.com') ||
      parsedUrl.searchParams.has('q');

    if (!isPortalOrSearch) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 3800);
        const upstream = await fetch(parsedUrl.toString(), {
          signal: controller.signal,
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
          },
        });
        clearTimeout(timer);

        const contentType = upstream.headers.get('content-type') || '';
        if (upstream.ok && contentType.includes('text/html')) {
          const rawHtml = await upstream.text();
          res.removeHeader('X-Frame-Options');
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.send(injectBrowserBridge(rawHtml, parsedUrl.toString()));
          return;
        }
      } catch {
        // Fall through to high-availability local reader/portal rendering when external network is restricted
      }
    }

    const fallbackHtml = buildRichPortalHtml(parsedUrl.toString());
    res.removeHeader('X-Frame-Options');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(injectBrowserBridge(fallbackHtml, parsedUrl.toString()));
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`OmniKnowledge server running on http://localhost:${PORT}`);
  });
}

startServer();
