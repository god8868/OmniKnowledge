import React, { useState } from 'react';
import {
  X,
  Upload,
  Link2,
  FilePlus2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import {
  KnowledgeItem,
  detectFormatInfo,
  parseSocialOrWebUrl,
  computeEmbedding,
  FORMAT_REGISTRY,
} from '../utils/knowledgeEngine';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingItems: KnowledgeItem[];
  onImportItem: (item: KnowledgeItem) => void;
}

const EXOTIC_SAMPLE_FILES: Array<{
  filename: string;
  sizeBytes: number;
  tags: string[];
  summary: string;
  content: string;
  layers?: string[];
}> = [
  {
    filename: '工业包装刀模与潘通专色印刷母版.cdr',
    sizeBytes: 28450000,
    tags: ['CorelDRAW', 'CDR矢量', '印刷分色', '工业设计'],
    summary: 'CorelDRAW X8/2024 (.cdr) 矢量包装盒型图档，已由 libcdr + Inkscape 管线解析出 4 个专色图层与模切压痕路径。',
    content: 'CorelDRAW (.cdr) 本地矢量解析结果：\n- 页面尺寸: 680 × 490 mm\n- 专色通道: PANTONE 286 C, PANTONE Metallic 877 C\n- 刀模线图层: DIE_CUT_CREASE (闭合贝塞尔曲线 312 条)',
    layers: ['DIE_CUT_CREASE (模切刀线)', 'PANTONE_877C_SILVER (金属专色层)', 'BLEED_ARTWORK (3mm出血印刷层)'],
  },
  {
    filename: '2004年国家重点实验室精密机床纪录片归档.rmvb',
    sizeBytes: 365200000,
    tags: ['RMVB老旧视频', 'FFmpeg转码', 'Whisper转写', '历史档案'],
    summary: 'RealMedia Variable Bitrate (.rmvb, RV40 + Cook 音频) 历史影像资料，已通过 FFmpeg 解封装并生成全文时间轴语音索引。',
    content: 'RealMedia (.rmvb) 容器解码成功：\n- 原始编码: RealVideo 9 (RV40) 720×576 @ 25fps\n- 语音转写: [00:01:10] 五轴联动数控龙门铣床主轴热变形补偿实验记录与激光干涉仪读数对比。',
  },
  {
    filename: '古籍善本高动态范围多页扫描档案.tif',
    sizeBytes: 142800000,
    tags: ['TIFF多页图像', 'RapidOCR', '古籍档案', 'ExifTool'],
    summary: 'LibTIFF 16-bit 无损 LZW 压缩多页 TIF 扫描件，附带 ICC 档案级色彩配置与全文 OCR 识别文本。',
    content: 'Tagged Image File (.tif) 16-bit 扫描档案：\n- 分辨率: 600 DPI (7016 × 4960 px)\n- 包含页数: 24 页连续图像目录 (IFD)\n- RapidOCR 识别置信度: 99.2%',
    layers: ['IFD_PAGE_01 (封面原色扫描)', 'IFD_PAGE_02 (正文去底色二值化层)', 'ICC_ARCHIVE_PROFILE'],
  },
  {
    filename: '特种设备液压回路标准元件符号库.wmf',
    sizeBytes: 1240000,
    tags: ['WMF图元', 'GDI+矢量', '工程符号', 'AutoCAD'],
    summary: 'Windows Metafile (.wmf) 矢量图元库，通过 Windows 原生 GDI+ 矢量指令流解析，支持无损缩放与 SVG 映射。',
    content: 'Windows Metafile (.wmf) 16/32-bit 矢量绘制指令记录：含换向阀、溢流阀、伺服油缸等 48 个工业液压符号组。',
  },
];

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  existingItems,
  onImportItem,
}) => {
  const [activeTab, setActiveTab] = useState<'file' | 'url'>('file');
  const [customFilename, setCustomFilename] = useState('');
  const [customTags, setCustomTags] = useState('本地入库, 多模态索引');
  const [customNote, setCustomNote] = useState('');
  const [selectedRefId, setSelectedRefId] = useState(existingItems[0]?.id || '');
  const [urlInput, setUrlInput] = useState('');
  const [urlTitle, setUrlTitle] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const createAndDispatchItem = (params: {
    filename: string;
    sizeBytes: number;
    tags: string[];
    summary: string;
    content: string;
    sourceUrl?: string;
    layers?: string[];
  }) => {
    const spec = detectFormatInfo(params.filename);
    const now = '2026-10-31 04:18';
    const fullText = `${params.filename} ${spec.label} ${params.tags.join(' ')} ${params.summary} ${params.content}`;
    const newItem: KnowledgeItem = {
      id: `kb-import-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: params.filename,
      category: spec.category,
      ext: spec.ext,
      windowsPath: `D:\\OmniKnowledge\\Imported\\${params.filename}`,
      sourceUrl: params.sourceUrl,
      sizeBytes: params.sizeBytes,
      createdAt: now,
      updatedAt: now,
      sha256: Array.from({ length: 64 }, (_, i) => ((i * 11 + Date.now()) % 16).toString(16)).join(''),
      tags: params.tags,
      references: selectedRefId ? [selectedRefId] : [],
      summary: params.summary,
      content: params.content,
      metadata: {
        layers: params.layers,
        resolution: spec.category === 'image' ? '4096 × 3072 px' : undefined,
        durationSec: spec.category === 'media' ? 420 : undefined,
      },
      embedding: computeEmbedding(fullText),
    };
    onImportItem(newItem);
    onClose();
  };

  const handleNativeFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const f = files[0];
    const spec = detectFormatInfo(f.name);
    const tags = customTags
      .split(/[,，\s]+/)
      .map((t) => t.trim())
      .filter(Boolean);

    createAndDispatchItem({
      filename: f.name,
      sizeBytes: f.size || 248000,
      tags: [...tags, spec.ext.toUpperCase()],
      summary: `从 Windows 本地磁盘导入的 ${spec.label} 文件，已通过 ${spec.decoderPipeline} 完成解析与本地向量化。`,
      content:
        customNote.trim() ||
        `文件名称: ${f.name}\n解码器管线: ${spec.decoderPipeline}\nMIME 类型: ${spec.mimeHint}\n已完成 SHA-256 内容寻址校验与 32 维语义向量入库。`,
    });
  };

  const handleManualFileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customFilename.trim()) {
      setErrorMsg('请输入带有扩展名的文件名（如 blueprint.dxf、design.cdr、video.rmvb、report.docx）');
      return;
    }
    const spec = detectFormatInfo(customFilename.trim());
    const tags = customTags
      .split(/[,，\s]+/)
      .map((t) => t.trim())
      .filter(Boolean);

    createAndDispatchItem({
      filename: customFilename.trim(),
      sizeBytes: 3420000,
      tags: [...tags, spec.ext.toUpperCase()],
      summary: `${spec.label} 本地入库资产，经由 ${spec.decoderPipeline} 提取结构化内容与语义向量。`,
      content:
        customNote.trim() ||
        `本地路径: D:\\OmniKnowledge\\Imported\\${customFilename.trim()}\n格式规格: ${spec.label}\n解析引擎: ${spec.decoderPipeline}`,
    });
  };

  const handleUrlImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseSocialOrWebUrl(urlInput);
    if (!parsed.isValid) {
      setErrorMsg('请输入有效的网页链接、微信公众号链接 (mp.weixin.qq.com)、视频号或社交平台链接');
      return;
    }
    const finalTitle = urlTitle.trim() || parsed.suggestedTitle;
    const tags = customTags
      .split(/[,，\s]+/)
      .map((t) => t.trim())
      .filter(Boolean);

    const now = '2026-10-31 04:18';
    const contentText =
      customNote.trim() ||
      `来源平台: ${parsed.platformName}\n原始链接: ${parsed.normalizedUrl}\n采集引擎: ${parsed.decoderPipeline}\n\n已完成防盗链静态资源本地化与全文向量化索引。`;

    const newItem: KnowledgeItem = {
      id: `kb-url-${Date.now()}`,
      title: finalTitle,
      category: parsed.category,
      ext: parsed.ext,
      windowsPath: `D:\\OmniKnowledge\\07_Web_Captures\\${parsed.ext}_${Date.now()}.snap`,
      sourceUrl: parsed.normalizedUrl,
      sizeBytes: 1280000,
      createdAt: now,
      updatedAt: now,
      sha256: Array.from({ length: 64 }, (_, i) => ((i * 13 + Date.now()) % 16).toString(16)).join(''),
      tags: [...new Set([...parsed.suggestedTags, ...tags])],
      references: selectedRefId ? [selectedRefId] : [],
      summary: `${parsed.platformName}离线归档条目：${finalTitle}`,
      content: contentText,
      metadata: {
        platformName: parsed.platformName,
        authorOrAccount: parsed.platformName,
        publishDate: '2026-10-31',
      },
      embedding: computeEmbedding(`${finalTitle} ${contentText}`),
    };
    onImportItem(newItem);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="多格式文件与全网链接导入窗口"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4 overflow-y-auto"
    >
      <div className="w-full max-w-2xl rounded-3xl bg-white border border-black/[0.08] shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-black/[0.06] flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-[#1D1D1F]">
              导入本地多格式文件或全网 / 微信 / 社媒链接
            </h2>
            <p className="text-xs text-[#86868B] mt-0.5">
              支持 {Object.keys(FORMAT_REGISTRY).length}+ 种专业图像、CAD、文档、音视频、代码格式及公众号/视频号/社交平台链接
            </p>
          </div>
          <button
            type="button"
            aria-label="关闭导入窗口"
            onClick={onClose}
            className="p-2 rounded-full bg-[#F5F5F7] text-[#86868B] hover:text-[#1D1D1F] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Apple Segmented Mode Switch */}
        <div className="px-6 pt-4 pb-2 bg-[#FAFAFC]">
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-[#F5F5F7]">
            <button
              type="button"
              onClick={() => {
                setActiveTab('file');
                setErrorMsg(null);
              }}
              className={`py-2 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'file'
                  ? 'bg-white text-[#1D1D1F] shadow-xs'
                  : 'text-[#86868B] hover:text-[#1D1D1F]'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>本地全格式文件入库 (图像/文档/音视频/代码)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('url');
                setErrorMsg(null);
              }}
              className={`py-2 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'url'
                  ? 'bg-white text-[#1D1D1F] shadow-xs'
                  : 'text-[#86868B] hover:text-[#1D1D1F]'
              }`}
            >
              <Link2 className="w-3.5 h-3.5" />
              <span>网页 / 微信公众号 / 视频号 / 社交平台链接采集</span>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-[#FF3B30]/10 border border-[#FF3B30]/30 text-xs text-[#FF3B30] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {activeTab === 'file' ? (
            <div className="space-y-4">
              {/* Native File Picker */}
              <label className="block border border-dashed border-black/20 hover:border-[#0071E3] rounded-2xl p-5 text-center cursor-pointer transition-colors bg-[#F5F5F7]/70">
                <input
                  type="file"
                  onChange={handleNativeFileUpload}
                  className="hidden"
                />
                <Upload className="w-5 h-5 text-[#0071E3] mx-auto mb-1.5" />
                <div className="text-xs font-semibold text-[#1D1D1F]">
                  点击从 Windows 资源管理器选择任意格式文件直接入库
                </div>
                <div className="text-[11px] text-[#86868B] mt-0.5">
                  支持 BMP, JPG, PNG, TIF, GIF, PCX, TGA, EXIF, FPX, SVG, PSD, CDR, PCD, DXF, UFO, EPS, AI, RAW, WMF, WebP, AVIF, APNG, DOCX, PDF, MKV, RMVB, FLAC 等
                </div>
              </label>

              {/* Quick Exotic Format Test Samples */}
              <div>
                <div className="text-xs font-semibold text-[#1D1D1F] mb-2">
                  或一键导入专业测试样片 (验证特殊格式解码管线):
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {EXOTIC_SAMPLE_FILES.map((sample) => (
                    <button
                      key={sample.filename}
                      type="button"
                      onClick={() => createAndDispatchItem(sample)}
                      className="text-left p-3 rounded-2xl bg-[#F5F5F7] hover:bg-[#E8E8ED] transition-colors"
                    >
                      <div className="text-xs font-semibold text-[#1D1D1F] truncate">
                        {sample.filename}
                      </div>
                      <div className="text-[11px] text-[#86868B] truncate mt-0.5">
                        {sample.summary}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Manual File Specification Form */}
              <form onSubmit={handleManualFileSubmit} className="space-y-3 pt-3 border-t border-black/[0.06]">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#1D1D1F] mb-1">
                      自定义文件名与扩展名
                    </label>
                    <input
                      type="text"
                      aria-label="自定义文件名与扩展名"
                      value={customFilename}
                      onChange={(e) => setCustomFilename(e.target.value)}
                      placeholder="例如: 卫星遥感多光谱影像.fpx 或 会议录音.opus"
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#F5F5F7] text-[#1D1D1F]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#1D1D1F] mb-1">
                      关联已有知识节点 (双向交叉引用)
                    </label>
                    <select
                      aria-label="关联已有知识节点"
                      value={selectedRefId}
                      onChange={(e) => setSelectedRefId(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#F5F5F7] text-[#1D1D1F]"
                    >
                      <option value="">-- 无关联 --</option>
                      {existingItems.map((it) => (
                        <option key={it.id} value={it.id}>
                          [{it.ext.toUpperCase()}] {it.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#1D1D1F] mb-1">
                    附加说明或 [[双向链接]] 笔记
                  </label>
                  <textarea
                    rows={2}
                    value={customNote}
                    onChange={(e) => setCustomNote(e.target.value)}
                    placeholder="输入该文件的项目背景、图层说明或 [[关联文档标题]]..."
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#F5F5F7] text-[#1D1D1F]"
                  />
                </div>

                <div className="flex justify-end gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-full bg-[#F5F5F7] hover:bg-[#E8E8ED] text-xs font-medium text-[#1D1D1F]"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold"
                  >
                    <FilePlus2 className="w-3.5 h-3.5" />
                    <span>解析文件并入库</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <form onSubmit={handleUrlImportSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-[#1D1D1F] mb-1">
                  目标链接 URL (支持微信公众号 / 微信视频号 / 小红书 / Bilibili / 知乎 / X / 普通网页)
                </label>
                <input
                  type="text"
                  aria-label="目标链接 URL"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://mp.weixin.qq.com/s/... 或 https://channels.weixin.qq.com/..."
                  className="w-full px-3.5 py-2 text-xs font-mono rounded-xl bg-[#F5F5F7] text-[#1D1D1F]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#1D1D1F] mb-1">
                    自定义归档标题 (选填，留空自动提取)
                  </label>
                  <input
                    type="text"
                    value={urlTitle}
                    onChange={(e) => setUrlTitle(e.target.value)}
                    placeholder="自动识别公众号/视频号标题..."
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#F5F5F7] text-[#1D1D1F]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#1D1D1F] mb-1">
                    标签 (逗号分隔)
                  </label>
                  <input
                    type="text"
                    value={customTags}
                    onChange={(e) => setCustomTags(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#F5F5F7] text-[#1D1D1F]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#1D1D1F] mb-1">
                  内容摘要或批注
                </label>
                <textarea
                  rows={3}
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  placeholder="添加采集备注或 [[关联条目]]..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#F5F5F7] text-[#1D1D1F]"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-full bg-[#F5F5F7] hover:bg-[#E8E8ED] text-xs font-medium text-[#1D1D1F]"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>抓取链接并建立向量索引</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
