import {
  KnowledgeItem,
  SyncNodeConfig,
  PersonalVault,
  VaultFolder,
  computeEmbedding,
} from '../utils/knowledgeEngine';

export const INITIAL_PERSONAL_VAULTS: PersonalVault[] = [
  {
    id: 'vault-engineering',
    name: '个人工程与CAD设计库',
    description: '存放 AutoCAD DXF 图纸、Photoshop PSD 视觉母版与索尼/哈苏 RAW 传感器原片资产',
    rootPath: 'D:\\OmniKnowledge\\01_Engineering_CAD\\',
    createdAt: '2026-10-18 09:00',
    updatedAt: '2026-10-31 03:00',
    coverColor: '#0071E3',
    iconName: 'Compass',
  },
  {
    id: 'vault-research',
    name: '科研架构与技术白皮书库',
    description: '存放系统架构 PDF 电子书、CSV 基准测试集与 Python 多模态解析核心脚本',
    rootPath: 'D:\\OmniKnowledge\\04_Architecture_Docs\\',
    createdAt: '2026-10-20 10:00',
    updatedAt: '2026-10-31 02:40',
    coverColor: '#5856D6',
    iconName: 'BookOpen',
  },
  {
    id: 'vault-media',
    name: '全格式音视频与社媒采集库',
    description: '存放 MKV 4K 研讨会视频、FLAC 96kHz 声学母带及微信公众号/视频号防抖抓取快照',
    rootPath: 'D:\\OmniKnowledge\\05_Media_Streams\\',
    createdAt: '2026-10-24 19:00',
    updatedAt: '2026-10-30 22:00',
    coverColor: '#AF52DE',
    iconName: 'Film',
  },
  {
    id: 'vault-general',
    name: '个人日常笔记与卡片盒',
    description: '存放双向链接卡片盒笔记、网页快照及跨平台高赞帖文离线剪藏',
    rootPath: 'D:\\OmniKnowledge\\Notes\\',
    createdAt: '2026-10-25 12:00',
    updatedAt: '2026-10-31 04:00',
    coverColor: '#34C759',
    iconName: 'FileText',
  },
];

export const INITIAL_VAULT_FOLDERS: VaultFolder[] = [
  { id: 'f-eng-1', vaultId: 'vault-engineering', path: '/01_Engineering_CAD', name: '01_Engineering_CAD', parentPath: '/', createdAt: '2026-10-18 09:00' },
  { id: 'f-eng-2', vaultId: 'vault-engineering', path: '/02_Design_Assets', name: '02_Design_Assets', parentPath: '/', createdAt: '2026-10-19 10:00' },
  { id: 'f-eng-3', vaultId: 'vault-engineering', path: '/03_Photography_RAW', name: '03_Photography_RAW', parentPath: '/', createdAt: '2026-10-20 11:00' },

  { id: 'f-res-1', vaultId: 'vault-research', path: '/04_Architecture_Docs', name: '04_Architecture_Docs', parentPath: '/', createdAt: '2026-10-20 10:00' },
  { id: 'f-res-2', vaultId: 'vault-research', path: '/06_Core_Scripts', name: '06_Core_Scripts', parentPath: '/', createdAt: '2026-10-21 12:00' },

  { id: 'f-med-1', vaultId: 'vault-media', path: '/05_Media_Streams', name: '05_Media_Streams', parentPath: '/', createdAt: '2026-10-24 19:00' },
  { id: 'f-med-2', vaultId: 'vault-media', path: '/07_WeChat_Archive', name: '07_WeChat_Archive', parentPath: '/', createdAt: '2026-10-28 20:00' },
  { id: 'f-med-3', vaultId: 'vault-media', path: '/08_Social_Feeds', name: '08_Social_Feeds', parentPath: '/', createdAt: '2026-10-27 13:00' },
];

