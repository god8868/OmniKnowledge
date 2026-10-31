import React from 'react';
import {
  BookOpen,
  Globe,
  RefreshCw,
  HardDrive,
} from 'lucide-react';
import {
  KnowledgeItem,
  formatBytes,
} from '../utils/knowledgeEngine';

export type WorkspaceView = 'library' | 'browser' | 'sync';

interface SidebarProps {
  activeView: WorkspaceView;
  items: KnowledgeItem[];
  pendingSyncCount: number;
  totalSize: number;
  onSelectView: (view: WorkspaceView) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  items,
  pendingSyncCount,
  totalSize,
  onSelectView,
}) => {
  return (
    <aside
      aria-label="导航栏"
      className="w-[240px] shrink-0 h-full flex flex-col bg-[#EBEBF0]/90 backdrop-blur-2xl border-r border-black/[0.08]"
    >
      <div className="h-14 px-4 flex items-center justify-between border-b border-black/[0.05] shrink-0">
        <button
          type="button"
          onClick={() => onSelectView('library')}
          className="flex items-center gap-2.5 text-sm font-bold tracking-tight text-[#1D1D1F] hover:opacity-85 transition-opacity"
        >
          <span className="w-6 h-6 rounded-lg bg-[#0071E3] text-white flex items-center justify-center text-xs font-bold shadow-2xs">
            O
          </span>
          <span>OmniKnowledge</span>
        </button>
        <span className="text-[11px] font-mono text-[#86868B] tabular-nums">
          70+
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3.5 space-y-5">
        <nav aria-label="工作区" className="space-y-0.5">
          <div className="px-2.5 pb-1.5 text-[11px] font-semibold text-[#86868B] tracking-tight flex items-center justify-between">
            <span>工作区</span>
            <span className="text-[10px] font-mono opacity-60">⌘1-3</span>
          </div>

          <button
            type="button"
            onClick={() => onSelectView('library')}
            className={`omni-sidebar-item ${
              activeView === 'library' ? 'omni-sidebar-item-active' : ''
            }`}
          >
            <span className="flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5 shrink-0" />
              <span>知识库总览</span>
            </span>
            <span
              className={`font-mono text-[11px] tabular-nums ${
                activeView === 'library' ? 'text-white/90' : 'text-[#86868B]'
              }`}
            >
              {items.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onSelectView('browser')}
            className={`omni-sidebar-item ${
              activeView === 'browser' ? 'omni-sidebar-item-active' : ''
            }`}
          >
            <span className="flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 shrink-0" />
              <span>内嵌浏览器</span>
            </span>
            <span
              className={`font-mono text-[10px] ${
                activeView === 'browser' ? 'text-white/90' : 'text-[#86868B]'
              }`}
            >
              Clipper
            </span>
          </button>

          <button
            type="button"
            onClick={() => onSelectView('sync')}
            className={`omni-sidebar-item ${
              activeView === 'sync' ? 'omni-sidebar-item-active' : ''
            }`}
          >
            <span className="flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 shrink-0" />
              <span>系统设置与同步</span>
            </span>
            <span
              className={`font-mono text-[11px] tabular-nums ${
                activeView === 'sync' ? 'text-white/90' : 'text-[#86868B]'
              }`}
            >
              {pendingSyncCount > 0 ? `${pendingSyncCount}↑` : '✓'}
            </span>
          </button>
        </nav>
      </div>

      <div className="p-3.5 border-t border-black/[0.06] bg-[#E5E5EA]/60 flex items-center justify-between text-[11px] text-[#424245] shrink-0">
        <span className="inline-flex items-center gap-1.5 font-medium">
          <HardDrive className="w-3.5 h-3.5 text-[#0071E3]" />
          <span className="font-mono">D:\OmniKnowledge</span>
        </span>
        <span className="font-mono tabular-nums text-[#86868B]">
          {formatBytes(totalSize)}
        </span>
      </div>
    </aside>
  );
};

