import React, { useState, useMemo } from 'react';
import JSZip from 'jszip';
import {
  BookOpen,
  Folder,
  FolderPlus,
  FileText,
  Plus,
  Search,
  ArrowLeft,
  Trash2,
  Edit3,
  Move,
  Copy,
  Tag,
  Upload,
  Link,
  ArrowUpDown,
  ChevronRight,
  ChevronDown,
  HardDrive,
  Compass,
  Film,
  FileCode,
  Check,
  X,
  MoreVertical,
  Layers,
  Sparkles,
  Download,
  CheckSquare,
  Square,
  Package,
  LayoutGrid,
  List,
  CheckCircle2,
} from 'lucide-react';
import {
  PersonalVault,
  VaultFolder,
  KnowledgeItem,
  formatBytes,
  createPersonalVault,
  createVaultFolder,
  deletePersonalVault,
  moveKnowledgeItem,
  copyKnowledgeItem,
  CATEGORY_META,
  parseSocialOrWebUrl,
  detectFormatInfo,
  computeEmbedding,
} from '../utils/knowledgeEngine';

interface SubVaultsOverviewViewProps {
  vaults: PersonalVault[];
  vaultFolders: VaultFolder[];
  items: KnowledgeItem[];
  activeVaultId: string | null;
  onSelectVault: (vaultId: string | null) => void;
  onUpdateVaults: (vaults: PersonalVault[]) => void;
  onUpdateFolders: (folders: VaultFolder[]) => void;
  onUpdateItems: (items: KnowledgeItem[]) => void;
  onInspectItem: (item: KnowledgeItem) => void;
  onShowToast: (msg: string) => void;
}

