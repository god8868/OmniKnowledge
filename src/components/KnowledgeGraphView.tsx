import React, { useMemo, useState } from 'react';
import {
  Share2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ArrowUpRight,
  Link2,
  Hash,
} from 'lucide-react';
import {
  KnowledgeItem,
  KnowledgeCategory,
  CATEGORY_META,
  buildKnowledgeGraph,
  computeGraphNodePositions,
  exportGraphAsJson,
  exportGraphAsSvg,
  GRAPH_CATEGORY_COLORS,
} from '../utils/knowledgeEngine';
import { GraphExportMenu } from './GraphExportMenu';

interface KnowledgeGraphViewProps {
  items: KnowledgeItem[];
  selectedItemId: string;
  onSelectItem: (id: string) => void;
  onOpenInspectorView: (id: string) => void;
  onShowToast?: (msg: string) => void;
}

export const KnowledgeGraphView: React.FC<KnowledgeGraphViewProps> = ({
  items,
  selectedItemId,
  onSelectItem,
  onOpenInspectorView,
  onShowToast,
}) => {
  const [categoryFilter, setCategoryFilter] = useState<KnowledgeCategory | 'all'>('all');
  const [showTagEdges, setShowTagEdges] = useState<boolean>(true);
  const [zoom, setZoom] = useState<number>(1);

  const graph = useMemo(
    () => buildKnowledgeGraph(items, { categoryFilter, includeTagEdges: showTagEdges }),
    [items, categoryFilter, showTagEdges]
  );

  const nodePositions = useMemo(() => {
    return computeGraphNodePositions(graph.nodes, 880, 520);
  }, [graph.nodes]);

  const activeNode = items.find((i) => i.id === selectedItemId) || items[0];

  const connectedEdges = useMemo(() => {
    if (!activeNode) return [];
    const raw = graph.edges.filter(
      (e) => e.source === activeNode.id || e.target === activeNode.id
    );
    const byNeighbor = new Map<string, typeof raw[0]>();
    for (const edge of raw) {
      const neighborId = edge.source === activeNode.id ? edge.target : edge.source;
      const existing = byNeighbor.get(neighborId);
      if (!existing) {
        byNeighbor.set(neighborId, edge);
      } else if (existing.type === 'reference' && edge.type === 'reference') {
        byNeighbor.set(neighborId, {
          ...existing,
          label: '双向交叉互引',
        });
      }
    }
    return Array.from(byNeighbor.values());
  }, [graph.edges, activeNode]);

  const handleExportJson = () => {
    const jsonStr = exportGraphAsJson(graph, items);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `omnivault_knowledge_graph_${categoryFilter}_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    if (onShowToast) {
      onShowToast('已导出知识关联网络为 JSON 格式');
    }
  };

  const handleExportSvg = () => {
    const title = `OmniKnowledge Knowledge Graph (${categoryFilter === 'all' ? '全部模态' : CATEGORY_META[categoryFilter]?.shortName})`;
    const svgStr = exportGraphAsSvg(graph, nodePositions, { width: 880, height: 520, title });
    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `omnivault_knowledge_graph_${categoryFilter}_${new Date().toISOString().slice(0, 10)}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    if (onShowToast) {
      onShowToast('已导出知识关联网络为 SVG 矢量图');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
      <div className="lg:col-span-8 apple-card rounded-3xl flex flex-col overflow-hidden">
        <div className="px-5 py-3.5 border-b border-black/[0.06] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#F5F5F7] flex-wrap">
            <button
              type="button"
              onClick={() => setCategoryFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all whitespace-nowrap shrink-0 ${
                categoryFilter === 'all'
                  ? 'bg-white text-[#1D1D1F] shadow-2xs'
                  : 'text-[#86868B] hover:text-[#1D1D1F]'
              }`}
            >
              全部节点 ({items.length})
            </button>
            {(Object.keys(CATEGORY_META) as KnowledgeCategory[]).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all whitespace-nowrap shrink-0 ${
                  categoryFilter === cat
                    ? 'bg-white text-[#1D1D1F] shadow-2xs'
                    : 'text-[#86868B] hover:text-[#1D1D1F]'
                }`}
              >
                {CATEGORY_META[cat].shortName}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <label className="inline-flex items-center gap-1.5 text-xs text-[#424245] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showTagEdges}
                onChange={(e) => setShowTagEdges(e.target.checked)}
                className="rounded border-black/20 text-[#0071E3] focus:ring-[#0071E3]"
              />
              <span>同标签共现边</span>
            </label>

            <div className="h-4 w-px bg-black/[0.08] mx-1" />

            <button
              type="button"
              aria-label="缩小图谱"
              onClick={() => setZoom((z) => Math.max(0.7, Number((z - 0.15).toFixed(2))))}
              className="p-1.5 rounded-lg bg-[#F5F5F7] hover:bg-[#E8E8ED] text-[#1D1D1F] transition-colors"
              title="缩小"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              aria-label="放大图谱"
              onClick={() => setZoom((z) => Math.min(1.5, Number((z + 0.15).toFixed(2))))}
              className="p-1.5 rounded-lg bg-[#F5F5F7] hover:bg-[#E8E8ED] text-[#1D1D1F] transition-colors"
              title="放大"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              aria-label="重置视角"
              onClick={() => setZoom(1)}
              className="p-1.5 rounded-lg bg-[#F5F5F7] hover:bg-[#E8E8ED] text-[#1D1D1F] transition-colors"
              title="重置"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <div className="h-4 w-px bg-black/[0.08] mx-1" />

            <GraphExportMenu
              onExportJson={handleExportJson}
              onExportSvg={handleExportSvg}
              totalNodes={graph.nodes.length}
              totalEdges={graph.edges.length}
            />
          </div>
        </div>

        <div
          data-testid="knowledge-graph-canvas"
          className="relative flex-1 min-h-[490px] bg-[#111113] flex items-center justify-center overflow-hidden"
        >
          <svg
            viewBox="0 0 880 520"
            className="w-full h-full select-none"
            style={{ transform: `scale(${zoom})`, transition: 'transform 150ms ease-out' }}
          >
            <defs>
              <pattern id="graphGrid" width="32" height="32" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="rgba(255, 255, 255, 0.1)" />
              </pattern>
              <marker
                id="arrowRef"
                viewBox="0 0 10 10"
                refX="22"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#2997FF" />
              </marker>
            </defs>

            <rect width="880" height="520" fill="url(#graphGrid)" />

            {graph.edges.map((edge) => {
              const p1 = nodePositions[edge.source];
              const p2 = nodePositions[edge.target];
              if (!p1 || !p2) return null;

              const isHighlighted =
                edge.source === activeNode?.id || edge.target === activeNode?.id;
              const isReference = edge.type === 'reference';

              return (
                <g key={edge.id}>
                  <line
                    x1={p1.x}
                    y1={p1.y}
                    x2={p2.x}
                    y2={p2.y}
                    stroke={
                      isReference
                        ? isHighlighted
                          ? '#2997FF'
                          : 'rgba(41, 151, 255, 0.42)'
                        : isHighlighted
                        ? '#A1A1A6'
                        : 'rgba(142, 142, 147, 0.22)'
                    }
                    strokeWidth={isHighlighted ? 2.2 : 1.2}
                    strokeDasharray={isReference ? undefined : '4 4'}
                    markerEnd={isReference ? 'url(#arrowRef)' : undefined}
                  />
                  {isHighlighted && (
                    <text
                      x={(p1.x + p2.x) / 2}
                      y={(p1.y + p2.y) / 2 - 6}
                      textAnchor="middle"
                      fill={isReference ? '#64D2FF' : '#D1D1D6'}
                      fontSize="10"
                      fontFamily="Plus Jakarta Sans, sans-serif"
                    >
                      {edge.label}
                    </text>
                  )}
                </g>
              );
            })}

            {graph.nodes.map((node) => {
              const pos = nodePositions[node.id];
              if (!pos) return null;
              const isSelected = node.id === activeNode?.id;
              const color = GRAPH_CATEGORY_COLORS[node.category] || '#0071E3';
              const shortLabel =
                node.title.length > 16 ? node.title.slice(0, 15) + '…' : node.title;

              return (
                <g
                  key={node.id}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  onClick={() => onSelectItem(node.id)}
                  className="cursor-pointer"
                  role="button"
                  tabIndex={0}
                  aria-label={`节点: ${node.title}`}
                >
                  {isSelected && (
                    <circle
                      r={24}
                      fill="none"
                      stroke="#2997FF"
                      strokeWidth="2"
                      strokeDasharray="3 3"
                    />
                  )}
                  <circle
                    r={isSelected ? 17 : 13}
                    fill={color}
                    stroke={isSelected ? '#FFFFFF' : '#141416'}
                    strokeWidth={isSelected ? 3 : 2}
                  />
                  <text
                    textAnchor="middle"
                    dy="3.5"
                    fill="#FFFFFF"
                    fontSize="9"
                    fontWeight="600"
                    fontFamily="JetBrains Mono, monospace"
                  >
                    .{node.ext}
                  </text>
                  <rect
                    x={-80}
                    y={22}
                    width={160}
                    height={21}
                    rx={8}
                    fill={isSelected ? '#0071E3' : 'rgba(29, 29, 31, 0.9)'}
                    stroke={isSelected ? '#64D2FF' : 'rgba(255, 255, 255, 0.14)'}
                    strokeWidth="1"
                  />
                  <text
                    textAnchor="middle"
                    y={36}
                    fill="#F5F5F7"
                    fontSize="10.5"
                    fontWeight={isSelected ? '600' : '500'}
                  >
                    {shortLabel}
                  </text>
                </g>
              );
            })}
          </svg>

          <div className="absolute bottom-4 left-5 right-5 flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 rounded-2xl bg-[#1D1D1F]/85 backdrop-blur-xl border border-white/10 text-xs text-[#D1D1D6]">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-5 h-0.5 bg-[#2997FF] inline-block" />
                <span>实线：显式引用 [[WikiLink]]</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-5 h-0.5 border-b border-dashed border-[#86868B] inline-block" />
                <span>虚线：标签共现</span>
              </span>
            </div>
            <span className="font-mono tabular-nums text-[#86868B]">
              {graph.nodes.length} 节点 · {graph.edges.length} 关系
            </span>
          </div>
        </div>
      </div>

      <div className="lg:col-span-4 apple-card rounded-3xl p-6 flex flex-col justify-between">
        {activeNode ? (
          <div className="space-y-5">
            <div>
              <div className="flex items-center justify-between text-xs text-[#86868B] mb-1.5">
                <span className="font-medium text-[#0071E3]">
                  {CATEGORY_META[activeNode.category].name}
                </span>
                <span className="font-mono uppercase">.{activeNode.ext}</span>
              </div>
              <h3 className="text-lg font-bold tracking-tight text-[#1D1D1F] leading-snug">
                {activeNode.title}
              </h3>
              <p className="mt-2 text-xs text-[#6E6E73] leading-relaxed">
                {activeNode.summary}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2.5 pt-3 border-t border-black/[0.06] text-center">
              <div className="p-3 rounded-2xl bg-[#F5F5F7]">
                <div className="text-xs text-[#86868B]">引用出度</div>
                <div className="mt-1 text-lg font-bold font-mono tabular-nums text-[#1D1D1F]">
                  {activeNode.references.length}
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-[#F5F5F7]">
                <div className="text-xs text-[#86868B]">相连边数</div>
                <div className="mt-1 text-lg font-bold font-mono tabular-nums text-[#0071E3]">
                  {connectedEdges.length}
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-[#F5F5F7]">
                <div className="text-xs text-[#86868B]">语义标签</div>
                <div className="mt-1 text-lg font-bold font-mono tabular-nums text-[#1D1D1F]">
                  {activeNode.tags.length}
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-[#1D1D1F] mb-2.5 flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-[#0071E3]" />
                <span>一跳关联节点 ({connectedEdges.length})</span>
              </h4>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {connectedEdges.map((edge) => {
                  const neighborId =
                    edge.source === activeNode.id ? edge.target : edge.source;
                  const neighbor = items.find((i) => i.id === neighborId);
                  if (!neighbor) return null;
                  return (
                    <button
                      key={edge.id}
                      type="button"
                      onClick={() => onSelectItem(neighbor.id)}
                      className="w-full text-left p-3 rounded-2xl bg-[#F5F5F7] hover:bg-[#E8E8ED] transition-colors flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-[#1D1D1F] truncate">
                          {neighbor.title}
                        </div>
                        <div className="text-[11px] text-[#86868B] flex items-center gap-1.5 mt-0.5">
                          {edge.type === 'reference' ? (
                            <Link2 className="w-3 h-3 text-[#0071E3]" />
                          ) : (
                            <Hash className="w-3 h-3 text-[#86868B]" />
                          )}
                          <span>{edge.label}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono">.{neighbor.ext}</span>
                        </div>
                      </div>
                      <ArrowUpRight className="w-3.5 h-3.5 text-[#86868B] shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}

        {activeNode && (
          <div className="pt-4 mt-4 border-t border-black/[0.06]">
            <button
              type="button"
              onClick={() => onOpenInspectorView(activeNode.id)}
              className="w-full py-2.5 px-4 rounded-full bg-[#1D1D1F] hover:bg-[#333336] text-white text-xs font-medium transition-colors"
            >
              在知识库预览器中打开此条目
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
