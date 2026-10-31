import React from 'react';
import {
  PanelLeft,
  ChevronRight,
  Columns,
  LayoutGrid,
  Search,
  X,
  Sparkles,
  Plus,
  Cpu,
  Share2,
  BookOpen,
} from 'lucide-react';
import { WorkspaceView } from './Sidebar';

export type LibraryMode = 'vaults' | 'split' | 'grid' | 'search' | 'graph';

interface AppHeaderProps {
  sidebarCollapsed: boolean;
  activeView: WorkspaceView;
  libraryMode: LibraryMode;
  breadcrumb: { section: string; title: string };
  quickFilterText: string;
  isGlobalGeminiOpen: boolean;
  onToggleSidebar: () => void;
  onChangeLibraryMode: (mode: LibraryMode) => void;
  onChangeQuickFilter: (text: string) => void;
  onToggleGemini: () => void;
  onOpenImportModal: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  sidebarCollapsed,
  activeView,
  libraryMode,
  breadcrumb,
  quickFilterText,
  isGlobalGeminiOpen,
  onToggleSidebar,
  onChangeLibraryMode,
  onChangeQuickFilter,
  onToggleGemini,
  onOpenImportModal,
}) => {
  return (
    <header className="h-14 px-4 sm:px-5 apple-glass border-b border-black/[0.07] flex items-center justify-between gap-3 shrink-0 z-20">
      <div className="flex items-center gap-2.5 min-w-0">
        <button
          type="button"
          aria-label={sidebarCollapsed ? '展开导航栏' : '收起导航栏'}
          onClick={onToggleSidebar}
          className="omni-btn-icon shrink-0"
          title="切换侧边栏"
        >
          <PanelLeft className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-black/[0.08] shrink-0" />

        <div className="flex items-center gap-1.5 text-xs truncate">
          <span className="text-[#86868B] hidden sm:inline">{breadcrumb.section}</span>
          <ChevronRight className="w-3 h-3 text-[#86868B] hidden sm:inline shrink-0" />
          <h1 className="font-bold text-xs sm:text-sm text-[#1D1D1F] truncate">
            {breadcrumb.title}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {activeView === 'library' && (
          <div
            role="group"
            aria-label="总览视图模式切换"
            className="flex items-center p-0.5 rounded-lg bg-black/[0.06]"
          >
            <button
              type="button"
              onClick={() => onChangeLibraryMode('vaults')}
              className={`p-1.5 rounded-md text-xs font-medium inline-flex items-center gap-1 transition-all ${
                libraryMode === 'vaults'
                  ? 'bg-white text-[#0071E3] shadow-2xs font-bold'
                  : 'text-[#6E6E73] hover:text-[#1D1D1F]'
              }`}
              title="个人子库卡片排列"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#0071E3]" />
              <span className="hidden xl:inline text-[11px]">子库卡片</span>
            </button>
            <button
              type="button"
              onClick={() => onChangeLibraryMode('split')}
              className={`p-1.5 rounded-md text-xs font-medium inline-flex items-center gap-1 transition-all ${
                libraryMode === 'split'
                  ? 'bg-white text-[#1D1D1F] shadow-2xs'
                  : 'text-[#6E6E73] hover:text-[#1D1D1F]'
              }`}
              title="分屏检视"
            >
              <Columns className="w-3.5 h-3.5" />
              <span className="hidden xl:inline text-[11px]">分屏</span>
            </button>
            <button
              type="button"
              onClick={() => onChangeLibraryMode('grid')}
              className={`p-1.5 rounded-md text-xs font-medium inline-flex items-center gap-1 transition-all ${
                libraryMode === 'grid'
                  ? 'bg-white text-[#1D1D1F] shadow-2xs'
                  : 'text-[#6E6E73] hover:text-[#1D1D1F]'
              }`}
              title="画廊网格"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden xl:inline text-[11px]">画廊</span>
            </button>
            <button
              type="button"
              onClick={() => onChangeLibraryMode('search')}
              className={`p-1.5 rounded-md text-xs font-medium inline-flex items-center gap-1 transition-all ${
                libraryMode === 'search'
                  ? 'bg-white text-[#1D1D1F] shadow-2xs'
                  : 'text-[#6E6E73] hover:text-[#1D1D1F]'
              }`}
              title="向量语义检索"
            >
              <Cpu className="w-3.5 h-3.5 text-[#0071E3]" />
              <span className="hidden xl:inline text-[11px]">语义检索</span>
            </button>
            <button
              type="button"
              onClick={() => onChangeLibraryMode('graph')}
              className={`p-1.5 rounded-md text-xs font-medium inline-flex items-center gap-1 transition-all ${
                libraryMode === 'graph'
                  ? 'bg-white text-[#1D1D1F] shadow-2xs'
                  : 'text-[#6E6E73] hover:text-[#1D1D1F]'
              }`}
              title="双向知识图谱"
            >
              <Share2 className="w-3.5 h-3.5 text-[#5856D6]" />
              <span className="hidden xl:inline text-[11px]">知识图谱</span>
            </button>
          </div>
        )}

        <div className="relative w-36 sm:w-48 lg:w-56">
          <Search className="w-3.5 h-3.5 text-[#86868B] absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            aria-label="快速检索"
            value={quickFilterText}
            onChange={(e) => onChangeQuickFilter(e.target.value)}
            placeholder="条目 / 格式 / 标签..."
            className="omni-input pl-8 pr-7 py-1 text-xs"
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

        {activeView !== 'browser' && (
          <button
            type="button"
            onClick={onToggleGemini}
            className={`omni-btn px-2.5 py-1.5 text-xs shadow-2xs ${
              isGlobalGeminiOpen
                ? 'bg-gradient-to-r from-[#0071E3] to-[#5856D6] text-white'
                : 'omni-btn-subtle'
            }`}
            title="Gemini 智能体"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden md:inline">Gemini</span>
          </button>
        )}

        <button
          type="button"
          onClick={onOpenImportModal}
          className="omni-btn omni-btn-primary px-3 py-1.5 text-xs"
          title="导入知识条目"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">导入</span>
        </button>
      </div>
    </header>
  );
};
