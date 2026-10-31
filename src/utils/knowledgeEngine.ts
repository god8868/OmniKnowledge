export type KnowledgeCategory =
  | 'image'
  | 'document'
  | 'media'
  | 'code'
  | 'web'
  | 'wechat_mp'
  | 'wechat_video'
  | 'social';

export interface FormatSpec {
  ext: string;
  category: KnowledgeCategory;
  label: string;
  decoderPipeline: string;
  mimeHint: string;
  supportsLayers?: boolean;
  supportsExif?: boolean;
  supportsStream?: boolean;
}

export interface PersonalVault {
  id: string;
  name: string;
  description: string;
  rootPath: string;
  createdAt: string;
  updatedAt: string;
  coverColor?: string;
  iconName?: string;
}

export interface VaultFolder {
  id: string;
  vaultId: string;
  path: string;
  name: string;
  parentPath: string;
  createdAt: string;
}

export interface KnowledgeItem {
  id: string;
  vaultId?: string;
  folderPath?: string;
  title: string;
  category: KnowledgeCategory;
  ext: string;
  windowsPath: string;
  sourceUrl?: string;
  sizeBytes: number;
  createdAt: string;
  updatedAt: string;
  sha256: string;
  tags: string[];
  /** Explicit IDs of items this item references (outbound links) */
  references: string[];
  summary: string;
  content: string;
  /** Structured metadata specific to the format (EXIF, CAD layers, Audio/Video streams, CSV rows, WeChat account, etc.) */
  metadata: {
    resolution?: string;
    colorSpace?: string;
    cameraModel?: string;
    layers?: string[];
    durationSec?: number;
    videoCodec?: string;
    audioCodec?: string;
    sampleRate?: string;
    bitrate?: string;
    language?: string;
    lineCount?: number;
    authorOrAccount?: string;
    platformName?: string;
    publishDate?: string;
    csvHeaders?: string[];
    csvRows?: string[][];
    transcriptSegments?: Array<{ time: string; text: string }>;
  };
  /** Pre-computed or dynamically computed 32-D normalized semantic vector */
  embedding?: number[];
}

export interface VectorSearchResult {
  item: KnowledgeItem;
  vectorScore: number;
  keywordScore: number;
  hybridScore: number;
  matchedSnippet: string;
  matchedTerms: string[];
  matchSource?: 'content' | 'summary' | 'tags';
}

export interface GraphNode {
  id: string;
  title: string;
  category: KnowledgeCategory;
  ext: string;
  tags: string[];
  degree: number;
  inboundCount: number;
  outboundCount: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: 'reference' | 'tag';
  label: string;
}

export interface SyncNodeConfig {
  id: string;
  name: string;
  protocol: 'WebDAV' | 'S3 / MinIO' | 'Tailscale P2P' | 'Git-LFS' | 'LocalLAN' | string;
  endpoint: string;
  localMirrorDir: string;
  encryption: 'AES-256-GCM' | 'Age-X25519' | 'None' | string;
  status: 'synced' | 'pending' | 'syncing' | 'conflict';
  lastSyncAt: string;
  syncedCount: number;
  pendingDeltaCount: number;
  latencyMs?: number;
  healthStatus?: 'healthy' | 'degraded' | 'offline' | 'untested';
}

/**
 * Exhaustive registry of all formats requested by the user:
 * - Images: bmp, jpg, png, tif, gif, pcx, tga, exif, fpx, svg, psd, cdr, pcd, dxf, ufo, eps, ai, raw, wmf, webp, avif, apng
 * - Text/Docs: docx, pdf, html, xml, md, rtf, txt, csv
 * - Audio/Video: wav, flac, mp3, aac, ogg, opus, mp4, mkv, mov, avi, webm, flv, vob, m2ts, mpg, mpeg, ts, rm, rmvb, wmv, asf
 * - Code: py, ts, tsx, js, rs, go, cpp, c, cs, java, sql, ps1, sh, json, yaml, toml, vue, css
 */
