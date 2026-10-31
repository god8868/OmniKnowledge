import test from 'node:test';
import assert from 'node:assert/strict';
import {
  detectFormatInfo,
  parseSocialOrWebUrl,
  computeEmbedding,
  cosineSimilarity,
  searchKnowledgeBase,
  buildKnowledgeGraph,
  getBacklinksForItem,
  exportItemMetadataAsMarkdown,
  exportItemMetadataAsCsv,
  KnowledgeItem,
  AutomationRule,
} from './knowledgeEngine';

test('detectFormatInfo recognizes all requested image, document, media, and code formats', () => {
  // Exotic & professional image formats
  assert.equal(detectFormatInfo('blueprint_truss.dxf').category, 'image');
  assert.equal(detectFormatInfo('poster_layout.cdr').category, 'image');
  assert.equal(detectFormatInfo('ui_mockup.psd').supportsLayers, true);
  assert.equal(detectFormatInfo('alpine_shot.raw').supportsExif, true);
  assert.equal(detectFormatInfo('legacy_texture.pcx').category, 'image');
  assert.equal(detectFormatInfo('kodak_archive.fpx').category, 'image');
  assert.equal(detectFormatInfo('metafile_diagram.wmf').category, 'image');
  assert.equal(detectFormatInfo('hdr_cover.avif').category, 'image');
  assert.equal(detectFormatInfo('animated_sprite.apng').category, 'image');

  // Document formats
  assert.equal(detectFormatInfo('architecture_spec.docx').category, 'document');
  assert.equal(detectFormatInfo('whitepaper.pdf').category, 'document');
  assert.equal(detectFormatInfo('metrics_2026.csv').category, 'document');
  assert.equal(detectFormatInfo('notes.md').category, 'document');

  // Audio/Video formats
  assert.equal(detectFormatInfo('studio_master.flac').category, 'media');
  assert.equal(detectFormatInfo('voice_memo.opus').category, 'media');
  assert.equal(detectFormatInfo('bluray_stream.m2ts').category, 'media');
  assert.equal(detectFormatInfo('archive_movie.rmvb').category, 'media');
  assert.equal(detectFormatInfo('dvd_chapter.vob').category, 'media');
  assert.equal(detectFormatInfo('broadcast_capture.ts').category, 'media');
  assert.equal(detectFormatInfo('windows_stream.asf').category, 'media');

  // Code formats
  assert.equal(detectFormatInfo('vector_indexer.py').category, 'code');
  assert.equal(detectFormatInfo('setup_windows.ps1').category, 'code');
});

test('parseSocialOrWebUrl classifies WeChat Official Account, Video Channel, Social platforms, and Web URLs', () => {
  const wxMp = parseSocialOrWebUrl('https://mp.weixin.qq.com/s/AbCdEfGh123456');
  assert.equal(wxMp.isValid, true);
  assert.equal(wxMp.category, 'wechat_mp');
  assert.equal(wxMp.platformName, '微信公众号');

  const wxVideo = parseSocialOrWebUrl('https://channels.weixin.qq.com/platform/post/98765');
  assert.equal(wxVideo.isValid, true);
  assert.equal(wxVideo.category, 'wechat_video');
  assert.equal(wxVideo.platformName, '微信视频号');

  const bili = parseSocialOrWebUrl('https://www.bilibili.com/video/BV1xx411c7mD');
  assert.equal(bili.isValid, true);
  assert.equal(bili.category, 'social');
  assert.ok(bili.platformName.includes('Bilibili'));

  const xhs = parseSocialOrWebUrl('https://www.xiaohongshu.com/explore/66a1b2c3');
  assert.equal(xhs.isValid, true);
  assert.equal(xhs.category, 'social');

  const invalid = parseSocialOrWebUrl('   ');
  assert.equal(invalid.isValid, false);
});

