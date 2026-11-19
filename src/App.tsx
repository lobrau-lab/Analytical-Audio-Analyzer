import React, { useState, useEffect } from "react";
import LyricalSourceInput from "./components/LyricalSourceInput";
import SettingsPanel from "./components/SettingsPanel";
import AnalysisDisplay from "./components/AnalysisDisplay";
import HistoryList from "./components/HistoryList";
import { StorySettings, AnalyzeResponse, HistoryItem } from "./types";
import {
  Music4,
  Sparkles,
  BookOpen,
  Send,
  Loader2,
  VolumeX,
  FileText,
  AlertTriangle,
  Award,
  Bookmark,
  ShieldAlert,
  Key,
  Database,
  Grid
} from "lucide-react";

export default function App() {
  const [lyrics, setLyrics] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [songContext, setSongContext] = useState("");
  const [storySettings, setStorySettings] = useState<StorySettings>({
    genre: "Adaptive",
    tone: "Adaptive",
    era: "Adaptive",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeResponse, setActiveResponse] = useState<AnalyzeResponse | null>(null);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | undefined>(undefined);

  // Character expansion sandbox state
  const [sandboxQuery, setSandboxQuery] = useState("");
  const [sandboxResult, setSandboxResult] = useState<string | null>(null);
  const [isSandboxLoading, setIsSandboxLoading] = useState(false);

  // Load history on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("audio_analyzer_plots_v1");
      if (stored) {
        const parsed = JSON.parse(stored) as HistoryItem[];
        setHistoryItems(parsed);
        if (parsed.length > 0) {
          setActiveResponse(parsed[0].result);
          setSelectedHistoryId(parsed[0].id);
        }
      }
    } catch (e) {
      console.error("Failed to load local history", e);
    }
  }, []);

  const saveToHistory = (response: AnalyzeResponse, songTitle: string, artist: string, hasAud: boolean) => {
    try {
      const newItem: HistoryItem = {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toISOString(),
        songName: songTitle || response.storyPlot.title || "Untitled Masterpiece",
        artistName: artist || "Artistic Translation",
        lyricsSnippet: lyrics ? lyrics.slice(0, 80) + "..." : "Soundwave Scan",
        hasAudio: hasAud,
        result: response,
      };

      const updated = [newItem, ...historyItems.filter((h) => h.songName !== newItem.songName)];
      setHistoryItems(updated);
      setSelectedHistoryId(newItem.id);
      localStorage.setItem("audio_analyzer_plots_v1", JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save trace to history", e);
    }
  };

  const handleDeleteHistory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const updated = historyItems.filter((item) => item.id !== id);
      setHistoryItems(updated);
      localStorage.setItem("audio_analyzer_plots_v1", JSON.stringify(updated));
      if (selectedHistoryId === id) {
        if (updated.length > 0) {
          setActiveResponse(updated[0].result);
          setSelectedHistoryId(updated[0].id);
        } else {
          setActiveResponse(null);
          setSelectedHistoryId(undefined);
        }
      }
    } catch (err) {
      console.error("Error wiping story from vault:", err);
    }
  };

  const handleSelectHistory = (item: HistoryItem) => {
    setActiveResponse(item.result);
    setSelectedHistoryId(item.id);
    setSandboxResult(null);
    setSandboxQuery("");
  };

  const onClearAll = () => {
    setLyrics("");
    setAudioFile(null);
    setSongContext("");
    setStorySettings({
      genre: "Adaptive",
      tone: "Adaptive",
      era: "Adaptive",
    });
    setError(null);
  };

  const handleQuickLoad = (preset: {
    lyrics: string;
    context: string;
    settings: { genre: string; tone: string; era: string };
  }) => {
    setLyrics(preset.lyrics);
    setSongContext(preset.context);
    setStorySettings(preset.settings);
    setError(null);
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64Data = result.split(",")[1];
        resolve(base64Data);
      };
      reader.onerror = (e) => reject(e);
    });
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lyrics.trim() && !audioFile) {
      setError("Please write/paste some lyrics or drag in an audio file to analyze.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSandboxResult(null);
    setSandboxQuery("");

    try {
      let fileData: string | undefined = undefined;
      let mimeType: string | undefined = undefined;
      let fileName: string | undefined = undefined;

      if (audioFile) {
        fileName = audioFile.name;
        mimeType = audioFile.type || "audio/mpeg";
        fileData = await convertFileToBase64(audioFile);
      }

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileData,
          fileName,
          mimeType,
          lyrics,
          context: songContext,
          storySettings,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `Server responded with status ${response.status}`);
      }

      const parsedData: AnalyzeResponse = await response.json();
      setActiveResponse(parsedData);

      // Save to local storage history
      let presetTitle = "";
      let presetArtist = "";
      if (songContext) {
        const firstLine = songContext.split(".")[0];
        const match = firstLine.match(/(.*)\sby\s(.*)/i);
        if (match) {
          presetTitle = match[1].trim();
          presetArtist = match[2].trim();
        } else {
          presetTitle = firstLine.slice(0, 30);
        }
      }
      saveToHistory(parsedData, presetTitle, presetArtist, !!audioFile);

    } catch (err: any) {
      console.error("Analysis request failed:", err);
      setError(err.message || "An error occurred connecting to the backend analysis engine.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPrompt = (prompt: string) => {
    setSandboxQuery(prompt);
    // Smooth scroll to sandbox
    const sandboxEl = document.getElementById("sandbox-section");
    if (sandboxEl) {
      sandboxEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSandboxSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeResponse || !sandboxQuery.trim()) return;

    setIsSandboxLoading(true);
    setSandboxResult(null);

    try {
      const pack = {
        storyPlot: activeResponse.storyPlot,
        songAnalysis: activeResponse.songAnalysis,
        query: sandboxQuery,
      };

      const resp = await fetch("/api/expand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pack),
      });

      if (!resp.ok) {
        const errJson = await resp.json().catch(() => ({}));
        throw new Error(errJson.error || "Plot expansion request failed");
      }

      const body = await resp.json();
      setSandboxResult(body.prose);
    } catch (err: any) {
      console.error("Sandbox extension failed:", err);
      setSandboxResult(`Failed to expand plot scene: ${err.message || "Unknown proxy error"}`);
    } finally {
      setIsSandboxLoading(false);
    }
  };

  // Check if error is due to the AQ API key restriction
  const isAuthError = error && (
    error.includes("401") ||
    error.toLowerCase().includes("unauthenticated") ||
    error.toLowerCase().includes("auth") ||
    error.includes("AQ.") ||
    error.toLowerCase().includes("access_token_type_unsupported") ||
    error.toLowerCase().includes("credential")
  );

  return (
    <div className="min-h-screen bg-[#020204] flex flex-col font-sans selection:bg-indigo-500/20 selection:text-indigo-300 text-slate-300">
      
      {/* Pristine Master Header */}
      <header className="bg-[#020204]/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-40 px-6 py-4" id="app-header">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600/20 text-indigo-400 rounded-2xl shadow-lg border border-indigo-500/35">
              <Music4 className="w-5 h-5 animate-pulse text-indigo-300" />
            </div>
            <div>
              <h1 className="font-display font-medium text-lg text-white tracking-widest uppercase flex items-center gap-1.5 leading-none">
                Sonic Script <span className="text-indigo-400 text-[10px] font-mono px-2 py-0.5 border border-indigo-500/20 rounded">Bento v4.5</span>
              </h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono mt-1">
                Lyrical Soundwave & Acoustic Plot Engine
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-[10px] font-mono font-medium text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
              ANALYZING: LIVE SANDBOX
            </span>
          </div>
        </div>
      </header>

      {/* Main App Grid Area - Bento Grid Styling */}
      <main className="flex-grow max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 space-y-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN: Inputs (Takes 2 columns in large screen) */}
          <section className="lg:col-span-2 space-y-6">
            <form onSubmit={handleAnalyze} className="space-y-6">
              
              {/* Lyrics and Audio controls */}
              <LyricalSourceInput
                lyrics={lyrics}
                setLyrics={setLyrics}
                audioFile={audioFile}
                setAudioFile={setAudioFile}
                onClearAll={onClearAll}
                onQuickLoad={handleQuickLoad}
              />

              {/* Adaptability configuration adapters */}
              <div className="grid grid-cols-1 gap-6">
                <SettingsPanel
                  settings={storySettings}
                  setSettings={setStorySettings}
                  songContext={songContext}
                  setSongContext={setSongContext}
                />
              </div>

              {/* ACTION CALL TO ACTION (Styled as an elegant Bento grid piece) */}
              <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#090a0f]/80 backdrop-blur-md rounded-3xl border border-white/10 p-6 shadow-xl shadow-black/40">
                <div className="text-xs text-slate-400 flex-grow text-center sm:text-left font-sans">
                  Ready to translate? Gemini will synthesize lyrics, melodies, and chosen settings into an interactive, multi-layered story.
                </div>
                <button
                  type="submit"
                  disabled={isLoading || (!lyrics.trim() && !audioFile)}
                  className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-white/5 disabled:text-slate-600 disabled:border-white/5 text-white font-semibold text-xs rounded-2xl transition duration-150 transform hover:-translate-y-0.5 active:translate-y-0 shadow-lg border border-indigo-500/30 uppercase tracking-wider font-mono flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                  id="submit-analysis-btn"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>DECODING SOUNDWAVES...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-200" />
                      <span>Formulate Story Plot</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </section>

          {/* RIGHT COLUMN: Sidebar (Vault & Extra Metadata) */}
          <aside className="space-y-6">
            
            {/* Short Application Explainer Card */}
            <div className="bg-[#090a0f]/80 backdrop-blur-md rounded-3xl p-6 border border-white/10 shadow-xl shadow-black/50">
              <div className="flex items-center gap-2 mb-3">
                <Award className="w-5 h-5 text-indigo-400" />
                <h4 className="font-mono font-bold text-xs text-white uppercase tracking-widest">
                  Analysis Paradigm
                </h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-sans mb-3">
                This analyzer treats every track as an interactive narrative. It isolates auditory states (melodic key changes, tempo tension, dynamic shifts) and meshes them with literal/metaphorical lyrics to create cohesive worlds, archetypal protagonists, and structured plots.
              </p>
              <div className="border-t border-white/10 pt-3 flex items-center justify-between text-[10px] font-mono text-indigo-400">
                <span>DEEP MUSICOLOGY</span>
                <span>v4.5.0 OPTIMAL</span>
              </div>
            </div>

            {/* History Chronicle Vault */}
            <HistoryList
              items={historyItems}
              onSelect={handleSelectHistory}
              onDelete={handleDeleteHistory}
              selectedId={selectedHistoryId}
            />

          </aside>
        </div>

        {/* RESULTS SEGMENT (Shows conditionally) */}
        <section className="space-y-6 max-w-7xl mx-auto">
          {error && (
            <div className="space-y-4">
              {/* Specialized AQ. API Key Diagnostics Alert Box */}
              {isAuthError ? (
                <div className="bg-[#0e0a0d] border border-amber-500/30 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row gap-5 shadow-2xl animate-fade-in" id="key-diagnostic-alert">
                  <div className="p-3 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-2xl flex-shrink-0 self-start">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2 leading-none">
                        ⚠️ CRITICAL: API KEY REDIRECT DETECTED (AQ. FORMAT)
                      </h4>
                      <p className="text-[11px] text-amber-400/80 font-mono mt-1">ACCOUNT STATUS SANCTION • ACCESS_TOKEN_TYPE_UNSUPPORTED</p>
                    </div>
                    
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      Your Gemini API key starts with <code className="bg-white/5 border border-white/10 rounded px-1 text-indigo-300 font-mono">AQ.</code>. 
                      Google's automated security systems automatically restrict developer accounts if an API key is accidentally exposed on public repositories (like public GitHub commits). 
                      When restricted, the account is penalized and restricted to generating <code className="bg-white/5 border border-white/10 rounded px-1 text-indigo-300 font-mono">AQ.</code> keys instead of standard 
                      <code className="bg-white/5 border border-white/10 rounded px-1 text-emerald-400 font-mono">AIza</code> keys. These AQ. tokens require an OAuth 2 identity gateway and are rejected with a 
                      <strong> 401 Unauthenticated / Unsupported Token</strong> error on normal developer SDK endpoints.
                    </p>

                    <div className="bg-black/40 rounded-2xl p-4 border border-white/5 space-y-2.5">
                      <span className="text-[9px] font-mono text-indigo-400 font-bold block uppercase tracking-widest">How to Resolve This Instantly:</span>
                      <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside font-sans pl-1">
                        <li>
                          <strong>Create a different/alternative Google Account</strong> (or use another Gmail or Google Workspace identity).
                        </li>
                        <li>
                          Navigate to <a href="https://aistudio.google.com" target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline font-semibold hover:text-indigo-300">Google AI Studio</a> logging in with your new account.
                        </li>
                        <li>
                          Create a new project and generate a fresh API key. Ensure the new key begins with the standard <strong className="text-emerald-400 font-mono">AIza...</strong> prefix.
                        </li>
                        <li>
                          Open the <strong>Settings &gt; Secrets</strong> panel in the top-right header of your AI Studio workspace, and update your <code className="font-mono text-indigo-300">GEMINI_API_KEY</code> secret with the new standard key.
                        </li>
                      </ol>
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Standard raw error block */}
              <div className="bg-rose-950/15 border border-rose-500/20 rounded-2xl p-5 flex items-start gap-3 text-rose-300 shadow-xl" id="error-message">
                <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-semibold text-xs uppercase tracking-wider mb-1 font-mono text-rose-400">Analysis Action Failed</h5>
                  <p className="text-xs font-mono">{error}</p>
                </div>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="bg-[#090a0f]/80 border border-white/10 p-16 text-center rounded-3xl shadow-xl flex flex-col items-center justify-center space-y-4 min-h-[400px]">
              <div className="relative">
                <Loader2 className="w-12 h-12 text-indigo-400 animate-spin" />
                <BookOpen className="w-5 h-5 text-indigo-300 absolute top-3.5 left-3.5 animate-pulse" />
              </div>
              <h3 className="font-display font-medium text-white text-base uppercase tracking-widest">Synthesizing Lyrics and Acoustic Elements</h3>
              <p className="text-xs text-slate-400 max-w-sm leading-relaxed font-sans">
                Please wait. Gemini is examining word metrics, thematic patterns, character dynamics, and audio markers to compose your storyplot...
              </p>
              {audioFile && (
                <div className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                  Processing multimodal acoustic waveform stream
                </div>
              )}
            </div>
          ) : (
            activeResponse && (
              <div className="space-y-6 animate-fade-in">
                {/* Visual rendering panel */}
                <AnalysisDisplay data={activeResponse} onSelectPrompt={handleSelectPrompt} />

                {/* Narrative Sandbox: Custom follow up prose generator */}
                <div
                  id="sandbox-section"
                  className="bg-[#090a0f]/80 backdrop-blur-md rounded-3xl border border-white/10 p-6 md:p-8 shadow-2xl"
                >
                  <div className="flex items-center gap-2 border-b border-white/10 pb-4 mb-5">
                    <div className="p-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg">
                      <Bookmark className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-display font-medium text-white text-sm uppercase tracking-widest">PROSE EXPANSION SANDBOX</h3>
                      <p className="text-xs text-slate-450 font-sans mt-0.5">
                        Ask follow-up questions to expand scene drafts, draft dialogues, or explore particular character moments
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleSandboxSubmit} className="space-y-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        value={sandboxQuery}
                        onChange={(e) => setSandboxQuery(e.target.value)}
                        placeholder="e.g. 'Draft scene prose for Act I with intense character dialogue.' or 'Write a backstory for Clara...'"
                        className="flex-grow bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all font-sans"
                        disabled={isSandboxLoading}
                      />
                      <button
                        type="submit"
                        disabled={isSandboxLoading || !sandboxQuery.trim()}
                        className="bg-indigo-600 hover:bg-indigo-500 border border-indigo-500/35 disabled:bg-white/5 disabled:text-slate-650 text-white p-3 rounded-xl transition duration-150 flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
                        id="sandbox-submit-btn"
                        title="Formulate prose"
                      >
                        {isSandboxLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {/* Expander Prose Render */}
                    {sandboxResult && (
                      <div className="bg-black/55 border border-white/5 rounded-xl p-5 md:p-6 transition-all duration-200 animate-slide-up">
                        <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
                          <span className="text-[9px] font-mono text-slate-400 font-bold uppercase tracking-widest">
                            Generated Literary prose
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(sandboxResult);
                              alert("Copied to clipboard!");
                            }}
                            className="text-[10px] font-mono text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
                          >
                            Copy prose
                          </button>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed font-serif whitespace-pre-wrap">
                          {sandboxResult}
                        </p>
                      </div>
                    )}
                  </form>
                </div>
              </div>
            )
          )}
        </section>

      </main>

      {/* Humble aesthetic footer */}
      <footer className="border-t border-white/10 py-6 mt-16 text-center text-xs text-slate-600 font-mono">
        <p className="max-w-md mx-auto px-4 leading-relaxed uppercase tracking-widest text-[9px]">
          Sonic Script Analytical Engine • Powered by Gemini 3.5 flash intelligence. Vault states persist locally.
        </p>
      </footer>

    </div>
  );
}
