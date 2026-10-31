import React from 'react';
import {
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Home,
  ShieldCheck,
  Sparkles,
  BookmarkPlus,
} from 'lucide-react';
import { SAFARI_FAVORITES } from './BrowserFavoritesGrid';

interface BrowserAddressBarProps {
  canGoBack: boolean;
  canGoForward: boolean;
  isLoading: boolean;
  isStartPage: boolean;
  addressInput: string;
  onAddressInputChange: (val: string) => void;
  onSubmitAddress: (e: React.FormEvent) => void;
  onBack: () => void;
  onForward: () => void;
  onReload: () => void;
  onHome: () => void;
  renderMode: 'proxy' | 'direct';
  onToggleRenderMode: (mode: 'proxy' | 'direct') => void;
  isGeminiSidebarOpen: boolean;
  onToggleGeminiSidebar: () => void;
  onOpenClipModal: () => void;
  currentUrl: string;
  onNavigateFavorite: (url: string) => void;
}

export const BrowserAddressBar: React.FC<BrowserAddressBarProps> = ({
  canGoBack,
  canGoForward,
  isLoading,
  isStartPage,
  addressInput,
  onAddressInputChange,
  onSubmitAddress,
  onBack,
  onForward,
  onReload,
  onHome,
  renderMode,
  onToggleRenderMode,
  isGeminiSidebarOpen,
  onToggleGeminiSidebar,
  onOpenClipModal,
  currentUrl,
  onNavigateFavorite,
}) => {
  return (
    <div className="bg-[#F2F2F7] border-b border-black/[0.08] px-3 pb-2 space-y-2 shrink-0">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            aria-label="后退"
            disabled={!canGoBack}
            onClick={onBack}
            className="p-1.5 rounded-lg hover:bg-black/[0.06] disabled:opacity-30 text-[#1D1D1F] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            aria-label="前进"
            disabled={!canGoForward}
            onClick={onForward}
            className="p-1.5 rounded-lg hover:bg-black/[0.06] disabled:opacity-30 text-[#1D1D1F] transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            aria-label="刷新"
            onClick={onReload}
            className="p-1.5 rounded-lg hover:bg-black/[0.06] text-[#1D1D1F] transition-colors"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#0071E3]' : ''}`} />
          </button>
          <button
            type="button"
            aria-label="起始页"
            onClick={onHome}
            className="p-1.5 rounded-lg hover:bg-black/[0.06] text-[#1D1D1F] transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
          </button>
        </div>

        <form onSubmit={onSubmitAddress} className="flex-1 max-w-3xl mx-auto relative flex items-center">
          <ShieldCheck className="w-3.5 h-3.5 text-[#34C759] absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            aria-label="网址或搜索"
            value={addressInput}
            onChange={(e) => onAddressInputChange(e.target.value)}
            placeholder="输入 URL 或关键词搜索..."
            className="w-full pl-9 pr-16 py-1.5 text-xs font-mono rounded-xl bg-white border border-black/[0.08] text-[#1D1D1F] placeholder-[#86868B] shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
          />
          <button
            type="submit"
            className="absolute right-1.5 px-2.5 py-1 rounded-lg bg-[#F5F5F7] hover:bg-[#E8E8ED] text-[11px] font-medium text-[#1D1D1F] transition-colors"
          >
            ↗
          </button>
        </form>

        <div className="flex items-center gap-1.5 shrink-0">
          <div className="hidden xl:flex items-center p-0.5 rounded-lg bg-black/[0.06] text-[11px]">
            <button
              type="button"
              onClick={() => onToggleRenderMode('proxy')}
              className={`px-2 py-1 rounded-md font-medium transition-all whitespace-nowrap ${
                renderMode === 'proxy'
                  ? 'bg-white text-[#1D1D1F] shadow-2xs'
                  : 'text-[#6E6E73] hover:text-[#1D1D1F]'
              }`}
              title="穿透引擎"
            >
              穿透
            </button>
            <button
              type="button"
              onClick={() => onToggleRenderMode('direct')}
              className={`px-2 py-1 rounded-md font-medium transition-all whitespace-nowrap ${
                renderMode === 'direct'
                  ? 'bg-white text-[#1D1D1F] shadow-2xs'
                  : 'text-[#6E6E73] hover:text-[#1D1D1F]'
              }`}
              title="原生直连"
            >
              直连
            </button>
          </div>

          <button
            type="button"
            onClick={onToggleGeminiSidebar}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors whitespace-nowrap shadow-2xs ${
              isGeminiSidebarOpen
                ? 'bg-gradient-to-r from-[#0071E3] to-[#5856D6] text-white'
                : 'bg-black/[0.05] hover:bg-black/[0.08] text-[#1D1D1F]'
            }`}
            title="Gemini 伴读"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>伴读</span>
          </button>

          {!isStartPage && (
            <button
              type="button"
              onClick={onOpenClipModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-medium transition-colors whitespace-nowrap shadow-2xs"
            >
              <BookmarkPlus className="w-3.5 h-3.5" />
              <span>⤓ 剪藏</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pt-0.5 text-[11px] no-scrollbar">
        <span className="text-[#86868B] px-1 shrink-0">★</span>
        {SAFARI_FAVORITES.map((fav) => (
          <button
            key={fav.url}
            type="button"
            onClick={() => onNavigateFavorite(fav.url)}
            className={`px-2.5 py-0.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
              currentUrl === fav.url
                ? 'bg-[#0071E3]/15 text-[#0071E3] font-semibold'
                : 'text-[#424245] hover:bg-black/[0.06]'
            }`}
          >
            {fav.title}
          </button>
        ))}
      </div>
    </div>
  );
};