test('computeEmbedding and searchKnowledgeBase rank semantically relevant items first', () => {
  const mockItems: KnowledgeItem[] = [
    {
      id: 'item-cad',
      title: '大跨度钢结构桁架节点 AutoCAD 施工图.dxf',
      category: 'image',
      ext: 'dxf',
      windowsPath: 'D:\\OmniKnowledge\\CAD\\truss_node.dxf',
      sizeBytes: 4200000,
      createdAt: '2026-10-20',
      updatedAt: '2026-10-28',
      sha256: 'a1b2c3',
      tags: ['CAD图纸', '建筑结构', 'DXF'],
      references: ['item-doc'],
      summary: '包含主桁架图层、螺栓节点剖面与矢量尺寸标注的 AutoCAD DXF 工程文件。',
      content: 'AutoCAD DXF 2024 矢量工程图，含 STRUCT_TRUSS、DIM_ANNOT 与 AXIS 三个核心图层。',
      metadata: { layers: ['STRUCT_TRUSS', 'DIM_ANNOT', 'AXIS'] },
    },
    {
      id: 'item-doc',
      title: '本地知识库向量检索与 SQLite-vec 架构白皮书.pdf',
      category: 'document',
      ext: 'pdf',
      windowsPath: 'D:\\OmniKnowledge\\Docs\\sqlite_vec_rag.pdf',
      sizeBytes: 1850000,
      createdAt: '2026-10-22',
      updatedAt: '2026-10-29',
      sha256: 'd4e5f6',
      tags: ['向量检索', 'RAG', '架构设计'],
      references: [],
      summary: '详解 Windows 下基于 BGE-M3 与 SQLite-vec 的本地混合向量搜索实现。',
      content: '通过余弦相似度与 BM25 倒排索引结合，实现毫秒级本地知识库向量检索与异地增量同步。',
      metadata: {},
    },
  ];

  const vecCad = computeEmbedding(mockItems[0].title + ' ' + mockItems[0].content);
  assert.equal(vecCad.length, 32);
  assert.ok(cosineSimilarity(vecCad, vecCad) > 0.99);

  const searchRes = searchKnowledgeBase(mockItems, '向量检索 RAG 余弦相似度');
  assert.ok(searchRes.length >= 1);
  assert.equal(searchRes[0].item.id, 'item-doc');
  assert.ok(searchRes[0].hybridScore > 0.3);
});

test('buildKnowledgeGraph and getBacklinksForItem compute bidirectional cross-references', () => {
  const mockItems: KnowledgeItem[] = [
    {
      id: 'n1',
      title: 'Node 1',
      category: 'document',
      ext: 'md',
      windowsPath: 'D:\\Vault\\n1.md',
      sizeBytes: 1024,
      createdAt: '2026-10-01',
      updatedAt: '2026-10-01',
      sha256: '111',
      tags: ['核心架构'],
      references: ['n2'],
      summary: 'First node',
      content: 'Links to [[Node 2]]',
      metadata: {},
    },
    {
      id: 'n2',
      title: 'Node 2',
      category: 'code',
      ext: 'py',
      windowsPath: 'D:\\Vault\\n2.py',
      sizeBytes: 2048,
      createdAt: '2026-10-02',
      updatedAt: '2026-10-02',
      sha256: '222',
      tags: ['核心架构'],
      references: [],
      summary: 'Second node',
      content: 'Implementation script',
      metadata: {},
    },
  ];

  const backlinks = getBacklinksForItem(mockItems, 'n2');
  assert.equal(backlinks.length, 1);
  assert.equal(backlinks[0].id, 'n1');

  const graph = buildKnowledgeGraph(mockItems);
  assert.equal(graph.nodes.length, 2);
  assert.equal(graph.edges.length, 1);
  assert.equal(graph.edges[0].type, 'reference');
});

test('getSuggestedTags returns filtered historical tags excluding current tags and matching query', async () => {
  const { getSuggestedTags } = await import('./knowledgeEngine');
  const mockAllTags: [string, number][] = [
    ['架构设计', 5],
    ['Windows部署', 4],
    ['AI全景', 3],
    ['计算机视觉', 2],
    ['多模态', 2],
  ];

  // When query is empty, returns all historical tags except those already on the item
  const suggestions1 = getSuggestedTags(mockAllTags, ['架构设计'], '', 5);
  assert.equal(suggestions1.length, 4);
  assert.equal(suggestions1.some(([tag]) => tag === '架构设计'), false);
  assert.equal(suggestions1[0][0], 'Windows部署');

  // When query matches substring
  const suggestions2 = getSuggestedTags(mockAllTags, ['多模态'], '视觉', 5);
  assert.equal(suggestions2.length, 1);
  assert.equal(suggestions2[0][0], '计算机视觉');

  // When query starts with hash symbol #
  const suggestions3 = getSuggestedTags(mockAllTags, [], '#AI', 5);
  assert.equal(suggestions3.length, 1);
  assert.equal(suggestions3[0][0], 'AI全景');
});

