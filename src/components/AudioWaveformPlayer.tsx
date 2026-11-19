import React, { useEffect, useRef, useState } from "react";
import { Play, Pause, Trash2, FileText, Loader2 } from "lucide-react";

interface AudioWaveformPlayerProps {
  file: File;
  onRemove: () => void;
  onTranscribe: () => void;
  isTranscribing: boolean;
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function AudioWaveformPlayer({
  file,
  onRemove,
  onTranscribe,
  isTranscribing,
}: AudioWaveformPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [peaks, setPeaks] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isDecoding, setIsDecoding] = useState(true);

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setAudioUrl(objectUrl);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);

    let cancelled = false;
    setIsDecoding(true);

    const decodePeaks = async () => {
      try {
        const buffer = await file.arrayBuffer();
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioCtx();
        const decoded = await ctx.decodeAudioData(buffer.slice(0));
        const channelData = decoded.getChannelData(0);
        const barCount = 72;
        const blockSize = Math.max(1, Math.floor(channelData.length / barCount));
        const sampled: number[] = [];

        let maxPeak = 0.01;
        for (let i = 0; i < barCount; i++) {
          let sum = 0;
          const start = i * blockSize;
          for (let j = 0; j < blockSize; j++) {
            const val = Math.abs(channelData[start + j] || 0);
            if (val > sum) sum = val;
          }
          if (sum > maxPeak) maxPeak = sum;
          sampled.push(sum);
        }

        if (!cancelled) {
          setPeaks(sampled.map((p) => Math.max(0.12, p / maxPeak)));
          setDuration(decoded.duration);
          setIsDecoding(false);
        }
        await ctx.close().catch(() => {});
      } catch {
        if (!cancelled) {
          // Graceful deterministic waveform bar profile when codec is not browser-decodable
          const fallback = Array.from({ length: 72 }, (_, idx) => {
            const wave = Math.abs(Math.sin(idx * 0.37) * 0.6 + Math.cos(idx * 0.19) * 0.25);
            return Math.max(0.15, Math.min(1, wave));
          });
          setPeaks(fallback);
          setIsDecoding(false);
        }
      }
    };

    decodePeaks();

    return () => {
      cancelled = true;
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || peaks.length === 0) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth || 360;
    const height = canvas.clientHeight || 64;
    canvas.width = width * dpr;
    canvas.height = height * dpr;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    const progress = duration > 0 ? currentTime / duration : 0;
    const gap = 2;
    const barWidth = Math.max(2, (width - gap * (peaks.length - 1)) / peaks.length);
    const midY = height / 2;

    peaks.forEach((amp, i) => {
      const x = i * (barWidth + gap);
      const barH = Math.max(4, amp * (height - 8));
      const y = midY - barH / 2;
      const ratio = i / peaks.length;

      ctx.fillStyle = ratio <= progress ? "#E5A93B" : "#34343D";
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barH, 1.5);
      ctx.fill();
    });
  }, [peaks, currentTime, duration]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const audio = audioRef.current;
    const canvas = canvasRef.current;
    if (!audio || !canvas || !duration) return;
    const rect = canvas.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audio.currentTime = ratio * duration;
    setCurrentTime(audio.currentTime);
  };

  const fileSizeMb = (file.size / (1024 * 1024)).toFixed(2);

  return (
    <div className="flex flex-col justify-between gap-4 pt-1">
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
          onLoadedMetadata={(e) => {
            const d = e.currentTarget.duration;
            if (Number.isFinite(d) && d > 0) setDuration(d);
          }}
          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        />
      )}

      {/* Track Metadata Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-[#F4F3EE] truncate" title={file.name}>
            {file.name}
          </p>
          <div className="mt-1 flex items-center gap-2 text-xs text-[#9898A2] font-mono tabular-nums">
            <span>{fileSizeMb} MB</span>
            <span aria-hidden="true">·</span>
            <span>{(file.type || "audio").replace("audio/", "").toUpperCase()}</span>
            {duration > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span>{formatTime(duration)}</span>
              </>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onRemove}
          className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg text-[#9898A2] hover:text-[#F4F3EE] hover:bg-white/5 transition-editorial cursor-pointer focus-visible:outline-2 focus-visible:outline-[#E5A93B]"
          aria-label="Remove audio track"
          title="Remove audio track"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Interactive Canvas Waveform */}
      <div className="pt-1">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={togglePlay}
            className="h-10 w-10 shrink-0 rounded-lg bg-[#E5A93B] hover:bg-[#F0BD5E] text-[#09090B] flex items-center justify-center transition-editorial cursor-pointer focus-visible:outline-2 focus-visible:outline-[#F4F3EE]"
            aria-label={isPlaying ? "Pause audio" : "Play audio"}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>

          <div className="flex-1 min-w-0">
            <canvas
              ref={canvasRef}
              onClick={handleSeek}
              className="w-full h-14 cursor-pointer block"
              aria-label="Audio waveform scrub bar"
            />
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between text-xs font-mono tabular-nums text-[#9898A2]">
          <span>{formatTime(currentTime)}</span>
          <span>{isDecoding ? "Decoding waveform..." : formatTime(duration)}</span>
        </div>
      </div>

      {/* Extract Lyrics Action */}
      <div className="pt-3 border-t border-[#242429] flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs text-[#9898A2]">
          Audio dynamics will be analyzed alongside lyrics.
        </span>
        <button
          type="button"
          onClick={onTranscribe}
          disabled={isTranscribing}
          className="inline-flex items-center gap-2 px-3.5 py-2 min-h-[40px] rounded-lg border border-[#2C2C33] hover:border-[#E5A93B]/60 text-xs font-medium text-[#F4F3EE] hover:text-[#E5A93B] transition-editorial whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-[#E5A93B]"
        >
          {isTranscribing ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Transcribing...</span>
            </>
          ) : (
            <>
              <FileText className="w-3.5 h-3.5" />
              <span>Extract Lyrics</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
