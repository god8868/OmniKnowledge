import React from 'react';
import { FileText, Copy, Check, Sliders } from 'lucide-react';
import { KnowledgeItem, FormatSpec } from '../../utils/knowledgeEngine';
import { WikiLinkText } from '../WikiLinkText';

interface DocumentPreviewerProps {
  item: KnowledgeItem;
  formatSpec: FormatSpec;
  allItems: KnowledgeItem[];
  onSelectItem: (id: string) => void;
}

export const DocumentPreviewer: React.FC<DocumentPreviewerProps> = ({
  item,
  formatSpec,
  allItems,
  onSelectItem,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard?.writeText(item.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  if (item.ext === 'csv' && item.metadata.csvHeaders && item.metadata.csvRows) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl overflow-hidden bg-[#F5F5F7] border border-black/[0.06]">
          <div className="px-4 py-3 bg-[#F5F5F7] border-b border-black/[0.06] flex items-center justify-between text-xs text-[#86868B]">
            <span className="font-semibold text-[#1D1D1F]">
              DuckDB 列式索引 ({item.metadata.csvRows.length} 行)
            </span>
            <span className="font-mono">{formatSpec.decoderPipeline}</span>
          </div>
          <div className="overflow-x-auto bg-white max-h-96">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-black/[0.06] bg-[#FAFAFC]">
                  {item.metadata.csvHeaders.map((h, i) => (
                    <th key={i} className="py-2.5 px-3.5 font-semibold text-[#1D1D1F] whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04] font-mono tabular-nums">
                {item.metadata.csvRows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-[#F5F5F7]/70 transition-colors">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="py-2 px-3.5 text-[#1D1D1F] whitespace-nowrap">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="rounded-2xl bg-[#F5F5F7] overflow-hidden border border-black/[0.05]">
        <div className="px-4 py-2.5 border-b border-black/[0.05] flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-[#86868B]">
            <FileText className="w-3.5 h-3.5 text-[#0071E3] shrink-0" />
            <span className="font-semibold text-[#1D1D1F]">{formatSpec.label}</span>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="omni-btn omni-btn-subtle px-2.5 py-1 text-xs"
            title="复制全文"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? '已复制' : '复制全文'}</span>
          </button>
        </div>

        <div className="p-5 bg-white text-[13px] text-[#1D1D1F] whitespace-pre-wrap leading-relaxed max-h-[460px] overflow-y-auto">
          <WikiLinkText text={item.content} allItems={allItems} onSelectItem={onSelectItem} />
        </div>

        <div className="px-4 py-2 bg-[#F5F5F7] border-t border-black/[0.05] text-[11px] text-[#86868B] flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5">
            <Sliders className="w-3 h-3" />
            <span>{formatSpec.decoderPipeline}</span>
          </span>
          <span className="font-mono tabular-nums">SHA: {item.sha256.slice(0, 10)}</span>
        </div>
      </div>
    </div>
  );
};
