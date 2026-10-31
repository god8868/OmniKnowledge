import React, { useState } from 'react';
import { Film, Play, Pause } from 'lucide-react';
import { KnowledgeItem, FormatSpec } from '../../utils/knowledgeEngine';

interface MediaPreviewerProps {
  item: KnowledgeItem;
  formatSpec: FormatSpec;
}

export const MediaPreviewer: React.FC<MediaPreviewerProps> = ({
  item,
  formatSpec,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimeSec, setCurrentTimeSec] = useState(135);

  const duration = item.metadata.durationSec || 600;
  const segments = item.metadata.transcriptSegments || [
    { time: '00:00:15', text: 'FFmpeg 音视频分流解码完成，已生成 Faster-Whisper 时间轴向量索引。' },
  ];

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-[#141416] text-[#F5F5F7] overflow-hidden border border-black/10">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 bg-[#1D1D1F] text-xs">
          <div className="flex items-center gap-2 font-mono text-[#F5F5F7]">
            <Film className="w-3.5 h-3.5 text-[#2997FF] shrink-0" />
            <span>{formatSpec.label}</span>
            <span aria-hidden="true" className="text-[#86868B]">·</span>
            <span className="text-[#86868B]">
              {item.metadata.videoCodec || item.metadata.audioCodec || 'FFmpeg Stream'}
            </span>
          </div>
          <span className="font-mono text-xs text-[#86868B] tabular-nums">
            {item.metadata.bitrate || '1,411 kbps'}
          </span>
        </div>

        <div className="p-5 bg-[#111113] space-y-4">
          <div className="h-32 rounded-xl border border-white/10 bg-[#18181B] flex flex-col justify-between p-3.5 relative overflow-hidden">
            <div className="flex items-center justify-between text-[11px] font-mono text-[#86868B] z-10">
              <span>
                {item.metadata.resolution
                  ? `VIDEO STREAM · ${item.metadata.resolution}`
                  : `LOSSLESS AUDIO WAVEFORM · ${item.metadata.sampleRate || '48kHz / 24-bit'}`}
              </span>
              <span className="tabular-nums text-[#2997FF]">
                {formatTime(currentTimeSec)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center justify-between gap-1 h-16 my-auto">
              {Array.from({ length: 44 }).map((_, idx) => {
                const progressRatio = currentTimeSec / duration;
                const barRatio = idx / 44;
                const isActive = barRatio <= progressRatio;
                const heightPct = 22 + ((idx * 37 + 13) % 72);
                return (
                  <div
                    key={idx}
                    style={{ height: `${heightPct}%` }}
                    className={`flex-1 rounded-full transition-colors ${
                      isActive ? 'bg-[#2997FF]' : 'bg-white/15'
                    }`}
                  />
                );
              })}
            </div>

            <div className="text-[11px] font-mono text-[#86868B] truncate z-10">
              解码管线: {formatSpec.decoderPipeline}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsPlaying((p) => !p)}
              aria-label={isPlaying ? '暂停' : '播放'}
              className="omni-btn omni-btn-primary px-4 py-2 text-xs"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? '暂停' : '播放'}</span>
            </button>
            <input
              type="range"
              aria-label="播放进度"
              min={0}
              max={duration}
              value={currentTimeSec}
              onChange={(e) => setCurrentTimeSec(Number(e.target.value))}
              className="w-full accent-[#0071E3] cursor-pointer"
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl p-4 bg-[#F5F5F7]">
        <div className="text-xs font-semibold text-[#1D1D1F] mb-3 flex items-center justify-between">
          <span>Faster-Whisper 本地语音转写</span>
          <span className="text-xs font-normal text-[#86868B]">点击时间戳定位</span>
        </div>
        <div className="space-y-2">
          {segments.map((seg, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrentTimeSec((i + 1) * Math.floor(duration / (segments.length + 1)))}
              className="w-full text-left p-3 rounded-xl bg-white hover:bg-white/80 shadow-2xs transition-all flex items-start gap-3"
            >
              <span className="font-mono text-xs text-[#0071E3] tabular-nums shrink-0 mt-0.5">
                [{seg.time}]
              </span>
              <span className="text-xs text-[#1D1D1F] leading-relaxed">
                {seg.text}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
