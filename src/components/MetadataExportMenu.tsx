import React, { useState, useRef, useEffect } from 'react';
import { Download, ChevronDown, Check, FileText, Table } from 'lucide-react';
import {
  KnowledgeItem,
  exportItemMetadataAsMarkdown,
  exportItemMetadataAsCsv,
} from '../utils/knowledgeEngine';

interface MetadataExportMenuProps {
  item: KnowledgeItem;
  allItems: KnowledgeItem[];
  onShowToast?: (msg: string) => void;
}

export const MetadataExportMenu: React.FC<MetadataExportMenuProps> = ({
  item,
  allItems,
  onShowToast,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [lastExported, setLastExported] = useState<'md' | 'csv' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  const sanitizeFilename = (name: string) => {
    return name.replace(/[\\/:*?"<>|]/g, '_').slice(0, 40);
  };

  const handleExportMarkdown = () => {
    const mdContent = exportItemMetadataAsMarkdown(item, allItems);
    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sanitizeFilename(item.title)}_metadata.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setLastExported('md');
    setIsOpen(false);
    setTimeout(() => setLastExported(null), 2200);
    if (onShowToast) {
      onShowToast(`已导出 Markdown 元数据文件 (.md)`);
    }
  };

  const handleExportCsv = () => {
    const csvContent = exportItemMetadataAsCsv(item, allItems);
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sanitizeFilename(item.title)}_metadata.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setLastExported('csv');
    setIsOpen(false);
    setTimeout(() => setLastExported(null), 2200);
    if (onShowToast) {
      onShowToast(`已导出 CSV 元数据文件 (.csv)`);
    }
  };

  return (
    <div ref={containerRef} className="relative inline-flex items-center">
      <button
        type="button"
        data-testid="export-metadata-trigger"
        onClick={() => setIsOpen((v) => !v)}
        className="omni-btn omni-btn-subtle px-2.5 py-1 text-xs inline-flex items-center gap-1.5 shadow-2xs"
        title="导出当前条目的属性元数据"
      >
        <Download className="w-3.5 h-3.5 text-[#0071E3]" />
        <span>导出元数据</span>
        <ChevronDown
          className={`w-3 h-3 text-[#86868B] transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          data-testid="export-metadata-dropdown"
          className="absolute right-0 top-full mt-1.5 w-60 rounded-2xl bg-white/95 backdrop-blur-xl border border-black/10 shadow-2xl p-1.5 z-30 animate-in fade-in zoom-in-95 duration-150 text-xs"
        >
          <div className="px-2.5 py-1 text-[10px] font-mono text-[#86868B] border-b border-black/[0.05] mb-1 flex items-center justify-between">
            <span>EXPORT METADATA</span>
            <span className="uppercase">.{item.ext}</span>
          </div>

          <div className="space-y-0.5">
            <button
              type="button"
              data-testid="export-md-button"
              onClick={handleExportMarkdown}
              className="w-full text-left px-2.5 py-2 rounded-xl transition-colors flex items-center justify-between hover:bg-[#0071E3]/10 hover:text-[#0071E3] group"
            >
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="w-4 h-4 text-[#0071E3] shrink-0" />
                <div className="min-w-0">
                  <div className="font-semibold text-[#1D1D1F] group-hover:text-[#0071E3] flex items-center gap-1">
                    <span>Markdown 格式</span>
                    <span className="text-[10px] text-[#86868B] font-mono font-normal">.md</span>
                  </div>
                  <div className="text-[10px] text-[#86868B] truncate">
                    包含标题、标签、双向链接与摘要
                  </div>
                </div>
              </div>
              {lastExported === 'md' ? (
                <Check className="w-3.5 h-3.5 text-[#34C759] shrink-0" />
              ) : (
                <Download className="w-3 h-3 text-[#86868B] group-hover:text-[#0071E3] shrink-0" />
              )}
            </button>

            <button
              type="button"
              data-testid="export-csv-button"
              onClick={handleExportCsv}
              className="w-full text-left px-2.5 py-2 rounded-xl transition-colors flex items-center justify-between hover:bg-[#0071E3]/10 hover:text-[#0071E3] group"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Table className="w-4 h-4 text-[#34C759] shrink-0" />
                <div className="min-w-0">
                  <div className="font-semibold text-[#1D1D1F] group-hover:text-[#0071E3] flex items-center gap-1">
                    <span>CSV 数据表</span>
                    <span className="text-[10px] text-[#86868B] font-mono font-normal">.csv</span>
                  </div>
                  <div className="text-[10px] text-[#86868B] truncate">
                    UTF-8 带 BOM 标准电子表格格式
                  </div>
                </div>
              </div>
              {lastExported === 'csv' ? (
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
