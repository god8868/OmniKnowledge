import React from 'react';
import {
  ArrowUpRight,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  FileText,
  FileCode2,
} from 'lucide-react';
import {
  VectorSearchResult,
  CATEGORY_META,
  formatBytes,
} from '../utils/knowledgeEngine';
import { HighlightedText } from './HighlightedText';

interface SearchResultCardProps {
  result: VectorSearchResult;
  idx: number;
  query: string;
  isExpanded: boolean;
  isCopied: boolean;
  onToggleExpand: () => void;
  onCopySnippet: (snippet: string) => void;
  onSelectAndInspect: (id: string) => void;
}

export const SearchResultCard: React.FC<SearchResultCardProps> = ({
  result,
  idx,
  query,
  isExpanded,
  isCopied,
  onToggleExpand,
  onCopySnippet,
  onSelectAndInspect,
}) => {
  const { item, vectorScore, keywordScore, hybridScore, matchedSnippet, matchedTerms, matchSource } = result;
  const isImportant = item.tags.includes('重要') || item.tags.includes('重点关注');

  return (
    <div
      data-testid={`search-result-${item.id}`}
      className="apple-card rounded-3xl p-5 sm:p-6 transition-all hover:shadow-md space-y-4"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-[#0071E3]/10 text-[#0071E3] font-bold">
            #{String(idx + 1).padStart(2, '0')}
          </span>
          <span className="text-xs text-[#86868B]">
            {CATEGORY_META[item.category].name}
          </span>
          <span className="text-[#86868B]">·</span>
          <span className="font-mono font-semibold uppercase text-xs text-[#1D1D1F]">
            .{item.ext}
          </span>
          <span className="text-[#86868B]">·</span>
          <span className="font-mono text-xs text-[#86868B] tabular-nums">
            {formatBytes(item.sizeBytes)}
          </span>
          <span className="text-[#86868B]">·</span>
          <span className="font-mono text-xs text-[#86868B] tabular-nums">
            {item.updatedAt.split(' ')[0]}
          </span>
          {isImportant && (
            <span className="omni-badge omni-badge-important">
              ★
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <div className="text-right">
            <div className="flex items-center gap-1.5 justify-end">
              <span className="text-[11px] text-[#86868B]">相关度</span>
              <span className="font-mono font-bold text-sm text-[#0071E3] tabular-nums">
                {(hybridScore * 100).toFixed(1)}%
              </span>
            </div>
            <div className="text-[10px] text-[#86868B] font-mono tabular-nums">
              向量 {(vectorScore * 100).toFixed(0)}% · 词频 {(keywordScore * 100).toFixed(0)}%
            </div>
          </div>

          <button
            type="button"
            onClick={() => onSelectAndInspect(item.id)}
            className="omni-btn omni-btn-primary px-3 py-1.5 text-xs shadow-2xs"
            title="在资料库中检视"
          >
            <span>检视</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-base font-bold text-[#1D1D1F] tracking-tight leading-snug">
          <HighlightedText text={item.title} query={query} matchedTerms={matchedTerms} />
        </h3>
        <p className="mt-1 text-xs text-[#6E6E73] font-mono truncate">
          {item.windowsPath}
        </p>
      </div>

      <div className="rounded-2xl bg-[#FAFAFC] p-3.5 border border-black/[0.05] space-y-2">
        <div className="flex items-center justify-between text-[11px] text-[#86868B]">
          <span className="flex items-center gap-1.5 font-medium">
            {matchSource === 'content' ? (
              <FileCode2 className="w-3.5 h-3.5 text-[#0071E3]" />
            ) : (
              <FileText className="w-3.5 h-3.5 text-[#5856D6]" />
            )}
            <span>高频命中片段</span>
            {matchedTerms.length > 0 && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-[#86868B] ml-1">
                {matchedTerms.map((t) => (
                  <span key={t} className="px-1.5 py-0.2 rounded bg-black/[0.04] text-[#0071E3] font-mono">
                    #{t}
                  </span>
                ))}
              </span>
            )}
          </span>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onCopySnippet(matchedSnippet)}
              className="omni-btn omni-btn-subtle px-2 py-1 text-[11px]"
              title="复制片段"
            >
              {isCopied ? (
                <>
                  <Check className="w-3 h-3 text-[#34C759]" />
                  <span className="text-[#34C759]">已复制</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>复制</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onToggleExpand}
              className="omni-btn omni-btn-subtle px-2 py-1 text-[11px]"
            >
              {isExpanded ? (
                <>
                  <span>收起</span>
                  <ChevronUp className="w-3 h-3" />
                </>
              ) : (
                <>
                  <span>展开</span>
                  <ChevronDown className="w-3 h-3" />
                </>
              )}
            </button>
          </div>
        </div>

        <p className="text-xs text-[#1D1D1F] leading-relaxed font-mono">
          <HighlightedText text={matchedSnippet} query={query} matchedTerms={matchedTerms} />
        </p>

        {isExpanded && (
          <div className="pt-2.5 mt-2.5 border-t border-black/[0.05] space-y-2 animate-in fade-in duration-150">
            <div className="text-[11px] font-semibold text-[#86868B]">资产完整索引上下文：</div>
            <pre className="p-3 rounded-xl bg-white text-xs font-mono text-[#424245] leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto border border-black/[0.04]">
              <HighlightedText text={item.content} query={query} matchedTerms={matchedTerms} />
            </pre>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-[#86868B] pt-1">
        <div className="flex items-center gap-1.5 truncate">
          {item.tags.map((tag) => (
            <span key={tag} className="omni-tag-pill py-0.5 px-2 text-[11px]">
              #{tag}
            </span>
          ))}
        </div>
        <span className="font-mono text-[11px] text-[#86868B] tabular-nums shrink-0">
          🔗 {item.references.length}
        </span>
      </div>
    </div>
  );
};
