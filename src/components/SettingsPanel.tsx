import React from "react";
import { StorySettings } from "../types";

interface SettingsPanelProps {
  settings: StorySettings;
  setSettings: React.Dispatch<React.SetStateAction<StorySettings>>;
  songContext: string;
  setSongContext: (context: string) => void;
}

const GENRES = [
  { value: "Adaptive", label: "Adaptive (Match the song)" },
  { value: "Noir & Psychological Thriller", label: "Noir & Psychological Thriller" },
  { value: "Sci-Fi & Speculative", label: "Sci-Fi & Speculative Fiction" },
  { value: "Literary Realism", label: "Literary Realism" },
  { value: "Victorian & Chamber Gothic", label: "Victorian & Chamber Gothic" },
  { value: "Dark Mythic Fantasy", label: "Dark Mythic Fantasy" },
  { value: "Magical Realism", label: "Poetic Magical Realism" },
];

const TONES = [
  { value: "Adaptive", label: "Adaptive (Match acoustic mood)" },
  { value: "Melancholic & Haunting", label: "Melancholic & Haunting" },
  { value: "Tense & Suspenseful", label: "Tense & Suspenseful" },
  { value: "Radiant & Redemptive", label: "Radiant & Redemptive" },
  { value: "Sparse & Unsentimental", label: "Sparse & Unsentimental" },
  { value: "Dreamlike & Surreal", label: "Dreamlike & Surreal" },
  { value: "Elegiac & Mythic", label: "Elegiac & Mythic" },
];

const ERAS = [
  { value: "Adaptive", label: "Adaptive (Match lyrical world)" },
  { value: "Classical Antiquity", label: "Classical Antiquity" },
  { value: "Victorian / Gilded Age", label: "Victorian / Gilded Age" },
  { value: "Mid-20th Century (1940s–1970s)", label: "Mid-20th Century (1940s–1970s)" },
  { value: "Contemporary Present", label: "Contemporary Present" },
  { value: "Retro-Futurist / Far Future", label: "Retro-Futurist / Far Future" },
];

export default function SettingsPanel({
  settings,
  setSettings,
  songContext,
  setSongContext,
}: SettingsPanelProps) {
  const handleSettingChange = (key: keyof StorySettings, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div
      className="rounded-xl bg-[#111114] border border-[#242429] p-6"
      id="settings-panel"
    >
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-4 border-b border-[#242429] mb-5">
        <h3 className="font-display text-lg font-medium text-[#F4F3EE]">
          Adaptation Direction
        </h3>
        <span className="text-xs text-[#9898A2]">
          Shape the genre, emotional register, and historical setting
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div>
          <label
            htmlFor="genre-select"
            className="block text-xs font-medium text-[#9898A2] mb-2"
          >
            Literary Genre
          </label>
          <select
            id="genre-select"
            value={settings.genre}
            onChange={(e) => handleSettingChange("genre", e.target.value)}
            className="w-full min-h-[42px] bg-[#0C0C0F] border border-[#242429] rounded-lg px-3.5 py-2 text-sm text-[#F4F3EE] focus:outline-none focus:border-[#E5A93B] transition-editorial cursor-pointer [&>option]:bg-[#111114] [&>option]:text-[#F4F3EE]"
          >
            {GENRES.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="tone-select"
            className="block text-xs font-medium text-[#9898A2] mb-2"
          >
            Narrative Tone
          </label>
          <select
            id="tone-select"
            value={settings.tone}
            onChange={(e) => handleSettingChange("tone", e.target.value)}
            className="w-full min-h-[42px] bg-[#0C0C0F] border border-[#242429] rounded-lg px-3.5 py-2 text-sm text-[#F4F3EE] focus:outline-none focus:border-[#E5A93B] transition-editorial cursor-pointer [&>option]:bg-[#111114] [&>option]:text-[#F4F3EE]"
          >
            {TONES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="era-select"
            className="block text-xs font-medium text-[#9898A2] mb-2"
          >
            Period &amp; Setting
          </label>
          <select
            id="era-select"
            value={settings.era}
            onChange={(e) => handleSettingChange("era", e.target.value)}
            className="w-full min-h-[42px] bg-[#0C0C0F] border border-[#242429] rounded-lg px-3.5 py-2 text-sm text-[#F4F3EE] focus:outline-none focus:border-[#E5A93B] transition-editorial cursor-pointer [&>option]:bg-[#111114] [&>option]:text-[#F4F3EE]"
          >
            {ERAS.map((er) => (
              <option key={er.value} value={er.value}>
                {er.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-5">
        <label
          htmlFor="context-notes"
          className="block text-xs font-medium text-[#9898A2] mb-2"
        >
          Song Title, Artist, or Director Notes (Optional)
        </label>
        <input
          id="context-notes"
          type="text"
          className="w-full min-h-[42px] bg-[#0C0C0F] border border-[#242429] rounded-lg px-3.5 py-2.5 text-sm text-[#F4F3EE] placeholder-[#686873] focus:outline-none focus:border-[#E5A93B] transition-editorial"
          placeholder="e.g., 'Fast Car by Tracy Chapman — focus on intergenerational ambition and quiet heartbreak'"
          value={songContext}
          onChange={(e) => setSongContext(e.target.value)}
        />
      </div>
    </div>
  );
}
