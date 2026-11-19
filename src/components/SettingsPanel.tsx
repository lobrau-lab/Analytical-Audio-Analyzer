import React from "react";
import { StorySettings } from "../types";
import { Sliders, HelpCircle, Music2 } from "lucide-react";

interface SettingsPanelProps {
  settings: StorySettings;
  setSettings: React.Dispatch<React.SetStateAction<StorySettings>>;
  songContext: string;
  setSongContext: (context: string) => void;
}

export default function SettingsPanel({
  settings,
  setSettings,
  songContext,
  setSongContext,
}: SettingsPanelProps) {
  const genres = [
    { value: "Adaptive", label: "🎨 Plan Organically (Match Song Style)" },
    { value: "Noir & Hardboiled Thriller", label: "🕶️ Noir & Hardboiled Thriller" },
    { value: "Sci-Fi & Cyberpunk", label: "🤖 Sci-Fi & Cyberworld" },
    { value: "Epic Dark Fantasy", label: "🐉 Epic Dark Fantasy" },
    { value: "Chamber Victorian Gothic", label: "🕯️ Victorian Gothic Drama" },
    { value: "Melodramatic Tragedy", label: "🥀 Melodramatic Tragedy" },
    { value: "Magical Realism", label: "💫 Poetic Magical Realism" }
  ];

  const tones = [
    { value: "Adaptive", label: "🔊 Dynamic (Match Acoustic Vibe)" },
    { value: "Melancholic & Haunting", label: "🥀 Melancholic & Haunting" },
    { value: "Tense & Suspenseful", label: "⚡ Tense & High-Suspense" },
    { value: "Uplifting & Radiant", label: "☀️ Uplifting & Radiant" },
    { value: "Gritty & Cynical", label: "🚬 Gritty & Cynical" },
    { value: "Ethereal & Dreamlike", label: "💭 Ethereal & Dreamlike" },
    { value: "Symphonic & Mythological", label: "🏛️ Symphonic & Mythological" }
  ];

  const eras = [
    { value: "Adaptive", label: "⏳ Adaptive Historical Era" },
    { value: "Medieval Antiquity", label: "🛡️ Medieval / Classical Antiquity" },
    { value: "Gilded Victorian Age", label: "👗 Gilded / Victorian Era" },
    { value: "Mid-20th Century Retrospect", label: "📻 1940s - 1970s Retro" },
    { value: "The Modern Grid", label: "📱 Contemporary Modern Day" },
    { value: "Hypertech Neo-Future", label: "🚀 Far Future / Cybernetic Era" }
  ];

  const handleSettingChange = (key: keyof StorySettings, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="bg-[#0b0c10]/70 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-xl shadow-black/40 h-full flex flex-col justify-between" id="settings-panel">
      <div>
        <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-5">
          <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-white text-base uppercase tracking-wider">Plot Adapters</h3>
            <p className="text-[11px] text-slate-450">Configure parameters to customize the storyplot output</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Genre option */}
          <div>
            <label className="block text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
              Target Literary Genre
            </label>
            <select
              value={settings.genre}
              onChange={(e) => handleSettingChange("genre", e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 font-sans focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer [&>option]:bg-[#0c0d12] [&>option]:text-slate-200"
            >
              {genres.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
          </div>

          {/* Narrative Tone option */}
          <div>
            <label className="block text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
              Tone Alignment
            </label>
            <select
              value={settings.tone}
              onChange={(e) => handleSettingChange("tone", e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 font-sans focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer [&>option]:bg-[#0c0d12] [&>option]:text-slate-200"
            >
              {tones.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Setting Era option */}
          <div>
            <label className="block text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
              Temporal setting Era
            </label>
            <select
              value={settings.era}
              onChange={(e) => handleSettingChange("era", e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 font-sans focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer [&>option]:bg-[#0c0d12] [&>option]:text-slate-200"
            >
              {eras.map((er) => (
                <option key={er.value} value={er.value}>
                  {er.label}
                </option>
              ))}
            </select>
          </div>

          {/* Context Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-widest">
                Artist / Context Notes (Optional)
              </label>
              <div className="group relative">
                <HelpCircle className="w-3.5 h-3.5 text-slate-500 hover:text-slate-400 cursor-help" />
                <div className="absolute right-0 bottom-full mb-2 w-64 bg-slate-900 border border-white/10 text-slate-300 text-[11px] p-2.5 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-xl leading-relaxed">
                  Provide the song title, artist, or any particular theme/meaning you want the AI writer to synthesize or stick to.
                </div>
              </div>
            </div>
            <div className="relative">
              <textarea
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-slate-200 font-sans placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all h-20 resize-none"
                placeholder="e.g. 'Bohemian Rhapsody by Queen. Focus on themes of guilt and escaping justice.' or 'A melancholic synthwave song about running away together.'"
                value={songContext}
                onChange={(e) => setSongContext(e.target.value)}
              />
              <div className="absolute right-3 bottom-3 text-slate-600">
                <Music2 className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
