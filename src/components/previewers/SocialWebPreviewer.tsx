import React, { useState } from 'react';
import { Globe, FileText, ExternalLink, Copy, Check, Sliders } from 'lucide-react';
import { KnowledgeItem, FormatSpec } from '../../utils/knowledgeEngine';
import { WikiLinkText } from '../WikiLinkText';

interface SocialWebPreviewerProps {
  item: KnowledgeItem;
  formatSpec: FormatSpec;
  allItems: KnowledgeItem[];
  onSelectItem: (id: string) => void;
  onOpenInBrowser: (url: string, title?: string) => void;
}

export const SocialWebPreviewer: React.FC<SocialWebPreviewerProps> = ({
  item,
  formatSpec,
  allItems,
  onSelectItem,
  onOpenInBrowser,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard?.writeText(item.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="space-y-3">
      <div className="rounded-2xl bg-[#F5F5F7] overflow-hidden border border-black/[0.05]">
        <div className="px-4 py-2.5 border-b border-black/[0.05] flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-[#86868B]">
            {item.sourceUrl ? (
              <Globe className="w-3.5 h-3.5 text-[#0071E3] shrink-0" />
            ) : (
              <FileText className="w-3.5 h-3.5 text-[#0071E3] shrink-0" />
            )}
            <span className="font-semibold text-[#1D1D1F]">
              {item.metadata.platformName || formatSpec.label}
            </span>
            {item.metadata.authorOrAccount && (
              <>
                <span aria-hidden="true">·</span>
                <span>{item.metadata.authorOrAccount}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {item.sourceUrl && (
              <button
                type="button"
                onClick={() => onOpenInBrowser(item.sourceUrl!, item.title)}
                className="omni-btn omni-btn-primary px-3 py-1 text-xs"
                title="在内嵌去噪浏览器中浏览"
              >
                <ExternalLink className="w-3 h-3" />
                <span>浏览器查看</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleCopy}
              className="omni-btn omni-btn-subtle px-2.5 py-1 text-xs"
              title="复制正文"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? '已复制' : '复制正文'}</span>
            </button>
          </div>
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
