import React, { useEffect, useRef } from 'react';
import {
  Trash2,
  Copy,
  Star,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { KnowledgeItem } from '../utils/knowledgeEngine';

export interface ContextMenuState {
  isOpen: boolean;
  x: number;
  y: number;
  item: KnowledgeItem | null;
}

interface ItemContextMenuProps {
  contextMenu: ContextMenuState;
  onClose: () => void;
  onDelete: (item: KnowledgeItem) => void;
  onCopyPath: (item: KnowledgeItem) => void;
  onToggleImportant: (item: KnowledgeItem) => void;
  onGenerateSummary: (item: KnowledgeItem) => void;
  onOpenInBrowser?: (url: string) => void;
}

export const ItemContextMenu: React.FC<ItemContextMenuProps> = ({
  contextMenu,
  onClose,
  onDelete,
  onCopyPath,
  onToggleImportant,
  onGenerateSummary,
  onOpenInBrowser,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (contextMenu.isOpen) {
      const timer = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 50);
      document.addEventListener('keydown', handleKeyDown);
      window.addEventListener('scroll', onClose, true);

      return () => {
        clearTimeout(timer);
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('scroll', onClose, true);
      };
    }
  }, [contextMenu.isOpen, onClose]);

  if (!contextMenu.isOpen || !contextMenu.item) return null;

  const { item, x, y } = contextMenu;
  const isImportant = item.tags.includes('重要') || item.tags.includes('重点关注');

  const menuWidth = 220;
  const menuHeight = 230;
  const adjustedX = Math.min(x, window.innerWidth - menuWidth - 10);
  const adjustedY = Math.min(y, window.innerHeight - menuHeight - 10);

  return (
    <div
      ref={menuRef}
      style={{ top: `${adjustedY}px`, left: `${adjustedX}px` }}
      role="menu"
      aria-label="知识条目上下文菜单"
      className="fixed z-50 w-56 rounded-2xl bg-[#FFFFFF]/95 backdrop-blur-2xl border border-black/10 shadow-2xl p-1.5 text-xs text-[#1D1D1F] select-none animate-in fade-in zoom-in-95 duration-100"
    >
      <div className="px-2.5 py-1.5 border-b border-black/[0.05] mb-1">
        <div className="text-[11px] font-bold text-[#1D1D1F] truncate flex items-center gap-1.5">
          <span className="font-mono text-[#0071E3] uppercase">.{item.ext}</span>
          <span className="truncate">{item.title}</span>
        </div>
        <div className="text-[10px] text-[#86868B] font-mono truncate mt-0.5">
          {item.windowsPath}
        </div>
      </div>

      <button
        type="button"
        role="menuitem"
        onClick={() => {
          onToggleImportant(item);
          onClose();
        }}
        className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-[#0071E3] hover:text-white transition-colors group"
      >
        <div className="flex items-center gap-2">
          <Star
            className={`w-3.5 h-3.5 ${
              isImportant
                ? 'fill-amber-400 text-amber-500 group-hover:text-white group-hover:fill-white'
                : 'text-[#86868B] group-hover:text-white'
            }`}
          />
          <span>{isImportant ? '取消重要' : '标记重要'}</span>
        </div>
        <span className="text-[10px] opacity-60">★</span>
      </button>

      <button
        type="button"
        role="menuitem"
        onClick={() => {
          onCopyPath(item);
          onClose();
        }}
        className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-[#0071E3] hover:text-white transition-colors group"
      >
        <div className="flex items-center gap-2">
          <Copy className="w-3.5 h-3.5 text-[#86868B] group-hover:text-white" />
          <span>复制路径</span>
        </div>
        <span className="text-[10px] opacity-60 font-mono">Win32</span>
      </button>

      <button
        type="button"
        role="menuitem"
        onClick={() => {
          onGenerateSummary(item);
          onClose();
        }}
        className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-[#0071E3] hover:text-white transition-colors group"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 group-hover:text-white" />
          <span>生成摘要</span>
        </div>
        <span className="text-[10px] opacity-60 font-mono">✨</span>
      </button>

      {item.sourceUrl && onOpenInBrowser && (
        <button
          type="button"
          role="menuitem"
          onClick={() => {
            onOpenInBrowser(item.sourceUrl!);
            onClose();
          }}
          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-[#0071E3] hover:text-white transition-colors group"
        >
          <div className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5 text-[#0071E3] group-hover:text-white" />
            <span>内嵌浏览</span>
          </div>
          <span className="text-[10px] opacity-60">↗</span>
        </button>
      )}

      <div className="my-1 border-t border-black/[0.06]" />

      <button
        type="button"
        role="menuitem"
        onClick={() => {
          onDelete(item);
          onClose();
        }}
        className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[#FF3B30] hover:bg-[#FF3B30] hover:text-white transition-colors group"
      >
        <div className="flex items-center gap-2">
          <Trash2 className="w-3.5 h-3.5" />
          <span>删除条目</span>
        </div>
        <span className="text-[10px] opacity-60">✕</span>
      </button>
    </div>
  );
};