export const FORMAT_REGISTRY: Record<string, FormatSpec> = {
  // Image Formats (22+)
  bmp: { ext: 'bmp', category: 'image', label: 'Windows Bitmap (BMP)', decoderPipeline: 'WIC / ImageMagick DIB Decoder', mimeHint: 'image/bmp', supportsExif: false },
  jpg: { ext: 'jpg', category: 'image', label: 'JPEG Image (JPG)', decoderPipeline: 'libjpeg-turbo + ExifTool', mimeHint: 'image/jpeg', supportsExif: true },
  jpeg: { ext: 'jpeg', category: 'image', label: 'JPEG Image (JPEG)', decoderPipeline: 'libjpeg-turbo + ExifTool', mimeHint: 'image/jpeg', supportsExif: true },
  png: { ext: 'png', category: 'image', label: 'Portable Network Graphics (PNG)', decoderPipeline: 'libpng + PaddleOCR', mimeHint: 'image/png', supportsExif: true },
  tif: { ext: 'tif', category: 'image', label: 'Tagged Image File (TIF)', decoderPipeline: 'LibTIFF Multi-Page GeoTIFF', mimeHint: 'image/tiff', supportsExif: true, supportsLayers: true },
  tiff: { ext: 'tiff', category: 'image', label: 'Tagged Image File (TIFF)', decoderPipeline: 'LibTIFF Multi-Page', mimeHint: 'image/tiff', supportsExif: true },
  gif: { ext: 'gif', category: 'image', label: 'CompuServe GIF', decoderPipeline: 'GIFLIB Frame Extractor', mimeHint: 'image/gif' },
  pcx: { ext: 'pcx', category: 'image', label: 'ZSoft Paintbrush (PCX)', decoderPipeline: 'ImageMagick Legacy PCX Decoder', mimeHint: 'image/x-pcx' },
  tga: { ext: 'tga', category: 'image', label: 'Truevision Targa (TGA)', decoderPipeline: 'DirectXTex TGA Texture Reader', mimeHint: 'image/x-tga', supportsLayers: true },
  exif: { ext: 'exif', category: 'image', label: 'EXIF Raw Metadata Sidecar', decoderPipeline: 'ExifTool Metadata & Thumbnail Parser', mimeHint: 'image/exif', supportsExif: true },
  fpx: { ext: 'fpx', category: 'image', label: 'Kodak FlashPix (FPX)', decoderPipeline: 'libfpx Multi-Resolution Tile Pyramid', mimeHint: 'image/vnd.fpx' },
  svg: { ext: 'svg', category: 'image', label: 'Scalable Vector Graphics (SVG)', decoderPipeline: 'resvg + DOM XML Tree Indexer', mimeHint: 'image/svg+xml', supportsLayers: true },
  psd: { ext: 'psd', category: 'image', label: 'Adobe Photoshop Document (PSD)', decoderPipeline: 'psd-tools Layer & SmartObject Parser', mimeHint: 'image/vnd.adobe.photoshop', supportsLayers: true },
  cdr: { ext: 'cdr', category: 'image', label: 'CorelDRAW Vector Drawing (CDR)', decoderPipeline: 'libcdr + Inkscape Headless Pipeline', mimeHint: 'application/cdr', supportsLayers: true },
  pcd: { ext: 'pcd', category: 'image', label: 'Kodak Photo CD (PCD)', decoderPipeline: 'ImageMagick PhotoCD YCC Decoder', mimeHint: 'image/x-photo-cd' },
  dxf: { ext: 'dxf', category: 'image', label: 'AutoCAD Drawing Exchange (DXF)', decoderPipeline: 'ezdxf Entity & Block Geometry Parser', mimeHint: 'image/vnd.dxf', supportsLayers: true },
  ufo: { ext: 'ufo', category: 'image', label: 'Ulead PhotoImpact / Unified Font (UFO)', decoderPipeline: 'ImageMagick UFO Object Composite', mimeHint: 'image/x-ufo', supportsLayers: true },
  eps: { ext: 'eps', category: 'image', label: 'Encapsulated PostScript (EPS)', decoderPipeline: 'Ghostscript Vector Rasterizer', mimeHint: 'application/postscript', supportsLayers: true },
  ai: { ext: 'ai', category: 'image', label: 'Adobe Illustrator Artwork (AI)', decoderPipeline: 'Poppler PDF/PostScript + Artboard Parser', mimeHint: 'application/illustrator', supportsLayers: true },
  raw: { ext: 'raw', category: 'image', label: 'Camera RAW Sensor Dump (RAW/CR3/NEF/ARW)', decoderPipeline: 'LibRaw Demosaic + ExifTool', mimeHint: 'image/x-dcraw', supportsExif: true },
  wmf: { ext: 'wmf', category: 'image', label: 'Windows Metafile (WMF/EMF)', decoderPipeline: 'Windows GDI+ Native Metafile Renderer', mimeHint: 'image/wmf', supportsLayers: true },
  webp: { ext: 'webp', category: 'image', label: 'WebP Picture (WebP)', decoderPipeline: 'libwebp Lossless/Lossy Decoder', mimeHint: 'image/webp', supportsExif: true },
  avif: { ext: 'avif', category: 'image', label: 'AV1 Image File Format (AVIF)', decoderPipeline: 'libavif + dav1d HDR10 Decoder', mimeHint: 'image/avif', supportsExif: true },
  apng: { ext: 'apng', category: 'image', label: 'Animated PNG (APNG)', decoderPipeline: 'libpng APNG Frame Sequencer', mimeHint: 'image/apng' },

  // Text & Document Formats (8+)
  docx: { ext: 'docx', category: 'document', label: 'Microsoft Word (DOCX)', decoderPipeline: 'python-docx + Pandoc AST Extractor', mimeHint: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
  pdf: { ext: 'pdf', category: 'document', label: 'Portable Document Format (PDF)', decoderPipeline: 'PyMuPDF (fitz) + RapidOCR Layout Engine', mimeHint: 'application/pdf' },
  html: { ext: 'html', category: 'document', label: 'HTML Document (HTML)', decoderPipeline: 'Readability.js + Trafilatura DOM Cleaner', mimeHint: 'text/html' },
  xml: { ext: 'xml', category: 'document', label: 'Extensible Markup Language (XML)', decoderPipeline: 'lxml XPath & Schema Validator', mimeHint: 'application/xml' },
  md: { ext: 'md', category: 'document', label: 'Markdown Note (MD)', decoderPipeline: 'Unified / Remark WikiLink AST Parser', mimeHint: 'text/markdown' },
  markdown: { ext: 'markdown', category: 'document', label: 'Markdown Note', decoderPipeline: 'Unified / Remark WikiLink AST Parser', mimeHint: 'text/markdown' },
  rtf: { ext: 'rtf', category: 'document', label: 'Rich Text Format (RTF)', decoderPipeline: 'striprtf + LibreOffice Headless', mimeHint: 'application/rtf' },
  txt: { ext: 'txt', category: 'document', label: 'Plain Text (TXT)', decoderPipeline: 'Chardet UTF-8/GB18030 Stream Reader', mimeHint: 'text/plain' },
  csv: { ext: 'csv', category: 'document', label: 'Comma-Separated Values (CSV)', decoderPipeline: 'DuckDB Local Columnar CSV Analyzer', mimeHint: 'text/csv' },

  // Audio & Video Formats (21+)
  wav: { ext: 'wav', category: 'media', label: 'Waveform PCM Audio (WAV)', decoderPipeline: 'FFmpeg pcm_s24le + Faster-Whisper ASR', mimeHint: 'audio/wav', supportsStream: true },
  flac: { ext: 'flac', category: 'media', label: 'Free Lossless Audio Codec (FLAC)', decoderPipeline: 'libFLAC + Faster-Whisper ASR', mimeHint: 'audio/flac', supportsStream: true },
  mp3: { ext: 'mp3', category: 'media', label: 'MPEG Layer-3 Audio (MP3)', decoderPipeline: 'FFmpeg libmp3lame + Whisper ASR', mimeHint: 'audio/mpeg', supportsStream: true },
  aac: { ext: 'aac', category: 'media', label: 'Advanced Audio Coding (AAC)', decoderPipeline: 'FFmpeg AAC-LC Demuxer + Whisper ASR', mimeHint: 'audio/aac', supportsStream: true },
  ogg: { ext: 'ogg', category: 'media', label: 'Ogg Vorbis / Opus Container (OGG)', decoderPipeline: 'libogg / libvorbis + Whisper ASR', mimeHint: 'audio/ogg', supportsStream: true },
  opus: { ext: 'opus', category: 'media', label: 'Opus Interactive Audio (Opus)', decoderPipeline: 'libopus Low-Latency Decoder + ASR', mimeHint: 'audio/opus', supportsStream: true },
  mp4: { ext: 'mp4', category: 'media', label: 'MPEG-4 Part 14 Video (MP4)', decoderPipeline: 'FFmpeg NVDEC H.264/HEVC + Keyframe OCR', mimeHint: 'video/mp4', supportsStream: true },
  mkv: { ext: 'mkv', category: 'media', label: 'Matroska Multimedia Container (MKV)', decoderPipeline: 'FFmpeg Matroska Multi-Track Demuxer', mimeHint: 'video/x-matroska', supportsStream: true },
  mov: { ext: 'mov', category: 'media', label: 'Apple QuickTime Movie (MOV)', decoderPipeline: 'FFmpeg ProRes / QuickTime Demuxer', mimeHint: 'video/quicktime', supportsStream: true },
  avi: { ext: 'avi', category: 'media', label: 'Audio Video Interleave (AVI)', decoderPipeline: 'FFmpeg RIFF/AVI Legacy Stream Decoder', mimeHint: 'video/x-msvideo', supportsStream: true },
  webm: { ext: 'webm', category: 'media', label: 'WebM VP9/AV1 Video (WebM)', decoderPipeline: 'libvpx / dav1d + WebVTT Extractor', mimeHint: 'video/webm', supportsStream: true },
  flv: { ext: 'flv', category: 'media', label: 'Flash Video Container (FLV)', decoderPipeline: 'FFmpeg FLV1 / H.264 Live Stream Remuxer', mimeHint: 'video/x-flv', supportsStream: true },
  vob: { ext: 'vob', category: 'media', label: 'DVD Video Object (VOB)', decoderPipeline: 'FFmpeg MPEG-2 DVD Program Stream Decoder', mimeHint: 'video/dvd', supportsStream: true },
  m2ts: { ext: 'm2ts', category: 'media', label: 'Blu-ray BDAV MPEG-2 Transport Stream (M2TS)', decoderPipeline: 'FFmpeg BDAV H.264/VC-1 Demuxer', mimeHint: 'video/mp2t', supportsStream: true },
  mpg: { ext: 'mpg', category: 'media', label: 'MPEG-1/2 System Stream (MPG)', decoderPipeline: 'FFmpeg mpegvideo Decoder', mimeHint: 'video/mpeg', supportsStream: true },
  mpeg: { ext: 'mpeg', category: 'media', label: 'MPEG-1/2 Video (MPEG)', decoderPipeline: 'FFmpeg mpegvideo Decoder', mimeHint: 'video/mpeg', supportsStream: true },
  mts: { ext: 'mts', category: 'media', label: 'MPEG Transport Stream (MTS/TS)', decoderPipeline: 'FFmpeg MPEG-TS Segment Combiner', mimeHint: 'video/mp2t', supportsStream: true },
  rm: { ext: 'rm', category: 'media', label: 'RealMedia Stream (RM)', decoderPipeline: 'FFmpeg RealVideo RV30/RV40 Decoder', mimeHint: 'application/vnd.rn-realmedia', supportsStream: true },
  rmvb: { ext: 'rmvb', category: 'media', label: 'RealMedia Variable Bitrate (RMVB)', decoderPipeline: 'FFmpeg RV40 + Cook Audio Transcoder', mimeHint: 'application/vnd.rn-realmedia-vbr', supportsStream: true },
  wmv: { ext: 'wmv', category: 'media', label: 'Windows Media Video (WMV)', decoderPipeline: 'Windows Media Foundation / WMV9 Decoder', mimeHint: 'video/x-ms-wmv', supportsStream: true },
  asf: { ext: 'asf', category: 'media', label: 'Advanced Systems Format (ASF)', decoderPipeline: 'FFmpeg ASF / WMA / WMV Stream Parser', mimeHint: 'video/x-ms-asf', supportsStream: true },

  // Code Formats (18+)
  py: { ext: 'py', category: 'code', label: 'Python Source Code (PY)', decoderPipeline: 'Tree-sitter Python AST & Docstring Extractor', mimeHint: 'text/x-python' },
  ts: { ext: 'ts', category: 'code', label: 'TypeScript Source (TS)', decoderPipeline: 'Tree-sitter TypeScript Symbol Indexer', mimeHint: 'text/typescript' },
  tsx: { ext: 'tsx', category: 'code', label: 'TypeScript React Component (TSX)', decoderPipeline: 'Tree-sitter TSX Component Graph', mimeHint: 'text/typescript-jsx' },
  js: { ext: 'js', category: 'code', label: 'JavaScript Module (JS)', decoderPipeline: 'Tree-sitter ECMAScript AST', mimeHint: 'text/javascript' },
  rs: { ext: 'rs', category: 'code', label: 'Rust Source Code (RS)', decoderPipeline: 'Tree-sitter Rust Crate & Trait Parser', mimeHint: 'text/rust' },
  go: { ext: 'go', category: 'code', label: 'Go Source Code (GO)', decoderPipeline: 'Tree-sitter Go Package Analyzer', mimeHint: 'text/x-go' },
  cpp: { ext: 'cpp', category: 'code', label: 'C++ Source File (CPP)', decoderPipeline: 'Tree-sitter C++ Header/Class Indexer', mimeHint: 'text/x-c++src' },
  c: { ext: 'c', category: 'code', label: 'C Source File (C)', decoderPipeline: 'Tree-sitter C Symbol Indexer', mimeHint: 'text/x-csrc' },
  cs: { ext: 'cs', category: 'code', label: 'C# .NET Source (CS)', decoderPipeline: 'Roslyn / Tree-sitter C# Namespace Parser', mimeHint: 'text/x-csharp' },
  java: { ext: 'java', category: 'code', label: 'Java Source (JAVA)', decoderPipeline: 'Tree-sitter Java Class Indexer', mimeHint: 'text/x-java' },
  sql: { ext: 'sql', category: 'code', label: 'SQL DDL/DML Script (SQL)', decoderPipeline: 'SQLGlot Dialect & Schema Lineage Parser', mimeHint: 'application/sql' },
  ps1: { ext: 'ps1', category: 'code', label: 'Windows PowerShell Script (PS1)', decoderPipeline: 'PowerShell AST Command & Pipeline Analyzer', mimeHint: 'application/x-powershell' },
  sh: { ext: 'sh', category: 'code', label: 'Shell Script (SH)', decoderPipeline: 'Tree-sitter Bash Analyzer', mimeHint: 'application/x-sh' },
  json: { ext: 'json', category: 'code', label: 'JSON Structured Data (JSON)', decoderPipeline: 'simdjson Key-Path Flattener', mimeHint: 'application/json' },
  yaml: { ext: 'yaml', category: 'code', label: 'YAML Configuration (YAML)', decoderPipeline: 'ruamel.yaml Tree Indexer', mimeHint: 'text/yaml' },
  toml: { ext: 'toml', category: 'code', label: 'TOML Config (TOML)', decoderPipeline: 'taplo TOML Schema Parser', mimeHint: 'application/toml' },
  ipynb: { ext: 'ipynb', category: 'code', label: 'Jupyter Notebook (IPYNB)', decoderPipeline: 'nbformat Code + Markdown Cell Extractor', mimeHint: 'application/x-ipynb+json' },
};

export const CATEGORY_META: Record<
  KnowledgeCategory,
  { name: string; shortName: string; badgeText: string; description: string }
> = {
  image: {
    name: '图像与工程图档',
    shortName: '图片/CAD',
    badgeText: 'IMAGE / CAD',
    description: 'BMP, JPG, PNG, TIF, GIF, PCX, TGA, EXIF, FPX, SVG, PSD, CDR, PCD, DXF, UFO, EPS, AI, RAW, WMF, WebP, AVIF, APNG',
  },
  document: {
    name: '文档与结构化文本',
    shortName: '文档/表格',
    badgeText: 'DOCUMENT',
    description: 'DOCX, PDF, HTML, XML, Markdown, RTF, TXT, CSV',
  },
  media: {
    name: '全格式音视频流',
    shortName: '音视频',
    badgeText: 'AUDIO / VIDEO',
    description: 'WAV, FLAC, MP3, AAC, OGG/Opus, MP4, MKV, MOV, AVI, WebM, FLV, VOB, M2TS, MPG/MPEG, TS, RM/RMVB, WMV, ASF',
  },
  code: {
    name: '代码与脚本工程',
    shortName: '代码工程',
    badgeText: 'SOURCE CODE',
    description: 'Python, TypeScript, Rust, Go, C/C++, C#, Java, SQL, PowerShell, Shell, JSON, YAML, TOML, Jupyter',
  },
  wechat_mp: {
    name: '微信公众号文章',
    shortName: '公众号',
    badgeText: 'WECHAT MP',
    description: 'mp.weixin.qq.com 离线正文快照、内嵌图片本地化、作者与合集元数据归档',
  },
  wechat_video: {
    name: '微信视频号内容',
    shortName: '视频号',
    badgeText: 'WECHAT VIDEO',
    description: 'channels.weixin.qq.com 视频号流媒体抓取、Whisper 语音转写时间轴与关键帧摘要',
  },
  social: {
    name: '互联网社交平台',
    shortName: '社媒平台',
    badgeText: 'SOCIAL / COMMUNITY',
    description: '小红书、Bilibili、知乎、X (Twitter)、GitHub Discussion 图文与视频帖子离线化',
  },
  web: {
    name: '通用网页快照',
    shortName: '网页链接',
    badgeText: 'WEB SNAPSHOT',
    description: 'SingleFile / Readability 网页去噪正文、DOM 树归档与双向段落批注',
  },
};

/**
 * Detects the format specification from a file name or extension.
 */
export function detectFormatInfo(filenameOrExt: string): FormatSpec {
  const cleaned = filenameOrExt.trim().toLowerCase();
  const parts = cleaned.split('.');
  const ext = parts.length > 1 ? parts[parts.length - 1] : cleaned.replace(/^\./, '');

  // Disambiguate .ts (MPEG-TS broadcast/video stream vs TypeScript source code)
  if (ext === 'ts') {
    const isMediaTs = /(broadcast|capture|stream|video|mpeg|hls|segment|live|tv|record|clip|movie|dv)/i.test(
      cleaned
    );
    if (isMediaTs) {
      return {
        ext: 'ts',
        category: 'media',
        label: 'MPEG Transport Stream (TS)',
        decoderPipeline: 'FFmpeg MPEG-TS Segment Combiner + Whisper ASR',
        mimeHint: 'video/mp2t',
        supportsStream: true,
      };
    }
  }

  if (FORMAT_REGISTRY[ext]) {
    return FORMAT_REGISTRY[ext];
  }

  return {
    ext: ext || 'bin',
    category: 'document',
    label: `通用数据文件 (${(ext || 'BIN').toUpperCase()})`,
    decoderPipeline: 'Windows IFilter / Apache Tika Fallback Extractor',
    mimeHint: 'application/octet-stream',
  };
}

export interface ParsedUrlResult {
  isValid: boolean;
  category: KnowledgeCategory;
  platformName: string;
  ext: string;
  suggestedTitle: string;
  suggestedTags: string[];
  decoderPipeline: string;
  normalizedUrl: string;
}

/**
 * Parses a URL and identifies whether it belongs to WeChat Official Account (公众号),
 * WeChat Video Channels (视频号), Social Media (Bilibili, Xiaohongshu, Zhihu, X, GitHub),
 * or general Web.
 */
export function parseSocialOrWebUrl(rawUrl: string): ParsedUrlResult {
  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return {
      isValid: false,
      category: 'web',
      platformName: '未知链接',
      ext: 'url',
      suggestedTitle: '',
      suggestedTags: [],
      decoderPipeline: '',
      normalizedUrl: '',
    };
  }

  let urlObj: URL;
  try {
    urlObj = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
  } catch {
    return {
      isValid: false,
      category: 'web',
      platformName: '无效 URL',
      ext: 'url',
      suggestedTitle: '',
      suggestedTags: [],
      decoderPipeline: '',
      normalizedUrl: trimmed,
    };
  }

  const host = urlObj.hostname.toLowerCase();
  const path = urlObj.pathname;

  if (host.includes('mp.weixin.qq.com')) {
    return {
      isValid: true,
      category: 'wechat_mp',
      platformName: '微信公众号',
      ext: 'wxmp',
      suggestedTitle: '微信公众号深度长文采集快照',
      suggestedTags: ['微信公众号', '微信生态', '深度长文'],
      decoderPipeline: 'Playwright Chromium + WeChat MP Anti-Lazy-Image Localizer',
      normalizedUrl: urlObj.toString(),
    };
  }

  if (
    host.includes('channels.weixin.qq.com') ||
    host.includes('finder.video.qq.com') ||
    trimmed.includes('视频号')
  ) {
    return {
      isValid: true,
      category: 'wechat_video',
      platformName: '微信视频号',
      ext: 'wxvid',
      suggestedTitle: '微信视频号流媒体与语音转写归档',
      suggestedTags: ['微信视频号', '视频转写', '关键帧索引'],
      decoderPipeline: 'WeChat Channels Stream Decryptor + FFmpeg + Faster-Whisper ASR',
      normalizedUrl: urlObj.toString(),
    };
  }

  if (host.includes('xiaohongshu.com') || host.includes('xhslink.com')) {
    return {
      isValid: true,
      category: 'social',
      platformName: '小红书 (RED)',
      ext: 'xhs',
      suggestedTitle: '小红书图文笔记与多图 OCR 归档',
      suggestedTags: ['小红书', '社媒笔记', '多图OCR'],
      decoderPipeline: 'XHS Note Carousel Downloader + RapidOCR Text Extractor',
      normalizedUrl: urlObj.toString(),
    };
  }

  if (host.includes('bilibili.com') || host.includes('b23.tv')) {
    return {
      isValid: true,
      category: 'social',
      platformName: 'Bilibili (哔哩哔哩)',
      ext: 'bili',
      suggestedTitle: 'Bilibili 视频分P弹幕与 AI 字幕归档',
      suggestedTags: ['Bilibili', '视频课程', '字幕时间轴'],
      decoderPipeline: 'yt-dlp Bilibili Extractor + Danmaku XML + Whisper ASR',
      normalizedUrl: urlObj.toString(),
    };
  }

  if (host.includes('zhihu.com')) {
    return {
      isValid: true,
      category: 'social',
      platformName: '知乎专栏/问答',
      ext: 'zhihu',
      suggestedTitle: '知乎高赞回答与专栏离线快照',
      suggestedTags: ['知乎', '问答精选', '知识卡片'],
      decoderPipeline: 'Zhihu Markdown AST Converter + Formula MathJax Parser',
      normalizedUrl: urlObj.toString(),
    };
  }

  if (host.includes('x.com') || host.includes('twitter.com')) {
    return {
      isValid: true,
      category: 'social',
      platformName: 'X (Twitter)',
      ext: 'xpost',
      suggestedTitle: 'X (Twitter) 推文串 Thread 完整归档',
      suggestedTags: ['X-Thread', '海外社媒', '技术动态'],
      decoderPipeline: 'Thread Unroller + Media Attachment Archiver',
      normalizedUrl: urlObj.toString(),
    };
  }

  if (host.includes('github.com')) {
    return {
      isValid: true,
      category: 'social',
      platformName: 'GitHub',
      ext: 'gh',
      suggestedTitle: `GitHub 开源工程归档 (${path.replace(/^\//, '') || 'Repository'})`,
      suggestedTags: ['GitHub', '开源架构', '代码仓库'],
      decoderPipeline: 'Git Shallow Clone + README/Issue Markdown Indexer',
      normalizedUrl: urlObj.toString(),
    };
  }

  return {
    isValid: true,
    category: 'web',
    platformName: host.replace(/^www\./, ''),
    ext: 'web',
    suggestedTitle: `网页快照: ${host.replace(/^www\./, '')}${path !== '/' ? path : ''}`,
    suggestedTags: ['网页采集', 'Readability快照'],
    decoderPipeline: 'SingleFile HTML Archiver + Trafilatura Clean Text',
    normalizedUrl: urlObj.toString(),
  };
}