test('getHighlightSegments and extractBestSnippet correctly extract windows and highlight matched tokens', async () => {
  const { getHighlightSegments, extractBestSnippet } = await import('./knowledgeEngine');

  const content = '在Windows 11环境下，SQLite-vec能够以极低延迟提供纯本地向量嵌入与检索功能。';
  const summary = 'Windows 本地 SQLite-vec 架构设计摘要';

  // 1. Highlight segments
  const segments = getHighlightSegments(content, 'SQLite-vec 向量', ['Windows']);
  const matchedSegments = segments.filter((s) => s.isMatch);
  assert.ok(matchedSegments.some((s) => s.text.toLowerCase() === 'sqlite-vec'));
  assert.ok(matchedSegments.some((s) => s.text === '向量'));
  assert.ok(matchedSegments.some((s) => s.text.toLowerCase() === 'windows'));

  // 2. Best snippet extraction
  const { snippet, matchSource } = extractBestSnippet(content, summary, ['SQLite-vec', '向量'], ['Windows']);
  assert.equal(matchSource, 'content');
  assert.ok(snippet.includes('SQLite-vec'));
  assert.ok(snippet.includes('向量'));
});

test('exportGraphAsJson and exportGraphAsSvg generate valid export files', async () => {
  const {
    buildKnowledgeGraph,
    computeGraphNodePositions,
    exportGraphAsJson,
    exportGraphAsSvg,
  } = await import('./knowledgeEngine');

  const mockItems: KnowledgeItem[] = [
    {
      id: 'item-1',
      title: '主系统设计.dxf',
      category: 'image',
      ext: 'dxf',
      windowsPath: 'D:\\Vault\\system.dxf',
      sizeBytes: 4096,
      createdAt: '2026-10-01',
      updatedAt: '2026-10-02',
      sha256: 'abc1',
      tags: ['系统', '工程'],
      references: ['item-2'],
      summary: '主系统总图',
      content: '主系统内容',
      metadata: {},
    },
    {
      id: 'item-2',
      title: '接口规范.md',
      category: 'document',
      ext: 'md',
      windowsPath: 'D:\\Vault\\api.md',
      sizeBytes: 2048,
      createdAt: '2026-10-02',
      updatedAt: '2026-10-03',
      sha256: 'abc2',
      tags: ['接口'],
      references: [],
      summary: 'API 文档',
      content: '接口设计',
      metadata: {},
    },
    {
      id: 'item-3',
      title: '系统测试用例.py',
      category: 'code',
      ext: 'py',
      windowsPath: 'D:\\Vault\\test.py',
      sizeBytes: 1024,
      createdAt: '2026-10-03',
      updatedAt: '2026-10-04',
      sha256: 'abc3',
      tags: ['系统'],
      references: [],
      summary: '测试脚本',
      content: '自动化测试',
      metadata: {},
    },
  ];

  const graph = buildKnowledgeGraph(mockItems);
  const positions = computeGraphNodePositions(graph.nodes, 880, 520);

  // 1. Test JSON Export
  const jsonExportStr = exportGraphAsJson(graph, mockItems, '2026-10-31T05:50:00.000Z');
  const parsed = JSON.parse(jsonExportStr);
  assert.equal(parsed.version, '1.0');
  assert.equal(parsed.generator, 'OmniKnowledge Knowledge Engine');
  assert.equal(parsed.summary.totalNodes, 3);
  assert.equal(parsed.summary.referenceEdges, 1);
  assert.equal(parsed.summary.tagEdges, 1);
  assert.equal(parsed.nodes.length, 3);
  assert.equal(parsed.nodes[0].id, 'item-1');
  assert.equal(parsed.nodes[0].windowsPath, 'D:\\Vault\\system.dxf');

  // 2. Test SVG Export
  const svgExportStr = exportGraphAsSvg(graph, positions, {
    width: 880,
    height: 520,
    title: 'Test Graph Export',
  });
  assert.ok(svgExportStr.startsWith('<?xml version="1.0" encoding="UTF-8"?>'));
  assert.ok(svgExportStr.includes('<svg xmlns="http://www.w3.org/2000/svg"'));
  assert.ok(svgExportStr.includes('Test Graph Export'));
  assert.ok(svgExportStr.includes('id="node-item-1"'));
  assert.ok(svgExportStr.includes('id="node-item-2"'));
  assert.ok(svgExportStr.includes('</svg>'));
});

