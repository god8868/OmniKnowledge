import React, { useMemo, useState } from 'react';
import {
  Search,
  Cpu,
  SlidersHorizontal,
  X,
  ArrowUpDown,
  Sparkles,
  Layers,
  Clock,
  HardDrive,
  Hash,
} from 'lucide-react';
import {
  KnowledgeItem,
  KnowledgeCategory,
  CATEGORY_META,
  searchKnowledgeBase,
  computeEmbedding,
  VectorSearchResult,
} from '../utils/knowledgeEngine';
import { SearchResultCard } from './SearchResultCard';

interface VectorSearchViewProps {
  items: KnowledgeItem[];
  onSelectAndInspect: (id: string) => void;
}

const PRESET_QUERIES = [
  'AutoCAD DXF 钢结构桁架节点与图层解析',
  '微信公众号与视频号防盗链离线归档',
  '无损音频 FLAC 与 MKV 视频 Whisper 语音转写',
  'Windows 本地 SQLite-vec 向量检索与 WebDAV 异地同步',
  'Photoshop PSD 图层母版与 RAW 传感器 EXIF 元数据',
];

export type SearchSortKey = 'hybrid' | 'vector' | 'keyword' | 'date' | 'size';
export type SortDirection = 'desc' | 'asc';

export const VectorSearchView: React.FC<VectorSearchViewProps> = ({
  items,
  onSelectAndInspect,
}) => {
  const [query, setQuery] = useState<string>('Windows 本地 SQLite-vec 向量检索与多格式解码');
  const [category, setCategory] = useState<KnowledgeCategory | 'all'>('all');
  const [vectorWeight, setVectorWeight] = useState<number>(0.7);
  const [sortKey, setSortKey] = useState<SearchSortKey>('hybrid');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [expandedContextIds, setExpandedContextIds] = useState<Set<string>>(new Set());
  const [copiedSnippetId, setCopiedSnippetId] = useState<string | null>(null);

  const queryVector = useMemo(() => computeEmbedding(query), [query]);

  const rawResults = useMemo(
    () =>
      searchKnowledgeBase(items, query, {
        category,
        vectorWeight,
        minScore: 0.05,
      }),
    [items, query, category, vectorWeight]
  );

  const sortedResults = useMemo(() => {
    const list = [...rawResults];
    list.sort((a, b) => {
      let diff = 0;
      if (sortKey === 'hybrid') {
        diff = a.hybridScore - b.hybridScore;
      } else if (sortKey === 'vector') {
        diff = a.vectorScore - b.vectorScore;
      } else if (sortKey === 'keyword') {
        diff = a.keywordScore - b.keywordScore;
      } else if (sortKey === 'date') {
        const timeA = new Date(a.item.updatedAt).getTime() || 0;
        const timeB = new Date(b.item.updatedAt).getTime() || 0;
        diff = timeA - timeB;
      } else if (sortKey === 'size') {
        diff = a.item.sizeBytes - b.item.sizeBytes;
      }
      return sortDirection === 'desc' ? -diff : diff;
    });
    return list;
  }, [rawResults, sortKey, sortDirection]);

  const toggleExpandContext = (id: string) => {
    setExpandedContextIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCopySnippet = (id: string, snippet: string) => {
    navigator.clipboard?.writeText(snippet);
    setCopiedSnippetId(id);
    setTimeout(() => setCopiedSnippetId(null), 2000);
  };

  const maxScore = rawResults[0]?.hybridScore || 0;
  const avgScore =
    rawResults.length > 0
      ? rawResults.reduce((acc, r) => acc + r.hybridScore, 0) / rawResults.length
      : 0;

  return (
    <div className="space-y-6">
      <div className="apple-card rounded-3xl p-6 sm:p-8 space-y-6">
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-semibold text-[#0071E3] tracking-wider">
              LOCAL NEURAL VECTOR ENGINE
            </span>
            <span className="font-mono text-[#86868B] tabular-nums">
              BGE-M3 & SQLite-vec
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1D1D1F] flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#0071E3]" />
            <span>本地稠密向量语义检索引擎</span>
          </h2>
          <p className="text-xs text-[#86868B] mt-1">
            全部文本、OCR 图层文字、EXIF 参数与音视频转写字幕均在本地转化为 32-D 归一化稠密向量，支持跨模态语义联想与精准片段提取。
          </p>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-[#86868B] absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="输入自然语言、工程问题或跨模态语义概念检索本地资料库..."
            className="w-full pl-11 pr-10 py-3 text-sm rounded-2xl bg-[#F5F5F7] hover:bg-[#EBEBF0] focus:bg-white text-[#1D1D1F] placeholder-[#86868B] focus:outline-none focus:ring-2 focus:ring-[#0071E3] transition-all shadow-inner"
          />
          {query && (
            <button
              type="button"
              aria-label="清空搜索"
              onClick={() => setQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#86868B] hover:text-[#1D1D1F] p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="space-y-2">
          <div className="text-[11px] font-semibold text-[#86868B] flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-[#0071E3]" />
            <span>跨模态示例查询</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {PRESET_QUERIES.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setQuery(preset)}
                className={`px-3 py-1 text-xs rounded-full transition-all text-left truncate max-w-md ${
                  query === preset
                    ? 'bg-[#0071E3] text-white shadow-2xs'
                    : 'bg-[#F5F5F7] text-[#424245] hover:bg-[#EBEBF0]'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-black/[0.06]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-1 p-1 rounded-xl bg-[#F5F5F7] flex-wrap">
              <button
                type="button"
                onClick={() => setCategory('all')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  category === 'all'
                    ? 'bg-white text-[#1D1D1F] shadow-2xs'
                    : 'text-[#86868B] hover:text-[#1D1D1F]'
                }`}
              >
                全模态库
              </button>
              {(Object.keys(CATEGORY_META) as KnowledgeCategory[]).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    category === cat
                      ? 'bg-white text-[#1D1D1F] shadow-2xs'
                      : 'text-[#86868B] hover:text-[#1D1D1F]'
                  }`}
                >
                  {CATEGORY_META[cat].shortName}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 text-xs text-[#424245]">
              <span className="flex items-center gap-1 text-[#86868B]">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#0071E3]" />
                <span>混合权重：</span>
              </span>
              <span className="font-mono font-medium">
                语义 {(vectorWeight * 100).toFixed(0)}% · 关键词 {((1 - vectorWeight) * 100).toFixed(0)}%
              </span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={vectorWeight}
                onChange={(e) => setVectorWeight(parseFloat(e.target.value))}
                className="w-24 accent-[#0071E3] cursor-pointer"
              />
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[#111113] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 font-mono text-[11px] text-[#A1A1A6]">
              <span className="w-2 h-2 rounded-full bg-[#0071E3] animate-pulse" />
              <span>QUERY TENSOR [32-D]</span>
            </div>
            <div className="flex items-center gap-1 overflow-x-auto py-1">
              {queryVector.slice(0, 24).map((val, i) => {
                const height = Math.max(4, Math.min(20, Math.round(Math.abs(val) * 60)));
                const isPositive = val >= 0;
                return (
                  <div
                    key={i}
                    title={`Dim ${i}: ${val.toFixed(3)}`}
                    style={{ height: `${height}px` }}
                    className={`w-1 rounded-sm ${isPositive ? 'bg-[#2997FF]' : 'bg-[#AF52DE]'}`}
                  />
                );
              })}
            </div>
            <div className="font-mono text-[10px] text-[#86868B] tabular-nums">
              L2-Norm: 1.000
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-2 text-xs text-[#86868B]">
        <div className="flex items-center gap-2 flex-wrap">
          <span>
            召回 <strong className="text-[#1D1D1F] tabular-nums">{sortedResults.length}</strong> 项结果
          </span>
          <span>·</span>
          <span>
            最高匹配: <strong className="text-[#0071E3] tabular-nums font-mono">{(maxScore * 100).toFixed(1)}%</strong>
          </span>
          <span>·</span>
          <span>
            平均置信度: <strong className="text-[#1D1D1F] tabular-nums font-mono">{(avgScore * 100).toFixed(1)}%</strong>
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-[#86868B]">排序依据：</span>
          <div className="flex items-center p-0.5 rounded-lg bg-black/[0.05]">
            <button
              type="button"
              onClick={() => setSortKey('hybrid')}
              className={`px-2 py-0.5 rounded-md text-xs font-medium transition-all ${
                sortKey === 'hybrid'
                  ? 'bg-white text-[#1D1D1F] shadow-2xs'
                  : 'text-[#6E6E73] hover:text-[#1D1D1F]'
              }`}
            >
              综合分
            </button>
            <button
              type="button"
              onClick={() => setSortKey('vector')}
              className={`px-2 py-0.5 rounded-md text-xs font-medium transition-all ${
                sortKey === 'vector'
                  ? 'bg-white text-[#1D1D1F] shadow-2xs'
                  : 'text-[#6E6E73] hover:text-[#1D1D1F]'
              }`}
            >
              纯向量
            </button>
            <button
              type="button"
              onClick={() => setSortKey('keyword')}
              className={`px-2 py-0.5 rounded-md text-xs font-medium transition-all ${
                sortKey === 'keyword'
                  ? 'bg-white text-[#1D1D1F] shadow-2xs'
                  : 'text-[#6E6E73] hover:text-[#1D1D1F]'
              }`}
            >
              关键词
            </button>
            <button
              type="button"
              onClick={() => setSortKey('date')}
              className={`px-2 py-0.5 rounded-md text-xs font-medium transition-all ${
                sortKey === 'date'
                  ? 'bg-white text-[#1D1D1F] shadow-2xs'
                  : 'text-[#6E6E73] hover:text-[#1D1D1F]'
              }`}
            >
              日期
            </button>
            <button
              type="button"
              onClick={() => setSortKey('size')}
              className={`px-2 py-0.5 rounded-md text-xs font-medium transition-all ${
                sortKey === 'size'
                  ? 'bg-white text-[#1D1D1F] shadow-2xs'
                  : 'text-[#6E6E73] hover:text-[#1D1D1F]'
              }`}
            >
              体积
            </button>
          </div>

          <button
            type="button"
            onClick={() => setSortDirection((d) => (d === 'desc' ? 'asc' : 'desc'))}
            className="omni-btn omni-btn-subtle px-2 py-1 text-xs"
            title={sortDirection === 'desc' ? '降序 (高→低)' : '升序 (低→高)'}
          >
            <ArrowUpDown className="w-3 h-3 text-[#0071E3]" />
            <span>{sortDirection === 'desc' ? '降序' : '升序'}</span>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {sortedResults.length === 0 ? (
          <div className="apple-card rounded-3xl p-12 text-center space-y-2">
            <div className="text-sm font-semibold text-[#1D1D1F]">
              未检索到符合条件的本地向量索引
            </div>
            <p className="text-xs text-[#86868B]">
              请尝试调整搜索词，降低权重过滤门槛，或在全模态分类下进行检索。
            </p>
          </div>
        ) : (
          sortedResults.map((result, idx) => (
            <SearchResultCard
              key={result.item.id}
              result={result}
              idx={idx}
              query={query}
              isExpanded={expandedContextIds.has(result.item.id)}
              isCopied={copiedSnippetId === result.item.id}
              onToggleExpand={() => toggleExpandContext(result.item.id)}
              onCopySnippet={(snippet) => handleCopySnippet(result.item.id, snippet)}
              onSelectAndInspect={onSelectAndInspect}
            />
          ))
        )}
      </div>
    </div>
  );
};
