import React, { useState } from 'react';
import { Code2, Copy, Check } from 'lucide-react';
import { KnowledgeItem, FormatSpec } from '../../utils/knowledgeEngine';

interface CodePreviewerProps {
  item: KnowledgeItem;
  formatSpec: FormatSpec;
}

export const CodePreviewer: React.FC<CodePreviewerProps> = ({
  item,
  formatSpec,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const lines = item.content.split('\n');

  const handleCopy = () => {
    navigator.clipboard?.writeText(item.content);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 1800);
  };

  return (
    <div className="rounded-2xl overflow-hidden bg-[#141416] text-[#F5F5F7] border border-black/10">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 bg-[#1D1D1F] text-xs">
        <div className="flex items-center gap-2 font-mono text-[#F5F5F7]">
          <Code2 className="w-3.5 h-3.5 text-[#2997FF]" />
          <span>{item.metadata.language || formatSpec.label}</span>
          <span aria-hidden="true" className="text-[#86868B]">·</span>
          <span className="text-[#86868B] tabular-nums">{lines.length} 行</span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="omni-btn omni-btn-subtle px-3 py-1 text-xs text-[#F5F5F7] bg-white/10 hover:bg-white/15"
          title="复制代码"
        >
          {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copiedCode ? '已复制' : '复制'}</span>
        </button>
      </div>
      <div className="p-4 overflow-x-auto font-mono text-xs leading-relaxed max-h-96">
        {lines.map((line, i) => (
          <div key={i} className="flex gap-4">
            <span className="w-7 text-right text-[#6E6E73] select-none tabular-nums shrink-0">
              {i + 1}
            </span>
            <span className="text-[#F5F5F7] whitespace-pre">{line}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