test('matchesAutomationRule and applyAutomationRules assign tags and directories correctly', async () => {
  const {
    matchesAutomationRule,
    applyAutomationRules,
  } = await import('./knowledgeEngine');

  const refDate = new Date('2026-10-31T12:00:00Z');

  const testItems: KnowledgeItem[] = [
    {
      id: 'cad-item',
      title: '主梁装配图.dxf',
      category: 'image',
      ext: 'dxf',
      windowsPath: 'D:\\Downloads\\main_beam.dxf',
      sizeBytes: 8192,
      createdAt: '2026-10-25 10:00',
      updatedAt: '2026-10-25 10:00',
      sha256: 'cad1',
      tags: ['CAD'],
      references: [],
      summary: '主梁 DXF 施工图',
      content: '主梁图层结构',
      metadata: {},
    },
    {
      id: 'media-item',
      title: '研讨会录音.flac',
      category: 'media',
      ext: 'flac',
      windowsPath: 'D:\\Recordings\\meeting.flac',
      sizeBytes: 1048576,
      createdAt: '2026-10-10 14:00',
      updatedAt: '2026-10-10 14:00',
      sha256: 'media1',
      tags: ['音频'],
      references: [],
      summary: '高保真音频',
      content: '音频会议记录',
      metadata: {},
    },
  ];

  const rules: AutomationRule[] = [
    {
      id: 'r1',
      name: 'CAD归类与打标',
      enabled: true,
      target: 'ext',
      operator: 'in',
      conditionValue: 'dxf, dwg, step',
      actionType: 'setDirectory',
      actionValue: 'D:\\OmniKnowledge\\01_Engineering_CAD\\',
    },
    {
      id: 'r2',
      name: '近期资产打标',
      enabled: true,
      target: 'createdAgeDays',
      operator: 'newerThanDays',
      conditionValue: '7',
      actionType: 'assignTags',
      actionValue: '近期新增',
    },
    {
      id: 'r3',
      name: '音视频分类打标',
      enabled: true,
      target: 'category',
      operator: 'equals',
      conditionValue: 'media',
      actionType: 'assignTags',
      actionValue: '视听流',
    },
  ];

  // 1. Check matching logic
  assert.equal(matchesAutomationRule(testItems[0], rules[0], refDate), true);
  assert.equal(matchesAutomationRule(testItems[1], rules[0], refDate), false);
  assert.equal(matchesAutomationRule(testItems[0], rules[1], refDate), true); // 6 days old <= 7
  assert.equal(matchesAutomationRule(testItems[1], rules[1], refDate), false); // 21 days old > 7
  assert.equal(matchesAutomationRule(testItems[1], rules[2], refDate), true);

  // 2. Check batch application
  const { updatedItems, totalUpdated, ruleMatchCounts } = applyAutomationRules(testItems, rules, refDate);
  assert.equal(totalUpdated, 2);
  assert.equal(ruleMatchCounts['r1'], 1);
  assert.equal(ruleMatchCounts['r2'], 1);
  assert.equal(ruleMatchCounts['r3'], 1);

  // CAD item should have new directory path and '近期新增' tag appended
  const updatedCad = updatedItems.find((i) => i.id === 'cad-item');
  assert.equal(updatedCad?.windowsPath, 'D:\\OmniKnowledge\\01_Engineering_CAD\\main_beam.dxf');
  assert.ok(updatedCad?.tags.includes('近期新增'));
  assert.ok(updatedCad?.tags.includes('CAD'));

  // Media item should have '视听流' tag appended
  const updatedMedia = updatedItems.find((i) => i.id === 'media-item');
  assert.ok(updatedMedia?.tags.includes('视听流'));
  assert.ok(updatedMedia?.tags.includes('音频'));
});

