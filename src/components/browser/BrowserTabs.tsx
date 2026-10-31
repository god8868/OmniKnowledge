import React from 'react';
import { Compass, Globe, Plus, X } from 'lucide-react';

export interface BrowserTab {
  id: string;
  title: string;
  url: string;
  isStartPage: boolean;
  history: string[];
  historyIndex: number;
  extractedText: string;
}

interface BrowserTabsProps {
  tabs: BrowserTab[];
  activeTabId: string;
  onSelectTab: (tab: BrowserTab) => void;
  onCloseTab: (e: React.MouseEvent, tabId: string) => void;
  onNewTab: () => void;
}

export const BrowserTabs: React.FC<BrowserTabsProps> = ({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onNewTab,
}) => {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;
        return (
          <div
            key={tab.id}
            onClick={() => onSelectTab(tab)}
            role="tab"
            aria-selected={isActive}
            tabIndex={0}
            className={`group flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl text-xs cursor-pointer transition-all min-w-[140px] max-w-[220px] shrink-0 ${
              isActive
                ? 'bg-white text-[#1D1D1F] font-semibold shadow-2xs'
                : 'bg-black/[0.04] hover:bg-black/[0.07] text-[#6E6E73]'
            }`}
          >
            <div className="flex items-center gap-1.5 truncate">
              {tab.isStartPage ? (
                <Compass className="w-3.5 h-3.5 text-[#0071E3] shrink-0" />
              ) : (
                <Globe className="w-3.5 h-3.5 text-[#0071E3] shrink-0" />
              )}
              <span className="truncate">{tab.title}</span>
            </div>
            <button
              type="button"
              aria-label={`关闭 ${tab.title}`}
              onClick={(e) => onCloseTab(e, tab.id)}
              className="p-0.5 rounded-full hover:bg-black/10 text-[#86868B] hover:text-[#1D1D1F] shrink-0"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        );
      })}

      <button
        type="button"
        aria-label="新建标签页"
        onClick={onNewTab}
        className="p-1.5 rounded-lg hover:bg-black/[0.06] text-[#424245] transition-colors shrink-0"
        title="+"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