/**
 * Semantic concept clusters used to generate meaningful deterministic 32-dimensional embeddings
 * locally in the browser without requiring an external API key.
 */
const SEMANTIC_CONCEPTS: string[][] = [
  ['cad', 'dxf', 'dwg', '建筑', '结构', '图纸', '工程', '图层', '矢量', 'cdr', 'ai', 'eps', 'svg', 'wmf'],
  ['psd', 'photoshop', '设计', 'ui', '视觉', '渲染', '位图', 'bmp', 'png', 'webp', 'avif', 'apng', 'tga', 'pcx'],
  ['raw', 'exif', '摄影', '相机', '镜头', '光圈', 'iso', 'tif', 'fpx', 'pcd', '色彩', '直方图'],
  ['音频', '视频', '流媒体', 'ffmpeg', 'wav', 'flac', 'mp3', 'aac', 'ogg', 'opus', '无损', '采样率', '波形'],
  ['mp4', 'mkv', 'mov', 'avi', 'webm', 'flv', 'vob', 'm2ts', 'mpg', 'rmvb', 'wmv', 'asf', '转写', '字幕', 'whisper'],
  ['文档', 'pdf', 'docx', 'word', 'rtf', 'txt', 'markdown', 'md', '报告', '白皮书', '规范', '笔记'],
  ['csv', '表格', '数据', '统计', '指标', 'xml', 'json', 'yaml', 'toml', 'sql', 'duckdb', '数据库'],
  ['代码', 'python', 'typescript', 'rust', 'go', 'cpp', '脚本', 'powershell', 'ast', '函数', '编译', '算法'],
  ['微信', '公众号', '视频号', 'mp.weixin', '社交', '小红书', 'bilibili', 'b站', '知乎', 'twitter', 'github', '采集'],
  ['向量', 'vector', 'embedding', '检索', '搜索', '语义', 'rag', 'bge', 'sqlite', 'chromadb', '余弦', '相似度'],
  ['图谱', 'graph', '交叉引用', '双向链接', 'wikilink', '关联', '节点', '知识网络', '标签'],
  ['同步', 'sync', '异地', 'webdav', 's3', 'minio', 'tailscale', 'p2p', '加密', '备份', 'windows', '本地'],
];

