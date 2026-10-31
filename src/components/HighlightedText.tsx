import React, { useMemo } from 'react';
import { getHighlightSegments } from '../utils/knowledgeEngine';

interface HighlightedTextProps {
  text: string;
  query: string;
  matchedTerms?: string[];
  className?: string;
  highlightClassName?: string;
}

export const HighlightedText: React.FC<HighlightedTextProps> = ({
  text,
  query,
  matchedTerms = [],
  className = '',
  highlightClassName = 'bg-[#FFE875]/70 text-[#1D1D1F] font-semibold px-1 py-0.5 rounded text-[12px] border border-[#E5C100]/30 shadow-2xs',
}) => {
  const segments = useMemo(
    () => getHighlightSegments(text, query, matchedTerms),
    [text, query, matchedTerms]
  );

  return (
    <span className={className}>
      {segments.map((seg, idx) =>
        seg.isMatch ? (
          <mark key={idx} className={highlightClassName}>
            {seg.text}
          </mark>
        ) : (
          <span key={idx}>{seg.text}</span>
        )
      )}
    </span>
  );
};