const rawItems: Omit<KnowledgeItem, 'embedding'>[] = [
  {
    id: 'kb-img-dxf',
    vaultId: 'vault-engineering',
    folderPath: '/01_Engineering_CAD',
    title: '模块化钢结构实验舱主桁架节点总成.dxf',
    category: 'image',
    ext: 'dxf',
    windowsPath: 'D:\\OmniKnowledge\\01_Engineering_CAD\\modular_truss_assembly_v4.dxf',
    sizeBytes: 14820400,
    createdAt: '2026-10-18 09:42',
    updatedAt: '2026-10-30 16:15',
    sha256: '8f9d2a7c4b1e083f91a2c4d6e8f012349a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d',
    tags: ['AutoCAD', '结构工程', 'DXF矢量', '硬件设计'],
    references: ['kb-doc-pdf', 'kb-img-psd', 'kb-code-py'],
    summary: 'AutoCAD 2024 DXF 矢量交换图档，包含主承重桁架、阻尼减震底座、标注尺寸及 BOM 块属性，已通过 ezdxf 提取 6 个图层与 1,420 个几何实体索引。',
    content: `文件标识: AutoCAD DXF (AC1032 / 2024)
单位系统: 毫米 (mm) · 比例 1:25
包含图层:
1. 01_PRIMARY_TRUSS (主桁架箱型梁, 材质 Q355B)
2. 02_JOINT_GUSSET (高强螺栓连接节点板 M24-10.9S)
3. 03_ISOLATION_BASE (氟橡胶隔振支座定位网格)
4. 04_DIM_ANNOTATION (公差与标高尺寸标注)
5. 05_ELECTRICAL_CONDUIT (传感器走线桥架预留孔)

关联文档: 参见 [[Windows 本地全格式知识库架构与解析白皮书.pdf]] 以及工业外观视觉稿 [[桌面级硬件控制台分层视觉母版.psd]]。`,
    metadata: {
      resolution: 'Vector Infinite (4200 × 2970 mm A0)',
      colorSpace: 'ACI AutoCAD Color Index (256-Color Vector)',
      layers: [
        '01_PRIMARY_TRUSS (主承重桁架)',
        '02_JOINT_GUSSET (高强节点板)',
        '03_ISOLATION_BASE (隔振底座)',
        '04_DIM_ANNOTATION (尺寸标注层)',
        '05_ELECTRICAL_CONDUIT (线缆管路)',
      ],
    },
  },
  {
    id: 'kb-img-psd',
    vaultId: 'vault-engineering',
    folderPath: '/02_Design_Assets',
    title: '桌面级硬件控制台分层视觉母版.psd',
    category: 'image',
    ext: 'psd',
    windowsPath: 'D:\\OmniKnowledge\\02_Design_Assets\\console_industrial_master.psd',
    sizeBytes: 186400200,
    createdAt: '2026-10-19 14:20',
    updatedAt: '2026-10-30 18:05',
    sha256: '3c4e5f6a7b8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f',
    tags: ['Photoshop', '工业设计', '图层母版', 'CDR联动'],
    references: ['kb-img-dxf', 'kb-img-raw'],
    summary: '16-bit Adobe RGB 多图层 PSD 设计源文件，包含阳极氧化铝面板纹理、OLED 仪表区智能对象、丝印标识矢量蒙版（同步导出 CDR/AI 刀模线）。',
    content: `通过 psd-tools 自动解构的 PSD 图层树与内嵌文字 OCR 索引：
- 智能对象组 [OLED_TELEMETRY_HUD]: 字号 12pt JetBrains Mono, 采样率状态指示
- 材质纹理层 [ANODIZED_ALUMINUM_BRUSH]: 4K 无缝法线贴图与柔光混合
- 丝印矢量层 [SILKSCREEN_LABELS_CDR]: 已同步导出 CorelDRAW (.cdr) 激光雕刻路径与 EPS 印刷分色版
- 色彩配置文件: Adobe RGB (1998) / 16 Bits/Channel`,
    metadata: {
      resolution: '5120 × 2880 px (5K Studio)',
      colorSpace: 'Adobe RGB (1998) · 16-bit Channel',
      cameraModel: 'Photoshop 2026 Smart Compositor',
      layers: [
        'SILKSCREEN_LABELS_CDR (矢量丝印路径)',
        'OLED_TELEMETRY_HUD (仪表盘智能对象)',
        'KNOB_SHADOW_OCCLUSION (环境光遮蔽)',
        'ANODIZED_ALUMINUM_BRUSH (拉丝铝基底)',
        'CHASSIS_BLUEPRINT_REF (DXF底图对齐层)',
      ],
    },
  },
  {
    id: 'kb-img-raw',
    vaultId: 'vault-engineering',
    folderPath: '/03_Photography_RAW',
    title: '横断山脉贡嘎雪山黎明航拍传感器原片.raw',
    category: 'image',
    ext: 'raw',
    windowsPath: 'D:\\OmniKnowledge\\03_Photography_RAW\\DSC09482_Gongga_Dawn.raw',
    sizeBytes: 64250880,
    createdAt: '2026-10-12 06:18',
    updatedAt: '2026-10-25 11:30',
    sha256: '7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b',
    tags: ['RAW原片', 'EXIF元数据', '风光摄影', '色彩管理'],
    references: ['kb-img-psd'],
    summary: '14-bit 无损压缩索尼/哈苏相机 RAW 传感器原始数据，附带完整 EXIF GPS 高程坐标、快门光圈参数与内嵌 4K AVIF/TIFF 预览金字塔。',
    content: `LibRaw + ExifTool 自动提取光学与地理元数据：
拍摄地点: 四川省甘孜州贡嘎山主峰西坡 (29°35'44"N, 101°52'40"E, 海拔 4,680m)
镜头参数: FE 24-70mm F2.8 GM II @ 35mm, f/8.0, 1/125s, ISO 64
动态范围: 14.8 EV (Linear RAW Demosaic -> ProPhoto RGB TIFF)
伴生文件: 已自动生成高动态范围 AVIF 缩略图与 .exif 独立元数据侧车文件。`,
    metadata: {
      resolution: '9504 × 6336 px (60.2 MP)',
      colorSpace: '14-bit Bayer RGGB RAW (ProPhoto RGB)',
      cameraModel: 'ILCE-7RM5 + FE 24-70mm F2.8 GM II · f/8 · 1/125s · ISO 64',
      layers: ['RAW Bayer Sensor Data', 'Embedded Preview JPEG', 'EXIF & GPS Sidecar Stream'],
    },
  },
  {
    id: 'kb-doc-pdf',
    vaultId: 'vault-research',
    folderPath: '/04_Architecture_Docs',
    title: 'Windows 本地全格式知识库架构与解析白皮书.pdf',
    category: 'document',
    ext: 'pdf',
    windowsPath: 'D:\\OmniKnowledge\\04_Architecture_Docs\\OmniKnowledge_Windows_Architecture_2026.pdf',
    sizeBytes: 5420800,
    createdAt: '2026-10-20 10:00',
    updatedAt: '2026-10-31 02:40',
    sha256: '1f2e3d4c5b6a79880716253443526170899a0b1c2d3e4f5a6b7c8d9e0f1a2b3c',
    tags: ['系统架构', '本地向量检索', '多格式解码', 'Windows原生'],
    references: ['kb-code-py', 'kb-doc-csv', 'kb-wx-mp', 'kb-img-dxf'],
    summary: '详细阐述在 Windows 10/11 下通过 FastAPI + SQLite-vec + ImageMagick + FFmpeg + LibreOffice 实现 60+ 种图片、文档、音视频与社媒链接本地解析与向量检索的工程规范。',
    content: `## 1. 核心架构分层 (Windows Native Knowledge Engine)

OmniKnowledge 采用「本地内容寻址存储 (CAS) + 异构格式解码管线 + 本地混合向量检索引擎」三层架构：

### 1.1 全格式本地解码矩阵
- **工业与设计图像管线**: 针对 BMP, JPG, PNG, TIF, GIF, PCX, TGA, EXIF, FPX, SVG, PSD, CDR, PCD, DXF, UFO, EPS, AI, RAW, WMF, WebP, AVIF, APNG，统一由 \`ImageMagick 7 + LibRaw + psd-tools + ezdxf + libcdr\` 提取分层图层、EXIF 相机参数与 RapidOCR 画面文字。
- **文档与结构化文本管线**: 针对 DOCX, PDF, HTML, XML, Markdown, RTF, TXT, CSV，采用 \`PyMuPDF (fitz) + python-docx + DuckDB\` 保留章节标题层级与表格行列语义。
- **全格式音视频流管线**: 针对 WAV, FLAC, MP3, AAC, OGG/Opus, MP4, MKV, MOV, AVI, WebM, FLV, VOB, M2TS, MPG, MPEG, TS, RM, RMVB, WMV, ASF，调用 \`FFmpeg 7.1 Hardware NVDEC\` 抽帧并结合 \`Faster-Whisper (CTranslate2 INT8)\` 生成带毫秒级时间戳的全文语音转写索引。

### 1.2 本地向量化混合搜索 (Hybrid Vector + BM25)
使用本地 ONNX Runtime 运行 \`BAAI/bge-m3\` (1024维稠密向量 + 稀疏词权)，持久化于单文件 \`SQLite-vec\` 与 \`FTS5\` 倒排索引中，无需联网即可完成跨模态语义召回。`,
    metadata: {
      authorOrAccount: 'OmniKnowledge 核心系统架构组',
      publishDate: '2026-10-31',
      lineCount: 428,
    },
  },
  {
    id: 'kb-doc-csv',
    vaultId: 'vault-research',
    folderPath: '/04_Architecture_Docs',
    title: '62种异构文件格式本地解码吞吐量与向量化基准测试.csv',
    category: 'document',
    ext: 'csv',
    windowsPath: 'D:\\OmniKnowledge\\04_Architecture_Docs\\format_benchmark_rtx4080.csv',
    sizeBytes: 48200,
    createdAt: '2026-10-26 15:12',
    updatedAt: '2026-10-30 20:00',
    sha256: '9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d',
    tags: ['基准测试', 'CSV数据集', '解码性能', '本地向量检索'],
    references: ['kb-doc-pdf', 'kb-code-py'],
    summary: '在 Windows 11 (Ryzen 9 7950X + RTX 4080 Super) 上对 PSD/CDR/DXF、PDF/DOCX、MKV/RMVB/FLAC 等格式的本地解析耗时与 BGE-M3 向量生成吞吐量实测数据表。',
    content: `格式类别,代表扩展名,本地解码器组件,平均解析耗时(ms),OCR/ASR速度,向量化吞吐(chunks/s),内存峰值(MB)
工程与设计图档,.psd / .cdr / .dxf / .ai,psd-tools + libcdr + ezdxf,142.5,RapidOCR 38ms/图,410.0,312.4
相机与传统位图,.raw / .tif / .fpx / .pcx / .avif,LibRaw + LibTIFF + ImageMagick,86.2,ExifTool 12ms/图,520.8,245.0
富文本与电子书,.pdf / .docx / .rtf / .html / .xml,PyMuPDF + python-docx + lxml,34.8,原生文本流免OCR,890.5,128.0
无损与压缩音频,.wav / .flac / .mp3 / .aac / .opus,FFmpeg + Faster-Whisper INT8,620.0,实时率 RTF 0.04x,380.2,640.0
高清与传统视频,.mp4 / .mkv / .m2ts / .rmvb / .vob,FFmpeg NVDEC + RV40 Demuxer,1180.4,关键帧 + 语音双轨,310.6,980.5
微信与社交平台,公众号 / 视频号 / 小红书 / B站,Playwright + Stream Decryptor,490.0,DOM快照 + 字幕提取,465.0,410.0`,
    metadata: {
      csvHeaders: ['格式类别', '代表扩展名', '本地解码器组件', '平均耗时(ms)', 'OCR/ASR特性', '向量吞吐(chunks/s)', '内存峰值(MB)'],
      csvRows: [
        ['工程与设计图档', '.psd / .cdr / .dxf / .ai', 'psd-tools + libcdr + ezdxf', '142.5', 'RapidOCR 38ms/图', '410.0', '312.4'],
        ['相机与传统位图', '.raw / .tif / .fpx / .pcx / .avif', 'LibRaw + LibTIFF + ImageMagick', '86.2', 'ExifTool 12ms/图', '520.8', '245.0'],
        ['富文本与办公文档', '.pdf / .docx / .rtf / .html / .xml', 'PyMuPDF + python-docx + lxml', '34.8', '原生文本流直提', '890.5', '128.0'],
        ['无损与压缩音频', '.wav / .flac / .mp3 / .aac / .opus', 'FFmpeg + Faster-Whisper INT8', '620.0', '实时率 RTF 0.04x', '380.2', '640.0'],
        ['高清与传统视频', '.mp4 / .mkv / .m2ts / .rmvb / .vob', 'FFmpeg NVDEC + RV40 Demuxer', '1180.4', '关键帧+语音双轨', '310.6', '980.5'],
        ['微信与社媒链接', '公众号 / 视频号 / 小红书 / B站', 'Playwright + Stream Decryptor', '490.0', 'DOM去噪+字幕提取', '465.0', '410.0'],
      ],
    },
  },
  {
    id: 'kb-media-mkv',
    vaultId: 'vault-media',
    folderPath: '/05_Media_Streams',
    title: '2026 本地个人知识库与多模态 RAG 系统架构研讨会.mkv',
    category: 'media',
    ext: 'mkv',
    windowsPath: 'D:\\OmniKnowledge\\05_Media_Streams\\local_rag_symposium_4k.mkv',
    sizeBytes: 842500600,
    createdAt: '2026-10-24 19:30',
    updatedAt: '2026-10-29 10:15',
    sha256: '4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c',
    tags: ['MKV多轨视频', 'Whisper转写', '本地向量检索', '知识图谱'],
    references: ['kb-doc-pdf', 'kb-media-flac', 'kb-wx-video'],
    summary: 'Matroska (MKV) 4K HEVC 视频流（内封 FLAC 24-bit 音轨与中英双语 ASS 字幕），已完成 FFmpeg 关键帧幻灯片切分与 Faster-Whisper 时间轴文本对齐。',
    content: `容器格式: Matroska (MKV) · 同时兼容 MP4/MOV/AVI/M2TS/RMVB/VOB 解码管线
视频流 #0: HEVC (H.265) Main 10 @ L5.1, 3840×2160, 60.00 fps, 18.4 Mbps
音频流 #1: FLAC (24-bit / 48 kHz Stereo Lossless)
语音转写全文摘要:
- [00:02:15] 为什么 Windows 本地知识库必须把 CAD (.dxf/.cdr) 和老旧视频 (.rmvb/.vob/.asf) 纳入统一内容寻址层？
- [00:14:40] 演示 SQLite-vec 在百万级分块下结合 HNSW 图索引实现 12ms 向量语义检索。
- [00:28:05] 演示通过 Tailscale P2P 与坚果云 WebDAV 实现端到端加密的异地增量同步。`,
    metadata: {
      durationSec: 2480,
      resolution: '3840 × 2160 (4K UHD 60fps)',
      videoCodec: 'HEVC / H.265 Main10 (NVDEC)',
      audioCodec: 'FLAC 24-bit / 48kHz Stereo',
      bitrate: '19.8 Mbps',
      transcriptSegments: [
        { time: '00:02:15', text: 'Windows 本地知识库的核心痛点在于格式碎片化：设计师有 PSD/CDR/AI，工程师有 DXF/RAW，影音资料有 MKV/RMVB/VOB/FLAC。' },
        { time: '00:09:32', text: '我们通过内容寻址存储 (SHA-256 CAS) 为任意格式建立唯一指纹，并用后台 Worker 自动提取文本、图层、EXIF 与语音转写。' },
        { time: '00:14:40', text: '在本地向量化搜索层，BGE-M3 模型将文本块编码为归一化稠密向量，配合双向交叉引用图谱实现联想式检索。' },
        { time: '00:28:05', text: '异地同步模块只传输新增的加密分块 (Chunk Delta)，在家中台式机与外出笔记本之间秒级同步。' },
      ],
    },
  },
  {
    id: 'kb-media-flac',
    vaultId: 'vault-media',
    folderPath: '/05_Media_Streams',
    title: '声学实验室合成器模块脉冲响应采样母带.flac',
    category: 'media',
    ext: 'flac',
    windowsPath: 'D:\\OmniKnowledge\\05_Media_Streams\\synth_impulse_96khz.flac',
    sizeBytes: 92400120,
    createdAt: '2026-10-15 11:05',
    updatedAt: '2026-10-27 17:40',
    sha256: '6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e',
    tags: ['FLAC无损音频', '频谱分析', '工业设计', 'WAV/Opus'],
    references: ['kb-img-psd', 'kb-media-mkv'],
    summary: '96kHz / 24-bit 无损 FLAC 录音母带（含语音旁白轨与频谱特征向量），与硬件控制台 PSD 母版一一对应。',
    content: `音频流元数据 (FFprobe 提取):
编码格式: Free Lossless Audio Codec (FLAC) · 支持 WAV / MP3 / AAC / OGG / Opus 无缝互转
采样规格: 96,000 Hz · 24 bits per sample · 2.0 Stereo · 动态范围 DR14
语音旁白转写记录:
[00:00:18] 测试编号 A-04，模块化铝制前面板谐振抑制测试通过，底噪低于 -112 dBFS。
[00:01:45] 低通滤波器截止频率扫描 20Hz 至 20kHz，奇次谐波失真 THD+N < 0.002%。`,
    metadata: {
      durationSec: 315,
      audioCodec: 'FLAC Lossless (24-bit / 96kHz)',
      sampleRate: '96.0 kHz / 24-bit',
      bitrate: '2,840 kbps',
      transcriptSegments: [
        { time: '00:00:18', text: '测试编号 A-04：模块化拉丝铝前面板声学谐振抑制测试通过，本底噪声 -112 dBFS。' },
        { time: '00:01:45', text: '滤波器扫频 20Hz - 20kHz，THD+N 低于 0.002%，波形包络已写入知识库索引。' },
      ],
    },
  },
  {
    id: 'kb-code-py',
    vaultId: 'vault-research',
    folderPath: '/06_Core_Scripts',
    title: 'omnivault_ingestor.py — Windows 多格式解析与本地向量化引擎',
    category: 'code',
    ext: 'py',
    windowsPath: 'D:\\OmniKnowledge\\06_Core_Scripts\\omnivault_ingestor.py',
    sizeBytes: 18420,
    createdAt: '2026-10-21 21:00',
    updatedAt: '2026-10-31 03:10',
    sha256: '2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b',
    tags: ['Python', '本地向量检索', '多格式解码', 'Windows原生'],
    references: ['kb-doc-pdf', 'kb-doc-csv'],
    summary: 'Windows 本地后台监控与多模态入库核心脚本：利用 watchdog 监听本地目录变化，自动分流调用 ImageMagick/ezdxf/PyMuPDF/FFmpeg 解析文件并写入 SQLite-vec。',
    content: `import os
import hashlib
import sqlite3
import subprocess
from pathlib import Path
from typing import Dict, Any, List

# 支持的完整扩展名集合（图片22种 / 文档8种 / 音视频21种 / 代码与链接）
IMAGE_EXTS = {'.bmp','.jpg','.jpeg','.png','.tif','.tiff','.gif','.pcx','.tga','.exif',
              '.fpx','.svg','.psd','.cdr','.pcd','.dxf','.ufo','.eps','.ai','.raw','.wmf','.webp','.avif','.apng'}
DOC_EXTS   = {'.docx','.pdf','.html','.xml','.md','.markdown','.rtf','.txt','.csv'}
MEDIA_EXTS = {'.wav','.flac','.mp3','.aac','.ogg','.opus','.mp4','.mkv','.mov','.avi',
              '.webm','.flv','.vob','.m2ts','.mpg','.mpeg','.ts','.rm','.rmvb','.wmv','.asf'}

class WindowsKnowledgeIngestor:
    def __init__(self, vault_root: Path, db_path: Path):
        self.vault_root = vault_root
        self.conn = sqlite3.connect(str(db_path))
        self.conn.enable_load_extension(True)
        # 加载本地 sqlite-vec 向量扩展
        self.conn.load_extension("vec0")

    def compute_sha256(self, file_path: Path) -> str:
        h = hashlib.sha256()
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(1048576), b""):
                h.update(chunk)
        return h.hexdigest()

    def extract_multimodal_payload(self, file_path: Path) -> Dict[str, Any]:
        ext = file_path.suffix.lower()
        if ext in {'.psd', '.cdr', '.dxf', '.ai', '.eps', '.wmf'}:
            return self._parse_vector_or_layered(file_path, ext)
        elif ext in IMAGE_EXTS:
            return self._parse_raster_and_exif(file_path)
        elif ext in MEDIA_EXTS:
            return self._transcribe_media_ffmpeg_whisper(file_path)
        elif ext in DOC_EXTS:
            return self._parse_document_ast(file_path, ext)
        return {"text": file_path.read_text(encoding="utf-8", errors="ignore")}`,
    metadata: {
      language: 'Python 3.12 (Windows AMD64)',
      lineCount: 38,
      authorOrAccount: 'OmniKnowledge Local Daemon',
    },
  },
  {
    id: 'kb-wx-mp',
    vaultId: 'vault-media',
    folderPath: '/07_WeChat_Archive',
    title: '微信公众号深度长文：如何构建永不失效的个人本地知识库与双向链接图谱',
    category: 'wechat_mp',
    ext: 'wxmp',
    windowsPath: 'D:\\OmniKnowledge\\07_WeChat_Archive\\mp_weixin_local_first_vault.wxmp',
    sourceUrl: 'https://mp.weixin.qq.com/s/OmniKnowledgeLocalFirst2026',
    sizeBytes: 3840500,
    createdAt: '2026-10-28 20:15',
    updatedAt: '2026-10-30 12:00',
    sha256: '5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f',
    tags: ['微信公众号', '微信生态', '双向链接', '知识图谱', '离线防丢'],
    references: ['kb-doc-pdf', 'kb-wx-video', 'kb-social-bili'],
    summary: '已通过内置 Chromium 采集器将公众号文章中的 18 张防盗链 WebP 图片与全文排版完整本地化，并自动建立与架构白皮书的双向引用关联。',
    content: `> 来源公众号：**系统工程与数字花园** · 原文链接：https://mp.weixin.qq.com/s/OmniKnowledgeLocalFirst2026
> 本地归档状态：全文 HTML + 18 张高清配图已转存至 D:\\OmniKnowledge\\07_WeChat_Archive\\assets\\

### 核心摘要
为什么传统的云端收藏夹最终都会沦为「404 墓地」？因为公众号文章随时可能被作者删除，外链图片带有防盗链签名。

1. **全量静态化抓取**：在采集公众号链接时，必须自动触发无头浏览器解析 \`data-src\` 属性，将全部图片转换为本地 WebP/AVIF 资产并重算哈希。
2. **打通非结构化孤岛**：将公众号深度文章与本地硬盘上的 [[Windows 本地全格式知识库架构与解析白皮书.pdf]] 以及 [[模块化钢结构实验舱主桁架节点总成.dxf]] 置于同一张知识图谱中。
3. **语义向量与卡片盒笔记**：每次划词高亮自动生成嵌入向量，让三年前收藏的公众号段落随时在本地搜索中浮现。`,
    metadata: {
      authorOrAccount: '公众号：系统工程与数字花园',
      platformName: '微信公众号 (mp.weixin.qq.com)',
      publishDate: '2026-10-28',
    },
  },
  {
    id: 'kb-wx-video',
    vaultId: 'vault-media',
    folderPath: '/07_WeChat_Archive',
    title: '微信视频号直播回放：Windows 本地部署 BGE-M3 向量模型与多端同步实操',
    category: 'wechat_video',
    ext: 'wxvid',
    windowsPath: 'D:\\OmniKnowledge\\07_WeChat_Archive\\channels_weixin_bge_sync_live.mp4',
    sourceUrl: 'https://channels.weixin.qq.com/platform/post/OmniKnowledgeLive2026',
    sizeBytes: 215400000,
    createdAt: '2026-10-29 21:40',
    updatedAt: '2026-10-30 22:10',
    sha256: '0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b',
    tags: ['微信视频号', '视频转写', '异地同步', '本地向量检索'],
    references: ['kb-wx-mp', 'kb-media-mkv', 'kb-doc-pdf'],
    summary: '微信视频号技术直播流解密归档（1080p MP4 + Whisper 逐字稿 + 12 张关键帧板书截图），完整记录 Windows 端 WebDAV/Tailscale 异地同步配置过程。',
    content: `来源平台：微信视频号 (@极客工程实验室)
视频规格：1080 × 1920 (H.264 High Profile) · 时长 18分42秒 · 已完成本地流解密与合并

### Whisper 自动提取时间轴节点：
- **[00:01:12]** 演示如何复制微信视频号分享链接直接粘贴到 OmniKnowledge 内嵌浏览器完成流媒体本地化。
- **[00:06:45]** 剖析 Windows 下 ONNX Runtime DirectML 加速：无论是 NVIDIA、AMD 还是 Intel 核显均可流畅运行本地向量化搜索。
- **[00:13:20]** 现场演示办公室 Windows 工作站与家里 NAS 通过 Tailscale + WebDAV 进行加密增量同步。`,
    metadata: {
      authorOrAccount: '视频号：@极客工程实验室',
      platformName: '微信视频号 (channels.weixin.qq.com)',
      durationSec: 1122,
      resolution: '1080 × 1920 (Full HD)',
      videoCodec: 'H.264 / AVC1 Decrypted Stream',
      audioCodec: 'AAC-LC 48kHz',
      transcriptSegments: [
        { time: '00:01:12', text: '把视频号链接粘贴进采集框后，系统会自动解密分片流并缓存为标准 MP4 文件。' },
        { time: '00:06:45', text: '开启 DirectML 硬件加速后，Windows 本地生成千字向量仅需 8 毫秒。' },
        { time: '00:13:20', text: '异地同步采用内容寻址分块，哪怕修改了 200MB 的 PSD 文件，也只同步变更的差分块。' },
      ],
    },
  },
  {
    id: 'kb-social-bili',
    vaultId: 'vault-media',
    folderPath: '/08_Social_Feeds',
    title: 'Bilibili & 小红书合集：工业 CAD/PSD/音视频多格式资产管理工作流',
    category: 'social',
    ext: 'bili',
    windowsPath: 'D:\\OmniKnowledge\\08_Social_Feeds\\bilibili_xhs_workflow_archive.json',
    sourceUrl: 'https://www.bilibili.com/video/BV1OmniKnowledge2026',
    sizeBytes: 42800000,
    createdAt: '2026-10-27 13:25',
    updatedAt: '2026-10-30 09:50',
    sha256: 'c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2',
    tags: ['Bilibili', '小红书', '社媒笔记', 'AutoCAD', 'Photoshop'],
    references: ['kb-img-dxf', 'kb-img-psd', 'kb-wx-mp'],
    summary: '聚合采集自 Bilibili 专栏视频与小红书工业设计高赞图集，包含弹幕高能时刻标记、AI 字幕时间轴与 9 张高分辨率工艺解剖图。',
    content: `采集源：Bilibili (BV1OmniKnowledge2026) & 小红书工业设计专题
包含内容：
1. **多格式工程文件命名与标签体系**：如何用统一标签（如 \`#AutoCAD\`, \`#图层母版\`, \`#本地向量检索\`）串联不同软件生成的格式。
2. **老旧档案抢救指南**：针对早期光盘中的 \`.rmvb\`, \`.vob\`, \`.pcx\`, \`.fpx\`, \`.cdr\`, \`.wmf\` 文件，利用 FFmpeg 与 ImageMagick 批量生成现代 WebP/MP4 预览代理，同时保留原始字节流不损坏。`,
    metadata: {
      authorOrAccount: 'UP主：数字资产架构师 / 小红书工业设计志',
      platformName: 'Bilibili / 小红书 跨平台合集',
      publishDate: '2026-10-27',
    },
  },
  {
    id: 'kb-img-dxf',
    title: '模块化钢结构实验舱主桁架节点总成.dxf',
    category: 'image',
    ext: 'dxf',
    windowsPath: 'D:\\OmniKnowledge\\01_Engineering_CAD\\modular_truss_assembly_v4.dxf',
    sizeBytes: 14820400,
    createdAt: '2026-10-18 09:42',
    updatedAt: '2026-10-30 16:15',
    sha256: '8f9d2a7c4b1e083f91a2c4d6e8f012349a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d',
    tags: ['AutoCAD', '结构工程', 'DXF矢量', '硬件设计'],
    references: ['kb-doc-pdf', 'kb-img-psd', 'kb-code-py'],
    summary: 'AutoCAD 2024 DXF 矢量交换图档，包含主承重桁架、阻尼减震底座、标注尺寸及 BOM 块属性，已通过 ezdxf 提取 6 个图层与 1,420 个几何实体索引。',
    content: `文件标识: AutoCAD DXF (AC1032 / 2024)
单位系统: 毫米 (mm) · 比例 1:25
包含图层:
1. 01_PRIMARY_TRUSS (主桁架箱型梁, 材质 Q355B)
2. 02_JOINT_GUSSET (高强螺栓连接节点板 M24-10.9S)
3. 03_ISOLATION_BASE (氟橡胶隔振支座定位网格)
4. 04_DIM_ANNOTATION (公差与标高尺寸标注)
5. 05_ELECTRICAL_CONDUIT (传感器走线桥架预留孔)

关联文档: 参见 [[Windows 本地全格式知识库架构与解析白皮书.pdf]] 以及工业外观视觉稿 [[桌面级硬件控制台分层视觉母版.psd]]。`,
    metadata: {
      resolution: 'Vector Infinite (4200 × 2970 mm A0)',
      colorSpace: 'ACI AutoCAD Color Index (256-Color Vector)',
      layers: [
        '01_PRIMARY_TRUSS (主承重桁架)',
        '02_JOINT_GUSSET (高强节点板)',
        '03_ISOLATION_BASE (隔振底座)',
        '04_DIM_ANNOTATION (尺寸标注层)',
        '05_ELECTRICAL_CONDUIT (线缆管路)',
      ],
    },
  },
  {
    id: 'kb-img-psd',
    title: '桌面级硬件控制台分层视觉母版.psd',
    category: 'image',
    ext: 'psd',
    windowsPath: 'D:\\OmniKnowledge\\02_Design_Assets\\console_industrial_master.psd',
    sizeBytes: 186400200,
    createdAt: '2026-10-19 14:20',
    updatedAt: '2026-10-30 18:05',
    sha256: '3c4e5f6a7b8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f',
    tags: ['Photoshop', '工业设计', '图层母版', 'CDR联动'],
    references: ['kb-img-dxf', 'kb-img-raw'],
    summary: '16-bit Adobe RGB 多图层 PSD 设计源文件，包含阳极氧化铝面板纹理、OLED 仪表区智能对象、丝印标识矢量蒙版（同步导出 CDR/AI 刀模线）。',
    content: `通过 psd-tools 自动解构的 PSD 图层树与内嵌文字 OCR 索引：
- 智能对象组 [OLED_TELEMETRY_HUD]: 字号 12pt JetBrains Mono, 采样率状态指示
- 材质纹理层 [ANODIZED_ALUMINUM_BRUSH]: 4K 无缝法线贴图与柔光混合
- 丝印矢量层 [SILKSCREEN_LABELS_CDR]: 已同步导出 CorelDRAW (.cdr) 激光雕刻路径与 EPS 印刷分色版
- 色彩配置文件: Adobe RGB (1998) / 16 Bits/Channel`,
    metadata: {
      resolution: '5120 × 2880 px (5K Studio)',
      colorSpace: 'Adobe RGB (1998) · 16-bit Channel',
      cameraModel: 'Photoshop 2026 Smart Compositor',
      layers: [
        'SILKSCREEN_LABELS_CDR (矢量丝印路径)',
        'OLED_TELEMETRY_HUD (仪表盘智能对象)',
        'KNOB_SHADOW_OCCLUSION (环境光遮蔽)',
        'ANODIZED_ALUMINUM_BRUSH (拉丝铝基底)',
        'CHASSIS_BLUEPRINT_REF (DXF底图对齐层)',
      ],
    },
  },
  {
    id: 'kb-img-raw',
    title: '横断山脉贡嘎雪山黎明航拍传感器原片.raw',
    category: 'image',
    ext: 'raw',
    windowsPath: 'D:\\OmniKnowledge\\03_Photography_RAW\\DSC09482_Gongga_Dawn.raw',
    sizeBytes: 64250880,
    createdAt: '2026-10-12 06:18',
    updatedAt: '2026-10-25 11:30',
    sha256: '7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b',
    tags: ['RAW原片', 'EXIF元数据', '风光摄影', '色彩管理'],
    references: ['kb-img-psd'],
    summary: '14-bit 无损压缩索尼/哈苏相机 RAW 传感器原始数据，附带完整 EXIF GPS 高程坐标、快门光圈参数与内嵌 4K AVIF/TIFF 预览金字塔。',
    content: `LibRaw + ExifTool 自动提取光学与地理元数据：
拍摄地点: 四川省甘孜州贡嘎山主峰西坡 (29°35'44"N, 101°52'40"E, 海拔 4,680m)
镜头参数: FE 24-70mm F2.8 GM II @ 35mm, f/8.0, 1/125s, ISO 64
动态范围: 14.8 EV (Linear RAW Demosaic -> ProPhoto RGB TIFF)
伴生文件: 已自动生成高动态范围 AVIF 缩略图与 .exif 独立元数据侧车文件。`,
    metadata: {
      resolution: '9504 × 6336 px (60.2 MP)',
      colorSpace: '14-bit Bayer RGGB RAW (ProPhoto RGB)',
      cameraModel: 'ILCE-7RM5 + FE 24-70mm F2.8 GM II · f/8 · 1/125s · ISO 64',
      layers: ['RAW Bayer Sensor Data', 'Embedded Preview JPEG', 'EXIF & GPS Sidecar Stream'],
    },
  },
  {
    id: 'kb-doc-pdf',
    title: 'Windows 本地全格式知识库架构与解析白皮书.pdf',
    category: 'document',
    ext: 'pdf',
    windowsPath: 'D:\\OmniKnowledge\\04_Architecture_Docs\\OmniKnowledge_Windows_Architecture_2026.pdf',
    sizeBytes: 5420800,
    createdAt: '2026-10-20 10:00',
    updatedAt: '2026-10-31 02:40',
    sha256: '1f2e3d4c5b6a79880716253443526170899a0b1c2d3e4f5a6b7c8d9e0f1a2b3c',
    tags: ['系统架构', '本地向量检索', '多格式解码', 'Windows原生'],
    references: ['kb-code-py', 'kb-doc-csv', 'kb-wx-mp', 'kb-img-dxf'],
    summary: '详细阐述在 Windows 10/11 下通过 FastAPI + SQLite-vec + ImageMagick + FFmpeg + LibreOffice 实现 60+ 种图片、文档、音视频与社媒链接本地解析与向量检索的工程规范。',
    content: `## 1. 核心架构分层 (Windows Native Knowledge Engine)

OmniKnowledge 采用「本地内容寻址存储 (CAS) + 异构格式解码管线 + 本地混合向量检索引擎」三层架构：

### 1.1 全格式本地解码矩阵
- **工业与设计图像管线**: 针对 BMP, JPG, PNG, TIF, GIF, PCX, TGA, EXIF, FPX, SVG, PSD, CDR, PCD, DXF, UFO, EPS, AI, RAW, WMF, WebP, AVIF, APNG，统一由 \`ImageMagick 7 + LibRaw + psd-tools + ezdxf + libcdr\` 提取分层图层、EXIF 相机参数与 RapidOCR 画面文字。
- **文档与结构化文本管线**: 针对 DOCX, PDF, HTML, XML, Markdown, RTF, TXT, CSV，采用 \`PyMuPDF (fitz) + python-docx + DuckDB\` 保留章节标题层级与表格行列语义。
- **全格式音视频流管线**: 针对 WAV, FLAC, MP3, AAC, OGG/Opus, MP4, MKV, MOV, AVI, WebM, FLV, VOB, M2TS, MPG, MPEG, TS, RM, RMVB, WMV, ASF，调用 \`FFmpeg 7.1 Hardware NVDEC\` 抽帧并结合 \`Faster-Whisper (CTranslate2 INT8)\` 生成带毫秒级时间戳的全文语音转写索引。

### 1.2 本地向量化混合搜索 (Hybrid Vector + BM25)
使用本地 ONNX Runtime 运行 \`BAAI/bge-m3\` (1024维稠密向量 + 稀疏词权)，持久化于单文件 \`SQLite-vec\` 与 \`FTS5\` 倒排索引中，无需联网即可完成跨模态语义召回。`,
    metadata: {
      authorOrAccount: 'OmniKnowledge 核心系统架构组',
      publishDate: '2026-10-31',
      lineCount: 428,
    },
  },
  {
    id: 'kb-doc-csv',
    vaultId: 'vault-research',
    folderPath: '/04_Architecture_Docs',
    title: '62种异构文件格式本地解码吞吐量与向量化基准测试.csv',
    category: 'document',
    ext: 'csv',
    windowsPath: 'D:\\OmniKnowledge\\04_Architecture_Docs\\format_benchmark_rtx4080.csv',
    sizeBytes: 48200,
    createdAt: '2026-10-26 15:12',
    updatedAt: '2026-10-30 20:00',
    sha256: '9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d',
    tags: ['基准测试', 'CSV数据集', '解码性能', '本地向量检索'],
    references: ['kb-doc-pdf', 'kb-code-py'],
    summary: '在 Windows 11 (Ryzen 9 7950X + RTX 4080 Super) 上对 PSD/CDR/DXF、PDF/DOCX、MKV/RMVB/FLAC 等格式的本地解析耗时与 BGE-M3 向量生成吞吐量实测数据表。',
    content: `格式类别,代表扩展名,本地解码器组件,平均解析耗时(ms),OCR/ASR速度,向量化吞吐(chunks/s),内存峰值(MB)
工程与设计图档,.psd / .cdr / .dxf / .ai,psd-tools + libcdr + ezdxf,142.5,RapidOCR 38ms/图,410.0,312.4
相机与传统位图,.raw / .tif / .fpx / .pcx / .avif,LibRaw + LibTIFF + ImageMagick,86.2,ExifTool 12ms/图,520.8,245.0
富文本与电子书,.pdf / .docx / .rtf / .html / .xml,PyMuPDF + python-docx + lxml,34.8,原生文本流免OCR,890.5,128.0
无损与压缩音频,.wav / .flac / .mp3 / .aac / .opus,FFmpeg + Faster-Whisper INT8,620.0,实时率 RTF 0.04x,380.2,640.0
高清与传统视频,.mp4 / .mkv / .m2ts / .rmvb / .vob,FFmpeg NVDEC + RV40 Demuxer,1180.4,关键帧 + 语音双轨,310.6,980.5
微信与社交平台,公众号 / 视频号 / 小红书 / B站,Playwright + Stream Decryptor,490.0,DOM快照 + 字幕提取,465.0,410.0`,
    metadata: {
      csvHeaders: ['格式类别', '代表扩展名', '本地解码器组件', '平均耗时(ms)', 'OCR/ASR特性', '向量吞吐(chunks/s)', '内存峰值(MB)'],
      csvRows: [
        ['工程与设计图档', '.psd / .cdr / .dxf / .ai', 'psd-tools + libcdr + ezdxf', '142.5', 'RapidOCR 38ms/图', '410.0', '312.4'],
        ['相机与传统位图', '.raw / .tif / .fpx / .pcx / .avif', 'LibRaw + LibTIFF + ImageMagick', '86.2', 'ExifTool 12ms/图', '520.8', '245.0'],
        ['富文本与办公文档', '.pdf / .docx / .rtf / .html / .xml', 'PyMuPDF + python-docx + lxml', '34.8', '原生文本流直提', '890.5', '128.0'],
        ['无损与压缩音频', '.wav / .flac / .mp3 / .aac / .opus', 'FFmpeg + Faster-Whisper INT8', '620.0', '实时率 RTF 0.04x', '380.2', '640.0'],
        ['高清与传统视频', '.mp4 / .mkv / .m2ts / .rmvb / .vob', 'FFmpeg NVDEC + RV40 Demuxer', '1180.4', '关键帧+语音双轨', '310.6', '980.5'],
        ['微信与社媒链接', '公众号 / 视频号 / 小红书 / B站', 'Playwright + Stream Decryptor', '490.0', 'DOM去噪+字幕提取', '465.0', '410.0'],
      ],
    },
  },
  {
    id: 'kb-media-mkv',
    vaultId: 'vault-media',
    folderPath: '/05_Media_Streams',
    title: '2026 本地个人知识库与多模态 RAG 系统架构研讨会.mkv',
    category: 'media',
    ext: 'mkv',
    windowsPath: 'D:\\OmniKnowledge\\05_Media_Streams\\local_rag_symposium_4k.mkv',
    sizeBytes: 842500600,
    createdAt: '2026-10-24 19:30',
    updatedAt: '2026-10-29 10:15',
    sha256: '4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c',
    tags: ['MKV多轨视频', 'Whisper转写', '本地向量检索', '知识图谱'],
    references: ['kb-doc-pdf', 'kb-media-flac', 'kb-wx-video'],
    summary: 'Matroska (MKV) 4K HEVC 视频流（内封 FLAC 24-bit 音轨与中英双语 ASS 字幕），已完成 FFmpeg 关键帧幻灯片切分与 Faster-Whisper 时间轴文本对齐。',
    content: `容器格式: Matroska (MKV) · 同时兼容 MP4/MOV/AVI/M2TS/RMVB/VOB 解码管线
视频流 #0: HEVC (H.265) Main 10 @ L5.1, 3840×2160, 60.00 fps, 18.4 Mbps
音频流 #1: FLAC (24-bit / 48 kHz Stereo Lossless)
语音转写全文摘要:
- [00:02:15] 为什么 Windows 本地知识库必须把 CAD (.dxf/.cdr) 和老旧视频 (.rmvb/.vob/.asf) 纳入统一内容寻址层？
- [00:14:40] 演示 SQLite-vec 在百万级分块下结合 HNSW 图索引实现 12ms 向量语义检索。
- [00:28:05] 演示通过 Tailscale P2P 与坚果云 WebDAV 实现端到端加密的异地增量同步。`,
    metadata: {
      durationSec: 2480,
      resolution: '3840 × 2160 (4K UHD 60fps)',
      videoCodec: 'HEVC / H.265 Main10 (NVDEC)',
      audioCodec: 'FLAC 24-bit / 48kHz Stereo',
      bitrate: '19.8 Mbps',
      transcriptSegments: [
        { time: '00:02:15', text: 'Windows 本地知识库的核心痛点在于格式碎片化：设计师有 PSD/CDR/AI，工程师有 DXF/RAW，影音资料有 MKV/RMVB/VOB/FLAC。' },
        { time: '00:09:32', text: '我们通过内容寻址存储 (SHA-256 CAS) 为任意格式建立唯一指纹，并用后台 Worker 自动提取文本、图层、EXIF 与语音转写。' },
        { time: '00:14:40', text: '在本地向量化搜索层，BGE-M3 模型将文本块编码为归一化稠密向量，配合双向交叉引用图谱实现联想式检索。' },
        { time: '00:28:05', text: '异地同步模块只传输新增的加密分块 (Chunk Delta)，在家中台式机与外出笔记本之间秒级同步。' },
      ],
    },
  },
  {
    id: 'kb-media-flac',
    vaultId: 'vault-media',
    folderPath: '/05_Media_Streams',
    title: '声学实验室合成器模块脉冲响应采样母带.flac',
    category: 'media',
    ext: 'flac',
    windowsPath: 'D:\\OmniKnowledge\\05_Media_Streams\\synth_impulse_96khz.flac',
    sizeBytes: 92400120,
    createdAt: '2026-10-15 11:05',
    updatedAt: '2026-10-27 17:40',
    sha256: '6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e',
    tags: ['FLAC无损音频', '频谱分析', '工业设计', 'WAV/Opus'],
    references: ['kb-img-psd', 'kb-media-mkv'],
    summary: '96kHz / 24-bit 无损 FLAC 录音母带（含语音旁白轨与频谱特征向量），与硬件控制台 PSD 母版一一对应。',
    content: `音频流元数据 (FFprobe 提取):
编码格式: Free Lossless Audio Codec (FLAC) · 支持 WAV / MP3 / AAC / OGG / Opus 无缝互转
采样规格: 96,000 Hz · 24 bits per sample · 2.0 Stereo · 动态范围 DR14
语音旁白转写记录:
[00:00:18] 测试编号 A-04，模块化铝制前面板谐振抑制测试通过，底噪低于 -112 dBFS。
[00:01:45] 低通滤波器截止频率扫描 20Hz 至 20kHz，奇次谐波失真 THD+N < 0.002%。`,
    metadata: {
      durationSec: 315,
      audioCodec: 'FLAC Lossless (24-bit / 96kHz)',
      sampleRate: '96.0 kHz / 24-bit',
      bitrate: '2,840 kbps',
      transcriptSegments: [
        { time: '00:00:18', text: '测试编号 A-04：模块化拉丝铝前面板声学谐振抑制测试通过，本底噪声 -112 dBFS。' },
        { time: '00:01:45', text: '滤波器扫频 20Hz - 20kHz，THD+N 低于 0.002%，波形包络已写入知识库索引。' },
      ],
    },
  },
  {
    id: 'kb-code-py',
    vaultId: 'vault-research',
    folderPath: '/06_Core_Scripts',
    title: 'omnivault_ingestor.py — Windows 多格式解析与本地向量化引擎',
    category: 'code',
    ext: 'py',
    windowsPath: 'D:\\OmniKnowledge\\06_Core_Scripts\\omnivault_ingestor.py',
    sizeBytes: 18420,
    createdAt: '2026-10-21 21:00',
    updatedAt: '2026-10-31 03:10',
    sha256: '2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b',
    tags: ['Python', '本地向量检索', '多格式解码', 'Windows原生'],
    references: ['kb-doc-pdf', 'kb-doc-csv'],
    summary: 'Windows 本地后台监控与多模态入库核心脚本：利用 watchdog 监听本地目录变化，自动分流调用 ImageMagick/ezdxf/PyMuPDF/FFmpeg 解析文件并写入 SQLite-vec。',
    content: `import os
import hashlib
import sqlite3
import subprocess
from pathlib import Path
from typing import Dict, Any, List

# 支持的完整扩展名集合（图片22种 / 文档8种 / 音视频21种 / 代码与链接）
IMAGE_EXTS = {'.bmp','.jpg','.jpeg','.png','.tif','.tiff','.gif','.pcx','.tga','.exif',
              '.fpx','.svg','.psd','.cdr','.pcd','.dxf','.ufo','.eps','.ai','.raw','.wmf','.webp','.avif','.apng'}
DOC_EXTS   = {'.docx','.pdf','.html','.xml','.md','.markdown','.rtf','.txt','.csv'}
MEDIA_EXTS = {'.wav','.flac','.mp3','.aac','.ogg','.opus','.mp4','.mkv','.mov','.avi',
              '.webm','.flv','.vob','.m2ts','.mpg','.mpeg','.ts','.rm','.rmvb','.wmv','.asf'}

class WindowsKnowledgeIngestor:
    def __init__(self, vault_root: Path, db_path: Path):
        self.vault_root = vault_root
        self.conn = sqlite3.connect(str(db_path))
        self.conn.enable_load_extension(True)
        # 加载本地 sqlite-vec 向量扩展
        self.conn.load_extension("vec0")

    def compute_sha256(self, file_path: Path) -> str:
        h = hashlib.sha256()
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(1048576), b""):
                h.update(chunk)
        return h.hexdigest()

    def extract_multimodal_payload(self, file_path: Path) -> Dict[str, Any]:
        ext = file_path.suffix.lower()
        if ext in {'.psd', '.cdr', '.dxf', '.ai', '.eps', '.wmf'}:
            return self._parse_vector_or_layered(file_path, ext)
        elif ext in IMAGE_EXTS:
            return self._parse_raster_and_exif(file_path)
        elif ext in MEDIA_EXTS:
            return self._transcribe_media_ffmpeg_whisper(file_path)
        elif ext in DOC_EXTS:
            return self._parse_document_ast(file_path, ext)
        return {"text": file_path.read_text(encoding="utf-8", errors="ignore")}`,
    metadata: {
      language: 'Python 3.12 (Windows AMD64)',
      lineCount: 38,
      authorOrAccount: 'OmniKnowledge Local Daemon',
    },
  },
  {
    id: 'kb-wx-mp',
    vaultId: 'vault-media',
    folderPath: '/07_WeChat_Archive',
    title: '微信公众号深度长文：如何构建永不失效的个人本地知识库与双向链接图谱',
    category: 'wechat_mp',
    ext: 'wxmp',
    windowsPath: 'D:\\OmniKnowledge\\07_WeChat_Archive\\mp_weixin_local_first_vault.wxmp',
    sourceUrl: 'https://mp.weixin.qq.com/s/OmniKnowledgeLocalFirst2026',
    sizeBytes: 3840500,
    createdAt: '2026-10-28 20:15',
    updatedAt: '2026-10-30 12:00',
    sha256: '5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f',
    tags: ['微信公众号', '微信生态', '双向链接', '知识图谱', '离线防丢'],
    references: ['kb-doc-pdf', 'kb-wx-video', 'kb-social-bili'],
    summary: '已通过内置 Chromium 采集器将公众号文章中的 18 张防盗链 WebP 图片与全文排版完整本地化，并自动建立与架构白皮书的双向引用关联。',
    content: `> 来源公众号：**系统工程与数字花园** · 原文链接：https://mp.weixin.qq.com/s/OmniKnowledgeLocalFirst2026
> 本地归档状态：全文 HTML + 18 张高清配图已转存至 D:\\OmniKnowledge\\07_WeChat_Archive\\assets\\

### 核心摘要
为什么传统的云端收藏夹最终都会沦为「404 墓地」？因为公众号文章随时可能被作者删除，外链图片带有防盗链签名。

1. **全量静态化抓取**：在采集公众号链接时，必须自动触发无头浏览器解析 \`data-src\` 属性，将全部图片转换为本地 WebP/AVIF 资产并重算哈希。
2. **打通非结构化孤岛**：将公众号深度文章与本地硬盘上的 [[Windows 本地全格式知识库架构与解析白皮书.pdf]] 以及 [[模块化钢结构实验舱主桁架节点总成.dxf]] 置于同一张知识图谱中。
3. **语义向量与卡片盒笔记**：每次划词高亮自动生成嵌入向量，让三年前收藏的公众号段落随时在本地搜索中浮现。`,
    metadata: {
      authorOrAccount: '公众号：系统工程与数字花园',
      platformName: '微信公众号 (mp.weixin.qq.com)',
      publishDate: '2026-10-28',
    },
  },
  {
    id: 'kb-wx-video',
    vaultId: 'vault-media',
    folderPath: '/07_WeChat_Archive',
    title: '微信视频号直播回放：Windows 本地部署 BGE-M3 向量模型与多端同步实操',
    category: 'wechat_video',
    ext: 'wxvid',
    windowsPath: 'D:\\OmniKnowledge\\07_WeChat_Archive\\channels_weixin_bge_sync_live.mp4',
    sourceUrl: 'https://channels.weixin.qq.com/platform/post/OmniKnowledgeLive2026',
    sizeBytes: 215400000,
    createdAt: '2026-10-29 21:40',
    updatedAt: '2026-10-30 22:10',
    sha256: '0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b',
    tags: ['微信视频号', '视频转写', '异地同步', '本地向量检索'],
    references: ['kb-wx-mp', 'kb-media-mkv', 'kb-doc-pdf'],
    summary: '微信视频号技术直播流解密归档（1080p MP4 + Whisper 逐字稿 + 12 张关键帧板书截图），完整记录 Windows 端 WebDAV/Tailscale 异地同步配置过程。',
    content: `来源平台：微信视频号 (@极客工程实验室)
视频规格：1080 × 1920 (H.264 High Profile) · 时长 18分42秒 · 已完成本地流解密与合并

### Whisper 自动提取时间轴节点：
- **[00:01:12]** 演示如何复制微信视频号分享链接直接粘贴到 OmniKnowledge 内嵌浏览器完成流媒体本地化。
- **[00:06:45]** 剖析 Windows 下 ONNX Runtime DirectML 加速：无论是 NVIDIA、AMD 还是 Intel 核显均可流畅运行本地向量化搜索。
- **[00:13:20]** 现场演示办公室 Windows 工作站与家里 NAS 通过 Tailscale + WebDAV 进行加密增量同步。`,
    metadata: {
      authorOrAccount: '视频号：@极客工程实验室',
      platformName: '微信视频号 (channels.weixin.qq.com)',
      durationSec: 1122,
      resolution: '1080 × 1920 (Full HD)',
      videoCodec: 'H.264 / AVC1 Decrypted Stream',
      audioCodec: 'AAC-LC 48kHz',
      transcriptSegments: [
        { time: '00:01:12', text: '把视频号链接粘贴进采集框后，系统会自动解密分片流并缓存为标准 MP4 文件。' },
        { time: '00:06:45', text: '开启 DirectML 硬件加速后，Windows 本地生成千字向量仅需 8 毫秒。' },
        { time: '00:13:20', text: '异地同步采用内容寻址分块，哪怕修改了 200MB 的 PSD 文件，也只同步变更的差分块。' },
      ],
    },
  },
  {
    id: 'kb-social-bili',
    vaultId: 'vault-media',
    folderPath: '/08_Social_Feeds',
    title: 'Bilibili & 小红书合集：工业 CAD/PSD/音视频多格式资产管理工作流',
    category: 'social',
    ext: 'bili',
    windowsPath: 'D:\\OmniKnowledge\\08_Social_Feeds\\bilibili_xhs_workflow_archive.json',
    sourceUrl: 'https://www.bilibili.com/video/BV1OmniKnowledge2026',
    sizeBytes: 42800000,
    createdAt: '2026-10-27 13:25',
    updatedAt: '2026-10-30 09:50',
    sha256: 'c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2',
    tags: ['Bilibili', '小红书', '社媒笔记', 'AutoCAD', 'Photoshop'],
    references: ['kb-img-dxf', 'kb-img-psd', 'kb-wx-mp'],
    summary: '聚合采集自 Bilibili 专栏视频与小红书工业设计高赞图集，包含弹幕高能时刻标记、AI 字幕时间轴与 9 张高分辨率工艺解剖图。',
    content: `采集源：Bilibili (BV1OmniKnowledge2026) & 小红书工业设计专题
包含内容：
1. **多格式工程文件命名与标签体系**：如何用统一标签（如 \`#AutoCAD\`, \`#图层母版\`, \`#本地向量检索\`）串联不同软件生成的格式。
2. **老旧档案抢救指南**：针对早期光盘中的 \`.rmvb\`, \`.vob\`, \`.pcx\`, \`.fpx\`, \`.cdr\`, \`.wmf\` 文件，利用 FFmpeg 与 ImageMagick 批量生成现代 WebP/MP4 预览代理，同时保留原始字节流不损坏。`,
    metadata: {
      authorOrAccount: 'UP主：数字资产架构师 / 小红书工业设计志',
      platformName: 'Bilibili / 小红书 跨平台合集',
      publishDate: '2026-10-27',
    },
  },
];