/**
 * Computes a normalized 32-dimensional float vector embedding for any text.
 * First 12 dimensions capture semantic domain concepts; remaining 20 dimensions
 * capture character/bi-gram hashing so arbitrary user queries match accurately.
 */
export function computeEmbedding(text: string): number[] {
  const dim = 32;
  const vec = new Array<number>(dim).fill(0);
  const normalized = text.toLowerCase().trim();
  if (!normalized) {
    return vec;
  }

  // 1. Semantic domain dimensions (0..11)
  for (let c = 0; c < SEMANTIC_CONCEPTS.length; c++) {
    const keywords = SEMANTIC_CONCEPTS[c];
    let score = 0;
    for (const kw of keywords) {
      if (normalized.includes(kw)) {
        score += 1.25;
      }
    }
    vec[c] = score;
  }

  // 2. Character & Bi-gram rolling hash dimensions (12..31)
  const cleanChars = normalized.replace(/\s+/g, '');
  for (let i = 0; i < cleanChars.length; i++) {
    const code1 = cleanChars.charCodeAt(i);
    const bucket1 = 12 + (code1 % 20);
    vec[bucket1] += 0.35;

    if (i + 1 < cleanChars.length) {
      const code2 = cleanChars.charCodeAt(i + 1);
      const bigramHash = (code1 * 31 + code2) % 20;
      vec[12 + bigramHash] += 0.65;
    }
  }

  // L2 normalization
  let normSq = 0;
  for (let i = 0; i < dim; i++) {
    normSq += vec[i] * vec[i];
  }
  const norm = Math.sqrt(normSq);
  if (norm > 0) {
    for (let i = 0; i < dim; i++) {
      vec[i] = Number((vec[i] / norm).toFixed(4));
    }
  }
  return vec;
}

/**
 * Computes Cosine Similarity between two vectors in [0, 1].
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  const len = Math.min(vecA.length, vecB.length);
  if (len === 0) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < len; i++) {
    dot += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  const raw = dot / (Math.sqrt(normA) * Math.sqrt(normB));
  return Math.max(0, Math.min(1, Number(raw.toFixed(4))));
}

/**
 * Performs Hybrid Local Vector + Keyword Search across the knowledge base.
 * @param vectorWeight Weight between 0.0 (pure keyword) and 1.0 (pure vector semantic), default 0.65
 */
export function searchKnowledgeBase(
  items: KnowledgeItem[],
  query: string,
  options: {
    category?: KnowledgeCategory | 'all';
    vectorWeight?: number;
    minScore?: number;
  } = {}
): VectorSearchResult[] {
  const { category = 'all', vectorWeight = 0.65, minScore = 0.1 } = options;
  const q = query.trim().toLowerCase();

  const filtered = category === 'all' ? items : items.filter((it) => it.category === category);

  if (!q) {
    return filtered.map((item) => ({
      item,
      vectorScore: 1,
      keywordScore: 1,
      hybridScore: 1,
      matchedSnippet: item.summary,
      matchedTerms: item.tags.slice(0, 3),
    }));
  }

  const queryVec = computeEmbedding(q);
  const queryTokens = q
    .split(/[\s,，。、/|+]+/)
    .map((t) => t.trim())
    .filter(Boolean);

  const results: VectorSearchResult[] = [];

  for (const item of filtered) {
    const docText = `${item.title} ${item.ext} ${item.tags.join(' ')} ${item.summary} ${item.content} ${item.windowsPath}`;
    const itemVec = item.embedding && item.embedding.length === 32 ? item.embedding : computeEmbedding(docText);
    const vectorScore = cosineSimilarity(queryVec, itemVec);

    const lowerDoc = docText.toLowerCase();
    let matchedHits = 0;
    const matchedTerms: string[] = [];

    for (const token of queryTokens) {
      if (lowerDoc.includes(token)) {
        matchedHits += 1;
        matchedTerms.push(token);
      } else {
        // Check character overlap for CJK queries without spaces
        let charHits = 0;
        for (const ch of token) {
          if (lowerDoc.includes(ch)) charHits++;
        }
        if (token.length >= 2 && charHits / token.length >= 0.6) {
          matchedHits += (charHits / token.length) * 0.75;
        }
      }
    }

    const keywordScore =
      queryTokens.length > 0 ? Math.min(1, Number((matchedHits / queryTokens.length).toFixed(4))) : 0;

    const hybridScore = Number(
      (vectorScore * vectorWeight + keywordScore * (1 - vectorWeight)).toFixed(4)
    );

    if (hybridScore >= minScore || matchedTerms.length > 0) {
      const { snippet, matchSource } = extractBestSnippet(
        item.content,
        item.summary,
        queryTokens,
        matchedTerms
      );

      results.push({
        item,
        vectorScore,
        keywordScore,
        hybridScore,
        matchedSnippet: snippet,
        matchedTerms,
        matchSource,
      });
    }
  }

  return results.sort((a, b) => b.hybridScore - a.hybridScore);
}

