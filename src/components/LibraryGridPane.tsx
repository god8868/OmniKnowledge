import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { KnowledgeItem, CATEGORY_META, formatBytes } from '../utils/knowledgeEngine';

interface LibraryGridPaneProps {
  filteredItems: KnowledgeItem[];
  activeItem: KnowledgeItem | undefined;
  onSelectItem: (id: string) => void;
  onContextMenu: (e: React.MouseEvent, item: KnowledgeItem) => void;
}

export const LibraryGridPane: React.FC<LibraryGridPaneProps> = ({
  filteredItems,
  activeItem,
  onSelectItem,
  onContextMenu,
}) => {
  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredItems.map((item) => {
          const isSelected = activeItem?.id === item.id;
          const isImportant = item.tags.includes('重要') || item.tags.includes('重点关注');
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectItem(item.id)}
              onContextMenu={(e) => onContextMenu(e, item)}
              className={`text-left apple-card rounded-3xl p-5 transition-all flex flex-col justify-between gap-3 relative ${
                isSelected
                  ? 'ring-2 ring-[#0071E3]'
                  : 'hover:border-[#0071E3]/40'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-[#86868B]">
                  <span className="font-mono font-semibold text-[#0071E3] uppercase">
                    .{item.ext} · {CATEGORY_META[item.category].shortName}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {isImportant && (
                      <span className="omni-badge omni-badge-important">
                        ★
                      </span>
                    )}
                    <span className="font-mono tabular-nums">{formatBytes(item.sizeBytes)}</span>
                  </div>
                </div>
                <h3 className="text-sm font-bold text-[#1D1D1F] leading-snug">
                  {item.title}
                </h3>
                <p className="text-xs text-[#6E6E73] line-clamp-3 leading-relaxed">
                  {item.summary}
                </p>
              </div>

              <div className="pt-3 border-t border-black/[0.05] flex items-center justify-between text-[11px] text-[#86868B]">
                <span className="truncate">{item.tags.map((t) => `#${t}`).join(' ')}</span>
                <span className="text-[#0071E3] font-medium shrink-0 flex items-center gap-0.5">
                  <span>检视</span>
                  <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
