import React from 'react';
import {
  FolderOpen,
  Link2,
  ArrowUpRight,
  Tag,
  X,
  Sparkles,
  Maximize2,
  Minimize2,
  Plus,
} from 'lucide-react';
import { KnowledgeItem, CATEGORY_META, formatBytes } from '../utils/knowledgeEngine';
import { FormatPreviewer } from './FormatPreviewer';
import { MetadataExportMenu } from './MetadataExportMenu';

interface DetailInspectorPaneProps {
  activeItem: KnowledgeItem;
  allItems: KnowledgeItem[];
  isInspectorFullScreen: boolean;
  newTagInput: string;
  isTagSuggestionsOpen: boolean;
  highlightedSuggestionIndex: number;
  matchingSuggestedTags: [string, number][];
  newCrossRefTargetId: string;
  inboundBacklinks: KnowledgeItem[];
  outboundReferences: KnowledgeItem[];
  tagSuggestionsContainerRef: React.RefObject<HTMLDivElement | null>;
  onToggleFullScreen: () => void;
  onLocateInGraph: () => void;
  onSelectItem: (id: string) => void;
  onOpenInBrowser: (url: string) => void;
  onRemoveTag: (tag: string) => void;
  onChangeNewTagInput: (val: string) => void;
  onOpenTagSuggestions: (open: boolean) => void;
  onSetHighlightedSuggestion: (idx: number) => void;
  onSelectSuggestedTag: (tag: string) => void;
  onSubmitNewTag: (e: React.FormEvent) => void;
  onChangeCrossRefTarget: (id: string) => void;
  onSubmitCrossRef: (e: React.FormEvent) => void;
  onRemoveCrossRef: (targetId: string) => void;
  onShowToast?: (msg: string) => void;
}

