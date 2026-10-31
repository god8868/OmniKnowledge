import React from 'react';
import { KnowledgeItem, detectFormatInfo } from '../utils/knowledgeEngine';
import { ImageCadPreviewer } from './previewers/ImageCadPreviewer';
import { MediaPreviewer } from './previewers/MediaPreviewer';
import { DocumentPreviewer } from './previewers/DocumentPreviewer';
import { CodePreviewer } from './previewers/CodePreviewer';
import { SocialWebPreviewer } from './previewers/SocialWebPreviewer';

interface FormatPreviewerProps {
  item: KnowledgeItem;
  allItems: KnowledgeItem[];
  onSelectItem: (id: string) => void;
  onOpenInBrowser: (url: string, title?: string) => void;
}

export const FormatPreviewer: React.FC<FormatPreviewerProps> = ({
  item,
  allItems,
  onSelectItem,
  onOpenInBrowser,
}) => {
  const formatSpec = detectFormatInfo(item.ext);

  if (item.category === 'image') {
    return (
      <ImageCadPreviewer
        item={item}
        formatSpec={formatSpec}
        allItems={allItems}
        onSelectItem={onSelectItem}
      />
    );
  }

  if (item.category === 'media') {
    return (
      <MediaPreviewer
        item={item}
        formatSpec={formatSpec}
      />
    );
  }

  if (item.category === 'code') {
    return (
      <CodePreviewer
        item={item}
        formatSpec={formatSpec}
      />
    );
  }

  if (item.category === 'social') {
    return (
      <SocialWebPreviewer
        item={item}
        formatSpec={formatSpec}
        allItems={allItems}
        onSelectItem={onSelectItem}
        onOpenInBrowser={onOpenInBrowser}
      />
    );
  }

  return (
    <DocumentPreviewer
      item={item}
      formatSpec={formatSpec}
      allItems={allItems}
      onSelectItem={onSelectItem}
    />
  );
};
