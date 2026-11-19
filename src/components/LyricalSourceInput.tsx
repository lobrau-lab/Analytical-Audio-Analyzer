import React, { useRef, useState } from "react";
import { Upload, Music } from "lucide-react";
import { SONG_PRESETS, SongPreset } from "../data/presets";
import AudioWaveformPlayer from "./AudioWaveformPlayer";

interface LyricalSourceInputProps {
  lyrics: string;
  setLyrics: (val: string) => void;
  audioFile: File | null;
  setAudioFile: (file: File | null) => void;
  onClearAll: () => void;
  onQuickLoad: (preset: SongPreset) => void;
  activePresetId: string | null;
  onTranscribeAudio: () => void;
  isTranscribing: boolean;
  onNotify: (message: string, type?: "info" | "error") => void;
}

export default function LyricalSourceInput({
  lyrics,
  setLyrics,
  audioFile,
  setAudioFile,
  onClearAll,
  onQuickLoad,
  activePresetId,
  onTranscribeAudio,
  isTranscribing,
  onNotify,
}: LyricalSourceInputProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith("audio/")) {
      onNotify("Select a supported audio file (MP3, WAV, M4A, or OGG).", "error");
      return;
    }
    if (file.size > 35 * 1024 * 1024) {
      onNotify("Audio file exceeds the 35 MB studio limit.", "error");
      return;
    }
    setAudioFile(file);
    onNotify(`Loaded "${file.name}" into the acoustic deck.`, "info");
  };

  const removeAudioFile = () => {
    setAudioFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const wordCount = lyrics.trim() ? lyrics.trim().split(/\s+/).length : 0;
  const stanzaCount = lyrics.trim()
    ? lyrics
        .trim()
        .split(/\n\s*\n/)
        .filter((s) => s.trim().length > 0).length
    : 0;

  return (
    <div className="space-y-10" id="lyrical-source-input">
      {/* 1. Curated Storytelling Classics */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-5">
          <div>
            <p className="text-xs font-medium text-[#E5A93B] tracking-wide">Curated Studies</p>
            <h2 className="font-display text-2xl font-medium text-[#F4F3EE] tracking-tight mt-1">
              Begin with a landmark track
            </h2>
          </div>
          <p className="text-xs text-[#9898A2]">
            Load annotated lyrics and tone presets with a single click
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {SONG_PRESETS.map((preset) => {
            const isSelected = activePresetId === preset.id;
            const imgFailed = failedImages[preset.id];

            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onQuickLoad(preset)}
                className={`group text-left rounded-xl overflow-hidden bg-[#111114] border transition-editorial cursor-pointer focus-visible:outline-2 focus-visible:outline-[#E5A93B] focus-visible:outline-offset-2 ${
                  isSelected
                    ? "border-[#E5A93B]"
                    : "border-[#242429] hover:border-[#3A3A44]"
                }`}
                id={`preset-btn-${preset.id}`}
              >
                <div className="aspect-[4/3] w-full overflow-hidden bg-[#16161A] relative">
                  {!imgFailed ? (
                    <img
                      src={preset.image}
                      alt={preset.imageAlt}
                      referrerPolicy="no-referrer"
                      onError={() =>
                        setFailedImages((prev) => ({ ...prev, [preset.id]: true }))
                      }
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-[#141418] text-[#9898A2] p-4">
                      <Music className="w-6 h-6 mb-2 text-[#E5A93B]" />
                      <span className="font-display text-sm text-[#F4F3EE]">{preset.title}</span>
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#111114] via-[#111114]/40 to-transparent pointer-events-none" />
                </div>

                <div className="p-5">
                  <div className="flex items-center gap-2 text-xs text-[#9898A2]">
                    <span>{preset.artist}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">{preset.year}</span>
                  </div>
                  <h3 className="font-display text-lg font-medium text-[#F4F3EE] group-hover:text-[#E5A93B] transition-editorial mt-1">
                    {preset.title}
                  </h3>
                  <p className="text-sm text-[#9898A2] leading-relaxed mt-1.5 line-clamp-2">
                    {preset.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Source Material Workspace: Audio Deck & Verse Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left 5 columns: Acoustic Audio Deck */}
        <div className="lg:col-span-5 rounded-xl bg-[#111114] border border-[#242429] p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-baseline justify-between pb-4 border-b border-[#242429]">
              <h3 className="font-display text-lg font-medium text-[#F4F3EE]">
                Audio Recording
              </h3>
              <span className="text-xs text-[#9898A2]">Optional</span>
            </div>

            <p className="text-sm text-[#9898A2] leading-relaxed mt-4 mb-5">
              Attach a recording to capture instrumentation shifts, vocal timbre, and harmonic pacing—or transcribe lyrics directly.
            </p>

            {!audioFile ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
                role="button"
                tabIndex={0}
                className={`rounded-lg border border-dashed p-8 text-center cursor-pointer transition-editorial flex flex-col items-center justify-center min-h-[210px] focus-visible:outline-2 focus-visible:outline-[#E5A93B] ${
                  isDragOver
                    ? "border-[#E5A93B] bg-[#E5A93B]/5"
                    : "border-[#2E2E36] hover:border-[#4A4A56] bg-[#0D0D10]"
                }`}
                id="dropzone"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="audio/*"
                  className="hidden"
                />
                <Upload className="w-5 h-5 text-[#E5A93B] mb-3" />
                <span className="text-sm font-medium text-[#F4F3EE]">
                  Drop an audio file here
                </span>
                <span className="text-xs text-[#9898A2] mt-1">
                  or click to select from your computer
                </span>
                <span className="text-xs font-mono text-[#767680] mt-4">
                  MP3 · WAV · M4A · OGG — up to 35 MB
                </span>
              </div>
            ) : (
              <AudioWaveformPlayer
                file={audioFile}
                onRemove={removeAudioFile}
                onTranscribe={onTranscribeAudio}
                isTranscribing={isTranscribing}
              />
            )}
          </div>

          {!audioFile && (
            <div className="mt-5 pt-4 border-t border-[#242429] text-xs text-[#767680]">
              Lyrics alone are sufficient to generate a full story adaptation.
            </div>
          )}
        </div>

        {/* Right 7 columns: Lyrics & Verse Input */}
        <div className="lg:col-span-7 rounded-xl bg-[#111114] border border-[#242429] p-6 flex flex-col justify-between">
          <div className="flex flex-col flex-1">
            <div className="flex items-baseline justify-between pb-4 border-b border-[#242429]">
              <h3 className="font-display text-lg font-medium text-[#F4F3EE]">
                Lyrics &amp; Verse
              </h3>
              <div className="flex items-center gap-2 text-xs font-mono tabular-nums text-[#9898A2]">
                <span>{wordCount} words</span>
                <span aria-hidden="true">·</span>
                <span>{stanzaCount} {stanzaCount === 1 ? "stanza" : "stanzas"}</span>
              </div>
            </div>

            <textarea
              className="mt-4 w-full flex-1 min-h-[235px] bg-[#0C0C0F] border border-[#242429] rounded-lg p-4 text-[15px] leading-relaxed text-[#F4F3EE] placeholder-[#686873] focus:outline-none focus:border-[#E5A93B] transition-editorial resize-y"
              placeholder={`Paste song lyrics, spoken word, or verse excerpts here...\n\nExample:\nEleanor Rigby picks up the rice in the church where a wedding has been\nLives in a dream...`}
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
              id="lyrics-textarea"
            />
          </div>

          <div className="mt-4 pt-4 border-t border-[#242429] flex items-center justify-between gap-4">
            <span className="text-xs text-[#767680]">
              Preserve verse and chorus breaks for sharper chapter mapping.
            </span>
            {(lyrics.trim().length > 0 || audioFile !== null) && (
              <button
                type="button"
                onClick={onClearAll}
                className="text-xs font-medium text-[#9898A2] hover:text-[#F4F3EE] transition-editorial whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#E5A93B]"
                id="clear-all-inputs"
              >
                Clear All
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
