import React, { useMemo, useState, useRef, useEffect } from 'react';
import {
  KnowledgeItem,
  KnowledgeCategory,
  CATEGORY_META,
  getBacklinksForItem,
  getSuggestedTags,
  AutomationRule,
  INITIAL_AUTOMATION_RULES,
  applyAutomationRules,
  ThirdPartyModelConfig,
  DEFAULT_AI_CONFIGS,
  LocalBackupConfig,
  DEFAULT_BACKUP_CONFIG,
  BackupSnapshot,
  INITIAL_BACKUP_SNAPSHOTS,
  createLocalBackupArchive,
  PersonalVault,
  VaultFolder,
} from './utils/knowledgeEngine';
import {
  INITIAL_KNOWLEDGE_ITEMS,
  INITIAL_SYNC_NODES,
  INITIAL_PERSONAL_VAULTS,
  INITIAL_VAULT_FOLDERS,
} from './data/seedData';
import { Sidebar, WorkspaceView } from './components/Sidebar';
import { LibraryMode } from './components/AppHeader';
import { LibraryItemListPane, LibraryVerticalNav } from './components/LibraryItemListPane';
import { LibraryGridPane } from './components/LibraryGridPane';
import { DetailInspectorPane } from './components/DetailInspectorPane';
import { KnowledgeGraphView } from './components/KnowledgeGraphView';
import { VectorSearchView } from './components/VectorSearchView';
import { BuiltInBrowserView } from './components/BuiltInBrowserView';
import { SyncAndWindowsDeployView } from './components/SyncAndWindowsDeployView';
import { SubVaultsOverviewView } from './components/SubVaultsOverviewView';
import { ImportModal } from './components/ImportModal';
import { GeminiChatPanel } from './components/GeminiChatPanel';
import { ItemContextMenu, ContextMenuState } from './components/ItemContextMenu';
import { Toast } from './components/Toast';

