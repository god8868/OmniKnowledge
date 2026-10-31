import React, { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import {
  KnowledgeItem,
  parseSocialOrWebUrl,
  computeEmbedding,
} from '../utils/knowledgeEngine';
import { GeminiChatPanel } from './GeminiChatPanel';
import { BrowserTabs, BrowserTab } from './browser/BrowserTabs';
import { BrowserAddressBar } from './browser/BrowserAddressBar';
import { BrowserFavoritesGrid } from './browser/BrowserFavoritesGrid';
import { BrowserClipperModal } from './browser/BrowserClipperModal';

interface BuiltInBrowserViewProps {
  initialUrl?: string;
  items: KnowledgeItem[];
  onClipToVault: (newItem: KnowledgeItem) => void;
}

export const BuiltInBrowserView: React.FC<BuiltInBrowserViewProps> = ({
  initialUrl,
  items,
  onClipToVault,
}) => {
  const [tabs, setTabs] = useState<BrowserTab[]>([
    {
      id: 'tab-1',
      title: 'Safari 起始页',
      url: 'omnivault://start',
      isStartPage: true,
      history: ['omnivault://start'],
      historyIndex: 0,
      extractedText: '',
    },
  ]);
  const [activeTabId, setActiveTabId] = useState<string>('tab-1');
  const [addressInput, setAddressInput] = useState<string>('');
  const [isLoadingPage, setIsLoadingPage] = useState<boolean>(false);
  const [renderMode, setRenderMode] = useState<'proxy' | 'direct'>('proxy');
  const [reloadNonce, setReloadNonce] = useState<number>(0);
  const [isClipPopoverOpen, setIsClipPopoverOpen] = useState<boolean>(false);
  const [clipTitle, setClipTitle] = useState<string>('');
  const [clipTags, setClipTags] = useState<string>('');
  const [clipRefId, setClipRefId] = useState<string>('');
  const [clipNote, setClipNote] = useState<string>('');
  const [clipToast, setClipToast] = useState<string | null>(null);
  const [isGeminiSidebarOpen, setIsGeminiSidebarOpen] = useState<boolean>(false);

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  useEffect(() => {
    if (initialUrl && initialUrl !== activeTab.url) {
      navigateTabTo(activeTab.id, initialUrl);
    }
  }, [initialUrl]);

  const navigateTabTo = (tabId: string, inputTarget: string) => {
    const trimmed = inputTarget.trim();
    if (!trimmed) return;

    let finalUrl = trimmed;
    const isStart = trimmed === 'omnivault://start';

    if (!isStart) {
      if (!/^https?:\/\//i.test(trimmed)) {
        if (/^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/.test(trimmed)) {
          finalUrl = `https://${trimmed}`;
        } else {
          finalUrl = `https://zh.wikipedia.org/w/index.php?search=${encodeURIComponent(trimmed)}`;
        }
      }
    }

    let detectedTitle = isStart ? 'Safari 起始页' : finalUrl;
    try {
      if (!isStart) {
        const parsedUrl = new URL(finalUrl);
        detectedTitle = `${parsedUrl.hostname}${parsedUrl.pathname !== '/' ? parsedUrl.pathname.slice(0, 20) : ''}`;
      }
    } catch {
      detectedTitle = finalUrl;
    }

    setIsLoadingPage(!isStart);

    setTabs((prev) =>
      prev.map((t) => {
        if (t.id !== tabId) return t;
        const newHistory = t.history.slice(0, t.historyIndex + 1);
        newHistory.push(finalUrl);
        return {
          ...t,
          url: finalUrl,
          title: detectedTitle,
          isStartPage: isStart,
          history: newHistory,
          historyIndex: newHistory.length - 1,
          extractedText: '',
        };
      })
    );

    setAddressInput(isStart ? '' : finalUrl);
  };

  const handleSelectTab = (tab: BrowserTab) => {
    setActiveTabId(tab.id);
    setAddressInput(tab.isStartPage ? '' : tab.url);
  };

  const handleCloseTab = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation();
    if (tabs.length === 1) {
      navigateTabTo(tabId, 'omnivault://start');
      return;
    }
    const filtered = tabs.filter((t) => t.id !== tabId);
    setTabs(filtered);
    if (activeTabId === tabId) {
      setActiveTabId(filtered[filtered.length - 1].id);
      setAddressInput(filtered[filtered.length - 1].isStartPage ? '' : filtered[filtered.length - 1].url);
    }
  };

  const handleNewTab = () => {
    const newId = `tab-${Date.now()}`;
    const newTab: BrowserTab = {
      id: newId,
      title: '新标签页',
      url: 'omnivault://start',
      isStartPage: true,
      history: ['omnivault://start'],
      historyIndex: 0,
      extractedText: '',
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newId);
    setAddressInput('');
  };

  const handleBack = () => {
    if (activeTab.historyIndex <= 0) return;
    const nextIdx = activeTab.historyIndex - 1;
    const targetUrl = activeTab.history[nextIdx];
    const isStart = targetUrl === 'omnivault://start';
    setTabs((prev) =>
      prev.map((t) =>
        t.id === activeTab.id
          ? { ...t, url: targetUrl, isStartPage: isStart, historyIndex: nextIdx }
          : t
      )
    );
    setAddressInput(isStart ? '' : targetUrl);
  };

  const handleForward = () => {
    if (activeTab.historyIndex >= activeTab.history.length - 1) return;
    const nextIdx = activeTab.historyIndex + 1;
    const targetUrl = activeTab.history[nextIdx];
    const isStart = targetUrl === 'omnivault://start';
    setTabs((prev) =>
      prev.map((t) =>
        t.id === activeTab.id
          ? { ...t, url: targetUrl, isStartPage: isStart, historyIndex: nextIdx }
          : t
      )
    );
    setAddressInput(isStart ? '' : targetUrl);
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressInput.trim()) return;
    navigateTabTo(activeTab.id, addressInput);
  };

  const handleOpenClipPopover = () => {
    const parsed = parseSocialOrWebUrl(activeTab.url);
    setClipTitle(activeTab.title || parsed.suggestedTitle || '网页采集快照');
    setClipTags((parsed.suggestedTags.length ? parsed.suggestedTags : ['网页浏览', '快照归档']).join(', '));
    setClipNote(
      activeTab.extractedText
        ? `【正文摘录】\n${activeTab.extractedText.slice(0, 460)}`
        : `来源: ${activeTab.url}\n通过 OmniKnowledge 内嵌浏览器归档入库。`
    );
    setIsClipPopoverOpen(true);
  };

  const handleConfirmClip = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseSocialOrWebUrl(activeTab.url);
    const tags = clipTags
      .split(/[,，\s]+/)
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    const nowStr = '2026-10-31 04:50';
    const titleStr = clipTitle.trim() || activeTab.title || '网页快照';
    const fullText = `${titleStr} ${tags.join(' ')} ${clipNote}`;

    const newItem: KnowledgeItem = {
      id: `kb-browser-${Date.now()}`,
      title: titleStr,
      category: parsed.isValid ? parsed.category : 'web',
      ext: parsed.isValid ? parsed.ext : 'web',
      windowsPath: `D:\\OmniKnowledge\\07_Web_Captures\\${parsed.ext || 'web'}_${Date.now()}.html`,
      sourceUrl: activeTab.url,
      sizeBytes: 420000,
      createdAt: nowStr,
      updatedAt: nowStr,
      sha256: Array.from({ length: 64 }, (_, i) => ((i * 7 + Date.now()) % 16).toString(16)).join(''),
      tags: tags.length > 0 ? tags : ['网页采集'],
      references: clipRefId ? [clipRefId] : [],
      summary: clipNote.slice(0, 110).replace(/\s+/g, ' ') + '...',
      content: clipNote,
      metadata: {
        platformName: parsed.platformName || 'Web Browser',
        authorOrAccount: parsed.platformName || '内嵌浏览器归档',
        publishDate: '2026-10-31',
      },
      embedding: computeEmbedding(fullText),
    };

    onClipToVault(newItem);
    setIsClipPopoverOpen(false);
    setClipToast(`已收入「${newItem.title}」`);
    setTimeout(() => setClipToast(null), 3000);
  };

  const iframeSrc =
    renderMode === 'proxy'
      ? `/api/web-proxy?url=${encodeURIComponent(activeTab.url)}&r=${reloadNonce}`
      : activeTab.url;

  return (
    <div className="h-full w-full flex flex-col bg-white overflow-hidden relative">
      <div className="bg-[#F2F2F7] border-b border-black/[0.08] px-3 pt-2">
        <BrowserTabs
          tabs={tabs}
          activeTabId={activeTab.id}
          onSelectTab={handleSelectTab}
          onCloseTab={handleCloseTab}
          onNewTab={handleNewTab}
        />
      </div>

      <BrowserAddressBar
        canGoBack={activeTab.historyIndex > 0}
        canGoForward={activeTab.historyIndex < activeTab.history.length - 1}
        isLoading={isLoadingPage}
        isStartPage={activeTab.isStartPage}
        addressInput={addressInput}
        onAddressInputChange={setAddressInput}
        onSubmitAddress={handleAddressSubmit}
        onBack={handleBack}
        onForward={handleForward}
        onReload={() => setReloadNonce((n) => n + 1)}
        onHome={() => navigateTabTo(activeTab.id, 'omnivault://start')}
        renderMode={renderMode}
        onToggleRenderMode={setRenderMode}
        isGeminiSidebarOpen={isGeminiSidebarOpen}
        onToggleGeminiSidebar={() => setIsGeminiSidebarOpen((v) => !v)}
        onOpenClipModal={handleOpenClipPopover}
        currentUrl={activeTab.url}
        onNavigateFavorite={(url) => navigateTabTo(activeTab.id, url)}
      />

      {clipToast && (
        <div className="absolute top-28 right-6 z-40 px-4 py-2.5 rounded-2xl bg-[#1D1D1F]/90 backdrop-blur-xl text-white text-xs font-medium shadow-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#34C759]" />
          <span>{clipToast}</span>
        </div>
      )}

      <BrowserClipperModal
        isOpen={isClipPopoverOpen && !activeTab.isStartPage}
        onClose={() => setIsClipPopoverOpen(false)}
        title={clipTitle}
        onTitleChange={setClipTitle}
        tags={clipTags}
        onTagsChange={setClipTags}
        refId={clipRefId}
        onRefIdChange={setClipRefId}
        note={clipNote}
        onNoteChange={setClipNote}
        items={items}
        onSubmit={handleConfirmClip}
      />

      <div className="flex-1 w-full h-full flex flex-row bg-white relative overflow-hidden">
        <div className="flex-1 h-full relative overflow-hidden">
          {activeTab.isStartPage ? (
            <BrowserFavoritesGrid
              items={items}
              onNavigate={(url) => navigateTabTo(activeTab.id, url)}
              searchQuery={addressInput}
              onSearchQueryChange={setAddressInput}
              onSearchSubmit={handleAddressSubmit}
            />
          ) : (
            <iframe
              key={`${activeTab.id}-${activeTab.url}-${renderMode}-${reloadNonce}`}
              title={`视口: ${activeTab.title}`}
              src={iframeSrc}
              onLoad={() => setIsLoadingPage(false)}
              className="w-full h-full border-0 bg-white"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
            />
          )}
        </div>

        {isGeminiSidebarOpen && (
          <GeminiChatPanel
            mode="browser-sidebar"
            isOpen={isGeminiSidebarOpen}
            onClose={() => setIsGeminiSidebarOpen(false)}
            contextType="browser"
            contextTitle={activeTab.title || activeTab.url}
            contextText={
              activeTab.extractedText ||
              `网址: ${activeTab.url}`
            }
          />
        )}
      </div>
    </div>
  );
};