export const SubVaultsOverviewView: React.FC<SubVaultsOverviewViewProps> = ({
  vaults,
  vaultFolders,
  items,
  activeVaultId,
  onSelectVault,
  onUpdateVaults,
  onUpdateFolders,
  onUpdateItems,
  onInspectItem,
  onShowToast,
}) => {
  const [activeFolderPath, setActiveFolderPath] = useState<string>('/');
  const [searchVaultText, setSearchVaultText] = useState<string>('');
  const [searchFileText, setSearchFileText] = useState<string>('');
  const [sortBy, setSortBy] = useState<'title' | 'date' | 'size' | 'ext'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [isCreateVaultModalOpen, setIsCreateVaultModalOpen] = useState(false);
  const [newVaultName, setNewVaultName] = useState('');
  const [newVaultDesc, setNewVaultDesc] = useState('');
  const [newVaultRootPath, setNewVaultRootPath] = useState('');
  const [newVaultColor, setNewVaultColor] = useState('#0071E3');

  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const [isCreateNoteModalOpen, setIsCreateNoteModalOpen] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteTags, setNoteTags] = useState('笔记, 卡片盒');

  const [isImportWebModalOpen, setIsImportWebModalOpen] = useState(false);
  const [webUrlInput, setWebUrlInput] = useState('');
  const [webTitleInput, setWebTitleInput] = useState('');

  const [isImportFileModalOpen, setIsImportFileModalOpen] = useState(false);
  const [importFileName, setImportFileName] = useState('');
  const [importFileExt, setImportFileExt] = useState('dxf');
  const [importFileContent, setImportFileContent] = useState('');

  const [isImportFolderModalOpen, setIsImportFolderModalOpen] = useState(false);
  const [importFolderPathInput, setImportFolderPathInput] = useState('');

  const [isRenameVaultModalOpen, setIsRenameVaultModalOpen] = useState(false);
  const [editingVault, setEditingVault] = useState<PersonalVault | null>(null);
  const [editVaultName, setEditVaultName] = useState('');
  const [editVaultDesc, setEditVaultDesc] = useState('');

  const [isRenameItemModalOpen, setIsRenameItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<KnowledgeItem | null>(null);
  const [editItemTitle, setEditItemTitle] = useState('');

  const [isEditTagsModalOpen, setIsEditTagsModalOpen] = useState(false);
  const [tagEditingItem, setTagEditingItem] = useState<KnowledgeItem | null>(null);
  const [tagInputText, setTagInputText] = useState('');

  const [isMoveCopyModalOpen, setIsMoveCopyModalOpen] = useState(false);
  const [moveCopyTargetItem, setMoveCopyTargetItem] = useState<KnowledgeItem | null>(null);
  const [moveCopyAction, setMoveCopyAction] = useState<'move' | 'copy'>('move');
  const [selectedTargetVaultId, setSelectedTargetVaultId] = useState<string>('');
  const [selectedTargetFolderPath, setSelectedTargetFolderPath] = useState<string>('/');

  const [itemViewMode, setItemViewMode] = useState<'grid' | 'table'>('grid');
  const [isBatchMode, setIsBatchMode] = useState<boolean>(false);
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());
  const [isBatchMoveModalOpen, setIsBatchMoveModalOpen] = useState<boolean>(false);
  const [batchTargetVaultId, setBatchTargetVaultId] = useState<string>('');
  const [batchTargetFolderPath, setBatchTargetFolderPath] = useState<string>('/');
  const [isExportingZip, setIsExportingZip] = useState<boolean>(false);

  const toggleSelectItem = (id: string) => {
    setSelectedItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedItemIds.size === displayedItems.length && displayedItems.length > 0) {
      setSelectedItemIds(new Set());
    } else {
      setSelectedItemIds(new Set(displayedItems.map((i) => i.id)));
    }
  };

  const handleBatchMoveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItemIds.size === 0 || !batchTargetVaultId) return;
    const targetVault = vaults.find((v) => v.id === batchTargetVaultId);
    const rootPath = targetVault?.rootPath || 'D:\\OmniKnowledge\\';

    const updatedItems = items.map((item) => {
      if (!selectedItemIds.has(item.id)) return item;
      const cleanFolder = batchTargetFolderPath === '/' ? '' : batchTargetFolderPath.replace(/\//g, '\\');
      return {
        ...item,
        vaultId: batchTargetVaultId,
        folderPath: batchTargetFolderPath,
        windowsPath: `${rootPath}${cleanFolder}\\${item.title}`.replace(/\\+/g, '\\'),
        updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      };
    });

    onUpdateItems(updatedItems);
    setIsBatchMoveModalOpen(false);
    onShowToast(`已批量移动 ${selectedItemIds.size} 项资产到目标路径`);
    setSelectedItemIds(new Set());
  };

  const handleBatchDelete = () => {
    if (selectedItemIds.size === 0) return;
    if (!confirm(`确定要彻底删除选中的 ${selectedItemIds.size} 个资产文件吗？`)) return;
    const updated = items.filter((i) => !selectedItemIds.has(i.id));
    onUpdateItems(updated);
    onShowToast(`已批量删除 ${selectedItemIds.size} 项资产`);
    setSelectedItemIds(new Set());
  };

  const handleBatchExportZip = async () => {
    const selectedList = items.filter((i) => selectedItemIds.has(i.id));
    if (selectedList.length === 0) {
      onShowToast('请先选择要导出的资产文件');
      return;
    }

    setIsExportingZip(true);
    try {
      const zip = new JSZip();
      const manifest = selectedList.map((i) => ({
        id: i.id,
        title: i.title,
        category: i.category,
        ext: i.ext,
        sizeBytes: i.sizeBytes,
        tags: i.tags,
        folderPath: i.folderPath,
        windowsPath: i.windowsPath,
        sourceUrl: i.sourceUrl,
        sha256: i.sha256,
        createdAt: i.createdAt,
        updatedAt: i.updatedAt,
        summary: i.summary,
        metadata: i.metadata,
      }));

      zip.file('metadata_manifest.json', JSON.stringify(manifest, null, 2));

      let readme = `# OmniKnowledge 知识库批量导出清单\n\n`;
      readme += `导出时间: ${new Date().toLocaleString('zh-CN')}\n`;
      readme += `导出数量: ${selectedList.length} 项资产\n`;
      readme += `所属知识库: ${activeVault?.name || '个人知识库'}\n\n`;
      readme += `## 导出文件索引表\n\n`;

      selectedList.forEach((item, index) => {
        const cleanFolderPath = (item.folderPath || '/').replace(/^\//, '');
        const zipFilePath = cleanFolderPath ? `assets/${cleanFolderPath}/${item.title}` : `assets/${item.title}`;
        const fileContent = item.content || item.summary || `# ${item.title}\n\n${item.summary}`;
        zip.file(zipFilePath, fileContent);

        readme += `${index + 1}. **${item.title}** (${item.ext.toUpperCase()}, ${formatBytes(item.sizeBytes)})\n`;
        readme += `   - 内部路径: \`${zipFilePath}\`\n`;
        readme += `   - 标签分类: ${item.tags.join(', ') || '无'}\n`;
        readme += `   - SHA-256 签名: \`${item.sha256}\`\n`;
        readme += `   - 原路径: \`${item.windowsPath}\`\n\n`;
      });

      zip.file('README_export.md', readme);

      const content = await zip.generateAsync({ type: 'blob' });
      const downloadUrl = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `OmniKnowledge_Export_${activeVault?.name || 'Vault'}_${Date.now()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);

      onShowToast(`成功打包导出 ${selectedList.length} 项资产 (含元数据清单)`);
    } catch (err) {
      console.error(err);
      onShowToast('导出 ZIP 压缩包失败，请重试');
    } finally {
      setIsExportingZip(false);
    }
  };

  const activeVault = useMemo(
    () => vaults.find((v) => v.id === activeVaultId) || null,
    [vaults, activeVaultId]
  );

  const activeVaultFolders = useMemo(() => {
    if (!activeVaultId) return [];
    return vaultFolders.filter((f) => f.vaultId === activeVaultId);
  }, [vaultFolders, activeVaultId]);

  const activeVaultItems = useMemo(() => {
    if (!activeVaultId) return [];
    return items.filter((i) => i.vaultId === activeVaultId);
  }, [items, activeVaultId]);

  const folderItemCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const item of activeVaultItems) {
      const p = item.folderPath || '/';
      counts[p] = (counts[p] || 0) + 1;
    }
    return counts;
  }, [activeVaultItems]);

  const filteredVaults = useMemo(() => {
    if (!searchVaultText.trim()) return vaults;
    const q = searchVaultText.toLowerCase();
    return vaults.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.description.toLowerCase().includes(q) ||
        v.rootPath.toLowerCase().includes(q)
    );
  }, [vaults, searchVaultText]);

  const displayedItems = useMemo(() => {
    let list = activeVaultItems;
    if (activeFolderPath !== '/') {
      list = list.filter(
        (i) => (i.folderPath || '/') === activeFolderPath || (i.folderPath || '/').startsWith(activeFolderPath + '/')
      );
    }
    if (searchFileText.trim()) {
      const q = searchFileText.toLowerCase();
      list = list.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.ext.toLowerCase().includes(q) ||
          i.summary.toLowerCase().includes(q) ||
          i.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    return [...list].sort((a, b) => {
      let result = 0;
      if (sortBy === 'title') {
        result = a.title.localeCompare(b.title, 'zh-CN');
      } else if (sortBy === 'date') {
        result = a.updatedAt.localeCompare(b.updatedAt);
      } else if (sortBy === 'size') {
        result = a.sizeBytes - b.sizeBytes;
      } else if (sortBy === 'ext') {
        result = a.ext.localeCompare(b.ext);
      }
      return sortOrder === 'asc' ? result : -result;
    });
  }, [activeVaultItems, activeFolderPath, searchFileText, sortBy, sortOrder]);

  const handleCreateVaultSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVaultName.trim()) return;
    const newVault = createPersonalVault({
      name: newVaultName,
      description: newVaultDesc || '新建个人离线全格式知识库',
      rootPath: newVaultRootPath || `D:\\OmniKnowledge\\${newVaultName.trim()}\\`,
      coverColor: newVaultColor,
    });
    onUpdateVaults([...vaults, newVault]);
    setIsCreateVaultModalOpen(false);
    setNewVaultName('');
    setNewVaultDesc('');
    setNewVaultRootPath('');
    onShowToast(`已创建个人知识库「${newVault.name}」`);
  };

  const handleSaveVaultEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVault || !editVaultName.trim()) return;
    onUpdateVaults(
      vaults.map((v) =>
        v.id === editingVault.id
          ? { ...v, name: editVaultName.trim(), description: editVaultDesc.trim(), updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16) }
          : v
      )
    );
    setIsRenameVaultModalOpen(false);
    setEditingVault(null);
    onShowToast('知识库基本信息已更新');
  };

  const handleDeleteVault = (v: PersonalVault) => {
    if (!confirm(`确定要彻底删除知识库「${v.name}」及其内部关联文件夹与资产吗？`)) return;
    const { updatedVaults, updatedFolders, updatedItems } = deletePersonalVault(v.id, vaults, vaultFolders, items);
    onUpdateVaults(updatedVaults);
    onUpdateFolders(updatedFolders);
    onUpdateItems(updatedItems);
    if (activeVaultId === v.id) {
      onSelectVault(null);
    }
    onShowToast(`已删除知识库「${v.name}」`);
  };

  const handleCreateFolderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeVaultId || !newFolderName.trim()) return;
    const folder = createVaultFolder(activeVaultId, newFolderName, activeFolderPath);
    onUpdateFolders([...vaultFolders, folder]);
    setIsCreateFolderModalOpen(false);
    setNewFolderName('');
    onShowToast(`已创建文件夹「${folder.name}」`);
  };

  const handleDeleteFolder = (folder: VaultFolder) => {
    if (!confirm(`确定要删除文件夹「${folder.name}」吗？`)) return;
    onUpdateFolders(vaultFolders.filter((f) => f.id !== folder.id));
    onShowToast(`已删除文件夹「${folder.name}」`);
  };

  const handleCreateNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeVaultId || !noteTitle.trim()) return;
    const cleanTags = noteTags.split(/[,，]/).map((t) => t.trim()).filter(Boolean);
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const newItem: KnowledgeItem = {
      id: `note-${Date.now()}`,
      vaultId: activeVaultId,
      folderPath: activeFolderPath,
      title: noteTitle.endsWith('.md') ? noteTitle : `${noteTitle}.md`,
      category: 'document',
      ext: 'md',
      windowsPath: `${activeVault?.rootPath || 'D:\\OmniKnowledge\\'}${activeFolderPath.replace(/\//g, '\\')}\\${noteTitle}.md`,
      sizeBytes: new Blob([noteContent]).size || 512,
      createdAt: now,
      updatedAt: now,
      sha256: Math.random().toString(16).slice(2, 14),
      tags: cleanTags.length > 0 ? cleanTags : ['个人笔记'],
      references: [],
      summary: `【个人笔记】${noteTitle}：${noteContent.slice(0, 80)}...`,
      content: noteContent || `# ${noteTitle}\n\n写下你的思考与卡片盒笔记...`,
      metadata: { lineCount: noteContent.split('\n').length },
      embedding: computeEmbedding(`${noteTitle} ${noteContent} ${cleanTags.join(' ')}`),
    };

    onUpdateItems([newItem, ...items]);
    setIsCreateNoteModalOpen(false);
    setNoteTitle('');
    setNoteContent('');
    onShowToast(`已新建笔记「${newItem.title}」`);
  };

  const handleImportWebSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeVaultId || !webUrlInput.trim()) return;
    const parsed = parseSocialOrWebUrl(webUrlInput);
    if (!parsed.isValid) {
      alert('请输入有效的网页 URL 链接');
      return;
    }
    const title = webTitleInput.trim() || parsed.suggestedTitle || '网页剪藏';
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const newItem: KnowledgeItem = {
      id: `web-${Date.now()}`,
      vaultId: activeVaultId,
      folderPath: activeFolderPath,
      title: `${title}.url`,
      category: parsed.category,
      ext: 'url',
      sourceUrl: parsed.normalizedUrl,
      windowsPath: `${activeVault?.rootPath || 'D:\\OmniKnowledge\\'}${activeFolderPath.replace(/\//g, '\\')}\\${title}.url`,
      sizeBytes: 1024,
      createdAt: now,
      updatedAt: now,
      sha256: Math.random().toString(16).slice(2, 14),
      tags: [parsed.platformName, '网页剪藏'],
      references: [],
      summary: `【${parsed.platformName} 采集】${title}`,
      content: `网页标题: ${title}\n来源链接: ${parsed.normalizedUrl}\n抓取引擎: OmniKnowledge Web Clipper 2.0\n采样内容: 包含完整网页 DOM 节点与高精快照解析`,
      metadata: { authorOrAccount: parsed.platformName, platformName: parsed.platformName },
      embedding: computeEmbedding(`${title} ${parsed.platformName} ${parsed.normalizedUrl}`),
    };

    onUpdateItems([newItem, ...items]);
    setIsImportWebModalOpen(false);
    setWebUrlInput('');
    setWebTitleInput('');
    onShowToast(`已导入网页链接「${title}」`);
  };

  const handleImportFileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeVaultId || !importFileName.trim()) return;
    const cleanExt = importFileExt.trim().toLowerCase().replace(/^\./, '');
    const spec = detectFormatInfo(`file.${cleanExt}`);
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const fullTitle = importFileName.endsWith(`.${cleanExt}`) ? importFileName : `${importFileName}.${cleanExt}`;

    const newItem: KnowledgeItem = {
      id: `file-${Date.now()}`,
      vaultId: activeVaultId,
      folderPath: activeFolderPath,
      title: fullTitle,
      category: spec.category,
      ext: cleanExt,
      windowsPath: `${activeVault?.rootPath || 'D:\\OmniKnowledge\\'}${activeFolderPath.replace(/\//g, '\\')}\\${fullTitle}`,
      sizeBytes: 1024 * 1024 * (Math.floor(Math.random() * 20) + 1),
      createdAt: now,
      updatedAt: now,
      sha256: Math.random().toString(16).slice(2, 14),
      tags: [spec.label, cleanExt.toUpperCase()],
      references: [],
      summary: `【格式解包】${fullTitle} (${spec.label})，管线: ${spec.decoderPipeline}`,
      content: importFileContent || `OmniKnowledge 自动为 ${fullTitle} 完成 60+ 格式层级解包与矢量索引构建。`,
      metadata: { layers: spec.supportsLayers ? ['MAIN_LAYER', 'ANNOTATIONS'] : undefined },
      embedding: computeEmbedding(`${fullTitle} ${spec.label} ${importFileContent}`),
    };

    onUpdateItems([newItem, ...items]);
    setIsImportFileModalOpen(false);
    setImportFileName('');
    setImportFileContent('');
    onShowToast(`已导入文件「${newItem.title}」`);
  };

  const handleImportFolderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeVaultId || !importFolderPathInput.trim()) return;
    const pathStr = importFolderPathInput.trim();
    const folderName = pathStr.split(/[\\/]/).filter(Boolean).pop() || 'Imported_Folder';
    const folder = createVaultFolder(activeVaultId, folderName, activeFolderPath);
    onUpdateFolders([...vaultFolders, folder]);
    setIsImportFolderModalOpen(false);
    setImportFolderPathInput('');
    onShowToast(`已导入文件夹层级结构「${folderName}」`);
  };

  const handleRenameItemSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editItemTitle.trim()) return;
    onUpdateItems(
      items.map((i) =>
        i.id === editingItem.id
          ? { ...i, title: editItemTitle.trim(), updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16) }
          : i
      )
    );
    setIsRenameItemModalOpen(false);
    setEditingItem(null);
    onShowToast('文件重命名成功');
  };

  const handleSaveTagsEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagEditingItem) return;
    const cleanTags = tagInputText.split(/[,，]/).map((t) => t.trim().replace(/^#/, '')).filter(Boolean);
    onUpdateItems(
      items.map((i) => (i.id === tagEditingItem.id ? { ...i, tags: cleanTags } : i))
    );
    setIsEditTagsModalOpen(false);
    setTagEditingItem(null);
    onShowToast('文件标签已成功更新');
  };

  const handleMoveCopySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!moveCopyTargetItem || !selectedTargetVaultId) return;
    if (moveCopyAction === 'move') {
      const moved = moveKnowledgeItem(moveCopyTargetItem, selectedTargetVaultId, selectedTargetFolderPath);
      onUpdateItems(items.map((i) => (i.id === moved.id ? moved : i)));
      onShowToast(`已移动「${moved.title}」`);
    } else {
      const copied = copyKnowledgeItem(moveCopyTargetItem, selectedTargetVaultId, selectedTargetFolderPath);
      onUpdateItems([copied, ...items]);
      onShowToast(`已复制副本「${copied.title}」`);
    }
    setIsMoveCopyModalOpen(false);
    setMoveCopyTargetItem(null);
  };

  const handleDeleteItem = (item: KnowledgeItem) => {
    if (!confirm(`确定要删除文件「${item.title}」吗？`)) return;
    onUpdateItems(items.filter((i) => i.id !== item.id));
    onShowToast(`已删除「${item.title}」`);
  };

  if (!activeVault) {
    return (
      <div className="h-full flex flex-col bg-[#F5F5F7] text-[#1D1D1F] overflow-hidden">
        <header className="h-14 px-6 border-b border-black/[0.08] bg-white/70 backdrop-blur-xl flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-[#0071E3] text-white flex items-center justify-center font-bold text-sm shadow-xs">
              <BookOpen className="w-4.5 h-4.5" />
            </span>
            <div>
              <h1 className="text-base font-bold tracking-tight text-[#1D1D1F]">
                个人知识库总览
              </h1>
              <p className="text-[11px] text-[#86868B]">
                多子库卡片规整排列 · 独立文件树目录 · 全格式向量离线存储
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#86868B]" />
              <input
                type="text"
                placeholder="搜索知识库名称或存储路径..."
                value={searchVaultText}
                onChange={(e) => setSearchVaultText(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#EBEBF0] border border-transparent rounded-lg focus:outline-none focus:bg-white focus:border-[#0071E3]/50 transition-all placeholder:text-[#86868B]"
              />
            </div>
            <button
              type="button"
              onClick={() => setIsCreateVaultModalOpen(true)}
              className="px-3.5 py-1.5 rounded-lg bg-[#0071E3] text-white text-xs font-semibold hover:bg-[#0071E3]/90 transition-all flex items-center gap-1.5 shadow-xs active:scale-[0.98]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>新建个人知识库</span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {filteredVaults.map((vault) => {
                const vaultItems = items.filter((i) => i.vaultId === vault.id);
                const totalBytes = vaultItems.reduce((acc, i) => acc + i.sizeBytes, 0);

                return (
                  <div
                    key={vault.id}
                    onClick={() => onSelectVault(vault.id)}
                    className="group relative bg-white border border-black/[0.08] rounded-2xl p-5 hover:shadow-xl hover:border-[#0071E3]/40 transition-all duration-200 cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <span
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-xs transition-transform group-hover:scale-105"
                          style={{ backgroundColor: vault.coverColor || '#0071E3' }}
                        >
                          <BookOpen className="w-5 h-5" />
                        </span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingVault(vault);
                              setEditVaultName(vault.name);
                              setEditVaultDesc(vault.description);
                              setIsRenameVaultModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-[#86868B] hover:bg-[#F5F5F7] hover:text-[#1D1D1F]"
                            title="重命名 / 编辑"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteVault(vault);
                            }}
                            className="p-1.5 rounded-lg text-[#86868B] hover:bg-red-50 hover:text-red-600"
                            title="删除知识库"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <h3 className="text-sm font-bold text-[#1D1D1F] tracking-tight group-hover:text-[#0071E3] transition-colors line-clamp-1">
                        {vault.name}
                      </h3>
                      <p className="text-[12px] text-[#86868B] mt-1 line-clamp-2 leading-relaxed">
                        {vault.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-black/[0.05] space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-[#86868B] font-mono">
                        <span>容量资产</span>
                        <span className="font-semibold text-[#1D1D1F]">
                          {vaultItems.length} 项 / {formatBytes(totalBytes)}
                        </span>
                      </div>
                      <div className="text-[10px] text-[#86868B] font-mono truncate" title={vault.rootPath}>
                        {vault.rootPath}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>

        {isCreateVaultModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-black/[0.1] rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-[#1D1D1F]">新建个人知识库</h3>
                <button
                  type="button"
                  onClick={() => setIsCreateVaultModalOpen(false)}
                  className="p-1 text-[#86868B] hover:text-[#1D1D1F]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateVaultSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-[#1D1D1F] font-semibold mb-1">知识库名称 *</label>
                  <input
                    type="text"
                    required
                    placeholder="例如：个人论文与研讨会知识库"
                    value={newVaultName}
                    onChange={(e) => setNewVaultName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F5F5F7] border border-black/[0.1] rounded-lg focus:outline-none focus:border-[#0071E3]"
                  />
                </div>

                <div>
                  <label className="block text-[#1D1D1F] font-semibold mb-1">简短描述说明</label>
                  <textarea
                    rows={2}
                    placeholder="说明该知识库主要存储的文件格式或业务领域..."
                    value={newVaultDesc}
                    onChange={(e) => setNewVaultDesc(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F5F5F7] border border-black/[0.1] rounded-lg focus:outline-none focus:border-[#0071E3]"
                  />
                </div>

                <div>
                  <label className="block text-[#1D1D1F] font-semibold mb-1">Windows 本地目录根路径</label>
                  <input
                    type="text"
                    placeholder="D:\OmniKnowledge\AI_Research\"
                    value={newVaultRootPath}
                    onChange={(e) => setNewVaultRootPath(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F5F5F7] border border-black/[0.1] rounded-lg focus:outline-none focus:border-[#0071E3] font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="block text-[#1D1D1F] font-semibold mb-1">主题标识色</label>
                  <div className="flex items-center gap-2">
                    {['#0071E3', '#5856D6', '#AF52DE', '#FF9500', '#34C759', '#FF2D55'].map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setNewVaultColor(color)}
                        className={`w-6 h-6 rounded-full transition-transform ${
                          newVaultColor === color ? 'scale-110 ring-2 ring-offset-2 ring-[#0071E3]' : 'opacity-80 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateVaultModalOpen(false)}
                    className="px-4 py-2 rounded-lg bg-[#EBEBF0] text-[#1D1D1F] hover:bg-[#EBEBF0]/80 font-medium"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-[#0071E3] text-white hover:bg-[#0071E3]/90 font-semibold shadow-xs"
                  >
                    确定创建
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isRenameVaultModalOpen && editingVault && (
          <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-black/[0.1] rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-[#1D1D1F]">重命名知识库</h3>
                <button
                  type="button"
                  onClick={() => setIsRenameVaultModalOpen(false)}
                  className="p-1 text-[#86868B] hover:text-[#1D1D1F]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveVaultEdit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-[#1D1D1F] font-semibold mb-1">知识库名称</label>
                  <input
                    type="text"
                    required
                    value={editVaultName}
                    onChange={(e) => setEditVaultName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F5F5F7] border border-black/[0.1] rounded-lg focus:outline-none focus:border-[#0071E3]"
                  />
                </div>

                <div>
                  <label className="block text-[#1D1D1F] font-semibold mb-1">描述说明</label>
                  <textarea
                    rows={2}
                    value={editVaultDesc}
                    onChange={(e) => setEditVaultDesc(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F5F5F7] border border-black/[0.1] rounded-lg focus:outline-none focus:border-[#0071E3]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsRenameVaultModalOpen(false)}
                    className="px-4 py-2 rounded-lg bg-[#EBEBF0] text-[#1D1D1F] hover:bg-[#EBEBF0]/80 font-medium"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-[#0071E3] text-white hover:bg-[#0071E3]/90 font-semibold shadow-xs"
                  >
                    保存修改
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#F5F5F7] text-[#1D1D1F] overflow-hidden">
      <header className="h-14 px-5 border-b border-black/[0.08] bg-white/70 backdrop-blur-xl flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onSelectVault(null)}
            className="p-1.5 rounded-lg text-[#86868B] hover:text-[#1D1D1F] hover:bg-[#EBEBF0] transition-colors"
            title="返回知识库总览"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span
            className="w-7 h-7 rounded-lg text-white flex items-center justify-center font-bold text-xs shadow-2xs"
            style={{ backgroundColor: activeVault.coverColor || '#0071E3' }}
          >
            <BookOpen className="w-4 h-4" />
          </span>
          <div className="flex items-center gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => onSelectVault(null)}
              className="text-[#86868B] hover:text-[#1D1D1F]"
            >
              知识库总览
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-[#86868B]" />
            <span className="font-bold text-[#1D1D1F]">{activeVault.name}</span>
            {activeFolderPath !== '/' && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-[#86868B]" />
                <span className="font-mono text-[#86868B]">{activeFolderPath}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#86868B]" />
            <input
              type="text"
              placeholder="搜索当前子库文件..."
              value={searchFileText}
              onChange={(e) => setSearchFileText(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#EBEBF0] border border-transparent rounded-lg focus:outline-none focus:bg-white focus:border-[#0071E3]/50 transition-all placeholder:text-[#86868B]"
            />
          </div>

          <div className="flex items-center bg-[#EBEBF0] rounded-lg p-0.5 text-xs">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent border-none text-[11px] font-semibold text-[#1D1D1F] focus:outline-none px-2 py-1"
            >
              <option value="date">按修改时间</option>
              <option value="title">按文件名</option>
              <option value="size">按文件大小</option>
              <option value="ext">按扩展格式</option>
            </select>
            <button
              type="button"
              onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
              className="p-1 rounded text-[#86868B] hover:text-[#1D1D1F]"
              title={sortOrder === 'asc' ? '升序' : '降序'}
            >
              <ArrowUpDown className="w-3 h-3" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex min-h-0 overflow-hidden">
        <aside className="w-64 bg-white/60 backdrop-blur-xl border-r border-black/[0.08] flex flex-col shrink-0">
          <div className="p-3 border-b border-black/[0.05] flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#86868B] tracking-tight flex items-center gap-1.5">
              <Folder className="w-3.5 h-3.5 text-[#0071E3]" />
              <span>文件树目录</span>
            </span>
            <button
              type="button"
              onClick={() => setIsCreateFolderModalOpen(true)}
              className="p-1 rounded text-[#0071E3] hover:bg-[#EBEBF0] transition-colors"
              title="新建文件夹"
            >
              <FolderPlus className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-0.5 text-xs font-mono">
            <button
              type="button"
              onClick={() => setActiveFolderPath('/')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                activeFolderPath === '/' ? 'bg-[#0071E3] text-white font-bold' : 'text-[#1D1D1F] hover:bg-[#EBEBF0]'
              }`}
            >
              <span className="flex items-center gap-2 truncate">
                <HardDrive className="w-3.5 h-3.5 shrink-0" />
                <span>/ (根目录)</span>
              </span>
              <span className="text-[10px] opacity-80 tabular-nums">
                {activeVaultItems.length}
              </span>
            </button>

            {activeVaultFolders.map((folder) => {
              const isActive = activeFolderPath === folder.path;
              const count = folderItemCounts[folder.path] || 0;

              return (
                <div key={folder.id} className="group relative flex items-center">
                  <button
                    type="button"
                    onClick={() => setActiveFolderPath(folder.path)}
                    className={`w-full flex items-center justify-between pl-6 pr-2.5 py-1.5 rounded-lg text-left transition-colors ${
                      isActive ? 'bg-[#0071E3] text-white font-bold' : 'text-[#1D1D1F] hover:bg-[#EBEBF0]'
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <Folder className="w-3.5 h-3.5 shrink-0" />
                      <span>{folder.name}</span>
                    </span>
                    <span className="text-[10px] opacity-80 tabular-nums">
                      {count}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteFolder(folder)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-50 rounded absolute right-1 top-1/2 -translate-y-1/2"
                    title="删除文件夹"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </aside>

        <main className="flex-1 flex flex-col min-w-0 bg-white overflow-hidden">
          <div className="p-3 border-b border-black/[0.08] bg-[#F9F9FB] flex items-center justify-between gap-2 overflow-x-auto shrink-0">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsCreateNoteModalOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-[#0071E3] text-white text-xs font-semibold hover:bg-[#0071E3]/90 transition-all flex items-center gap-1.5 shadow-2xs"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>新建笔记</span>
              </button>
              <button
                type="button"
                onClick={() => setIsImportFileModalOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-[#EBEBF0] text-[#1D1D1F] text-xs font-semibold hover:bg-[#EBEBF0]/80 transition-all flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>导入文件</span>
              </button>
              <button
                type="button"
                onClick={() => setIsImportWebModalOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-[#EBEBF0] text-[#1D1D1F] text-xs font-semibold hover:bg-[#EBEBF0]/80 transition-all flex items-center gap-1.5"
              >
                <Link className="w-3.5 h-3.5" />
                <span>导入网页链接</span>
              </button>
              <button
                type="button"
                onClick={() => setIsCreateFolderModalOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-[#EBEBF0] text-[#1D1D1F] text-xs font-semibold hover:bg-[#EBEBF0]/80 transition-all flex items-center gap-1.5"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                <span>新建文件夹</span>
              </button>
              <button
                type="button"
                onClick={() => setIsImportFolderModalOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-[#EBEBF0] text-[#1D1D1F] text-xs font-semibold hover:bg-[#EBEBF0]/80 transition-all flex items-center gap-1.5"
              >
                <Folder className="w-3.5 h-3.5" />
                <span>导入文件夹</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center bg-[#EBEBF0] rounded-lg p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setItemViewMode('grid')}
                  className={`p-1.5 rounded-md transition-all ${
                    itemViewMode === 'grid' ? 'bg-white text-[#0071E3] shadow-2xs' : 'text-[#86868B] hover:text-[#1D1D1F]'
                  }`}
                  title="卡片排列视图"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setItemViewMode('table')}
                  className={`p-1.5 rounded-md transition-all ${
                    itemViewMode === 'table' ? 'bg-white text-[#0071E3] shadow-2xs' : 'text-[#86868B] hover:text-[#1D1D1F]'
                  }`}
                  title="表格列表视图"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsBatchMode((prev) => !prev);
                  setSelectedItemIds(new Set());
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  isBatchMode
                    ? 'bg-[#0071E3] text-white shadow-2xs'
                    : 'bg-[#EBEBF0] text-[#1D1D1F] hover:bg-[#EBEBF0]/80'
                }`}
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>{isBatchMode ? '退出批量' : '批量操作'}</span>
              </button>

              <span className="text-[11px] font-mono text-[#86868B]">
                共 {displayedItems.length} 个条目
              </span>
            </div>
          </div>

          {isBatchMode && (
            <div className="bg-[#0071E3]/10 border-b border-[#0071E3]/20 px-4 py-2.5 flex items-center justify-between gap-3 text-xs shrink-0">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="px-2.5 py-1 rounded-md bg-white border border-black/[0.1] text-[#1D1D1F] font-medium hover:bg-[#F5F5F7] flex items-center gap-1.5 shadow-2xs"
                >
                  {selectedItemIds.size === displayedItems.length && displayedItems.length > 0 ? (
                    <CheckSquare className="w-3.5 h-3.5 text-[#0071E3]" />
                  ) : (
                    <Square className="w-3.5 h-3.5 text-[#86868B]" />
                  )}
                  <span>
                    {selectedItemIds.size === displayedItems.length && displayedItems.length > 0
                      ? '取消全选'
                      : '全选本页'}
                  </span>
                </button>
                <span className="font-semibold text-[#0071E3] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  已选择 <span className="font-mono text-sm underline">{selectedItemIds.size}</span> / {displayedItems.length} 项资产
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={selectedItemIds.size === 0 || isExportingZip}
                  onClick={handleBatchExportZip}
                  className="px-3 py-1.5 rounded-lg bg-[#0071E3] text-white font-semibold hover:bg-[#0071E3]/90 disabled:opacity-50 flex items-center gap-1.5 shadow-2xs transition-all"
                >
                  {isExportingZip ? (
                    <Package className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  <span>批量导出压缩包 (.zip)</span>
                </button>

                <button
                  type="button"
                  disabled={selectedItemIds.size === 0}
                  onClick={() => {
                    setBatchTargetVaultId(activeVaultId || vaults[0]?.id || '');
                    setBatchTargetFolderPath(activeFolderPath);
                    setIsBatchMoveModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#5856D6] text-white font-semibold hover:bg-[#5856D6]/90 disabled:opacity-50 flex items-center gap-1.5 shadow-2xs transition-all"
                >
                  <Move className="w-3.5 h-3.5" />
                  <span>批量移动</span>
                </button>

                <button
                  type="button"
                  disabled={selectedItemIds.size === 0}
                  onClick={handleBatchDelete}
                  className="px-3 py-1.5 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-50 flex items-center gap-1.5 shadow-2xs transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>批量删除</span>
                </button>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto">
            {displayedItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-[#86868B]">
                <BookOpen className="w-12 h-12 stroke-[1.2] mb-3 text-[#86868B]/40" />
                <h3 className="text-sm font-bold text-[#1D1D1F]">当前文件夹下暂无文件资产</h3>
                <p className="text-xs text-[#86868B] max-w-sm mt-1">
                  点击顶部按钮新建笔记、导入 60+ 格式文件或直接引入微信/网页链接。
                </p>
              </div>
            ) : itemViewMode === 'grid' ? (
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {displayedItems.map((item) => {
                  const isSelected = selectedItemIds.has(item.id);
                  const catMeta = CATEGORY_META[item.category] || CATEGORY_META.document;

                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        if (isBatchMode) {
                          toggleSelectItem(item.id);
                        } else {
                          onInspectItem(item);
                        }
                      }}
                      className={`group relative bg-white border rounded-2xl p-4 transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-[#0071E3] bg-[#0071E3]/[0.02] shadow-md ring-2 ring-[#0071E3]/20'
                          : 'border-black/[0.08] hover:border-[#0071E3]/40 hover:shadow-lg'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2.5">
                          <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-[#EBEBF0] text-[#1D1D1F] uppercase tracking-wider">
                            {item.ext}
                          </span>

                          {isBatchMode ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSelectItem(item.id);
                              }}
                              className="p-1 rounded text-[#0071E3] hover:scale-110 transition-transform"
                            >
                              {isSelected ? (
                                <CheckSquare className="w-5 h-5 text-[#0071E3]" />
                              ) : (
                                <Square className="w-5 h-5 text-[#86868B]" />
                              )}
                            </button>
                          ) : (
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingItem(item);
                                  setEditItemTitle(item.title);
                                  setIsRenameItemModalOpen(true);
                                }}
                                className="p-1.5 rounded-md hover:bg-[#F5F5F7] text-[#86868B]"
                                title="重命名"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setMoveCopyTargetItem(item);
                                  setMoveCopyAction('move');
                                  setSelectedTargetVaultId(activeVaultId || vaults[0]?.id || '');
                                  setSelectedTargetFolderPath(activeFolderPath);
                                  setIsMoveCopyModalOpen(true);
                                }}
                                className="p-1.5 rounded-md hover:bg-[#F5F5F7] text-[#86868B]"
                                title="移动到..."
                              >
                                <Move className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteItem(item);
                                }}
                                className="p-1.5 rounded-md hover:bg-red-50 text-red-500"
                                title="删除文件"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>

                        <h4 className="text-xs font-bold text-[#1D1D1F] group-hover:text-[#0071E3] transition-colors line-clamp-1">
                          {item.title}
                        </h4>

                        <p className="text-[11px] text-[#86868B] mt-1.5 line-clamp-2 leading-relaxed">
                          {item.summary}
                        </p>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-black/[0.05] space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] text-[#86868B]">
                          <span className="font-mono">{formatBytes(item.sizeBytes)}</span>
                          <span className="font-mono">{item.updatedAt}</span>
                        </div>

                        <div className="flex items-center gap-1 flex-wrap">
                          {item.tags.slice(0, 3).map((t) => (
                            <span
                              key={t}
                              className="px-1.5 py-0.5 rounded bg-[#F5F5F7] text-[#86868B] text-[9px]"
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F5F5F7] border-b border-black/[0.05] text-[#86868B] font-semibold sticky top-0">
                  <tr>
                    {isBatchMode && <th className="px-3 py-2.5 w-10 text-center">选择</th>}
                    <th className="px-4 py-2.5">文件名 & 格式</th>
                    <th className="px-4 py-2.5">目录路径</th>
                    <th className="px-4 py-2.5">类别</th>
                    <th className="px-4 py-2.5">大小</th>
                    <th className="px-4 py-2.5">标签</th>
                    <th className="px-4 py-2.5">更新时间</th>
                    <th className="px-4 py-2.5 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.05]">
                  {displayedItems.map((item) => {
                    const isSelected = selectedItemIds.has(item.id);
                    const catMeta = CATEGORY_META[item.category] || CATEGORY_META.document;

                    return (
                      <tr
                        key={item.id}
                        onClick={() => {
                          if (isBatchMode) {
                            toggleSelectItem(item.id);
                          } else {
                            onInspectItem(item);
                          }
                        }}
                        className={`hover:bg-[#F5F5F7]/70 transition-colors cursor-pointer group ${
                          isSelected ? 'bg-[#0071E3]/[0.04]' : ''
                        }`}
                      >
                        {isBatchMode && (
                          <td className="px-3 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => toggleSelectItem(item.id)}
                              className="p-1 text-[#0071E3]"
                            >
                              {isSelected ? (
                                <CheckSquare className="w-4 h-4 text-[#0071E3]" />
                              ) : (
                                <Square className="w-4 h-4 text-[#86868B]" />
                              )}
                            </button>
                          </td>
                        )}

                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-[#EBEBF0] text-[#1D1D1F] uppercase">
                              {item.ext}
                            </span>
                            <span className="font-semibold text-[#1D1D1F] group-hover:text-[#0071E3] transition-colors truncate max-w-xs">
                              {item.title}
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-3 font-mono text-[11px] text-[#86868B]">
                          {item.folderPath || '/'}
                        </td>

                        <td className="px-4 py-3 text-[#86868B]">
                          {catMeta.name}
                        </td>

                        <td className="px-4 py-3 font-mono text-[11px] text-[#86868B]">
                          {formatBytes(item.sizeBytes)}
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 flex-wrap">
                            {item.tags.map((t) => (
                              <span
                                key={t}
                                className="px-1.5 py-0.5 rounded bg-[#EBEBF0] text-[#86868B] text-[10px]"
                              >
                                #{t}
                              </span>
                            ))}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setTagEditingItem(item);
                                setTagInputText(item.tags.join(', '));
                                setIsEditTagsModalOpen(true);
                              }}
                              className="p-1 rounded text-[#86868B] hover:text-[#0071E3] hover:bg-[#EBEBF0]"
                              title="编辑标签"
                            >
                              <Tag className="w-3 h-3" />
                            </button>
                          </div>
                        </td>

                        <td className="px-4 py-3 font-mono text-[11px] text-[#86868B]">
                          {item.updatedAt}
                        </td>

                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingItem(item);
                                setEditItemTitle(item.title);
                                setIsRenameItemModalOpen(true);
                              }}
                              className="p-1.5 rounded hover:bg-[#EBEBF0] text-[#86868B]"
                              title="重命名"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setMoveCopyTargetItem(item);
                                setMoveCopyAction('move');
                                setSelectedTargetVaultId(activeVaultId || vaults[0]?.id || '');
                                setSelectedTargetFolderPath(activeFolderPath);
                                setIsMoveCopyModalOpen(true);
                              }}
                              className="p-1.5 rounded hover:bg-[#EBEBF0] text-[#86868B]"
                              title="移动到..."
                            >
                              <Move className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setMoveCopyTargetItem(item);
                                setMoveCopyAction('copy');
                                setSelectedTargetVaultId(activeVaultId || vaults[0]?.id || '');
                                setSelectedTargetFolderPath(activeFolderPath);
                                setIsMoveCopyModalOpen(true);
                              }}
                              className="p-1.5 rounded hover:bg-[#EBEBF0] text-[#86868B]"
                              title="复制副本"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteItem(item);
                              }}
                              className="p-1.5 rounded hover:bg-red-50 text-red-500"
                              title="删除文件"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>

      {isCreateFolderModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-black/[0.1] rounded-2xl w-full max-w-sm shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#1D1D1F]">新建文件夹</h3>
              <button
                type="button"
                onClick={() => setIsCreateFolderModalOpen(false)}
                className="p-1 text-[#86868B] hover:text-[#1D1D1F]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateFolderSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#1D1D1F] font-semibold mb-1">文件夹名称</label>
                <input
                  type="text"
                  required
                  placeholder="如：07_CAD_Standard_Details"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F5F5F7] border border-black/[0.1] rounded-lg focus:outline-none focus:border-[#0071E3]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateFolderModalOpen(false)}
                  className="px-4 py-1.5 rounded-lg bg-[#EBEBF0] text-[#1D1D1F] font-medium"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#0071E3] text-white font-semibold shadow-xs"
                >
                  创建
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isCreateNoteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-black/[0.1] rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#1D1D1F]">新建 Markdown 笔记</h3>
              <button
                type="button"
                onClick={() => setIsCreateNoteModalOpen(false)}
                className="p-1 text-[#86868B] hover:text-[#1D1D1F]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNoteSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#1D1D1F] font-semibold mb-1">笔记标题</label>
                <input
                  type="text"
                  required
                  placeholder="例如：多模态 Agent 研讨会议纪要"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F5F5F7] border border-black/[0.1] rounded-lg focus:outline-none focus:border-[#0071E3]"
                />
              </div>

              <div>
                <label className="block text-[#1D1D1F] font-semibold mb-1">标签 (逗号分隔)</label>
                <input
                  type="text"
                  placeholder="笔记, 会议纪要, 架构"
                  value={noteTags}
                  onChange={(e) => setNoteTags(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F5F5F7] border border-black/[0.1] rounded-lg focus:outline-none focus:border-[#0071E3]"
                />
              </div>

              <div>
                <label className="block text-[#1D1D1F] font-semibold mb-1">笔记正文 (Markdown)</label>
                <textarea
                  rows={6}
                  placeholder="# 标题&#10;&#10;记录核心思考与卡片盒双向链接 [[知识条目]]..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F5F5F7] border border-black/[0.1] rounded-lg focus:outline-none focus:border-[#0071E3] font-mono text-[11px]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateNoteModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-[#EBEBF0] text-[#1D1D1F] font-medium"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#0071E3] text-white font-semibold shadow-xs"
                >
                  保存笔记
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isImportWebModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-black/[0.1] rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#1D1D1F]">导入网页 / 社媒 / 微信公众号链接</h3>
              <button
                type="button"
                onClick={() => setIsImportWebModalOpen(false)}
                className="p-1 text-[#86868B] hover:text-[#1D1D1F]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleImportWebSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#1D1D1F] font-semibold mb-1">网页 URL 链接 *</label>
                <input
                  type="url"
                  required
                  placeholder="https://mp.weixin.qq.com/s/... 或 Bilibili/小红书/GitHub 链接"
                  value={webUrlInput}
                  onChange={(e) => setWebUrlInput(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F5F5F7] border border-black/[0.1] rounded-lg focus:outline-none focus:border-[#0071E3] font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block text-[#1D1D1F] font-semibold mb-1">自定义标题 (可选)</label>
                <input
                  type="text"
                  placeholder="未填则自动抓取网页标题"
                  value={webTitleInput}
                  onChange={(e) => setWebTitleInput(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F5F5F7] border border-black/[0.1] rounded-lg focus:outline-none focus:border-[#0071E3]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsImportWebModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-[#EBEBF0] text-[#1D1D1F] font-medium"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#0071E3] text-white font-semibold shadow-xs"
                >
                  导入链接
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isImportFileModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-black/[0.1] rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#1D1D1F]">导入全格式文件资产 (60+ 格式支持)</h3>
              <button
                type="button"
                onClick={() => setIsImportFileModalOpen(false)}
                className="p-1 text-[#86868B] hover:text-[#1D1D1F]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleImportFileSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#1D1D1F] font-semibold mb-1">文件名称 *</label>
                <input
                  type="text"
                  required
                  placeholder="例如：建筑结构施工图"
                  value={importFileName}
                  onChange={(e) => setImportFileName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F5F5F7] border border-black/[0.1] rounded-lg focus:outline-none focus:border-[#0071E3]"
                />
              </div>

              <div>
                <label className="block text-[#1D1D1F] font-semibold mb-1">扩展格式后缀 *</label>
                <input
                  type="text"
                  required
                  placeholder="dxf, psd, flac, raw, pdf, py, csv..."
                  value={importFileExt}
                  onChange={(e) => setImportFileExt(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F5F5F7] border border-black/[0.1] rounded-lg focus:outline-none focus:border-[#0071E3] font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block text-[#1D1D1F] font-semibold mb-1">采样文本或描述</label>
                <textarea
                  rows={3}
                  placeholder="输入元数据、代码片断或提取的文本..."
                  value={importFileContent}
                  onChange={(e) => setImportFileContent(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F5F5F7] border border-black/[0.1] rounded-lg focus:outline-none focus:border-[#0071E3]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsImportFileModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-[#EBEBF0] text-[#1D1D1F] font-medium"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#0071E3] text-white font-semibold shadow-xs"
                >
                  导入并解析
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isImportFolderModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-black/[0.1] rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#1D1D1F]">导入文件夹层级</h3>
              <button
                type="button"
                onClick={() => setIsImportFolderModalOpen(false)}
                className="p-1 text-[#86868B] hover:text-[#1D1D1F]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleImportFolderSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#1D1D1F] font-semibold mb-1">本地文件夹路径 *</label>
                <input
                  type="text"
                  required
                  placeholder="D:\OmniKnowledge\08_Design_Templates"
                  value={importFolderPathInput}
                  onChange={(e) => setImportFolderPathInput(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F5F5F7] border border-black/[0.1] rounded-lg focus:outline-none focus:border-[#0071E3] font-mono text-[11px]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsImportFolderModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-[#EBEBF0] text-[#1D1D1F] font-medium"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#0071E3] text-white font-semibold shadow-xs"
                >
                  导入结构
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isRenameItemModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-black/[0.1] rounded-2xl w-full max-w-sm shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#1D1D1F]">重命名文件</h3>
              <button
                type="button"
                onClick={() => setIsRenameItemModalOpen(false)}
                className="p-1 text-[#86868B] hover:text-[#1D1D1F]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRenameItemSave} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#1D1D1F] font-semibold mb-1">新文件名</label>
                <input
                  type="text"
                  required
                  value={editItemTitle}
                  onChange={(e) => setEditItemTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F5F5F7] border border-black/[0.1] rounded-lg focus:outline-none focus:border-[#0071E3]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRenameItemModalOpen(false)}
                  className="px-4 py-1.5 rounded-lg bg-[#EBEBF0] text-[#1D1D1F] font-medium"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#0071E3] text-white font-semibold shadow-xs"
                >
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditTagsModalOpen && tagEditingItem && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-black/[0.1] rounded-2xl w-full max-w-sm shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#1D1D1F]">编辑文件标签</h3>
              <button
                type="button"
                onClick={() => setIsEditTagsModalOpen(false)}
                className="p-1 text-[#86868B] hover:text-[#1D1D1F]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTagsEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#1D1D1F] font-semibold mb-1">
                  标签列表 (用逗号分隔)
                </label>
                <input
                  type="text"
                  value={tagInputText}
                  onChange={(e) => setTagInputText(e.target.value)}
                  placeholder="CAD图纸, 施工规范, 维度A"
                  className="w-full px-3 py-2 bg-[#F5F5F7] border border-black/[0.1] rounded-lg focus:outline-none focus:border-[#0071E3]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditTagsModalOpen(false)}
                  className="px-4 py-1.5 rounded-lg bg-[#EBEBF0] text-[#1D1D1F] font-medium"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#0071E3] text-white font-semibold shadow-xs"
                >
                  保存标签
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isMoveCopyModalOpen && moveCopyTargetItem && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-black/[0.1] rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#1D1D1F]">
                {moveCopyAction === 'move' ? '移动文件到...' : '复制文件副本到...'}
              </h3>
              <button
                type="button"
                onClick={() => setIsMoveCopyModalOpen(false)}
                className="p-1 text-[#86868B] hover:text-[#1D1D1F]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleMoveCopySubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#1D1D1F] font-semibold mb-1">目标个人知识库</label>
                <select
                  value={selectedTargetVaultId}
                  onChange={(e) => {
                    setSelectedTargetVaultId(e.target.value);
                    setSelectedTargetFolderPath('/');
                  }}
                  className="w-full px-3 py-2 bg-[#F5F5F7] border border-black/[0.1] rounded-lg focus:outline-none focus:border-[#0071E3]"
                >
                  {vaults.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.rootPath})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#1D1D1F] font-semibold mb-1">目标文件夹路径</label>
                <select
                  value={selectedTargetFolderPath}
                  onChange={(e) => setSelectedTargetFolderPath(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F5F5F7] border border-black/[0.1] rounded-lg focus:outline-none focus:border-[#0071E3] font-mono"
                >
                  <option value="/">/ (根目录)</option>
                  {vaultFolders
                    .filter((f) => f.vaultId === selectedTargetVaultId)
                    .map((f) => (
                      <option key={f.id} value={f.path}>
                        {f.path} ({f.name})
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsMoveCopyModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-[#EBEBF0] text-[#1D1D1F] font-medium"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#0071E3] text-white font-semibold shadow-xs"
                >
                  {moveCopyAction === 'move' ? '确认移动' : '生成副本'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isBatchMoveModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-black/[0.1] rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#1D1D1F]">
                批量移动 {selectedItemIds.size} 项资产到...
              </h3>
              <button
                type="button"
                onClick={() => setIsBatchMoveModalOpen(false)}
                className="p-1 text-[#86868B] hover:text-[#1D1D1F]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleBatchMoveSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#1D1D1F] font-semibold mb-1">目标个人知识库</label>
                <select
                  value={batchTargetVaultId}
                  onChange={(e) => {
                    setBatchTargetVaultId(e.target.value);
                    setBatchTargetFolderPath('/');
                  }}
                  className="w-full px-3 py-2 bg-[#F5F5F7] border border-black/[0.1] rounded-lg focus:outline-none focus:border-[#0071E3]"
                >
                  {vaults.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.rootPath})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#1D1D1F] font-semibold mb-1">目标文件夹路径</label>
                <select
                  value={batchTargetFolderPath}
                  onChange={(e) => setBatchTargetFolderPath(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F5F5F7] border border-black/[0.1] rounded-lg focus:outline-none focus:border-[#0071E3] font-mono"
                >
                  <option value="/">/ (根目录)</option>
                  {vaultFolders
                    .filter((f) => f.vaultId === batchTargetVaultId)
                    .map((f) => (
                      <option key={f.id} value={f.path}>
                        {f.path} ({f.name})
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBatchMoveModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-[#EBEBF0] text-[#1D1D1F] font-medium"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#0071E3] text-white font-semibold shadow-xs"
                >
                  确认批量移动 ({selectedItemIds.size} 项)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