export default function App() {
  const [activeView, setActiveView] = useState<WorkspaceView>('library');
  const [libraryMode, setLibraryMode] = useState<LibraryMode>('vaults');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [vaults, setVaults] = useState<PersonalVault[]>(INITIAL_PERSONAL_VAULTS);
  const [vaultFolders, setVaultFolders] = useState<VaultFolder[]>(INITIAL_VAULT_FOLDERS);
  const [activeVaultId, setActiveVaultId] = useState<string | null>(null);
  const [items, setItems] = useState<KnowledgeItem[]>(INITIAL_KNOWLEDGE_ITEMS);
  const [syncNodes, setSyncNodes] = useState(INITIAL_SYNC_NODES);
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>(INITIAL_AUTOMATION_RULES);
  const [aiConfigs, setAiConfigs] = useState<ThirdPartyModelConfig[]>(DEFAULT_AI_CONFIGS);
  const [activeAiEngineId, setActiveAiEngineId] = useState<string>('built-in-gemini');
  const [selectedCategory, setSelectedCategory] = useState<KnowledgeCategory | 'all'>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [quickFilterText, setQuickFilterText] = useState<string>('');
  const [backupConfig, setBackupConfig] = useState<LocalBackupConfig>(DEFAULT_BACKUP_CONFIG);
  const [backupSnapshots, setBackupSnapshots] = useState<BackupSnapshot[]>(INITIAL_BACKUP_SNAPSHOTS);

  const handleCreateBackupNow = () => {
    const newSnapshot = createLocalBackupArchive(items, backupConfig);
    setBackupSnapshots((prev) => [newSnapshot, ...prev]);
    setBackupConfig((prev) => ({
      ...prev,
      lastBackupAt: newSnapshot.createdAt,
      lastBackupSizeBytes: newSnapshot.sizeBytes,
      status: 'completed',
    }));
    showToast(`本地增量备份包已生成: ${newSnapshot.fileName}`);
  };
  const [selectedItemId, setSelectedItemId] = useState<string>(INITIAL_KNOWLEDGE_ITEMS[0].id);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [browserTargetUrl, setBrowserTargetUrl] = useState<string | undefined>(undefined);
  const [newTagInput, setNewTagInput] = useState<string>('');
  const [newCrossRefTargetId, setNewCrossRefTargetId] = useState<string>('');
  const [isGlobalGeminiOpen, setIsGlobalGeminiOpen] = useState<boolean>(false);
  const [isInspectorFullScreen, setIsInspectorFullScreen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [isTagSuggestionsOpen, setIsTagSuggestionsOpen] = useState<boolean>(false);
  const [highlightedSuggestionIndex, setHighlightedSuggestionIndex] = useState<number>(-1);
  const tagSuggestionsContainerRef = useRef<HTMLDivElement>(null);

  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    isOpen: false,
    x: 0,
    y: 0,
    item: null,
  });

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        tagSuggestionsContainerRef.current &&
        !tagSuggestionsContainerRef.current.contains(e.target as Node)
      ) {
        setIsTagSuggestionsOpen(false);
        setHighlightedSuggestionIndex(-1);
      }
    };
    if (isTagSuggestionsOpen) {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isTagSuggestionsOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isInspectorFullScreen && !isTagSuggestionsOpen) {
        setIsInspectorFullScreen(false);
        showToast('已退出全屏模式');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isInspectorFullScreen, isTagSuggestionsOpen]);

  const allTags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of items) {
      for (const t of item.tags) {
        counts.set(t, (counts.get(t) || 0) + 1);
      }
    }
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
      if (selectedTag && !item.tags.includes(selectedTag)) return false;
      if (quickFilterText.trim()) {
        const q = quickFilterText.toLowerCase();
        const hay = `${item.title} ${item.ext} ${item.summary} ${item.tags.join(' ')} ${item.windowsPath}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [items, selectedCategory, selectedTag, quickFilterText]);

  const activeItem = useMemo(
    () => items.find((i) => i.id === selectedItemId) || filteredItems[0] || items[0],
    [items, selectedItemId, filteredItems]
  );

  const inboundBacklinks = useMemo(
    () => (activeItem ? getBacklinksForItem(items, activeItem.id) : []),
    [items, activeItem]
  );

  const outboundReferences = useMemo(() => {
    if (!activeItem) return [];
    return activeItem.references
      .map((refId) => items.find((i) => i.id === refId))
      .filter((i): i is KnowledgeItem => Boolean(i));
  }, [items, activeItem]);

  const totalSize = useMemo(
    () => items.reduce((acc, it) => acc + it.sizeBytes, 0),
    [items]
  );

  const pendingSyncCount = useMemo(
    () => syncNodes.reduce((acc, n) => acc + n.pendingDeltaCount, 0),
    [syncNodes]
  );

  const handleAddItem = (newItem: KnowledgeItem) => {
    setItems((prev) => [newItem, ...prev]);
    setSelectedItemId(newItem.id);
    setSyncNodes((prev) =>
      prev.map((n) => ({
        ...n,
        status: 'pending',
        pendingDeltaCount: n.pendingDeltaCount + 1,
      }))
    );
  };

  const matchingSuggestedTags = useMemo(() => {
    if (!activeItem) return [];
    return getSuggestedTags(allTags, activeItem.tags, newTagInput, 8);
  }, [allTags, activeItem, newTagInput]);

  const handleSelectSuggestedTag = (tagToAdd: string) => {
    if (!activeItem) return;
    const cleaned = tagToAdd.trim().replace(/^#/, '');
    if (!cleaned) return;
    setItems((prev) =>
      prev.map((it) =>
        it.id === activeItem.id && !it.tags.includes(cleaned)
          ? { ...it, tags: [...it.tags, cleaned] }
          : it
      )
    );
    setNewTagInput('');
    setIsTagSuggestionsOpen(false);
    setHighlightedSuggestionIndex(-1);
    showToast(`已添加 #${cleaned}`);
  };

  const handleAddTagToActive = (e: React.FormEvent) => {
    e.preventDefault();
    if (highlightedSuggestionIndex >= 0 && matchingSuggestedTags[highlightedSuggestionIndex]) {
      handleSelectSuggestedTag(matchingSuggestedTags[highlightedSuggestionIndex][0]);
      return;
    }
    const cleaned = newTagInput.trim().replace(/^#/, '');
    if (!cleaned || !activeItem) return;
    setItems((prev) =>
      prev.map((it) =>
        it.id === activeItem.id && !it.tags.includes(cleaned)
          ? { ...it, tags: [...it.tags, cleaned] }
          : it
      )
    );
    setNewTagInput('');
    setIsTagSuggestionsOpen(false);
    setHighlightedSuggestionIndex(-1);
    showToast(`已添加 #${cleaned}`);
  };

  const handleRemoveTagFromActive = (tagToRemove: string) => {
    if (!activeItem) return;
    setItems((prev) =>
      prev.map((it) =>
        it.id === activeItem.id
          ? { ...it, tags: it.tags.filter((t) => t !== tagToRemove) }
          : it
      )
    );
  };

  const handleAddCrossReference = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeItem || !newCrossRefTargetId || newCrossRefTargetId === activeItem.id) return;
    setItems((prev) =>
      prev.map((it) =>
        it.id === activeItem.id && !it.references.includes(newCrossRefTargetId)
          ? { ...it, references: [...it.references, newCrossRefTargetId] }
          : it
      )
    );
    setNewCrossRefTargetId('');
  };

  const handleRemoveCrossReference = (targetId: string) => {
    if (!activeItem) return;
    setItems((prev) =>
      prev.map((it) =>
        it.id === activeItem.id
          ? { ...it, references: it.references.filter((r) => r !== targetId) }
          : it
      )
    );
  };

  const handleOpenInBuiltInBrowser = (url: string) => {
    setBrowserTargetUrl(url);
    setActiveView('browser');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  const handleContextMenuOnItem = (e: React.MouseEvent, item: KnowledgeItem) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedItemId(item.id);
    setContextMenu({
      isOpen: true,
      x: e.clientX,
      y: e.clientY,
      item,
    });
  };

  const handleDeleteItem = (itemToDelete: KnowledgeItem) => {
    setItems((prev) => prev.filter((i) => i.id !== itemToDelete.id));
    showToast(`已删除「${itemToDelete.title}」`);
  };

  const handleCopyFilePath = (item: KnowledgeItem) => {
    navigator.clipboard?.writeText(item.windowsPath);
    showToast(`已复制 Windows 路径: ${item.windowsPath}`);
  };

  const handleToggleImportant = (itemToToggle: KnowledgeItem) => {
    const isImportant = itemToToggle.tags.includes('重要') || itemToToggle.tags.includes('重点关注');
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== itemToToggle.id) return it;
        if (isImportant) {
          return {
            ...it,
            tags: it.tags.filter((t) => t !== '重要' && t !== '重点关注'),
          };
        } else {
          return {
            ...it,
            tags: [...it.tags, '重要'],
          };
        }
      })
    );
    showToast(isImportant ? `已取消重要标记` : `已标记为重要条目 ★`);
  };

  const handleGenerateSummary = (itemToSummarize: KnowledgeItem) => {
    const newSummary = `【Gemini 智能知识摘要】${itemToSummarize.title}属于${CATEGORY_META[itemToSummarize.category].name}（.${itemToSummarize.ext}），包含 ${itemToSummarize.tags.map((t) => `#${t}`).join(' ')} 维度信息，Windows 存储校验码为 SHA-256:${itemToSummarize.sha256.slice(0, 12)}。`;
    setItems((prev) =>
      prev.map((it) => (it.id === itemToSummarize.id ? { ...it, summary: newSummary } : it))
    );
    showToast(`已通过 AI 重新生成知识摘要`);
  };

  const handleTriggerSyncAll = () => {
    setSyncNodes((prev) =>
      prev.map((n) => ({
        ...n,
        status: 'synced',
        lastSyncAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
        syncedCount: items.length,
        pendingDeltaCount: 0,
      }))
    );
    showToast('全局异地多端双向同步完成，0 增量冲突');
  };

  const handleApplyAutomationRules = () => {
    const { updatedItems, totalUpdated } = applyAutomationRules(items, automationRules);
    if (totalUpdated > 0) {
      setItems(updatedItems);
      showToast(`自动化规则已执行：更新了 ${totalUpdated} 项资产的标签与归档路径`);
    } else {
      showToast('自动化规则已执行：全部资产已处于最新规则配置状态');
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-[#F5F5F7] text-[#1D1D1F] select-none sm:select-auto">
      {!sidebarCollapsed && !isInspectorFullScreen && (
        <Sidebar
          activeView={activeView}
          items={items}
          pendingSyncCount={pendingSyncCount}
          totalSize={totalSize}
          onSelectView={(v) => setActiveView(v)}
        />
      )}

      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        <main className="flex-1 min-h-0 overflow-hidden">
          {activeView === 'library' && libraryMode === 'vaults' && (
            <div className="h-full flex flex-row overflow-hidden">
              <LibraryVerticalNav
                libraryMode={libraryMode}
                filteredCount={filteredItems.length}
                onOpenImportModal={() => setIsImportModalOpen(true)}
                onChangeLibraryMode={(mode) => setLibraryMode(mode)}
              />
              <div className="flex-1 h-full overflow-hidden">
                <SubVaultsOverviewView
                  vaults={vaults}
                  vaultFolders={vaultFolders}
                  items={items}
                  activeVaultId={activeVaultId}
                  onSelectVault={(vId) => setActiveVaultId(vId)}
                  onUpdateVaults={setVaults}
                  onUpdateFolders={setVaultFolders}
                  onUpdateItems={setItems}
                  onInspectItem={(item) => {
                    setSelectedItemId(item.id);
                    setLibraryMode('split');
                  }}
                  onShowToast={showToast}
                />
              </div>
            </div>
          )}

          {activeView === 'library' && libraryMode === 'split' && (
            <div className="h-full flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-black/[0.07]">
              {!isInspectorFullScreen && (
                <LibraryItemListPane
                  filteredItems={filteredItems}
                  allItems={items}
                  activeItem={activeItem}
                  selectedCategory={selectedCategory}
                  selectedTag={selectedTag}
                  allTags={allTags}
                  quickFilterText={quickFilterText}
                  libraryMode={libraryMode}
                  onSelectItem={(id) => setSelectedItemId(id)}
                  onContextMenu={handleContextMenuOnItem}
                  onResetCategory={() => setSelectedCategory('all')}
                  onSelectCategory={(cat) => setSelectedCategory(cat)}
                  onResetTag={() => setSelectedTag(null)}
                  onSelectTag={(tag) => setSelectedTag(tag)}
                  onChangeQuickFilter={(text) => setQuickFilterText(text)}
                  onOpenImportModal={() => setIsImportModalOpen(true)}
                  onChangeLibraryMode={(mode) => setLibraryMode(mode)}
                />
              )}

              {activeItem && (
                <DetailInspectorPane
                  activeItem={activeItem}
                  allItems={items}
                  isInspectorFullScreen={isInspectorFullScreen}
                  newTagInput={newTagInput}
                  isTagSuggestionsOpen={isTagSuggestionsOpen}
                  highlightedSuggestionIndex={highlightedSuggestionIndex}
                  matchingSuggestedTags={matchingSuggestedTags}
                  newCrossRefTargetId={newCrossRefTargetId}
                  inboundBacklinks={inboundBacklinks}
                  outboundReferences={outboundReferences}
                  tagSuggestionsContainerRef={tagSuggestionsContainerRef}
                  onToggleFullScreen={() => {
                    const next = !isInspectorFullScreen;
                    setIsInspectorFullScreen(next);
                    showToast(next ? '全屏沉浸模式 (Esc 退出)' : '已退出全屏');
                  }}
                  onLocateInGraph={() => {
                    setActiveView('library');
                    setLibraryMode('graph');
                  }}
                  onSelectItem={(id) => setSelectedItemId(id)}
                  onOpenInBrowser={handleOpenInBuiltInBrowser}
                  onRemoveTag={handleRemoveTagFromActive}
                  onChangeNewTagInput={setNewTagInput}
                  onOpenTagSuggestions={setIsTagSuggestionsOpen}
                  onSetHighlightedSuggestion={setHighlightedSuggestionIndex}
                  onSelectSuggestedTag={handleSelectSuggestedTag}
                  onSubmitNewTag={handleAddTagToActive}
                  onChangeCrossRefTarget={setNewCrossRefTargetId}
                  onSubmitCrossRef={handleAddCrossReference}
                  onRemoveCrossRef={handleRemoveCrossReference}
                  onShowToast={showToast}
                />
              )}
            </div>
          )}

          {activeView === 'library' && libraryMode === 'grid' && (
            <div className="h-full flex flex-row overflow-hidden">
              <LibraryVerticalNav
                libraryMode={libraryMode}
                filteredCount={filteredItems.length}
                onOpenImportModal={() => setIsImportModalOpen(true)}
                onChangeLibraryMode={(mode) => setLibraryMode(mode)}
              />
              <div className="flex-1 h-full overflow-y-auto">
                <LibraryGridPane
                  filteredItems={filteredItems}
                  activeItem={activeItem}
                  onSelectItem={(id) => {
                    setSelectedItemId(id);
                    setLibraryMode('split');
                  }}
                  onContextMenu={handleContextMenuOnItem}
                />
              </div>
            </div>
          )}

          {activeView === 'library' && libraryMode === 'search' && (
            <div className="h-full flex flex-row overflow-hidden">
              <LibraryVerticalNav
                libraryMode={libraryMode}
                filteredCount={filteredItems.length}
                onOpenImportModal={() => setIsImportModalOpen(true)}
                onChangeLibraryMode={(mode) => setLibraryMode(mode)}
              />
              <div className="flex-1 h-full overflow-y-auto p-6">
                <div className="max-w-5xl mx-auto">
                  <VectorSearchView
                    items={items}
                    onSelectAndInspect={(id) => {
                      setSelectedItemId(id);
                      setActiveView('library');
                      setLibraryMode('split');
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {activeView === 'library' && libraryMode === 'graph' && (
            <div className="h-full flex flex-row overflow-hidden">
              <LibraryVerticalNav
                libraryMode={libraryMode}
                filteredCount={filteredItems.length}
                onOpenImportModal={() => setIsImportModalOpen(true)}
                onChangeLibraryMode={(mode) => setLibraryMode(mode)}
              />
              <div className="flex-1 h-full overflow-y-auto p-6">
                <KnowledgeGraphView
                  items={items}
                  selectedItemId={selectedItemId}
                  onSelectItem={(id) => setSelectedItemId(id)}
                  onOpenInspectorView={(id) => {
                    setSelectedItemId(id);
                    setActiveView('library');
                    setLibraryMode('split');
                  }}
                  onShowToast={showToast}
                />
              </div>
            </div>
          )}

          {activeView === 'browser' && (
            <div className="h-full w-full overflow-hidden">
              <BuiltInBrowserView
                initialUrl={browserTargetUrl}
                items={items}
                onClipToVault={handleAddItem}
              />
            </div>
          )}

          {activeView === 'sync' && (
            <div className="h-full overflow-y-auto p-6">
              <div className="max-w-5xl mx-auto">
                <SyncAndWindowsDeployView
                  syncNodes={syncNodes}
                  items={items}
                  rules={automationRules}
                  aiConfigs={aiConfigs}
                  activeAiEngineId={activeAiEngineId}
                  backupConfig={backupConfig}
                  backupSnapshots={backupSnapshots}
                  onTriggerSyncAll={handleTriggerSyncAll}
                  onAddSyncNode={(node) => setSyncNodes((prev) => [...prev, node])}
                  onUpdateSyncNodes={setSyncNodes}
                  onUpdateRules={setAutomationRules}
                  onApplyRulesNow={handleApplyAutomationRules}
                  onUpdateAiConfigs={setAiConfigs}
                  onSelectAiEngine={setActiveAiEngineId}
                  onUpdateBackupConfig={setBackupConfig}
                  onCreateBackupNow={handleCreateBackupNow}
                  onShowToast={showToast}
                />
              </div>
            </div>
          )}
        </main>
      </div>

      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        existingItems={items}
        onImportItem={handleAddItem}
      />

      {activeView !== 'browser' && (
        <GeminiChatPanel
          mode="global-floating"
          isOpen={isGlobalGeminiOpen}
          onClose={() => setIsGlobalGeminiOpen(false)}
          contextType="vault"
          contextTitle={activeItem ? `[.${activeItem.ext}] ${activeItem.title}` : undefined}
          contextText={activeItem ? activeItem.summary || activeItem.content : undefined}
        />
      )}

      <ItemContextMenu
        contextMenu={contextMenu}
        onClose={() => setContextMenu((prev) => ({ ...prev, isOpen: false }))}
        onDelete={handleDeleteItem}
        onCopyPath={handleCopyFilePath}
        onToggleImportant={handleToggleImportant}
        onGenerateSummary={handleGenerateSummary}
        onOpenInBrowser={handleOpenInBuiltInBrowser}
      />

      <Toast message={toastMessage} />
    </div>
  );
}