export const INITIAL_KNOWLEDGE_ITEMS: KnowledgeItem[] = rawItems.map((item) => ({
  ...item,
  embedding: computeEmbedding(
    `${item.title} ${item.ext} ${item.tags.join(' ')} ${item.summary} ${item.content}`
  ),
}));

export const INITIAL_SYNC_NODES: SyncNodeConfig[] = [
  {
    id: 'sync-tailscale-nas',
    name: '家庭绿联/群晖 NAS 主存储节点 (Tailscale 直连)',
    protocol: 'Tailscale P2P',
    endpoint: 'https://100.84.19.42:8443/omnivault-cas',
    localMirrorDir: 'D:\\OmniKnowledge',
    encryption: 'AES-256-GCM',
    status: 'synced',
    lastSyncAt: '2026-10-31 04:05:12',
    syncedCount: 9,
    pendingDeltaCount: 0,
    latencyMs: 18,
    healthStatus: 'healthy',
  },
  {
    id: 'sync-webdav-cloud',
    name: '坚果云 / Nextcloud 异地热备节点 (WebDAV)',
    protocol: 'WebDAV',
    endpoint: 'https://dav.jianguoyun.com/dav/OmniKnowledge_Encrypted/',
    localMirrorDir: 'D:\\OmniKnowledge\\.cas_mirror',
    encryption: 'Age-X25519',
    status: 'pending',
    lastSyncAt: '2026-10-31 01:30:00',
    syncedCount: 7,
    pendingDeltaCount: 2,
    latencyMs: 135,
    healthStatus: 'degraded',
  },
  {
    id: 'sync-s3-minio',
    name: '工作室 Windows Server MinIO 对象存储库 (S3)',
    protocol: 'S3 / MinIO',
    endpoint: 'https://s3.studio-lan.local:9000/vault-buckets',
    localMirrorDir: 'D:\\OmniKnowledge',
    encryption: 'AES-256-GCM',
    status: 'synced',
    lastSyncAt: '2026-10-31 03:58:40',
    syncedCount: 9,
    pendingDeltaCount: 0,
    latencyMs: 28,
    healthStatus: 'healthy',
  },
];

