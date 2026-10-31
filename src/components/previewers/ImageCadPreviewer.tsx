import React, { useState } from 'react';
import { Camera, ZoomIn, ZoomOut, Layers } from 'lucide-react';
import { KnowledgeItem, FormatSpec } from '../../utils/knowledgeEngine';
import { WikiLinkText } from '../WikiLinkText';

interface ImageCadPreviewerProps {
  item: KnowledgeItem;
  formatSpec: FormatSpec;
  allItems: KnowledgeItem[];
  onSelectItem: (id: string) => void;
}

export const ImageCadPreviewer: React.FC<ImageCadPreviewerProps> = ({
  item,
  formatSpec,
  allItems,
  onSelectItem,
}) => {
  const [zoom, setZoom] = useState(100);
  const [hiddenLayers, setHiddenLayers] = useState<Record<string, boolean>>({});

  const layers = item.metadata.layers || [
    '01_BASE_RASTER (主位图通道)',
    '02_ALPHA_MASK (透明通道/矢量路径)',
    '03_EXIF_ICC_PROFILE (色彩与元数据层)',
  ];

  const toggleLayer = (layer: string) => {
    setHiddenLayers((prev) => ({ ...prev, [layer]: !prev[layer] }));
  };

  const isCadOrVector = ['dxf', 'cdr', 'ai', 'eps', 'svg', 'wmf', 'ufo'].includes(item.ext);
  const isPsd = item.ext === 'psd' || item.ext === 'tga' || item.ext === 'tif';

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-[#141416] text-[#F5F5F7] overflow-hidden border border-black/10 shadow-sm">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 bg-[#1D1D1F] text-xs">
          <div className="flex items-center gap-2 text-[#F5F5F7] font-mono">
            <Camera className="w-3.5 h-3.5 text-[#2997FF] shrink-0" />
            <span>{formatSpec.label}</span>
            <span aria-hidden="true" className="text-[#86868B]">·</span>
            <span className="text-[#86868B]">{item.metadata.resolution || '4096 × 2304 px'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              aria-label="缩小预览"
              onClick={() => setZoom((z) => Math.max(50, z - 25))}
              className="p-1.5 rounded-lg hover:bg-white/10 text-[#F5F5F7] transition-colors"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-xs tabular-nums px-1.5 text-[#F5F5F7]">{zoom}%</span>
            <button
              type="button"
              aria-label="放大预览"
              onClick={() => setZoom((z) => Math.min(200, z + 25))}
              className="p-1.5 rounded-lg hover:bg-white/10 text-[#F5F5F7] transition-colors"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoom(100)}
              className="px-2.5 py-1 text-xs rounded-lg bg-white/10 hover:bg-white/15 text-[#F5F5F7] transition-colors"
            >
              1:1
            </button>
          </div>
        </div>

        <div className="relative h-64 flex items-center justify-center overflow-hidden bg-[#111113] p-5">
          <div
            className="w-full h-full flex items-center justify-center transition-transform duration-150"
            style={{ transform: `scale(${zoom / 100})` }}
          >
            {isCadOrVector ? (
              <svg viewBox="0 0 600 260" className="w-full h-full max-h-56 select-none">
                <defs>
                  <pattern id="cadGrid" width="24" height="24" patternUnits="userSpaceOnUse">
                    <path
                      d="M 24 0 L 0 0 0 24"
                      fill="none"
                      stroke="rgba(255, 255, 255, 0.06)"
                      strokeWidth="0.75"
                    />
                  </pattern>
                </defs>
                <rect width="600" height="260" fill="url(#cadGrid)" />
                {!hiddenLayers[layers[0]] && (
                  <g stroke="#2997FF" strokeWidth="1.8" fill="none">
                    <polygon points="60,190 180,65 300,65 420,65 540,190" />
                    <line x1="60" y1="190" x2="540" y2="190" strokeWidth="2.5" />
                    <line x1="180" y1="65" x2="180" y2="190" />
                    <line x1="300" y1="65" x2="300" y2="190" />
                    <line x1="420" y1="65" x2="420" y2="190" />
                    <line x1="180" y1="65" x2="300" y2="190" />
                    <line x1="420" y1="65" x2="300" y2="190" />
                  </g>
                )}
                {!hiddenLayers[layers[1]] && (
                  <g fill="#FF9F0A" fillOpacity="0.22" stroke="#FF9F0A" strokeWidth="1.2">
                    <circle cx="180" cy="65" r="9" />
                    <circle cx="300" cy="65" r="9" />
                    <circle cx="420" cy="65" r="9" />
                    <circle cx="300" cy="190" r="11" />
                    <rect x="48" y="182" width="24" height="16" rx="2" />
                    <rect x="528" y="182" width="24" height="16" rx="2" />
                  </g>
                )}
                {!hiddenLayers[layers[2]] && (
                  <g fill="#86868B" fontSize="10" fontFamily="JetBrains Mono, monospace">
                    <line x1="60" y1="220" x2="540" y2="220" stroke="#6E6E73" strokeDasharray="3 3" />
                    <text x="245" y="236" fill="#F5F5F7">
                      SPAN L = 12,400 mm (±0.15mm)
                    </text>
                    <text x="20" y="24" fill="#2997FF">
                      DXF/CDR VECTOR ENGINE · ENTITIES: 1,420
                    </text>
                  </g>
                )}
              </svg>
            ) : isPsd ? (
              <svg viewBox="0 0 600 260" className="w-full h-full max-h-56 select-none">
                {!hiddenLayers[layers[3]] && (
                  <rect
                    x="40"
                    y="30"
                    width="520"
                    height="200"
                    rx="16"
                    fill="#18181B"
                    stroke="#2997FF"
                    strokeWidth="2"
                  />
                )}
                {!hiddenLayers[layers[1]] && (
                  <g>
                    <rect
                      x="70"
                      y="50"
                      width="260"
                      height="120"
                      rx="8"
                      fill="#0C0C0E"
                      stroke="#2997FF"
                      strokeWidth="1.2"
                    />
                    <path
                      d="M 95 115 Q 125 65, 155 110 T 215 95 T 275 115 T 315 80"
                      fill="none"
                      stroke="#2997FF"
                      strokeWidth="2"
                    />
                    <text x="95" y="72" fill="#2997FF" fontSize="10" fontFamily="JetBrains Mono">
                      PSD LAYER: OLED_HUD_96KHZ
                    </text>
                  </g>
                )}
                {!hiddenLayers[layers[0]] && (
                  <g>
                    <circle cx="400" cy="98" r="32" fill="#141416" stroke="#86868B" strokeWidth="1.8" />
                    <line x1="400" y1="98" x2="418" y2="76" stroke="#2997FF" strokeWidth="2.5" />
                    <circle cx="490" cy="98" r="32" fill="#141416" stroke="#86868B" strokeWidth="1.8" />
                    <line x1="490" y1="98" x2="490" y2="68" stroke="#FF9F0A" strokeWidth="2.5" />
                    <text x="80" y="195" fill="#A1A1A6" fontSize="11" fontFamily="JetBrains Mono">
                      ADOBE RGB 16-BIT · SMART OBJECT COMPOSITE
                    </text>
                  </g>
                )}
              </svg>
            ) : (
              <svg viewBox="0 0 600 260" className="w-full h-full max-h-56 select-none">
                <defs>
                  <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#141416" />
                    <stop offset="55%" stopColor="#1d2b3a" />
                    <stop offset="100%" stopColor="#2c3e50" />
                  </linearGradient>
                </defs>
                <rect width="600" height="260" fill="url(#skyGrad)" />
                <polygon points="0,240 140,95 270,185 390,60 520,165 600,115 600,260 0,260" fill="#1D1D1F" />
                <polygon points="140,95 195,135 110,150" fill="#F5F5F7" fillOpacity="0.75" />
                <polygon points="390,60 455,120 345,130" fill="#FFFFFF" fillOpacity="0.88" />
                <text x="24" y="32" fill="#F5F5F7" fontSize="11" fontFamily="JetBrains Mono">
                  {item.ext.toUpperCase()} SENSOR RAW DEMOSAIC · 14.8 EV DYNAMIC RANGE
                </text>
                <text x="24" y="242" fill="#A1A1A6" fontSize="10" fontFamily="JetBrains Mono">
                  {item.metadata.cameraModel || 'ExifTool Verified Optical Metadata'}
                </text>
              </svg>
            )}
          </div>
        </div>

        <div className="px-4 py-2.5 bg-[#1D1D1F] border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs text-[#86868B]">
          <span>解码管线: {formatSpec.decoderPipeline}</span>
          <span className="font-mono text-[#F5F5F7]">
            {item.metadata.colorSpace || 'Display P3 / sRGB ICC'}
          </span>
        </div>
      </div>

      <div className="rounded-2xl p-4 bg-[#F5F5F7]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-[#1D1D1F] flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#0071E3]" />
            <span>图层与通道 ({layers.length})</span>
          </span>
          <span className="text-xs text-[#86868B]">点击切换显隐</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {layers.map((layer) => {
            const isHidden = !!hiddenLayers[layer];
            return (
              <button
                key={layer}
                type="button"
                onClick={() => toggleLayer(layer)}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono text-left transition-all ${
                  isHidden
                    ? 'bg-white/50 text-[#86868B] line-through'
                    : 'bg-white text-[#1D1D1F] shadow-2xs'
                }`}
              >
                <span className="truncate">{layer}</span>
                <span className="text-[11px] ml-2 shrink-0 text-[#0071E3] font-sans font-medium">
                  {isHidden ? '已隐藏' : '显示中'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl p-4 bg-[#F5F5F7]">
        <div className="text-xs font-semibold text-[#1D1D1F] mb-2">
          多模态索引摘要与几何 / OCR 提取内容
        </div>
        <div className="text-xs text-[#424245] whitespace-pre-wrap leading-relaxed font-sans">
          <WikiLinkText text={item.content} allItems={allItems} onSelectItem={onSelectItem} />
        </div>
      </div>
    </div>
  );
};