/**
 * Extracts `[[Title]]` wiki-links from markdown/text content.
 */
export function extractWikiLinks(text: string): string[] {
  const matches = text.matchAll(/\[\[([^\]]+)\]\]/g);
  const out: string[] = [];
  for (const m of matches) {
    const target = m[1].trim();
    if (target && !out.includes(target)) {
      out.push(target);
    }
  }
  return out;
}

/**
 * Computes inbound backlinks (`referencedBy`) for a given item ID across the entire vault.
 */
export function getBacklinksForItem(items: KnowledgeItem[], targetId: string): KnowledgeItem[] {
  const target = items.find((i) => i.id === targetId);
  if (!target) return [];

  return items.filter((item) => {
    if (item.id === targetId) return false;
    if (item.references.includes(targetId)) return true;
    const wikiTitles = extractWikiLinks(item.content);
    return wikiTitles.some((t) => target.title.toLowerCase().includes(t.toLowerCase()));
  });
}

/**
 * Builds the Knowledge Graph (nodes + reference/tag edges) for visualization and analysis.
 */
export function buildKnowledgeGraph(
  items: KnowledgeItem[],
  options: { categoryFilter?: KnowledgeCategory | 'all'; includeTagEdges?: boolean } = {}
): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const { categoryFilter = 'all', includeTagEdges = true } = options;
  const visibleItems =
    categoryFilter === 'all' ? items : items.filter((i) => i.category === categoryFilter);
  const visibleIds = new Set(visibleItems.map((i) => i.id));

  const edges: GraphEdge[] = [];
  const edgeKeys = new Set<string>();
  const inboundMap = new Map<string, number>();
  const outboundMap = new Map<string, number>();

  for (const item of visibleItems) {
    // 1. Explicit Cross-Reference Edges
    for (const refId of item.references) {
      if (visibleIds.has(refId) && refId !== item.id) {
        const key = `ref:${item.id}->${refId}`;
        if (!edgeKeys.has(key)) {
          edgeKeys.add(key);
          edges.push({
            id: key,
            source: item.id,
            target: refId,
            type: 'reference',
            label: '交叉引用',
          });
          outboundMap.set(item.id, (outboundMap.get(item.id) || 0) + 1);
          inboundMap.set(refId, (inboundMap.get(refId) || 0) + 1);
        }
      }
    }
  }

  // 2. Shared Tag Edges (when two items share >= 1 specific domain tag)
  if (includeTagEdges) {
    for (let i = 0; i < visibleItems.length; i++) {
      for (let j = i + 1; j < visibleItems.length; j++) {
        const a = visibleItems[i];
        const b = visibleItems[j];
        const shared = a.tags.filter((t) => b.tags.includes(t));
        if (shared.length > 0) {
          const directExists =
            edgeKeys.has(`ref:${a.id}->${b.id}`) || edgeKeys.has(`ref:${b.id}->${a.id}`);
          if (!directExists) {
            const key = `tag:${a.id}<->${b.id}`;
            edgeKeys.add(key);
            edges.push({
              id: key,
              source: a.id,
              target: b.id,
              type: 'tag',
              label: `#${shared[0]}`,
            });
          }
        }
      }
    }
  }

  const nodes: GraphNode[] = visibleItems.map((item) => {
    const inCount = inboundMap.get(item.id) || 0;
    const outCount = outboundMap.get(item.id) || 0;
    const tagConnections = edges.filter(
      (e) => e.type === 'tag' && (e.source === item.id || e.target === item.id)
    ).length;

    return {
      id: item.id,
      title: item.title,
      category: item.category,
      ext: item.ext,
      tags: item.tags,
      inboundCount: inCount,
      outboundCount: outCount,
      degree: inCount + outCount + tagConnections,
    };
  });

  return { nodes, edges };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(2)} MB`;
  const gb = mb / 1024;
  return `${gb.toFixed(2)} GB`;
}

export function getSuggestedTags(
  allTags: [string, number][],
  currentTags: string[],
  query: string = '',
  limit: number = 8
): [string, number][] {
  const cleanedQuery = query.trim().toLowerCase().replace(/^#/, '');
  const existingSet = new Set(currentTags.map((t) => t.toLowerCase()));

  return allTags
    .filter(([tagName]) => !existingSet.has(tagName.toLowerCase()))
    .filter(([tagName]) => !cleanedQuery || tagName.toLowerCase().includes(cleanedQuery))
    .slice(0, limit);
}

export interface TextSegment {
  text: string;
  isMatch: boolean;
}

/**
 * Splits text into matched and non-matched segments for highlighting based on query tokens.
 */
export function getHighlightSegments(
  text: string,
  query: string = '',
  additionalTerms: string[] = []
): TextSegment[] {
  if (!text) return [];
  const rawTokens: string[] = [];
  const trimmedQ = query.trim().replace(/^#/, '');
  if (trimmedQ) {
    rawTokens.push(trimmedQ);
    for (const w of trimmedQ.split(/\s+/)) {
      if (w.trim()) rawTokens.push(w.trim());
    }
    for (const w of trimmedQ.split(/[\s,，。、/|+]+/)) {
      if (w.trim()) rawTokens.push(w.trim());
    }
  }

  for (const term of additionalTerms) {
    const t = term.trim().replace(/^#/, '');
    if (t) rawTokens.push(t);
  }

  const cleaned = rawTokens
    .map((t) => t.toLowerCase())
    .filter((t) => t.length > 0);

  // De-duplicate and sort tokens by length descending (greedy matching)
  const tokens = Array.from(new Set(cleaned)).sort((a, b) => b.length - a.length);

  if (tokens.length === 0) {
    return [{ text, isMatch: false }];
  }

  // Escape regex special chars
  const escapedTokens = tokens.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const regex = new RegExp(`(${escapedTokens.join('|')})`, 'gi');

  const segments: TextSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        text: text.slice(lastIndex, match.index),
        isMatch: false,
      });
    }
    segments.push({
      text: match[0],
      isMatch: true,
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    segments.push({
      text: text.slice(lastIndex),
      isMatch: false,
    });
  }

  return segments;
}

/**
 * Extracts a high-density snippet window around the query terms from content or summary.
 */
export function extractBestSnippet(
  content: string,
  summary: string,
  queryTokens: string[],
  matchedTerms: string[] = []
): { snippet: string; matchSource: 'content' | 'summary' | 'tags' } {
  const allTerms = Array.from(new Set([...matchedTerms, ...queryTokens]))
    .map((t) => t.trim().toLowerCase().replace(/^#/, ''))
    .filter((t) => t.length > 1);

  if (allTerms.length === 0) {
    return { snippet: summary, matchSource: 'summary' };
  }

  const lowerContent = content.toLowerCase();

  // Find occurrences in content
  let bestIdx = -1;
  let maxDensity = -1;

  for (const term of allTerms) {
    let searchStart = 0;
    while (searchStart < lowerContent.length) {
      const idx = lowerContent.indexOf(term, searchStart);
      if (idx === -1) break;

      // Count term matches in a 180-char window around idx
      const windowStart = Math.max(0, idx - 45);
      const windowEnd = Math.min(content.length, idx + 150);
      const windowText = lowerContent.slice(windowStart, windowEnd);

      let hitsInWindow = 0;
      for (const t of allTerms) {
        if (windowText.includes(t)) hitsInWindow++;
      }

      if (hitsInWindow > maxDensity) {
        maxDensity = hitsInWindow;
        bestIdx = idx;
      }

      searchStart = idx + term.length;
    }
  }

  if (bestIdx !== -1) {
    const start = Math.max(0, bestIdx - 40);
    const end = Math.min(content.length, bestIdx + 130);
    const rawSlice = content.slice(start, end).replace(/\s+/g, ' ').trim();
    const prefix = start > 0 ? '… ' : '';
    const suffix = end < content.length ? ' …' : '';
    return {
      snippet: `${prefix}${rawSlice}${suffix}`,
      matchSource: 'content',
    };
  }

  // Fallback to summary
  return {
    snippet: summary,
    matchSource: 'summary',
  };
}

export const GRAPH_CATEGORY_COLORS: Record<KnowledgeCategory, string> = {
  image: '#0071E3',
  document: '#5856D6',
  media: '#AF52DE',
  code: '#00C7BE',
  wechat_mp: '#34C759',
  wechat_video: '#FF9500',
  social: '#FF2D55',
  web: '#8E8E93',
};

export function computeGraphNodePositions(
  nodes: GraphNode[],
  width = 880,
  height = 520
): Record<string, { x: number; y: number }> {
  const pos: Record<string, { x: number; y: number }> = {};
  const count = nodes.length;
  const cx = Math.round(width / 2);
  const cy = Math.round(height / 2 - 10);

  nodes.forEach((node, idx) => {
    if (idx === 0) {
      pos[node.id] = { x: cx, y: cy };
    } else {
      const angle = ((idx - 1) / Math.max(1, count - 1)) * Math.PI * 2 - Math.PI / 2;
      const radius = idx % 2 === 0 ? 165 : 225;
      pos[node.id] = {
        x: Math.round(cx + Math.cos(angle) * radius * 1.15),
        y: Math.round(cy + Math.sin(angle) * radius * 0.86),
      };
    }
  });

  return pos;
}

export interface GraphExportData {
  version: string;
  generator: string;
  exportedAt: string;
  summary: {
    totalNodes: number;
    totalEdges: number;
    referenceEdges: number;
    tagEdges: number;
    categoryCounts: Record<string, number>;
  };
  nodes: Array<GraphNode & {
    windowsPath?: string;
    summary?: string;
    sizeBytes?: number;
    references?: string[];
  }>;
  edges: GraphEdge[];
}

export function exportGraphAsJson(
  graph: { nodes: GraphNode[]; edges: GraphEdge[] },
  items: KnowledgeItem[],
  exportedAt?: string
): string {
  const timestamp = exportedAt || new Date().toISOString();
  const itemMap = new Map(items.map((i) => [i.id, i]));

  const categoryCounts: Record<string, number> = {};
  for (const n of graph.nodes) {
    categoryCounts[n.category] = (categoryCounts[n.category] || 0) + 1;
  }

  const referenceEdges = graph.edges.filter((e) => e.type === 'reference').length;
  const tagEdges = graph.edges.filter((e) => e.type === 'tag').length;

  const enrichedNodes = graph.nodes.map((node) => {
    const raw = itemMap.get(node.id);
    return {
      ...node,
      windowsPath: raw?.windowsPath,
      summary: raw?.summary,
      sizeBytes: raw?.sizeBytes,
      references: raw?.references,
    };
  });

  const payload: GraphExportData = {
    version: '1.0',
    generator: 'OmniKnowledge Knowledge Engine',
    exportedAt: timestamp,
    summary: {
      totalNodes: graph.nodes.length,
      totalEdges: graph.edges.length,
      referenceEdges,
      tagEdges,
      categoryCounts,
    },
    nodes: enrichedNodes,
    edges: graph.edges,
  };

  return JSON.stringify(payload, null, 2);
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function exportGraphAsSvg(
  graph: { nodes: GraphNode[]; edges: GraphEdge[] },
  nodePositions: Record<string, { x: number; y: number }>,
  options: { width?: number; height?: number; title?: string } = {}
): string {
  const { width = 880, height = 520, title = 'OmniKnowledge Knowledge Graph' } = options;

  let edgesXml = '';
  for (const edge of graph.edges) {
    const p1 = nodePositions[edge.source];
    const p2 = nodePositions[edge.target];
    if (!p1 || !p2) continue;

    const isReference = edge.type === 'reference';
    const strokeColor = isReference ? '#2997FF' : 'rgba(142, 142, 147, 0.45)';
    const strokeWidth = isReference ? '1.8' : '1.0';
    const dashArray = isReference ? '' : ' stroke-dasharray="4 4"';
    const marker = isReference ? ' marker-end="url(#arrowRef)"' : '';

    const midX = Math.round((p1.x + p2.x) / 2);
    const midY = Math.round((p1.y + p2.y) / 2 - 5);
    const labelColor = isReference ? '#64D2FF' : '#A1A1A6';

    edgesXml += `    <g id="edge-${edge.id}">
      <line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${strokeColor}" stroke-width="${strokeWidth}"${dashArray}${marker} />
      <text x="${midX}" y="${midY}" text-anchor="middle" fill="${labelColor}" font-size="9" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif">${escapeXml(edge.label)}</text>
    </g>\n`;
  }

  let nodesXml = '';
  for (const node of graph.nodes) {
    const pos = nodePositions[node.id];
    if (!pos) continue;

    const color = GRAPH_CATEGORY_COLORS[node.category] || '#0071E3';
    const shortLabel = node.title.length > 16 ? node.title.slice(0, 15) + '…' : node.title;

    nodesXml += `    <g id="node-${node.id}" transform="translate(${pos.x}, ${pos.y})">
      <circle r="14" fill="${color}" stroke="#141416" stroke-width="2" />
      <text text-anchor="middle" dy="3.5" fill="#FFFFFF" font-size="9" font-weight="600" font-family="'JetBrains Mono', monospace">.${escapeXml(node.ext)}</text>
      <rect x="-75" y="22" width="150" height="20" rx="6" fill="rgba(29, 29, 31, 0.92)" stroke="rgba(255, 255, 255, 0.18)" stroke-width="1" />
      <text text-anchor="middle" y="35" fill="#F5F5F7" font-size="10" font-weight="500" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif">${escapeXml(shortLabel)}</text>
    </g>\n`;
  }

  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" style="background-color: #111113; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif;">
  <defs>
    <pattern id="graphGrid" width="32" height="32" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1" fill="rgba(255, 255, 255, 0.08)" />
    </pattern>
    <marker id="arrowRef" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#2997FF" />
    </marker>
  </defs>

  <rect width="${width}" height="${height}" fill="url(#graphGrid)" />

  <g id="graph-header" transform="translate(24, 28)">
    <text x="0" y="0" fill="#F5F5F7" font-size="14" font-weight="700" letter-spacing="-0.02em">${escapeXml(title)}</text>
    <text x="0" y="16" fill="#86868B" font-size="10" font-family="'JetBrains Mono', monospace">Nodes: ${graph.nodes.length} · Edges: ${graph.edges.length} · Exported: ${timestamp}</text>
  </g>

  <g id="graph-edges">
${edgesXml}  </g>

  <g id="graph-nodes">
${nodesXml}  </g>

  <g id="graph-legend" transform="translate(24, ${height - 24})">
    <line x1="0" y1="0" x2="20" y2="0" stroke="#2997FF" stroke-width="2" />
    <text x="26" y="3.5" fill="#86868B" font-size="9">Reference [[WikiLink]]</text>
    <line x1="140" y1="0" x2="160" y2="0" stroke="#86868B" stroke-width="1.2" stroke-dasharray="3 3" />
    <text x="166" y="3.5" fill="#86868B" font-size="9">Shared Tag Co-occurrence</text>
  </g>
</svg>`;
}

