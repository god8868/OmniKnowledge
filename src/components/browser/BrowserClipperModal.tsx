import React from 'react';
import { X, Sparkles } from 'lucide-react';
import { KnowledgeItem } from '../../utils/knowledgeEngine';

interface BrowserClipperModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  onTitleChange: (v: string) => void;
  tags: string;
  onTagsChange: (v: string) => void;
  refId: string;
  onRefIdChange: (v: string) => void;
  note: string;
  onNoteChange: (v: string) => void;
  items: KnowledgeItem[];
  onSubmit: (e: React.FormEvent) => void;
}

export const BrowserClipperModal: React.FC<BrowserClipperModalProps> = ({
  isOpen,
  onClose,
  title,
  onTitleChange,
  tags,
  onTagsChange,
  refId,
  onRefIdChange,
  note,
  onNoteChange,
  items,
  onSubmit,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-label="收入知识库"
      className="absolute top-24 right-5 z-30 w-96 rounded-3xl apple-glass border border-black/10 shadow-2xl p-5 space-y-3.5"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-[#1D1D1F] flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#0071E3]" />
          <span>收入本地知识库</span>
        </h3>
        <button
          type="button"
          aria-label="关闭"
          onClick={onClose}
          className="p-1 rounded-full hover:bg-black/5 text-[#86868B]"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="block text-[11px] font-medium text-[#6E6E73] mb-1">网页标题</label>
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            className="w-full px-3 py-1.5 text-xs rounded-xl bg-white border border-black/10 text-[#1D1D1F]"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[11px] font-medium text-[#6E6E73] mb-1">标签</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => onTagsChange(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-white border border-black/10 text-[#1D1D1F]"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-[#6E6E73] mb-1">双向关联</label>
            <select
              aria-label="关联条目"
              value={refId}
              onChange={(e) => onRefIdChange(e.target.value)}
              className="w-full px-2 py-1.5 text-xs rounded-xl bg-white border border-black/10 text-[#1D1D1F]"
            >
              <option value="">(无)</option>
              {items.map((it) => (
                <option key={it.id} value={it.id}>
                  [{it.ext}] {it.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-medium text-[#6E6E73] mb-1">
            正文摘录
          </label>
          <textarea
            rows={3}
            value={note}
            onChange={(e) => onNoteChange(e.target.value)}
            className="w-full px-3 py-1.5 text-xs rounded-xl bg-white border border-black/10 text-[#1D1D1F]"
          />
        </div>

        <button
          type="submit"
          className="w-full py-2 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
        >
          <span>⤓ 保存快照并索引</span>
        </button>
      </form>
    </div>
  );
};