test('exportItemMetadataAsMarkdown and exportItemMetadataAsCsv produce valid metadata string output', () => {
  const sampleItem: KnowledgeItem = {
    id: 'sample-1',
    title: '工程结构节点设计图.dxf',
    category: 'image',
    ext: 'dxf',
    windowsPath: 'D:\\OmniKnowledge\\01_Engineering_CAD\\sample.dxf',
    sourceUrl: 'https://example.com/truss.dxf',
    sizeBytes: 1048576,
    createdAt: '2026-10-31 01:00',
    updatedAt: '2026-10-31 02:00',
    sha256: 'abc123def456',
    tags: ['工程设计', 'CAD'],
    references: ['ref-item-2'],
    summary: 'CAD结构图概要',
    content: '这是图纸正文解析明细',
    metadata: {},
  };

  const allItems: KnowledgeItem[] = [
    sampleItem,
    {
      id: 'ref-item-2',
      title: '钢结构规范白皮书.pdf',
      category: 'document',
      ext: 'pdf',
      windowsPath: 'D:\\OmniKnowledge\\04_Architecture_Docs\\spec.pdf',
      sizeBytes: 2048,
      createdAt: '2026-10-30',
      updatedAt: '2026-10-30',
      sha256: 'def456',
      tags: ['规范'],
      references: [],
      summary: '规范白皮书摘要',
      content: '规范正文',
      metadata: {},
    },
  ];

  const md = exportItemMetadataAsMarkdown(sampleItem, allItems);
  assert.ok(md.includes('# 工程结构节点设计图.dxf'));
  assert.ok(md.includes('- **条目 ID**: `sample-1`'));
  assert.ok(md.includes('#工程设计'));
  assert.ok(md.includes('[[钢结构规范白皮书.pdf]]'));

  const csv = exportItemMetadataAsCsv(sampleItem, allItems);
  assert.ok(csv.startsWith('ID,Title,Category,Extension,WindowsPath,SourceUrl'));
  assert.ok(csv.includes('sample-1,工程结构节点设计图.dxf,image,dxf'));
  assert.ok(csv.includes('钢结构规范白皮书.pdf'));
});

test('createLocalBackupArchive generates backup snapshot with configured path and estimated size', async () => {
  const { createLocalBackupArchive, DEFAULT_BACKUP_CONFIG } = await import('./knowledgeEngine');
  const mockItems: KnowledgeItem[] = [
    {
      id: 'b1',
      title: 'Test Asset.dxf',
      category: 'image',
      ext: 'dxf',
      windowsPath: 'D:\\OmniKnowledge\\test.dxf',
      sizeBytes: 1000000,
      createdAt: '2026-10-31',
      updatedAt: '2026-10-31',
      sha256: 'xyz',
      tags: ['Test'],
      references: [],
      summary: 'Summary',
      content: 'Content',
      metadata: {},
    },
  ];

  const snapshot = createLocalBackupArchive(mockItems, DEFAULT_BACKUP_CONFIG);
  assert.ok(snapshot.fileName.startsWith('OmniKnowledge_Backup_'));
  assert.ok(snapshot.path.startsWith('D:\\OmniKnowledge\\Backups\\'));
  assert.equal(snapshot.itemCount, 1);
  assert.equal(snapshot.status, 'verified');
  assert.ok(snapshot.sizeBytes > 0);
});

test('exportBackupOperationLogsAsText formats backup timestamp, size, and status into structured text log', async () => {
  const { exportBackupOperationLogsAsText, DEFAULT_BACKUP_CONFIG, INITIAL_BACKUP_SNAPSHOTS } =
    await import('./knowledgeEngine');

  const logOutput = exportBackupOperationLogsAsText(
    INITIAL_BACKUP_SNAPSHOTS,
    DEFAULT_BACKUP_CONFIG,
    '2026-10-31 14:30:00'
  );

  assert.ok(logOutput.includes('OmniKnowledge 知识库 - 系统本地备份操作运行日志记录'));
  assert.ok(logOutput.includes('导出时间: 2026-10-31 14:30:00'));
  assert.ok(logOutput.includes('备份存储目录: D:\\OmniKnowledge\\Backups\\'));
  assert.ok(logOutput.includes('OmniKnowledge_Backup_20261030_0300.zip'));
  assert.ok(logOutput.includes('定时自动'));
  assert.ok(logOutput.includes('[成功/已校验]'));
  assert.ok(logOutput.includes('累计备份快照总数: 3 份'));
});