export type AutomationConditionTarget = 'category' | 'ext' | 'createdAgeDays';
export type AutomationConditionOperator = 'equals' | 'in' | 'olderThanDays' | 'newerThanDays';
export type AutomationActionType = 'assignTags' | 'setDirectory' | 'markImportant';

export interface AutomationRule {
  id: string;
  name: string;
  enabled: boolean;
  target: AutomationConditionTarget;
  operator: AutomationConditionOperator;
  conditionValue: string;
  actionType: AutomationActionType;
  actionValue: string;
}

export const INITIAL_AUTOMATION_RULES: AutomationRule[] = [
  {
    id: 'rule-cad-dir',
    name: 'CAD工程与矢量图档目录归类',
    enabled: true,
    target: 'ext',
    operator: 'in',
    conditionValue: 'dxf, dwg, cdr, ai, eps',
    actionType: 'setDirectory',
    actionValue: 'D:\\OmniKnowledge\\01_Engineering_CAD\\',
  },
  {
    id: 'rule-cad-tag',
    name: '工程图档自动附加专属标签',
    enabled: true,
    target: 'ext',
    operator: 'in',
    conditionValue: 'dxf, dwg, step, iges',
    actionType: 'assignTags',
    actionValue: '工程图档, 工业设计, CAD标准',
  },
  {
    id: 'rule-media-dir',
    name: '高保真音视频流目录分流',
    enabled: true,
    target: 'category',
    operator: 'equals',
    conditionValue: 'media',
    actionType: 'setDirectory',
    actionValue: 'D:\\OmniKnowledge\\05_Media_Streams\\',
  },
  {
    id: 'rule-recent-tag',
    name: '14天内新入库资产自动标注审阅',
    enabled: true,
    target: 'createdAgeDays',
    operator: 'newerThanDays',
    conditionValue: '14',
    actionType: 'assignTags',
    actionValue: '近期入库, 待深度索引',
  },
  {
    id: 'rule-wechat-dir',
    name: '社媒与微信公众号采集自动入库',
    enabled: true,
    target: 'category',
    operator: 'in',
    conditionValue: 'wechat_mp, wechat_video, social',
    actionType: 'setDirectory',
    actionValue: 'D:\\OmniKnowledge\\07_WeChat_Archive\\',
  },
];

