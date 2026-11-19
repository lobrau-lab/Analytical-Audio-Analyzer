import React, { useState } from "react";
import { AnalyzeResponse } from "../types";
import {
  FileText,
  User,
  Layers,
  Repeat,
  Compass,
  Clock,
  Heart,
  Tag,
  BookOpen,
  ArrowRight,
  Sparkles,
  Award,
  Grid,
  MapPin,
  Flame,
  Zap,
  CheckCircle,
  TrendingUp,
  Columns
} from "lucide-react";

interface AnalysisDisplayProps {
  data: AnalyzeResponse;
  onSelectPrompt: (prompt: string) => void;
}

export default function AnalysisDisplay({ data, onSelectPrompt }: AnalysisDisplayProps) {
  const [layoutMode, setLayoutMode] = useState<"bento" | "tabs">("bento");
  const [activeTab, setActiveTab] = useState<"decoding" | "characters" | "chapters" | "translations">("decoding");

  const { songAnalysis, storyPlot, suggestedPrompts } = data;

  const tabs = [
    { id: "decoding", label: "🔍 Song Analytical Decoding", icon: Compass },
    { id: "characters", label: "👤 Cast & Protagonist", icon: User },
    { id: "chapters", label: "🎬 Narrative Chronology", icon: Layers },
    { id: "translations", label: "⚓ Lyrical Transformations", icon: Repeat }
  ];

  return (
    <div className="space-y-6" id="analysis-display">
      
      {/* Prime Header - Storyplot title styled with display typography */}
      <div className="bg-gradient-to-r from-[#030303] via-[#0b0c10] to-[#120e24]/40 p-6 md:p-8 rounded-3xl border border-white/10 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none">
          <BookOpen className="w-40 h-40 text-white" />
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-[9px] font-mono uppercase tracking-widest bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-full text-indigo-400">
                Acoustically Adapted Storyplot
              </span>
              <span className="text-[9px] font-mono uppercase tracking-widest bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full text-amber-400">
                {storyPlot.genre}
              </span>
            </div>
            <h2 className="font-display font-medium text-2xl md:text-3xl text-white tracking-tight leading-tight uppercase">
              {storyPlot.title}
            </h2>
            <p className="text-slate-400 text-xs mt-2 max-w-2xl font-sans font-normal leading-relaxed">
              Inspired by the underlying storytelling, metaphors, and phonetic atmosphere of the song.
            </p>
          </div>

          {/* Layout switcher buttons for the Bento Grid Theme */}
          <div className="flex items-center bg-[#030303]/60 border border-white/10 rounded-2xl p-1 self-start md:self-center">
            <button
              onClick={() => setLayoutMode("bento")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold tracking-wider uppercase transition cursor-pointer ${
                layoutMode === "bento"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Switch to Bento Grid layout"
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Bento Dashboard</span>
            </button>
            <button
              onClick={() => setLayoutMode("tabs")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold tracking-wider uppercase transition cursor-pointer ${
                layoutMode === "tabs"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Switch to Tabbed Focus layout"
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Tabbed Focus</span>
            </button>
          </div>
        </div>
      </div>

      {/* ==================== BENTO GRID VIEW ==================== */}
      {layoutMode === "bento" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Bento Card A: Song Decoding Summary */}
          <div className="lg:col-span-2 bg-[#090a0f]/80 backdrop-blur-md rounded-3xl border border-white/10 p-6 md:p-8 flex flex-col justify-between hover:border-indigo-500/25 hover:shadow-2xl hover:scale-[1.005] transition-all duration-300 shadow-xl group">
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
                    <Compass className="w-4 h-4" />
                  </div>
                  <h3 className="font-display font-semibold text-white text-xs uppercase tracking-wider">Song Analytical Decoding</h3>
                </div>
                <span className="text-[9px] font-mono text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded uppercase">
                  Decoding
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                This section isolates acoustic states and metaphorical subtext from the song to form structural story beats.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-black/40 rounded-xl p-4 border border-white/5">
                  <span className="text-[8px] font-mono font-bold text-slate-500 block uppercase tracking-widest mb-1.5">Literal Interpretation</span>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">{songAnalysis.literalMeaning}</p>
                </div>
                <div className="bg-indigo-950/15 rounded-xl p-4 border border-indigo-500/10">
                  <span className="text-[8px] font-mono font-bold text-indigo-400 block uppercase tracking-widest mb-1.5">Symbolic & Hidden Subtext</span>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">{songAnalysis.hiddenMeaning}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bento Card B: Themes & Motifs */}
          <div className="bg-[#090a0f]/80 backdrop-blur-md rounded-3xl border border-white/10 p-6 flex flex-col justify-between hover:border-indigo-500/25 hover:shadow-2xl hover:scale-[1.005] transition-all duration-300 shadow-xl group">
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
                    <Tag className="w-4 h-4" />
                  </div>
                  <h3 className="font-display font-semibold text-white text-xs uppercase tracking-wider">Themes & Motifs</h3>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Core narrative signals extracted organically from lyrics and rhythmic cues:
              </p>
              <div className="flex flex-wrap gap-2">
                {songAnalysis.themes.map((theme, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-mono font-semibold bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-3 py-1.5 rounded-lg uppercase tracking-wider"
                  >
                    #{theme}
                  </span>
                ))}
              </div>
            </div>
            <div className="border-t border-white/10 pt-4 mt-4 flex items-center justify-between text-[9px] font-mono text-slate-500">
              <span>MOTIF COUNTER</span>
              <span>{songAnalysis.themes.length} SCANS FOUND</span>
            </div>
          </div>

          {/* Bento Card C: Setting & Atmosphere */}
          <div className="bg-[#090a0f]/80 backdrop-blur-md rounded-3xl border border-white/10 p-6 flex flex-col justify-between hover:border-indigo-500/25 hover:shadow-2xl hover:scale-[1.005] transition-all duration-300 shadow-xl group">
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-purple-500/10 text-purple-400 rounded-lg border border-purple-500/20">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <h3 className="font-display font-semibold text-white text-xs uppercase tracking-wider">Atmospheric Setting</h3>
                </div>
              </div>
              <p className="text-xs text-slate-350 leading-relaxed mb-4">
                {storyPlot.setting.description}
              </p>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                  <span className="text-[8px] font-mono text-slate-500 block uppercase tracking-widest">Chronology Era</span>
                  <span className="text-xs font-mono font-bold text-indigo-400 block mt-1 uppercase">{storyPlot.setting.era}</span>
                </div>
                <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                  <span className="text-[8px] font-mono text-slate-500 block uppercase tracking-widest">Environment Mood</span>
                  <span className="text-xs font-mono font-bold text-amber-400 block mt-1 uppercase">{storyPlot.setting.mood}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bento Card D: Character Hero Profile */}
          <div className="md:col-span-2 bg-[#090a0f]/80 backdrop-blur-md rounded-3xl border border-white/10 p-6 md:p-8 flex flex-col justify-between hover:border-indigo-500/25 hover:shadow-2xl hover:scale-[1.005] transition-all duration-300 shadow-xl group">
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-rose-500/10 text-rose-400 rounded-lg border border-rose-500/20">
                    <User className="w-4 h-4" />
                  </div>
                  <h3 className="font-display font-semibold text-white text-xs uppercase tracking-wider">Core Protagonist</h3>
                </div>
                <span className="text-[10px] font-mono text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-0.5 rounded-full uppercase">
                  {storyPlot.protagonist.role}
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex flex-wrap items-baseline gap-3">
                  <h4 className="font-display font-medium text-white text-lg uppercase tracking-wide">
                    {storyPlot.protagonist.name}
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {storyPlot.protagonist.traits.map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[9px] bg-white/5 border border-white/10 text-slate-300 px-2 py-0.5 rounded-md font-mono uppercase tracking-wider"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  <div>
                    <span className="text-[8px] font-mono font-bold uppercase text-slate-500 tracking-wider block mb-1">Backstory & Conflict</span>
                    <p className="text-xs text-slate-400 leading-relaxed font-sans">{storyPlot.protagonist.backStory}</p>
                  </div>
                  <div className="bg-indigo-950/10 rounded-xl p-4 border border-indigo-500/15">
                    <span className="text-[8px] font-mono font-bold uppercase text-indigo-400 tracking-wider block mb-1">Character Evolution Arc</span>
                    <p className="text-xs text-slate-350 leading-relaxed font-sans">{storyPlot.protagonist.arc}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bento Card E: Supporting Cast */}
          {storyPlot.supportingCharacters && storyPlot.supportingCharacters.length > 0 && (
            <div className="bg-[#090a0f]/80 backdrop-blur-md rounded-3xl border border-white/10 p-6 flex flex-col justify-between hover:border-indigo-500/25 hover:shadow-2xl hover:scale-[1.005] transition-all duration-300 shadow-xl group">
              <div>
                <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-teal-500/10 text-teal-400 rounded-lg border border-teal-500/20">
                      <Award className="w-4 h-4" />
                    </div>
                    <h3 className="font-display font-semibold text-white text-xs uppercase tracking-wider">Key Supporting Cast</h3>
                  </div>
                </div>
                <div className="space-y-4">
                  {storyPlot.supportingCharacters.slice(0, 2).map((char, index) => (
                    <div key={index} className="bg-black/30 rounded-xl p-3 border border-white/5">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-display font-semibold text-slate-200 text-xs uppercase tracking-wider">{char.name}</span>
                        <span className="text-[8px] font-mono text-indigo-400 uppercase">{char.role}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{char.definition}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Bento Card F: Emotional & Acoustic Arc Metrics */}
          <div className="lg:col-span-3 bg-[#090a0f]/80 backdrop-blur-md rounded-3xl border border-white/10 p-6 md:p-8 flex flex-col justify-between hover:border-indigo-500/25 hover:shadow-2xl hover:scale-[1.005] transition-all duration-300 shadow-xl group">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex gap-4 items-start">
                <div className="p-3 bg-rose-500/10 text-rose-450 border border-rose-500/20 rounded-2xl flex-shrink-0">
                  <Heart className="w-5 h-5 animate-pulse text-rose-400" />
                </div>
                <div>
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block font-bold">Emotional Narrative Arc Shift</span>
                  <h4 className="font-display font-semibold text-white text-sm uppercase tracking-wide mt-1 mb-2">Internal Character Momentum</h4>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">{songAnalysis.emotionalArc}</p>
                </div>
              </div>

              <div className="flex gap-4 items-start border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6">
                <div className="p-3 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-2xl flex-shrink-0">
                  <Repeat className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block font-bold">Acoustic & Structural Style</span>
                  <h4 className="font-display font-semibold text-white text-sm uppercase tracking-wide mt-1 mb-2">Sonic Adaptability Metrics</h4>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">{songAnalysis.storytellingStyle}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bento Card G: Narrative Chronology (Chapters / Timeline) */}
          <div className="lg:col-span-3 bg-[#090a0f]/80 backdrop-blur-md rounded-3xl border border-white/10 p-6 md:p-8 hover:border-indigo-500/25 hover:shadow-2xl hover:scale-[1.002] transition-all duration-300 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
                  <Layers className="w-4 h-4" />
                </div>
                <h3 className="font-display font-semibold text-white text-sm uppercase tracking-wider">Narrative Chronology</h3>
              </div>
              <span className="text-[9px] font-mono text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded">
                {storyPlot.chapters.length} PHASES DECODED
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {storyPlot.chapters.map((chapter, idx) => (
                <div key={idx} className="bg-black/40 hover:bg-[#0c0d12]/60 rounded-2xl p-5 border border-white/5 hover:border-indigo-500/20 transition duration-200 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2 mb-3">
                      <span className="text-[9px] font-mono font-bold text-indigo-400 uppercase">Act 0{idx + 1}</span>
                      <span className="text-[9px] font-mono text-slate-500 uppercase truncate max-w-[120px]">{chapter.emotionalBeat}</span>
                    </div>
                    <h4 className="font-display font-semibold text-slate-100 text-xs uppercase tracking-wide mb-2">{chapter.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed mb-4">{chapter.summary}</p>
                  </div>
                  <div className="text-[10px] bg-[#030303] border border-white/5 rounded-lg p-2.5 italic text-indigo-300 font-sans mt-2">
                    "{chapter.keyMetaphor}"
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-r from-[#030303] to-indigo-950/20 rounded-2xl p-5 mt-6 border border-indigo-500/15">
              <span className="text-[8px] font-mono font-bold text-indigo-400 block uppercase tracking-widest mb-1.5">Story Resolution Finale</span>
              <p className="text-xs text-slate-350 leading-relaxed font-sans">{storyPlot.conclusion}</p>
            </div>
          </div>

          {/* Bento Card H: Lyrical Connections Mapping */}
          <div className="lg:col-span-3 bg-[#08080c]/80 backdrop-blur-md rounded-3xl border border-white/10 p-6 md:p-8 hover:border-indigo-500/25 hover:shadow-2xl transition duration-300 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-teal-500/10 text-teal-400 rounded-lg border border-teal-500/20">
                  <Repeat className="w-4 h-4" />
                </div>
                <h3 className="font-display font-semibold text-white text-sm uppercase tracking-wider">Lyrical Transformations Mapping</h3>
              </div>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Precise decoding registries mapping how acoustic shifts and lyrics represent fictional elements:
            </p>

            <div className="border border-white/5 rounded-2xl overflow-hidden bg-black/40">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#050508] border-b border-white/10 text-[8px] font-mono font-semibold text-slate-400 uppercase tracking-widest">
                    <th className="px-4 py-3 w-1/3">Lyrical / Auditory Quote</th>
                    <th className="px-4 py-3">Narrative Transformation Matrix</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {storyPlot.lyricalConnections.map((conn, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.01] transition-colors duration-150">
                      <td className="px-4 py-3.5 font-mono text-indigo-300 leading-relaxed italic border-r border-white/5">
                        "{conn.quoteOrTimestamp}"
                      </td>
                      <td className="px-4 py-3.5 text-slate-400 leading-relaxed font-sans">
                        {conn.narrativeTranslation}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      ) : (
        /* ==================== TABBED VIEW ==================== */
        <div className="bg-[#0b0c10]/70 backdrop-blur-md rounded-3xl border border-white/10 shadow-xl overflow-hidden animate-fade-in">
          
          {/* Tabs header list */}
          <div className="bg-[#030303]/40 border-b border-white/10 flex flex-wrap gap-1 p-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-medium tracking-wide transition cursor-pointer uppercase ${
                    isActive
                      ? "bg-indigo-600/10 text-indigo-300 border border-indigo-500/35 shadow-inner"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent"
                  }`}
                  id={`tab-button-${tab.id}`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-indigo-400" : "text-slate-500"}`} />
                  <span>{tab.label.split(" ").slice(1).join(" ")}</span>
                </button>
              );
            })}
          </div>

          <div className="p-6 md:p-8">
            {/* Tab: Decoding */}
            {activeTab === "decoding" && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h4 className="flex items-center gap-2 text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-widest mb-3">
                    <Tag className="w-3.5 h-3.5 text-indigo-450" /> Discovered Themes & Motifs
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {songAnalysis.themes.map((theme, i) => (
                      <span key={i} className="text-xs font-semibold bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-3 py-1 rounded-lg font-mono uppercase tracking-wide">
                        {theme}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div className="bg-[#030303]/60 hover:bg-white/[0.01] rounded-xl p-5 border border-white/5 transition-all">
                    <span className="text-[9px] font-mono font-bold bg-white/5 border border-white/10 text-slate-450 px-2 py-0.5 rounded uppercase tracking-wider">Surface Level Ingest</span>
                    <h4 className="font-display font-medium text-slate-200 text-sm mt-3 mb-2 uppercase tracking-wide">Literal Interpretation</h4>
                    <p className="text-xs text-slate-400 leading-relaxed font-sans">{songAnalysis.literalMeaning}</p>
                  </div>

                  <div className="bg-indigo-950/10 hover:bg-indigo-650/[0.04] rounded-xl p-5 border border-indigo-500/15 transition-all">
                    <span className="text-[9px] font-mono font-bold bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 px-2 py-0.5 rounded uppercase tracking-wider">Symbolic Subtext Scan</span>
                    <h4 className="font-display font-medium text-indigo-300 text-sm mt-3 mb-2 uppercase tracking-wide">Metaphor & Hidden Codes</h4>
                    <p className="text-xs text-slate-350 leading-relaxed font-sans">{songAnalysis.hiddenMeaning}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="bg-[#030303]/40 border border-white/5 rounded-xl p-4 flex gap-4 items-start">
                    <Heart className="w-4 h-4 text-rose-450 animate-pulse mt-0.5" />
                    <div>
                      <h4 className="font-mono text-slate-300 text-[10px] font-semibold uppercase tracking-widest">Emotional Arc Shift</h4>
                      <p className="text-xs text-slate-400 leading-relaxed mt-1 font-sans">{songAnalysis.emotionalArc}</p>
                    </div>
                  </div>

                  <div className="bg-[#030303]/40 border border-white/5 rounded-xl p-4 flex gap-4 items-start">
                    <Repeat className="w-4 h-4 text-indigo-400 mt-0.5" />
                    <div>
                      <h4 className="font-mono text-slate-300 text-[10px] font-semibold uppercase tracking-widest">Acoustic & Structural Style</h4>
                      <p className="text-xs text-slate-400 leading-relaxed mt-1 font-sans">{songAnalysis.storytellingStyle}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Characters */}
            {activeTab === "characters" && (
              <div className="space-y-8 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white/5 border border-white/5 p-5 rounded-2xl">
                  <div>
                    <span className="text-[9px] font-mono font-bold text-slate-500 block uppercase tracking-widest">Atmospheric Setting</span>
                    <span className="text-xs font-semibold text-slate-200 mt-1 block leading-relaxed">{storyPlot.setting.description}</span>
                  </div>
                  <div className="border-t md:border-t-0 md:border-l border-white/10 pt-3 md:pt-0 md:pl-5">
                    <span className="text-[9px] font-mono font-bold text-slate-500 block uppercase tracking-widest">Chronology Era</span>
                    <span className="text-xs text-indigo-400 font-bold font-mono mt-1 block uppercase">{storyPlot.setting.era}</span>
                  </div>
                  <div className="border-t md:border-t-0 md:border-l border-white/10 pt-3 md:pt-0 md:pl-5">
                    <span className="text-[9px] font-mono font-bold text-slate-500 block uppercase tracking-widest">Environment Mood</span>
                    <span className="text-xs text-amber-400 font-bold font-mono mt-1 block uppercase">{storyPlot.setting.mood}</span>
                  </div>
                </div>

                <div className="border border-white/10 rounded-2xl bg-[#030303]/60 shadow-lg overflow-hidden">
                  <div className="bg-[#030303] border-b border-white/10 p-4 flex items-center justify-between">
                    <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-widest">Core Protagonist</span>
                    <span className="text-[10px] font-mono text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-2.5 py-0.5 uppercase tracking-wide">{storyPlot.protagonist.role}</span>
                  </div>

                  <div className="p-5 md:p-6 space-y-4">
                    <div className="flex flex-wrap items-baseline gap-3">
                      <h3 className="font-display font-medium text-white text-lg uppercase tracking-wide">{storyPlot.protagonist.name}</h3>
                      <div className="flex flex-wrap gap-1.5">
                        {storyPlot.protagonist.traits.map((t, idx) => (
                          <span key={idx} className="text-[9px] bg-white/5 border border-white/10 text-slate-300 px-2 py-0.5 rounded-md font-mono uppercase tracking-wider">{t}</span>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
                      <div>
                        <h5 className="text-[10px] font-mono font-semibold uppercase text-slate-500 tracking-wider mb-2">Dramatic Backstory</h5>
                        <p className="text-xs text-slate-400 leading-relaxed font-sans">{storyPlot.protagonist.backStory}</p>
                      </div>
                      <div className="bg-indigo-650/[0.02] rounded-xl p-4 border border-indigo-500/15">
                        <h5 className="text-[10px] font-mono font-semibold uppercase text-indigo-400 tracking-wider mb-2">Frictional Character Arc</h5>
                        <p className="text-xs text-slate-350 leading-relaxed font-sans">{storyPlot.protagonist.arc}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {storyPlot.supportingCharacters && storyPlot.supportingCharacters.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-widest mb-3.5 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-indigo-400" /> Key Supporting Cast
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {storyPlot.supportingCharacters.map((char, index) => (
                        <div key={index} className="border border-white/5 bg-[#030303]/60 hover:border-indigo-500/20 rounded-xl p-4 flex flex-col justify-between transition-all duration-150">
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <span className="font-display font-semibold text-slate-200 text-xs uppercase tracking-wider">{char.name}</span>
                              <span className="text-[9px] font-mono text-indigo-450 bg-indigo-500/5 border border-indigo-500/10 px-2 py-0.5 rounded uppercase tracking-wide">{char.role}</span>
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed font-sans">{char.definition}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Chapters */}
            {activeTab === "chapters" && (
              <div className="space-y-6 animate-fade-in">
                <div className="relative border-l border-white/10 pl-6 ml-3 space-y-8">
                  {storyPlot.chapters.map((chapter, idx) => (
                    <div key={idx} className="relative group animate-slide-up">
                      <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border border-indigo-500 bg-[#020203] group-hover:border-indigo-400 transition flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-550 group-hover:bg-indigo-400" />
                      </div>

                      <div className="bg-[#030303]/70 hover:bg-[#0c0d12]/80 rounded-2xl p-5 border border-white/5 group-hover:border-indigo-500/20 transition duration-200 shadow-md">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2.5 mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-mono font-bold text-indigo-400">ACT 0{idx + 1}</span>
                            <h4 className="font-display font-semibold text-white text-xs uppercase tracking-wider">{chapter.title}</h4>
                          </div>
                          <span className="text-[9px] font-mono bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded uppercase tracking-wider">Beat: {chapter.emotionalBeat}</span>
                        </div>

                        <div className="space-y-3">
                          <p className="text-xs text-slate-400 leading-relaxed font-sans">{chapter.summary}</p>
                          <div className="text-[11px] bg-black/40 border border-white/5 rounded-lg p-3 italic text-slate-455">
                            <strong className="not-italic text-[9px] font-mono text-indigo-400 block uppercase tracking-widest mb-1 leading-none">Lyric Anchor Context</strong>
                            "{chapter.keyMetaphor}"
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-gradient-to-r from-[#030303] to-indigo-950/20 text-indigo-200 rounded-2xl p-5 mt-6 border border-indigo-550/20">
                  <h4 className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-widest text-[#cfc5f9] mb-2 leading-none">
                    <Clock className="w-4 h-4 text-indigo-400" /> Plot resolution Finale
                  </h4>
                  <p className="text-xs leading-relaxed text-slate-400 font-sans">{storyPlot.conclusion}</p>
                </div>
              </div>
            )}

            {/* Tab: Translations */}
            {activeTab === "translations" && (
              <div className="space-y-4 animate-fade-in">
                <p className="text-xs text-slate-400">Precise decoding registers mapping how lyrics represent structural elements:</p>
                <div className="border border-white/10 rounded-2xl overflow-hidden shadow-lg bg-black/40">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#08080c] border-b border-white/10 text-[9px] font-mono font-semibold text-slate-400 uppercase tracking-widest">
                        <th className="px-4 py-3.5 w-1/3">Sound Anchor / Lyrical Quote</th>
                        <th className="px-4 py-3.5">Narrative Decoding Matrix</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {storyPlot.lyricalConnections.map((conn, idx) => (
                        <tr key={idx} className="hover:bg-white/[0.01] transition-colors duration-150">
                          <td className="px-4 py-3.5 font-mono text-indigo-300 leading-relaxed italic border-r border-white/5">"{conn.quoteOrTimestamp}"</td>
                          <td className="px-4 py-3.5 text-slate-400 leading-relaxed font-sans">{conn.narrativeTranslation}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Suggested interactive prompts footer */}
      {suggestedPrompts && suggestedPrompts.length > 0 && (
        <div className="bg-[#090a0f]/85 border border-white/10 rounded-3xl p-6 md:p-8 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
            <h4 className="font-display font-medium text-slate-300 text-xs uppercase tracking-widest leading-none">Acoustically Suggested Plot Expanders</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {suggestedPrompts.map((prompt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onSelectPrompt(prompt)}
                className="bg-white/5 border border-white/5 hover:border-indigo-500/30 hover:bg-indigo-650/10 p-3.5 rounded-xl text-left transition duration-200 text-xs text-slate-300 hover:text-indigo-400 group cursor-pointer flex justify-between gap-1.5 h-full items-start"
              >
                <span className="leading-relaxed">{prompt}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-indigo-400 flex-shrink-0 mt-0.5 group-hover:translate-x-0.5 transition" />
              </button>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