test('pingSyncNode correctly detects latency and assigns health status (healthy/degraded/offline)', async () => {
  const { pingSyncNode } = await import('./knowledgeEngine');

  const healthyNode = {
    id: 'sync-test-lan',
    name: 'LAN Workstation',
    protocol: 'LocalLAN',
    endpoint: 'https://192.168.1.100:8000',
    localMirrorDir: 'D:\\OmniKnowledge',
    encryption: 'AES-256-GCM',
    status: 'synced' as const,
    lastSyncAt: '2026-10-31 05:00',
    syncedCount: 10,
    pendingDeltaCount: 0,
  };

  const ping1 = pingSyncNode(healthyNode);
  assert.equal(ping1.nodeId, 'sync-test-lan');
  assert.equal(ping1.healthy, true);
  assert.equal(ping1.healthStatus, 'healthy');
  assert.ok(ping1.latencyMs < 90);

  const offlineNode = {
    ...healthyNode,
    id: 'sync-offline-node',
    endpoint: 'unreachable',
  };

  const ping2 = pingSyncNode(offlineNode);
  assert.equal(ping2.healthy, false);
  assert.equal(ping2.healthStatus, 'offline');
  assert.equal(ping2.latencyMs, 999);
});

test('createPersonalVault and createVaultFolder create structured sub-libraries and nested folders', async () => {
  const { createPersonalVault, createVaultFolder } = await import('./knowledgeEngine');

  const vault = createPersonalVault({
    name: '人工智能论文库',
    description: '存放 LLM 与 多模态 Agent 最新研究论文',
    rootPath: 'D:\\OmniKnowledge\\AI_Papers\\',
    coverColor: '#FF9500',
  });

  assert.ok(vault.id.startsWith('vault-'));
  assert.equal(vault.name, '人工智能论文库');
  assert.equal(vault.rootPath, 'D:\\OmniKnowledge\\AI_Papers\\');
  assert.equal(vault.coverColor, '#FF9500');

  const folder = createVaultFolder(vault.id, '01_LLM_Architecture', '/');
  assert.ok(folder.id.startsWith('f-'));
  assert.equal(folder.vaultId, vault.id);
  assert.equal(folder.name, '01_LLM_Architecture');
  assert.equal(folder.path, '/01_LLM_Architecture');
});

test('deletePersonalVault, moveKnowledgeItem and copyKnowledgeItem modify sub-library holdings accurately', async () => {
  const { deletePersonalVault, moveKnowledgeItem, copyKnowledgeItem } = await import('./knowledgeEngine');

  const vaults = [
    { id: 'v1', name: 'Vault 1', description: 'v1', rootPath: 'D:\\v1', createdAt: '2026-10-31', updatedAt: '2026-10-31' },
    { id: 'v2', name: 'Vault 2', description: 'v2', rootPath: 'D:\\v2', createdAt: '2026-10-31', updatedAt: '2026-10-31' },
  ];
  const folders = [
    { id: 'f1', vaultId: 'v1', path: '/sub1', name: 'sub1', parentPath: '/', createdAt: '2026-10-31' },
  ];
  const item: KnowledgeItem = {
    id: 'it1',
    vaultId: 'v1',
    folderPath: '/sub1',
    title: 'Test Note.md',
    category: 'document',
    ext: 'md',
    windowsPath: 'D:\\v1\\sub1\\test.md',
    sizeBytes: 1024,
    createdAt: '2026-10-31',
    updatedAt: '2026-10-31',
    sha256: 'abc',
    tags: ['test'],
    references: [],
    summary: 'Summary',
    content: 'Content',
    metadata: {},
  };

  const moved = moveKnowledgeItem(item, 'v2', '/docs');
  assert.equal(moved.vaultId, 'v2');
  assert.equal(moved.folderPath, '/docs');
  assert.equal(moved.id, 'it1');

  const copied = copyKnowledgeItem(item, 'v2', '/archive');
  assert.equal(copied.vaultId, 'v2');
  assert.equal(copied.folderPath, '/archive');
  assert.notEqual(copied.id, 'it1');
  assert.ok(copied.title.includes('副本'));

  const result = deletePersonalVault('v1', vaults, folders, [item]);
  assert.equal(result.updatedVaults.length, 1);
  assert.equal(result.updatedVaults[0].id, 'v2');
  assert.equal(result.updatedFolders.length, 0);
  assert.equal(result.updatedItems.length, 0);
});






