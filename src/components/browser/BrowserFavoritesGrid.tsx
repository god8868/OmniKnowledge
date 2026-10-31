import React from 'react';
import { Search, Layers, Compass } from 'lucide-react';
import { KnowledgeItem } from '../../utils/knowledgeEngine';

export interface FavoriteSite {
  title: string;
  subtitle: string;
  url: string;
  categoryLabel: string;
  color: string;
}

export const SAFARI_FAVORITES: FavoriteSite[] = [
  {
    title: '维基百科 · 知识图谱',
    subtitle: 'zh.wikipedia.org',
    url: 'https://zh.wikipedia.org/wiki/知识图谱',
    categoryLabel: '百科词条',
    color: '#0071E3',
  },
  {
    title: '维基百科 · 向量数据库',
    subtitle: 'zh.wikipedia.org',
    url: 'https://zh.wikipedia.org/wiki/向量数据库',
    categoryLabel: '核心技术',
    color: '#5856D6',
  },
  {
    title: '微信公众号深度专栏',
    subtitle: 'mp.weixin.qq.com',
    url: 'https://mp.weixin.qq.com/s/WindowsLocalRAG_2026_Guide',
    categoryLabel: '公众号长文',
    color: '#34C759',
  },
  {
    title: '微信视频号技术直播',
    subtitle: 'channels.weixin.qq.com',
    url: 'https://channels.weixin.qq.com/platform/post/Whisper_Local_ASR_Demo',
    categoryLabel: '视频号流',
    color: '#FF9500',
  },
  {
    title: '小红书工业设计志',
    subtitle: 'xiaohongshu.com',
    url: 'https://www.xiaohongshu.com/explore/6720a9c8000000001e02f8a1',
    categoryLabel: '社媒图集',
    color: '#FF2D55',
  },
  {
    title: 'Bilibili 硬核架构课',
    subtitle: 'bilibili.com',
    url: 'https://www.bilibili.com/video/BV1LocalKnowledgeGraph',
    categoryLabel: 'B站专栏',
    color: '#00C7BE',
  },
  {
    title: 'AutoCAD DXF 格式规范',
    subtitle: 'zh.wikipedia.org',
    url: 'https://zh.wikipedia.org/wiki/AutoCAD_DXF',
    categoryLabel: '工程标准',
    color: '#AF52DE',
  },
  {
    title: 'GitHub 开源工程检索',
    subtitle: 'github.com',
    url: 'https://github.com/topics/local-first',
    categoryLabel: '代码归档',
    color: '#1D1D1F',
  },
];

interface BrowserFavoritesGridProps {
  items: KnowledgeItem[];
  onNavigate: (url: string) => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
}

export const BrowserFavoritesGrid: React.FC<BrowserFavoritesGridProps> = ({
  items,
  onNavigate,
  searchQuery,
  onSearchQueryChange,
  onSearchSubmit,
}) => {
  const vaultLinks = items.filter((it) => Boolean(it.sourceUrl));

  return (
    <div className="h-full overflow-y-auto bg-[#F5F5F7] px-8 py-10">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white shadow-sm border border-black/5 text-[#0071E3] mb-1">
            <Compass className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-[#1D1D1F]">
            Safari 内嵌浏览器
          </h2>
          <p className="text-xs text-[#86868B]">
            穿透引擎支持无缝浏览全网资料，一键剪藏至本地知识库
          </p>
          <form
            onSubmit={onSearchSubmit}
            className="max-w-xl mx-auto relative flex items-center"
          >
            <Search className="w-4 h-4 text-[#86868B] absolute left-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              placeholder="输入网址或关键词搜索..."
              className="w-full pl-11 pr-24 py-3 text-sm rounded-2xl bg-white border border-black/[0.08] text-[#1D1D1F] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
            />
            <button
              type="submit"
              className="absolute right-2 px-4 py-1.5 rounded-xl bg-[#0071E3] text-white text-xs font-medium hover:bg-[#0077ED]"
            >
              浏览 ↗
            </button>
          </form>
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-[#86868B] uppercase tracking-wider">
            个人收藏 (Favorites)
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {SAFARI_FAVORITES.map((fav) => (
              <button
                key={fav.url}
                type="button"
                onClick={() => onNavigate(fav.url)}
                className="text-left apple-card rounded-2xl p-4 hover:border-[#0071E3]/50 transition-all group flex flex-col justify-between gap-3"
              >
                <div className="flex items-center justify-between">
                  <span
                    style={{ backgroundColor: fav.color }}
                    className="w-8 h-8 rounded-xl text-white flex items-center justify-center font-bold text-xs shadow-2xs"
                  >
                    {fav.title.slice(0, 1)}
                  </span>
                  <span className="text-[11px] text-[#86868B]">{fav.categoryLabel}</span>
                </div>
                <div>
                  <div className="text-xs font-bold text-[#1D1D1F] group-hover:text-[#0071E3] truncate">
                    {fav.title}
                  </div>
                  <div className="text-[11px] font-mono text-[#86868B] truncate mt-0.5">
                    {fav.subtitle}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {vaultLinks.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-[#86868B] uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#0071E3]" />
              <span>知识库已归档网页 ({vaultLinks.length})</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {vaultLinks.map((it) => (
                <button
                  key={it.id}
                  type="button"
                  onClick={() => onNavigate(it.sourceUrl!)}
                  className="text-left apple-card rounded-2xl p-3.5 hover:border-[#0071E3]/50 transition-all flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-[#1D1D1F] truncate">
                      {it.title}
                    </div>
                    <div className="text-[11px] font-mono text-[#86868B] truncate mt-0.5">
                      {it.sourceUrl}
                    </div>
                  </div>
                  <span className="text-xs text-[#0071E3] font-medium shrink-0">↗</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
