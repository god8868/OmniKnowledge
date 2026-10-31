import React, { useState, useRef, useEffect } from 'react';
import { Download, ChevronDown, Check } from 'lucide-react';

interface GraphExportMenuProps {
  onExportJson: () => void;
  onExportSvg: () => void;
  totalNodes: number;
  totalEdges: number;
}

export const GraphExportMenu: React.FC<GraphExportMenuProps> = ({
  onExportJson,
  onExportSvg,
  totalNodes,
  totalEdges,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [lastExported, setLastExported] = useState<'json' | 'svg' | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutside);
    }
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [isOpen]);

  const handleJsonClick = () => {
    onExportJson();
    setLastExported('json');
    setIsOpen(false);
    setTimeout(() => setLastExported(null), 2500);
  };

  const handleSvgClick = () => {
    onExportSvg();
    setLastExported('svg');
    setIsOpen(false);
    setTimeout(() => setLastExported(null), 2500);
  };

  return (
    <div ref={menuRef} className="relative inline-flex items-center">
      <button
        type="button"
        aria-label="导出知识图谱"
        data-testid="export-graph-trigger"
        onClick={() => setIsOpen((v) => !v)}
        className="omni-btn omni-btn-subtle px-2.5 py-1.5 text-xs inline-flex items-center gap-1.5 shadow-2xs"
        title="导出知识网络为 JSON 或 SVG"
      >
        <Download className="w-3.5 h-3.5 text-[#0071E3]" />
        <span>导出</span>
        <ChevronDown className={`w-3 h-3 text-[#86868B] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          data-testid="graph-export-dropdown"
          className="absolute right-0 top-full mt-1.5 w-56 rounded-2xl bg-white/95 backdrop-blur-xl border border-black/10 shadow-2xl p-1.5 z-30 animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="px-2.5 py-1 text-[10px] text-[#86868B] font-mono border-b border-black/[0.05] mb-1 flex items-center justify-between">
            <span>EXPORT GRAPH</span>
            <span>{totalNodes}N · {totalEdges}E</span>
          </div>

          <div className="space-y-0.5">
            <button
              type="button"
              data-testid="export-json-button"
              onClick={handleJsonClick}
              className="w-full text-left px-2.5 py-2 rounded-xl transition-colors flex items-center justify-between text-xs hover:bg-[#0071E3]/10 hover:text-[#0071E3] group"
            >
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-[#5856D6]/15 text-[#5856D6] flex items-center justify-center font-mono font-bold text-[10px]">
                  { }
                </span>
                <div>
                  <div className="font-semibold text-[#1D1D1F] group-hover:text-[#0071E3] flex items-center gap-1.5">
                    <span>JSON 结构</span>
                    <span className="text-[10px] text-[#86868B] font-normal font-mono">.json</span>
                  </div>
                  <div className="text-[10px] text-[#86868B]">Cytoscape / Gephi / D3 节点边模型</div>
                </div>
              </div>
              {lastExported === 'json' ? (
                <Check className="w-3.5 h-3.5 text-[#34C759] shrink-0" />
              ) : (
                <Download className="w-3 h-3 text-[#86868B] group-hover:text-[#0071E3] shrink-0" />
              )}
            </button>

            <button
              type="button"
              data-testid="export-svg-button"
              onClick={handleSvgClick}
              className="w-full text-left px-2.5 py-2 rounded-xl transition-colors flex items-center justify-between text-xs hover:bg-[#0071E3]/10 hover:text-[#0071E3] group"
            >
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-[#0071E3]/15 text-[#0071E3] flex items-center justify-center font-mono font-bold text-[10px]">
                  ❖
                </span>
                <div>
                  <div className="font-semibold text-[#1D1D1F] group-hover:text-[#0071E3] flex items-center gap-1.5">
                    <span>SVG 矢量图</span>
                    <span className="text-[10px] text-[#86868B] font-normal font-mono">.svg</span>
                  </div>
                  <div className="text-[10px] text-[#86868B]">矢量拓扑图·可导入 Illustrator / Figma</div>
                </div>
              </div>
              {lastExported === 'svg' ? (
                <Check className="w-3.5 h-3.5 text-[#34C759] shrink-0" />
              ) : (
                <Download className="w-3 h-3 text-[#86868B] group-hover:text-[#0071E3] shrink-0" />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