export const DetailInspectorPane: React.FC<DetailInspectorPaneProps> = ({
  activeItem,
  allItems,
  isInspectorFullScreen,
  newTagInput,
  isTagSuggestionsOpen,
  highlightedSuggestionIndex,
  matchingSuggestedTags,
  newCrossRefTargetId,
  inboundBacklinks,
  outboundReferences,
  tagSuggestionsContainerRef,
  onToggleFullScreen,
  onLocateInGraph,
  onSelectItem,
  onOpenInBrowser,
  onRemoveTag,
  onChangeNewTagInput,
  onOpenTagSuggestions,
  onSetHighlightedSuggestion,
  onSelectSuggestedTag,
  onSubmitNewTag,
  onChangeCrossRefTarget,
  onSubmitCrossRef,
  onRemoveCrossRef,
  onShowToast,
}) => {
  return (
    <div className="flex-1 h-full overflow-y-auto bg-[#F5F5F7] p-6">
      <div className="max-w-4xl mx-auto apple-card rounded-3xl p-6 space-y-6">
        <div className="border-b border-black/[0.06] pb-4 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#86868B]">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#0071E3]">
                {CATEGORY_META[activeItem.category].name}
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono uppercase text-[#1D1D1F]">.{activeItem.ext}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">
                {formatBytes(activeItem.sizeBytes)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <MetadataExportMenu
                item={activeItem}
                allItems={allItems}
                onShowToast={onShowToast}
              />

              <button
                type="button"
                onClick={onToggleFullScreen}
                className={`omni-btn px-2.5 py-1 text-xs shadow-2xs ${
                  isInspectorFullScreen
                    ? 'bg-[#0071E3] text-white hover:bg-[#0077ED]'
                    : 'omni-btn-subtle'
                }`}
                title={isInspectorFullScreen ? '退出全屏 (Esc)' : '进入全屏'}
              >
                {isInspectorFullScreen ? (
                  <>
                    <Minimize2 className="w-3.5 h-3.5" />
                    <span>退出全屏</span>
                    <span className="text-[10px] opacity-75 font-mono">Esc</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>全屏</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onLocateInGraph}
                className="text-xs font-medium text-[#0071E3] hover:underline inline-flex items-center gap-1"
                title="在知识图谱中查看"
              >
                <span>图谱定位</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <h2 className="text-xl font-bold tracking-tight text-[#1D1D1F] leading-snug">
            {activeItem.title}
          </h2>

          <div className="flex items-center gap-2 text-xs font-mono text-[#86868B] break-all">
            <FolderOpen className="w-3.5 h-3.5 text-[#86868B] shrink-0" />
            <span>{activeItem.windowsPath}</span>
          </div>
        </div>

        <FormatPreviewer
          item={activeItem}
          allItems={allItems}
          onSelectItem={onSelectItem}
          onOpenInBrowser={onOpenInBrowser}
        />

        <div className="pt-5 border-t border-black/[0.06] space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-[#1D1D1F] flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-[#0071E3]" />
              <span>标签 ({activeItem.tags.length})</span>
            </h3>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {activeItem.tags.map((tag) => (
              <span key={tag} className="omni-tag-pill">
                <span>#{tag}</span>
                <button
                  type="button"
                  aria-label={`移除标签 ${tag}`}
                  onClick={() => onRemoveTag(tag)}
                  className="text-[#86868B] hover:text-[#FF3B30] transition-colors p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            <div ref={tagSuggestionsContainerRef} className="relative inline-flex items-center">
              <form onSubmit={onSubmitNewTag} className="inline-flex items-center gap-1.5">
                <div className="relative">
                  <input
                    type="text"
                    aria-label="输入新标签"
                    value={newTagInput}
                    onFocus={() => onOpenTagSuggestions(true)}
                    onChange={(e) => {
                      onChangeNewTagInput(e.target.value);
                      onOpenTagSuggestions(true);
                      onSetHighlightedSuggestion(-1);
                    }}
                    onKeyDown={(e) => {
                      if (!isTagSuggestionsOpen) {
                        if (e.key === 'ArrowDown') {
                          onOpenTagSuggestions(true);
                        }
                        return;
                      }
                      if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        onSetHighlightedSuggestion(
                          highlightedSuggestionIndex < matchingSuggestedTags.length - 1
                            ? highlightedSuggestionIndex + 1
                            : 0
                        );
                      } else if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        onSetHighlightedSuggestion(
                          highlightedSuggestionIndex > 0
                            ? highlightedSuggestionIndex - 1
                            : matchingSuggestedTags.length - 1
                        );
                      } else if (e.key === 'Escape') {
                        e.stopPropagation();
                        onOpenTagSuggestions(false);
                        onSetHighlightedSuggestion(-1);
                      }
                    }}
                    placeholder="+ 标签..."
                    className="px-3 py-1 text-xs rounded-full bg-[#F5F5F7] text-[#1D1D1F] w-32 focus:outline-none focus:ring-2 focus:ring-[#0071E3] pr-7"
                  />
                  <button
                    type="button"
                    aria-label="展开历史标签"
                    onClick={() => onOpenTagSuggestions(!isTagSuggestionsOpen)}
                    title="推荐标签"
                    className={`absolute right-1.5 top-1/2 -translate-y-1/2 p-1 rounded-full transition-colors ${
                      isTagSuggestionsOpen
                        ? 'text-[#0071E3] bg-[#0071E3]/10'
                        : 'text-[#86868B] hover:text-[#0071E3]'
                    }`}
                  >
                    <Sparkles className="w-3 h-3" />
                  </button>
                </div>
                <button
                  type="submit"
                  className="px-2.5 py-1 rounded-full bg-[#1D1D1F] text-white text-xs font-medium hover:bg-[#333336] transition-colors"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </form>

              {isTagSuggestionsOpen && (
                <div
                  data-testid="tag-suggestions-dropdown"
                  className="absolute left-0 top-full mt-2 w-64 rounded-2xl bg-white/95 backdrop-blur-xl border border-black/10 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                >
                  <div className="flex items-center justify-between px-2.5 py-1 text-[11px] text-[#86868B] font-medium border-b border-black/[0.05] mb-1">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#0071E3]" />
                      <span>推荐 ({matchingSuggestedTags.length})</span>
                    </span>
                    <span className="text-[10px] text-[#86868B]/70 font-mono">Esc</span>
                  </div>

                  <div className="max-h-52 overflow-y-auto space-y-0.5 py-0.5">
                    {matchingSuggestedTags.length === 0 ? (
                      <div className="px-3 py-3 text-center text-xs text-[#86868B]">
                        {newTagInput.trim() ? (
                          <div className="space-y-1">
                            <p>无匹配标签</p>
                            <button
                              type="button"
                              onClick={() => onSelectSuggestedTag(newTagInput)}
                              className="text-[#0071E3] font-medium hover:underline text-xs"
                            >
                              创建 "#{newTagInput.trim()}"
                            </button>
                          </div>
                        ) : (
                          <p>无更多历史标签</p>
                        )}
                      </div>
                    ) : (
                      matchingSuggestedTags.map(([tag, count], idx) => {
                        const isHighlighted = idx === highlightedSuggestionIndex;
                        return (
                          <button
                            key={tag}
                            type="button"
                            data-testid={`tag-suggestion-${tag}`}
                            onClick={() => onSelectSuggestedTag(tag)}
                            onMouseEnter={() => onSetHighlightedSuggestion(idx)}
                            className={`w-full text-left px-2.5 py-1.5 rounded-xl transition-all flex items-center justify-between text-xs group ${
                              isHighlighted
                                ? 'bg-[#0071E3] text-white shadow-sm'
                                : 'text-[#1D1D1F] hover:bg-[#0071E3]/10 hover:text-[#0071E3]'
                            }`}
                          >
                            <span className="font-medium truncate flex items-center gap-1">
                              <span className="opacity-60">#</span>
                              <span>{tag}</span>
                            </span>
                            <span
                              className={`text-[10px] font-mono ml-2 shrink-0 px-1.5 py-0.5 rounded-md ${
                                isHighlighted
                                  ? 'bg-white/20 text-white'
                                  : 'bg-black/[0.04] text-[#86868B] group-hover:bg-[#0071E3]/20 group-hover:text-[#0071E3]'
                              }`}
                            >
                              {count}
                            </span>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="pt-5 border-t border-black/[0.06] grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2.5">
            <h3 className="text-xs font-semibold text-[#1D1D1F] flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5 text-[#0071E3]" />
              <span>正向引用 ({outboundReferences.length})</span>
            </h3>

            <div className="space-y-2">
              {outboundReferences.length === 0 ? (
                <div className="text-xs text-[#86868B] py-1">暂无正向关联</div>
              ) : (
                outboundReferences.map((refItem) => (
                  <div
                    key={refItem.id}
                    className="flex items-center justify-between gap-2 p-2.5 rounded-2xl bg-[#F5F5F7]"
                  >
                    <button
                      type="button"
                      onClick={() => onSelectItem(refItem.id)}
                      className="text-left min-w-0 flex-1 hover:text-[#0071E3] transition-colors"
                    >
                      <div className="text-xs font-semibold text-[#1D1D1F] truncate">
                        {refItem.title}
                      </div>
                      <div className="text-[11px] text-[#86868B] font-mono">
                        .{refItem.ext} · {CATEGORY_META[refItem.category].shortName}
                      </div>
                    </button>
                    <button
                      type="button"
                      aria-label={`移除 ${refItem.title}`}
                      onClick={() => onRemoveCrossRef(refItem.id)}
                      className="p-1 text-[#86868B] hover:text-[#FF3B30] shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={onSubmitCrossRef} className="flex items-center gap-2 pt-1">
              <select
                aria-label="关联条目"
                value={newCrossRefTargetId}
                onChange={(e) => onChangeCrossRefTarget(e.target.value)}
                className="flex-1 min-w-0 px-3 py-1.5 text-xs rounded-xl bg-[#F5F5F7] text-[#1D1D1F]"
              >
                <option value="">+ 选择关联条目...</option>
                {allItems
                  .filter(
                    (it) =>
                      it.id !== activeItem.id && !activeItem.references.includes(it.id)
                  )
                  .map((it) => (
                    <option key={it.id} value={it.id}>
                      [.{it.ext}] {it.title}
                    </option>
                  ))}
              </select>
              <button
                type="submit"
                className="omni-btn omni-btn-primary px-3 py-1.5 text-xs"
              >
                <Link2 className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          <div className="space-y-2.5">
            <h3 className="text-xs font-semibold text-[#1D1D1F] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#0071E3]" />
              <span>反向引用 ({inboundBacklinks.length})</span>
            </h3>

            <div className="space-y-2">
              {inboundBacklinks.length === 0 ? (
                <div className="text-xs text-[#86868B] py-1">
                  暂无反向引用
                </div>
              ) : (
                inboundBacklinks.map((backItem) => (
                  <button
                    key={backItem.id}
                    type="button"
                    onClick={() => onSelectItem(backItem.id)}
                    className="w-full text-left flex items-center justify-between gap-2 p-2.5 rounded-2xl bg-[#F5F5F7] hover:bg-[#E8E8ED] transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-[#1D1D1F] truncate">
                        {backItem.title}
                      </div>
                      <div className="text-[11px] text-[#86868B] font-mono">
                        .{backItem.ext} · 节点引用
                      </div>
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#86868B] shrink-0" />
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