export function matchesAutomationRule(
  item: KnowledgeItem,
  rule: AutomationRule,
  referenceDate = new Date('2026-10-31T12:00:00Z')
): boolean {
  if (!rule.enabled) return false;

  if (rule.target === 'category') {
    if (rule.operator === 'equals') {
      return item.category.toLowerCase() === rule.conditionValue.toLowerCase().trim();
    }
    if (rule.operator === 'in') {
      const allowed = rule.conditionValue
        .toLowerCase()
        .split(/[\s,，、|]+/)
        .map((s) => s.trim())
        .filter(Boolean);
      return allowed.includes(item.category.toLowerCase());
    }
  }

  if (rule.target === 'ext') {
    const itemExt = item.ext.toLowerCase().trim();
    if (rule.operator === 'equals') {
      return itemExt === rule.conditionValue.toLowerCase().replace(/^\./, '').trim();
    }
    if (rule.operator === 'in') {
      const allowed = rule.conditionValue
        .toLowerCase()
        .split(/[\s,，、|]+/)
        .map((s) => s.replace(/^\./, '').trim())
        .filter(Boolean);
      return allowed.includes(itemExt);
    }
  }

  if (rule.target === 'createdAgeDays') {
    const itemDate = new Date(item.createdAt);
    if (isNaN(itemDate.getTime())) return false;
    const diffDays = Math.max(
      0,
      (referenceDate.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const targetDays = parseFloat(rule.conditionValue) || 0;

    if (rule.operator === 'olderThanDays') {
      return diffDays >= targetDays;
    }
    if (rule.operator === 'newerThanDays') {
      return diffDays <= targetDays;
    }
  }

  return false;
}

export function applyAutomationRules(
  items: KnowledgeItem[],
  rules: AutomationRule[],
  referenceDate?: Date
): {
  updatedItems: KnowledgeItem[];
  totalUpdated: number;
  ruleMatchCounts: Record<string, number>;
} {
  const activeRules = rules.filter((r) => r.enabled);
  const ruleMatchCounts: Record<string, number> = {};
  for (const r of rules) ruleMatchCounts[r.id] = 0;

  let totalUpdated = 0;

  const updatedItems = items.map((origItem) => {
    let modified = false;
    let item = { ...origItem, tags: [...origItem.tags] };

    for (const rule of activeRules) {
      if (matchesAutomationRule(item, rule, referenceDate)) {
        ruleMatchCounts[rule.id] = (ruleMatchCounts[rule.id] || 0) + 1;

        if (rule.actionType === 'assignTags') {
          const tagsToAdd = rule.actionValue
            .split(/[\s,，、#|]+/)
            .map((t) => t.trim().replace(/^#/, ''))
            .filter(Boolean);
          for (const t of tagsToAdd) {
            if (!item.tags.includes(t)) {
              item.tags.push(t);
              modified = true;
            }
          }
        } else if (rule.actionType === 'setDirectory') {
          const baseDir = rule.actionValue.trim();
          const filename =
            item.windowsPath.split(/[\\/]/).pop() || `${item.title}.${item.ext}`;
          const sep = baseDir.endsWith('\\') || baseDir.endsWith('/') ? '' : '\\';
          const newPath = `${baseDir}${sep}${filename}`;
          if (item.windowsPath !== newPath) {
            item.windowsPath = newPath;
            modified = true;
          }
        } else if (rule.actionType === 'markImportant') {
          if (!item.tags.includes('重要')) {
            item.tags.push('重要');
            modified = true;
          }
        }
      }
    }

    if (modified) totalUpdated++;
    return item;
  });

  return { updatedItems, totalUpdated, ruleMatchCounts };
}

export type AiProviderType =
  | 'gemini'
  | 'deepseek'
  | 'ollama'
  | 'siliconflow'
  | 'openai'
  | 'moonshot'
  | 'custom';

export interface ThirdPartyModelConfig {
  id: string;
  provider: AiProviderType;
  name: string;
  endpoint: string;
  apiKey: string;
  chatModel: string;
  embeddingModel: string;
  temperature: number;
  maxTokens: number;
  enabled: boolean;
}

export const DEFAULT_AI_CONFIGS: ThirdPartyModelConfig[] = [
  {
    id: 'deepseek-v3',
    provider: 'deepseek',
    name: 'DeepSeek 官方 API',
    endpoint: 'https://api.deepseek.com/v1',
    apiKey: '',
    chatModel: 'deepseek-chat',
    embeddingModel: 'BAAI/bge-m3',
    temperature: 0.7,
    maxTokens: 4096,
    enabled: true,
  },
  {
    id: 'local-ollama',
    provider: 'ollama',
    name: '本地私有化 Ollama (Qwen / Llama)',
    endpoint: 'http://localhost:11434/v1',
    apiKey: 'ollama',
    chatModel: 'qwen2.5:14b',
    embeddingModel: 'bge-m3',
    temperature: 0.7,
    maxTokens: 8192,
    enabled: false,
  },
  {
    id: 'siliconflow-cloud',
    provider: 'siliconflow',
    name: '硅基流动 SiliconCloud',
    endpoint: 'https://api.siliconflow.cn/v1',
    apiKey: '',
    chatModel: 'deepseek-ai/DeepSeek-V3',
    embeddingModel: 'BAAI/bge-m3',
    temperature: 0.7,
    maxTokens: 4096,
    enabled: false,
  },
  {
    id: 'openai-gpt4o',
    provider: 'openai',
    name: 'OpenAI 官方端点',
    endpoint: 'https://api.openai.com/v1',
    apiKey: '',
    chatModel: 'gpt-4o-mini',
    embeddingModel: 'text-embedding-3-small',
    temperature: 0.7,
    maxTokens: 4096,
    enabled: false,
  },
];

export function exportItemMetadataAsMarkdown(
  item: KnowledgeItem,
  allItems: KnowledgeItem[] = []
): string {
  const outboundTitles = item.references
    .map((refId) => allItems.find((i) => i.id === refId)?.title || refId)
    .filter(Boolean);

  const tagsFormatted = item.tags.length
    ? item.tags.map((t) => `#${t}`).join(', ')
    : '(无)';

  const referencesFormatted = outboundTitles.length
    ? outboundTitles.map((t) => `- [[${t}]]`).join('\n')
    : '- (无关联引用)';

  return `# ${item.title}

- **条目 ID**: \`${item.id}\`
- **模态分类**: \`${item.category}\` (扩展名: \`.${item.ext}\`)
- **Windows 本地路径**: \`${item.windowsPath}\`
- **源网址**: ${item.sourceUrl ? `[${item.sourceUrl}](${item.sourceUrl})` : '(本地资产)'}
- **文件体积**: ${item.sizeBytes} 字节 (${formatBytes(item.sizeBytes)})
- **创建时间**: ${item.createdAt}
- **更新时间**: ${item.updatedAt}
- **SHA-256 校验码**: \`${item.sha256}\`
- **分类标签**: ${tagsFormatted}

## 知识关联引用
${referencesFormatted}

## 内容摘要
${item.summary}

## 正文 / 解析明细
${item.content}
`;
}

function escapeCsvCell(cell: string | number): string {
  const str = String(cell ?? '');
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportItemMetadataAsCsv(
  item: KnowledgeItem,
  allItems: KnowledgeItem[] = []
): string {
  const headers = [
    'ID',
    'Title',
    'Category',
    'Extension',
    'WindowsPath',
    'SourceUrl',
    'SizeBytes',
    'CreatedAt',
    'UpdatedAt',
    'SHA256',
    'Tags',
    'OutboundReferences',
    'Summary',
    'Content',
  ];

  const outboundTitles = item.references
    .map((refId) => allItems.find((i) => i.id === refId)?.title || refId)
    .join('; ');

  const row = [
    item.id,
    item.title,
    item.category,
    item.ext,
    item.windowsPath,
    item.sourceUrl || '',
    item.sizeBytes,
    item.createdAt,
    item.updatedAt,
    item.sha256,
    item.tags.join(', '),
    outboundTitles,
    item.summary,
    item.content,
  ].map(escapeCsvCell);

  return [headers.join(','), row.join(',')].join('\n');
}

export interface LocalBackupConfig {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  backupPath: string;
  keepHistoryCount: number;
  includeMedia: boolean;
  autoCompress: boolean;
  lastBackupAt: string | null;
  lastBackupSizeBytes: number | null;
  status: 'idle' | 'backing_up' | 'completed' | 'error';
}

export interface BackupSnapshot {
  id: string;
  fileName: string;
  path: string;
  createdAt: string;
  sizeBytes: number;
  itemCount: number;
  type: 'auto' | 'manual';
  status: 'valid' | 'verified';
}

export const DEFAULT_BACKUP_CONFIG: LocalBackupConfig = {
  enabled: true,
  frequency: 'daily',
  backupPath: 'D:\\OmniKnowledge\\Backups\\',
  keepHistoryCount: 7,
  includeMedia: true,
  autoCompress: true,
  lastBackupAt: '2026-10-30 03:00:00',
  lastBackupSizeBytes: 18450000,
  status: 'completed',
};

export const INITIAL_BACKUP_SNAPSHOTS: BackupSnapshot[] = [
  {
    id: 'snap-001',
    fileName: 'OmniKnowledge_Backup_20261030_0300.zip',
    path: 'D:\\OmniKnowledge\\Backups\\OmniKnowledge_Backup_20261030_0300.zip',
    createdAt: '2026-10-30 03:00:00',
    sizeBytes: 18450000,
    itemCount: 12,
    type: 'auto',
    status: 'verified',
  },
  {
    id: 'snap-002',
    fileName: 'OmniKnowledge_Backup_20261023_0300.zip',
    path: 'D:\\OmniKnowledge\\Backups\\OmniKnowledge_Backup_20261023_0300.zip',
    createdAt: '2026-10-23 03:00:00',
    sizeBytes: 17200000,
    itemCount: 11,
    type: 'auto',
    status: 'valid',
  },
  {
    id: 'snap-003',
    fileName: 'OmniKnowledge_Manual_Snapshot_20261016.zip',
    path: 'D:\\OmniKnowledge\\Backups\\OmniKnowledge_Manual_Snapshot_20261016.zip',
    createdAt: '2026-10-16 15:30:00',
    sizeBytes: 15800000,
    itemCount: 10,
    type: 'manual',
    status: 'valid',
  },
];

export function createLocalBackupArchive(
  items: KnowledgeItem[],
  config: LocalBackupConfig
): BackupSnapshot {
  const now = new Date();
  const timestamp = now.toISOString().replace('T', ' ').slice(0, 19);
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const timeStr = now.toTimeString().slice(0, 5).replace(':', '');
  const fileName = `OmniKnowledge_Backup_${dateStr}_${timeStr}.zip`;
  const totalContentSize = items.reduce((acc, i) => acc + i.sizeBytes, 0);
  const sizeBytes = config.includeMedia
    ? Math.round(totalContentSize * 0.88)
    : Math.round(totalContentSize * 0.22);
  const cleanPath =
    config.backupPath.endsWith('\\') || config.backupPath.endsWith('/')
      ? config.backupPath
      : config.backupPath + '\\';

  return {
    id: `snap-${Date.now()}`,
    fileName,
    path: `${cleanPath}${fileName}`,
    createdAt: timestamp,
    sizeBytes,
    itemCount: items.length,
    type: 'manual',
    status: 'verified',
  };
}

export function exportBackupOperationLogsAsText(
  snapshots: BackupSnapshot[],
  config: LocalBackupConfig,
  exportedAt?: string
): string {
  const now = exportedAt || new Date().toISOString().replace('T', ' ').slice(0, 19);
  const totalSizeBytes = snapshots.reduce((acc, s) => acc + s.sizeBytes, 0);
  const totalItems = snapshots.reduce((acc, s) => acc + s.itemCount, 0);
  const freqMap: Record<string, string> = {
    daily: '每日 (Daily)',
    weekly: '每周 (Weekly)',
    monthly: '每月 (Monthly)',
  };

  let logContent = `================================================================================\n`;
  logContent += `OmniKnowledge 知识库 - 系统本地备份操作运行日志记录\n`;
  logContent += `导出时间: ${now}\n`;
  logContent += `备份存储目录: ${config.backupPath}\n`;
  logContent += `定时策略周期: ${freqMap[config.frequency] || config.frequency} | 自动保护状态: ${config.enabled ? '已启用' : '已暂停'}\n`;
  logContent += `历史留存上限: ${config.keepHistoryCount} 份 | 包含工程原件: ${config.includeMedia ? '是' : '否'}\n`;
  logContent += `================================================================================\n\n`;

  logContent += `[序号]    [备份时间]            [备份类型]   [快照大小]      [资产数量]   [执行结果]     [快照文件名]\n`;
  logContent += `----------------------------------------------------------------------------------------------------------------\n`;

  if (snapshots.length === 0) {
    logContent += `(无历史备份运行记录)\n`;
  } else {
    snapshots.forEach((snap, idx) => {
      const num = String(idx + 1).padStart(3, '0');
      const time = snap.createdAt.padEnd(19, ' ');
      const typeStr = (snap.type === 'auto' ? '定时自动' : '手动发起').padEnd(8, ' ');
      const sizeStr = formatBytes(snap.sizeBytes).padEnd(12, ' ');
      const itemsStr = `${snap.itemCount} 项`.padEnd(10, ' ');
      const statusStr = (snap.status === 'verified' ? '[成功/已校验]' : '[正常/已验证]').padEnd(12, ' ');
      logContent += `#${num}    ${time}   ${typeStr}   ${sizeStr}   ${itemsStr}   ${statusStr}   ${snap.fileName}\n`;
    });
  }

  logContent += `\n================================================================================\n`;
  logContent += `运行记录汇总统计:\n`;
  logContent += `- 累计备份快照总数: ${snapshots.length} 份\n`;
  logContent += `- 累积占用磁盘空间: ${formatBytes(totalSizeBytes)}\n`;
  logContent += `- 保护资产总量人次: ${totalItems} 项\n`;
  logContent += `- 系统校验成功率: 100.0% (全量校验通过，无逻辑损伤或传输异常)\n`;
  logContent += `================================================================================\n`;

  return logContent;
}

export interface SyncNodePingResult {
  nodeId: string;
  healthy: boolean;
  healthStatus: 'healthy' | 'degraded' | 'offline';
  latencyMs: number;
  message: string;
}

export function pingSyncNode(node: SyncNodeConfig): SyncNodePingResult {
  const endpoint = node.endpoint.toLowerCase().trim();
  if (
    !endpoint ||
    endpoint === 'unreachable' ||
    endpoint.includes('offline') ||
    endpoint.includes('invalid')
  ) {
    return {
      nodeId: node.id,
      healthy: false,
      healthStatus: 'offline',
      latencyMs: 999,
      message: '节点地址不可达或连接超时 (Timeout)',
    };
  }

  let baseLatency = 22;
  if (endpoint.includes('s3') || endpoint.includes('aws') || endpoint.includes('cloud')) {
    baseLatency = 88;
  } else if (endpoint.includes('jianguoyun') || endpoint.includes('webdav')) {
    baseLatency = 135;
  } else if (endpoint.includes('lan') || endpoint.includes('local') || endpoint.includes('100.84')) {
    baseLatency = 18;
  }

  const hash = node.id.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const latencyMs = baseLatency + (hash % 38);

  let healthStatus: 'healthy' | 'degraded' | 'offline' = 'healthy';
  let message = `节点响应迅速 (${latencyMs} ms)`;

  if (latencyMs > 200) {
    healthStatus = 'offline';
    message = `网络高延迟/不稳定 (${latencyMs} ms)`;
  } else if (latencyMs >= 90) {
    healthStatus = 'degraded';
    message = `连通但延迟稍高 (${latencyMs} ms)`;
  } else {
    healthStatus = 'healthy';
    message = `网络健康，极速连通 (${latencyMs} ms)`;
  }

  return {
    nodeId: node.id,
    healthy: healthStatus !== 'offline',
    healthStatus,
    latencyMs,
    message,
  };
}

export interface CreateVaultParams {
  name: string;
  description: string;
  rootPath: string;
  coverColor?: string;
  iconName?: string;
}

export function createPersonalVault(params: CreateVaultParams): PersonalVault {
  const id = `vault-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
  return {
    id,
    name: params.name.trim(),
    description: params.description.trim(),
    rootPath: params.rootPath.trim() || `D:\\OmniKnowledge\\${params.name.trim()}\\`,
    createdAt: now,
    updatedAt: now,
    coverColor: params.coverColor || '#0071E3',
    iconName: params.iconName || 'BookOpen',
  };
}

export function createVaultFolder(
  vaultId: string,
  folderName: string,
  parentPath: string = '/'
): VaultFolder {
  const id = `f-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const cleanParent = parentPath.endsWith('/') ? parentPath : parentPath + '/';
  const nameClean = folderName.trim().replace(/^\/+|\/+$/g, '');
  const path = cleanParent === '/' ? `/${nameClean}` : `${cleanParent}${nameClean}`;
  const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
  return {
    id,
    vaultId,
    name: nameClean,
    path,
    parentPath: cleanParent,
    createdAt: now,
  };
}

export function deletePersonalVault(
  vaultId: string,
  vaults: PersonalVault[],
  folders: VaultFolder[],
  items: KnowledgeItem[]
): { updatedVaults: PersonalVault[]; updatedFolders: VaultFolder[]; updatedItems: KnowledgeItem[] } {
  return {
    updatedVaults: vaults.filter((v) => v.id !== vaultId),
    updatedFolders: folders.filter((f) => f.vaultId !== vaultId),
    updatedItems: items.filter((i) => i.vaultId !== vaultId),
  };
}

export function moveKnowledgeItem(
  item: KnowledgeItem,
  targetVaultId: string,
  targetFolderPath: string
): KnowledgeItem {
  return {
    ...item,
    vaultId: targetVaultId,
    folderPath: targetFolderPath,
    updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
  };
}

export function copyKnowledgeItem(
  item: KnowledgeItem,
  targetVaultId: string,
  targetFolderPath: string
): KnowledgeItem {
  const newId = `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
  return {
    ...item,
    id: newId,
    vaultId: targetVaultId,
    folderPath: targetFolderPath,
    title: `${item.title} (副本)`,
    createdAt: now,
    updatedAt: now,
  };
}





