import React from 'react';
import { KnowledgeItem } from '../utils/knowledgeEngine';

interface WikiLinkTextProps {
  text: string;
  allItems: KnowledgeItem[];
  onSelectItem: (id: string) => void;
  className?: string;
}

export const WikiLinkText: React.FC<WikiLinkTextProps> = ({
  text,
  allItems,
  onSelectItem,
  className = '',
}) => {
  const parts = text.split(/(\[\[[^\]]+\]\])/g);
  return (
    <span className={className}>
      {parts.map((part, idx) => {
        if (part.startsWith('[[') && part.endsWith(']]')) {
          const linkTitle = part.slice(2, -2).trim();
          const targetItem = allItems.find(
            (it) =>
              it.title.toLowerCase().includes(linkTitle.toLowerCase()) ||
              linkTitle.toLowerCase().includes(it.title.toLowerCase())
          );
          return (
            <button
              key={idx}
              type="button"
              onClick={() => targetItem && onSelectItem(targetItem.id)}
              className="inline-flex items-center gap-1 font-medium text-[#0071E3] underline decoration-[#0071E3]/40 underline-offset-4 hover:text-[#0077ED] transition-colors mx-0.5"
              title={targetItem ? `跳转: ${targetItem.title}` : `未关联: ${linkTitle}`}
            >
              {part}
            </button>
          );
        }
        return <React.Fragment key={idx}>{part}</React.Fragment>;
      })}
    </span>
  );
};
