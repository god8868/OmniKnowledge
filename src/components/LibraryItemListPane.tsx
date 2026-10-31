import React from 'react';
import {
  Search,
  Plus,
  X,
  Columns,
  LayoutGrid,
  Cpu,
  Share2,
  Layers,
  Image as ImageIcon,
  FileText,
  Film,
  Code2,
  MessageSquare,
  Video,
  Compass,
  BookOpen,
  Globe,
} from 'lucide-react';
import { KnowledgeItem, KnowledgeCategory, CATEGORY_META, formatBytes } from '../utils/knowledgeEngine';
import { LibraryMode } from './AppHeader';

const CATEGORY_ICONS: Record<KnowledgeCategory, React.FC<{ className?: string }>> = {
  image: ImageIcon,
  document: FileText,
  media: Film,
  code: Code2,
  wechat_mp: MessageSquare,
  wechat_video: Video,
  social: Compass,
  web: Globe,
};

interface LibraryVerticalNavProps {
  libraryMode: LibraryMode;
  filteredCount: number;
  onOpenImportModal: () => void;
  onChangeLibraryMode: (mode: LibraryMode) => void;
}

export const LibraryVerticalNav: React.FC<LibraryVerticalNavProps> = ({
  libraryMode,
  filteredCount,
  onOpenImportModal,
  onChangeLibraryMode,
}) => {
  return (
    <div className="w-14 shrink-0 bg-[#FAFAFC] border-r border-black/[0.06] flex flex-col items-center py-3.5 justify-between select-none h-full">
      <div className="flex flex-col items-center gap-3 w-full px-2">
        <button
          type="button"
          onClick={onOpenImportModal}
          className="w-10 h-10 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] text-white flex items-center justify-center shadow-xs hover:scale-105 active:scale-95 transition-all group relative"
          title="导入新资产 (+)"
        >
          <Plus className="w-5 h-5" />
          <span className="sr-only">导入资产</span>
        </button>

        <div className="w-6 h-[1px] bg-black/[0.08] my-1" />

        <div className="flex flex-col items-center gap-1.5 w-full">
          <button
            type="button"
            onClick={() => onChangeLibraryMode('vaults')}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              libraryMode === 'vaults'
                ? 'bg-white text-[#0071E3] shadow-xs ring-1 ring-black/[0.06]'
                : 'text-[#86868B] hover:text-[#1D1D1F] hover:bg-black/[0.04]'
            }`}
            title="个人知识子库总览 (Sub-Libraries Overview)"
          >
            <BookOpen className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => onChangeLibraryMode('split')}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              libraryMode === 'split'
                ? 'bg-white text-[#0071E3] shadow-xs ring-1 ring-black/[0.06]'
                : 'text-[#86868B] hover:text-[#1D1D1F] hover:bg-black/[0.04]'
            }`}
            title="分屏检视 (Split View)"
          >
            <Columns className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => onChangeLibraryMode('grid')}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              libraryMode === 'grid'
                ? 'bg-white text-[#0071E3] shadow-xs ring-1 ring-black/[0.06]'
                : 'text-[#86868B] hover:text-[#1D1D1F] hover:bg-black/[0.04]'
            }`}
            title="画廊网格 (Grid Gallery)"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => onChangeLibraryMode('search')}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              libraryMode === 'search'
                ? 'bg-white text-[#0071E3] shadow-xs ring-1 ring-black/[0.06]'
                : 'text-[#86868B] hover:text-[#1D1D1F] hover:bg-black/[0.04]'
            }`}
            title="向量语义检索 (Semantic Search)"
          >
            <Cpu className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => onChangeLibraryMode('graph')}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              libraryMode === 'graph'
                ? 'bg-white text-[#5856D6] shadow-xs ring-1 ring-black/[0.06]'
                : 'text-[#86868B] hover:text-[#1D1D1F] hover:bg-black/[0.04]'
            }`}
            title="双向知识图谱 (Knowledge Graph)"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-col items-center gap-0.5 text-[10px] font-mono font-bold text-[#86868B]">
        <span className="px-1.5 py-0.5 rounded bg-black/[0.05] text-[#1D1D1F] tabular-nums">
          {filteredCount}
        </span>
        <span className="text-[9px] text-[#86868B] scale-90">资产</span>
      </div>
    </div>
  );
};

interface LibraryItemListPaneProps {
  filteredItems: KnowledgeItem[];
  allItems: KnowledgeItem[];
  activeItem: KnowledgeItem | undefined;
  selectedCategory: KnowledgeCategory | 'all';
  selectedTag: string | null;
  allTags: [string, number][];
  quickFilterText: string;
  libraryMode: LibraryMode;
  onSelectItem: (id: string) => void;
  onContextMenu: (e: React.MouseEvent, item: KnowledgeItem) => void;
  onResetCategory: () => void;
  onSelectCategory: (cat: KnowledgeCategory | 'all') => void;
  onResetTag: () => void;
  onSelectTag: (tag: string | null) => void;
  onChangeQuickFilter: (text: string) => void;
  onOpenImportModal: () => void;
  onChangeLibraryMode: (mode: LibraryMode) => void;
}

export const LibraryItemListPane: React.FC<LibraryItemListPaneProps> = ({
  filteredItems,
  allItems,
  activeItem,
  selectedCategory,
  selectedTag,
  allTags,
  quickFilterText,
  libraryMode,
  onSelectItem,
  onContextMenu,
  onSelectCategory,
  onSelectTag,
  onChangeQuickFilter,
  onOpenImportModal,
  onChangeLibraryMode,
}) => {
  return (
    <div className="w-full lg:w-[420px] xl:w-[460px] shrink-0 h-64 lg:h-full flex bg-white border-r border-black/[0.07]">
      <LibraryVerticalNav
        libraryMode={libraryMode}
        filteredCount={filteredItems.length}
        onOpenImportModal={onOpenImportModal}
        onChangeLibraryMode={onChangeLibraryMode}
      />
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        <div className="p-3 border-b border-black/[0.06] bg-[#FAFAFC] shrink-0">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-[#86868B] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              aria-label="检索条目"
              value={quickFilterText}
              onChange={(e) => onChangeQuickFilter(e.target.value)}
              placeholder="检索条目 / 格式 / 标签..."
              className="omni-input pl-8 pr-7 py-1 text-xs w-full bg-white"
            />
            {quickFilterText && (
              <button
                type="button"
                aria-label="清空"
                onClick={() => onChangeQuickFilter('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#86868B] hover:text-[#1D1D1F] p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* 多模态分类 Filter Strip */}
        <div className="px-3 py-1.5 border-b border-black/[0.05] bg-[#FAFAFC] flex items-center gap-1 overflow-x-auto no-scrollbar shrink-0 text-[11px]">
          <button
            type="button"
            onClick={() => onSelectCategory('all')}
            className={`px-2 py-0.5 rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1 ${
              selectedCategory === 'all'
                ? 'bg-[#0071E3] text-white font-medium shadow-2xs'
                : 'bg-white border border-black/[0.08] text-[#424245] hover:border-[#0071E3]/50'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>全部</span>
            <span className="opacity-70 tabular-nums">{allItems.length}</span>
          </button>

          {(Object.keys(CATEGORY_META) as KnowledgeCategory[]).map((cat) => {
            const isCatActive = selectedCategory === cat;
            const count = allItems.filter((i) => i.category === cat).length;
            if (count === 0) return null;
            const Icon = CATEGORY_ICONS[cat];
            return (
              <button
                key={cat}
                type="button"
                onClick={() => onSelectCategory(isCatActive ? 'all' : cat)}
                className={`px-2 py-0.5 rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1 ${
                  isCatActive
                    ? 'bg-[#0071E3] text-white font-medium shadow-2xs'
                    : 'bg-white border border-black/[0.08] text-[#424245] hover:border-[#0071E3]/50'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{CATEGORY_META[cat].shortName}</span>
                <span className="opacity-70 tabular-nums">{count}</span>
              </button>
            );
          })}
        </div>

        {allTags.length > 0 && (
          <div className="px-3 py-1.5 border-b border-black/[0.05] bg-[#F5F5F7]/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 text-[11px]">
            <button
              type="button"
              onClick={() => onSelectTag(null)}
              className={`px-2 py-0.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
                !selectedTag
                  ? 'bg-black/[0.08] text-[#1D1D1F] font-semibold'
                  : 'text-[#6E6E73] hover:text-[#1D1D1F]'
              }`}
            >
              全部
            </button>
            {allTags.map(([tag, count]) => {
              const isTagActive = selectedTag === tag;
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => onSelectTag(isTagActive ? null : tag)}
                  className={`px-2 py-0.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    isTagActive
                      ? 'bg-[#0071E3] text-white font-medium shadow-2xs'
                      : 'bg-white border border-black/[0.08] text-[#424245] hover:border-[#0071E3]/50'
                  }`}
                >
                  #{tag} <span className="opacity-70 tabular-nums">{count}</span>
                </button>
              );
            })}
          </div>
        )}

        <div className="flex-1 overflow-y-auto divide-y divide-black/[0.05]">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <div className="text-sm font-semibold text-[#1D1D1F]">
                未检索到符合条件的本地条目
              </div>
              <p className="text-xs text-[#86868B]">
                请清除筛选条件，或点击左侧「+」导入资产
              </p>
            </div>
          ) : (
            filteredItems.map((item) => {
              const isSelected = activeItem?.id === item.id;
              const isImportant = item.tags.includes('重要') || item.tags.includes('重点关注');
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectItem(item.id)}
                  onContextMenu={(e) => onContextMenu(e, item)}
                  className={`w-full text-left px-4 py-3 transition-colors block relative group ${
                    isSelected
                      ? 'bg-[#0071E3] text-white'
                      : 'hover:bg-[#F5F5F7]/80 text-[#1D1D1F]'
                  }`}
                >
                  <div
                    className={`flex items-center justify-between gap-2 text-[11px] mb-1 ${
                      isSelected ? 'text-white/85' : 'text-[#86868B]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <span
                        className={`font-mono font-semibold uppercase ${
                          isSelected ? 'text-white' : 'text-[#0071E3]'
                        }`}
                      >
                        .{item.ext}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{CATEGORY_META[item.category].shortName}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">{formatBytes(item.sizeBytes)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {isImportant && (
                        <span
                          className={`text-[10px] px-1 py-0.5 rounded font-bold ${
                            isSelected ? 'bg-white/20 text-white' : 'omni-badge omni-badge-important'
                          }`}
                        >
                          ★
                        </span>
                      )}
                      <span className="font-mono tabular-nums">
                        {item.updatedAt.split(' ')[0]}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-xs font-bold tracking-tight leading-snug line-clamp-1">
                    {item.title}
                  </h3>

                  <p
                    className={`mt-1 text-xs line-clamp-2 leading-relaxed ${
                      isSelected ? 'text-white/85' : 'text-[#6E6E73]'
                    }`}
                  >
                    {item.summary}
                  </p>

                  <div
                    className={`mt-2 flex items-center justify-between gap-2 text-[11px] ${
                      isSelected ? 'text-white/75' : 'text-[#86868B]'
                    }`}
                  >
                    <span className="truncate">
                      {item.tags.map((t) => `#${t}`).join(' ')}
                    </span>
                    <span className="font-mono tabular-nums shrink-0">
                      🔗 {item.references.length}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

