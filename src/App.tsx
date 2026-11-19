import React, { useEffect, useState } from "react";
import {
  ArrowDown,
  Loader2,
  AlertTriangle,
  ShieldAlert,
  Music,
  X,
} from "lucide-react";
import LyricalSourceInput from "./components/LyricalSourceInput";
import SettingsPanel from "./components/SettingsPanel";
import AnalysisDisplay, { buildMarkdownDossier } from "./components/AnalysisDisplay";
import SceneDesk from "./components/SceneDesk";
import HistoryDrawer from "./components/HistoryDrawer";
import { HERO_STUDIO_IMAGE, SongPreset } from "./data/presets";
import {
  AnalyzeResponse,
  Chapter,
  DraftedScene,
  ExpansionMode,
  HistoryItem,
  StorySettings,
} from "./types";

const STORAGE_KEY = "audio_analyzer_plots_v1";

function convertFileToBase64(file: File): Promise<string> {
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
}

export default function App() {
  const [lyrics, setLyrics] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [songContext, setSongContext] = useState("");
  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const [storySettings, setStorySettings] = useState<StorySettings>({
    genre: "Adaptive",
    tone: "Adaptive",
    era: "Adaptive",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeResponse, setActiveResponse] = useState<AnalyzeResponse | null>(null);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | undefined>(undefined);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [heroImgFailed, setHeroImgFailed] = useState(false);

  // Scene Desk state
  const [scenePrompt, setScenePrompt] = useState("");
  const [sceneMode, setSceneMode] = useState<ExpansionMode>("prose");
  const [autoTriggerToken, setAutoTriggerToken] = useState(0);

  // Non-blocking toast feedback (replaces window.alert)
  const [toast, setToast] = useState<{ message: string; type: "info" | "error" } | null>(null);

  const notify = (message: string, type: "info" | "error" = "info") => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  // Load saved adaptations from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as HistoryItem[];
        setHistoryItems(parsed);
        if (parsed.length > 0) {
          setActiveResponse(parsed[0].result);
          setSelectedHistoryId(parsed[0].id);
        }
      }
    } catch (e) {
      console.error("Failed to load local archive", e);
    }
  }, []);

  const persistHistory = (updated: HistoryItem[]) => {
    setHistoryItems(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save archive", e);
    }
  };

  const activeHistoryItem = historyItems.find((h) => h.id === selectedHistoryId);
  const draftedScenes: DraftedScene[] = activeHistoryItem?.scenes || [];

  const saveToHistory = (
    response: AnalyzeResponse,
    songTitle: string,
    artist: string,
    hasAudio: boolean
  ) => {
    const newItem: HistoryItem = {
      id: Math.random().toString(36).substring(2, 10),
      timestamp: new Date().toISOString(),
      songName: songTitle || response.storyPlot.title || "Untitled Track",
      artistName: artist || "Original Adaptation",
      lyricsSnippet: lyrics ? lyrics.slice(0, 80) : "Audio Track",
      hasAudio,
      result: response,
      scenes: [],
    };
    const updated = [
      newItem,
      ...historyItems.filter((h) => h.result.storyPlot.title !== response.storyPlot.title),
    ];
    setSelectedHistoryId(newItem.id);
    persistHistory(updated);
  };

  const handleAddScene = (scene: DraftedScene) => {
    if (!selectedHistoryId) return;
    const updated = historyItems.map((item) =>
      item.id === selectedHistoryId
        ? { ...item, scenes: [scene, ...(item.scenes || [])] }
        : item
    );
    persistHistory(updated);
  };

  const handleDeleteScene = (sceneId: string) => {
    if (!selectedHistoryId) return;
    const updated = historyItems.map((item) =>
      item.id === selectedHistoryId
        ? { ...item, scenes: (item.scenes || []).filter((s) => s.id !== sceneId) }
        : item
    );
    persistHistory(updated);
    notify("Scene removed from notebook.", "info");
  };

  const handleDeleteHistory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = historyItems.filter((item) => item.id !== id);
    persistHistory(updated);
    if (selectedHistoryId === id) {
      if (updated.length > 0) {
        setActiveResponse(updated[0].result);
        setSelectedHistoryId(updated[0].id);
      } else {
        setActiveResponse(null);
        setSelectedHistoryId(undefined);
      }
    }
    notify("Removed from archive.", "info");
  };

  const handleSelectHistory = (item: HistoryItem) => {
    setActiveResponse(item.result);
    setSelectedHistoryId(item.id);
    setScenePrompt("");
    setTimeout(() => {
      document.getElementById("folio-section")?.scrollIntoView({ behavior: "smooth" });
    }, 60);
  };

  const handleClearAll = () => {
    setLyrics("");
    setAudioFile(null);
    setSongContext("");
    setActivePresetId(null);
    setStorySettings({
      genre: "Adaptive",
      tone: "Adaptive",
      era: "Adaptive",
    });
    setError(null);
  };

  const handleQuickLoad = (preset: SongPreset) => {
    setLyrics(preset.lyrics);
    setSongContext(preset.context);
    setActivePresetId(preset.id);
    setStorySettings({
      genre: preset.genre,
      tone: preset.tone,
      era: preset.era,
    });
    setError(null);
    notify(`Loaded "${preset.title}" by ${preset.artist}.`, "info");
  };

  const handleTranscribeAudio = async () => {
    if (!audioFile || isTranscribing) return;
    setIsTranscribing(true);
    setError(null);
    try {
      const fileData = await convertFileToBase64(audioFile);
      const mimeType = audioFile.type || "audio/mpeg";
      const res = await fetch("/api/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileData, mimeType }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Transcription failed (${res.status})`);
      }

      const data = await res.json();
      if (data.lyrics) {
        setLyrics(data.lyrics);
        setActivePresetId(null);
        notify("Lyrics transcribed into the editor.", "info");
      }
    } catch (err: any) {
      notify(err?.message || "Audio transcription failed.", "error");
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lyrics.trim() && !audioFile) {
      setError("Paste song lyrics or attach an audio file to begin.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setScenePrompt("");

    try {
      let fileData: string | undefined;
      let mimeType: string | undefined;
      let fileName: string | undefined;

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
        throw new Error(errJson.error || `Server error (${response.status})`);
      }

      const parsedData: AnalyzeResponse = await response.json();
      setActiveResponse(parsedData);

      let songTitle = "";
      let artist = "";
      if (songContext) {
        const firstSentence = songContext.split(".")[0];
        const match = firstSentence.match(/(.*)\sby\s(.*)/i);
        if (match) {
          songTitle = match[1].trim();
          artist = match[2].trim();
        } else {
          songTitle = firstSentence.slice(0, 40);
        }
      }

      saveToHistory(parsedData, songTitle, artist, !!audioFile);
      notify(`Created "${parsedData.storyPlot.title}".`, "info");

      setTimeout(() => {
        document.getElementById("folio-section")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err: any) {
      setError(err?.message || "Unable to complete analysis.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDraftChapter = (chapter: Chapter, index: number) => {
    setSceneMode("prose");
    setScenePrompt(
      `Draft Chapter ${index + 1} ("${chapter.title}", ${chapter.songSection || "Movement"}): ${chapter.summary} Anchor the scene around the motif "${chapter.keyMetaphor}".`
    );
    setAutoTriggerToken((n) => n + 1);
    document.getElementById("sandbox-section")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSelectPrompt = (prompt: string) => {
    setScenePrompt(prompt);
    const lower = prompt.toLowerCase();
    if (lower.includes("dialogue") || lower.includes("screenplay") || lower.includes("script")) {
      setSceneMode("screenplay");
    } else if (lower.includes("monologue") || lower.includes("inner")) {
      setSceneMode("monologue");
    } else if (lower.includes("ending") || lower.includes("finale") || lower.includes("alternate")) {
      setSceneMode("alternate_ending");
    } else {
      setSceneMode("prose");
    }
    document.getElementById("sandbox-section")?.scrollIntoView({ behavior: "smooth" });
  };

  const handlePrimaryTopAction = () => {
    if (activeResponse) {
      const md = buildMarkdownDossier(activeResponse, draftedScenes);
      const slug = activeResponse.storyPlot.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${slug || "story-dossier"}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      notify(`Exported "${slug || "story-dossier"}.md".`, "info");
    } else {
      document.getElementById("studio-section")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const isAuthError =
    error &&
    (error.includes("401") ||
      error.includes("403") ||
      error.toLowerCase().includes("unauthenticated") ||
      error.toLowerCase().includes("api_key_invalid") ||
      error.includes("AQ.") ||
      error.toLowerCase().includes("permission_denied"));

  return (
    <div className="min-h-screen bg-[#09090B] text-[#E4E3DD] flex flex-col">
      {/* Strict 3-Zone Top Bar Contract */}
      <header
        className="sticky top-0 z-40 bg-[#09090B]/90 backdrop-blur-md border-b border-[#1E1E24]"
        id="app-header"
      >
        <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="#top"
            className="font-display text-lg font-semibold tracking-tight text-[#F4F3EE] whitespace-nowrap shrink-0"
          >
            Sonic Script
          </a>

          {/* Zone 2: Concise single-line text links */}
          <nav
            className="hidden md:flex items-center gap-7 text-sm font-medium text-[#9898A2]"
            aria-label="Primary navigation"
          >
            <a
              href="#studio-section"
              className="hover:text-[#F4F3EE] transition-editorial whitespace-nowrap shrink-0"
            >
              Studio
            </a>
            <a
              href="#folio-section"
              className="hover:text-[#F4F3EE] transition-editorial whitespace-nowrap shrink-0"
            >
              Story Folio
            </a>
            <a
              href="#sandbox-section"
              className="hover:text-[#F4F3EE] transition-editorial whitespace-nowrap shrink-0"
            >
              Scene Desk
            </a>
            <button
              type="button"
              onClick={() => setIsArchiveOpen(true)}
              className="hover:text-[#F4F3EE] transition-editorial whitespace-nowrap shrink-0 cursor-pointer"
            >
              Archive{historyItems.length > 0 ? ` (${historyItems.length})` : ""}
            </button>
          </nav>

          {/* Zone 3: Single primary action */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={handlePrimaryTopAction}
              className="px-4 py-2 min-h-[38px] rounded-lg bg-[#E5A93B] hover:bg-[#F0BD5E] text-[#09090B] text-xs font-semibold transition-editorial whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#F4F3EE]"
            >
              {activeResponse ? "Export Dossier" : "Open Studio"}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main id="top" className="flex-1 max-w-[1280px] w-full mx-auto px-6">
        {/* Split-Screen Editorial Hero */}
        <section className="py-12 md:py-16 border-b border-[#1E1E24]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
            {/* Left typographic hierarchy */}
            <div className="lg:col-span-6 flex flex-col justify-center">
              <p className="text-xs font-medium text-[#E5A93B] tracking-wide">
                Acoustic &amp; Lyrical Adaptation Studio
              </p>

              <h1 className="font-display text-4xl sm:text-5xl font-medium text-[#F4F3EE] tracking-tight leading-[1.1] mt-3 max-w-xl">
                Turn any song into a structured literary story
              </h1>

              <p className="mt-5 text-[15px] text-[#9898A2] leading-relaxed max-w-lg">
                Upload a recording or paste lyrics to decode hidden subtext, map musical dynamics to chapter pacing, draft scenes live, and hear them narrated aloud.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <a
                  href="#studio-section"
                  className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] rounded-lg bg-[#E5A93B] hover:bg-[#F0BD5E] text-[#09090B] text-sm font-semibold transition-editorial whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#F4F3EE]"
                >
                  <span>Begin an Adaptation</span>
                  <ArrowDown className="w-4 h-4" />
                </a>

                <button
                  type="button"
                  onClick={() => setIsArchiveOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-lg border border-[#2C2C33] hover:border-[#4A4A55] text-sm font-medium text-[#D4D3CC] hover:text-[#F4F3EE] transition-editorial whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span>
                    Browse Archive
                    {historyItems.length > 0 ? ` (${historyItems.length})` : ""}
                  </span>
                </button>
              </div>
            </div>

            {/* Right editorial photograph matching column height */}
            <div className="lg:col-span-6">
              <div className="h-full min-h-[260px] lg:min-h-[340px] rounded-xl overflow-hidden border border-[#242429] bg-[#111114] relative">
                {!heroImgFailed ? (
                  <img
                    src={HERO_STUDIO_IMAGE}
                    alt="Analog reel-to-reel tape machine beside an open literary notebook and brass fountain pen on a walnut studio desk"
                    referrerPolicy="no-referrer"
                    onError={() => setHeroImgFailed(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-8 text-[#9898A2]">
                    <Music className="w-8 h-8 text-[#E5A93B] mb-3" />
                    <span className="font-display text-lg text-[#F4F3EE]">
                      Sonic Script Studio
                    </span>
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#09090B]/85 via-[#09090B]/30 to-transparent pointer-events-none" />
                <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between text-xs text-[#D4D3CC]">
                  <span>Multimodal Audio · Lyrics Transcription · Live Scene Desk</span>
                  <span className="font-mono text-[#E5A93B] hidden sm:inline">WAV Narration</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Studio Input Section */}
        <section id="studio-section" className="py-12 md:py-16 space-y-8 border-b border-[#1E1E24]">
          <form onSubmit={handleAnalyze} className="space-y-8">
            <LyricalSourceInput
              lyrics={lyrics}
              setLyrics={(val) => {
                setLyrics(val);
                if (activePresetId) setActivePresetId(null);
              }}
              audioFile={audioFile}
              setAudioFile={setAudioFile}
              onClearAll={handleClearAll}
              onQuickLoad={handleQuickLoad}
              activePresetId={activePresetId}
              onTranscribeAudio={handleTranscribeAudio}
              isTranscribing={isTranscribing}
              onNotify={notify}
            />

            <SettingsPanel
              settings={storySettings}
              setSettings={setStorySettings}
              songContext={songContext}
              setSongContext={setSongContext}
            />

            {/* Primary Generate Bar */}
            <div className="rounded-xl bg-[#111114] border border-[#242429] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-display text-lg font-medium text-[#F4F3EE]">
                  Generate Story Dossier
                </h3>
                <p className="text-sm text-[#9898A2] mt-0.5">
                  Synthesizes song analysis, tension curve, protagonist arc, chapter chronology, and lyric matrix.
                </p>
              </div>
              <button
                type="submit"
                disabled={isLoading || (!lyrics.trim() && !audioFile)}
                id="submit-analysis-btn"
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3 min-h-[44px] rounded-lg bg-[#E5A93B] hover:bg-[#F0BD5E] disabled:bg-[#1E1E24] disabled:text-[#686873] text-[#09090B] text-sm font-semibold transition-editorial whitespace-nowrap shrink-0 cursor-pointer disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-[#F4F3EE]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing Track...</span>
                  </>
                ) : (
                  <span>Formulate Story Plot</span>
                )}
              </button>
            </div>
          </form>

          {/* Error Diagnostics */}
          {error && (
            <div className="space-y-4">
              {isAuthError && (
                <div
                  className="rounded-xl bg-[#141112] border border-amber-500/35 p-6 flex flex-col sm:flex-row gap-4"
                  id="key-diagnostic-alert"
                >
                  <ShieldAlert className="w-5 h-5 text-[#E5A93B] shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <h4 className="font-display text-base font-medium text-[#F4F3EE]">
                      API Key Verification Required
                    </h4>
                    <p className="text-sm text-[#C8C7C0] leading-relaxed">
                      The request returned an authentication or permission error. Verify that your active{" "}
                      <code className="font-mono text-xs text-[#E5A93B]">GEMINI_API_KEY</code> in{" "}
                      <strong>Settings &gt; Secrets</strong> is valid and uses a standard{" "}
                      <code className="font-mono text-xs text-[#E5A93B]">AIza...</code> key format.
                    </p>
                  </div>
                </div>
              )}

              <div
                className="rounded-xl bg-[#161012] border border-rose-500/30 p-5 flex items-start gap-3"
                id="error-message"
              >
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-rose-300">
                    Analysis could not be completed
                  </h4>
                  <p className="text-xs font-mono text-rose-200/80 mt-1 break-words">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Story Folio & Scene Desk Output */}
        <section id="folio-section" className="py-12 md:py-16 space-y-10">
          {isLoading ? (
            <div className="rounded-xl bg-[#111114] border border-[#242429] p-14 md:p-20 text-center flex flex-col items-center justify-center min-h-[360px]">
              <Loader2 className="w-8 h-8 text-[#E5A93B] animate-spin mb-5" />
              <h3 className="font-display text-2xl font-medium text-[#F4F3EE]">
                Decoding lyrics and acoustic movements
              </h3>
              <p className="text-sm text-[#9898A2] max-w-md mt-2 leading-relaxed">
                Mapping symbolic themes, building the protagonist arc, and plotting dramatic tension across every section of the track.
              </p>
              {audioFile && (
                <p className="text-xs font-mono text-[#E5A93B] mt-4">
                  Processing audio track · {audioFile.name}
                </p>
              )}
            </div>
          ) : activeResponse ? (
            <>
              <AnalysisDisplay
                data={activeResponse}
                draftedScenes={draftedScenes}
                onDraftChapter={handleDraftChapter}
                onSelectPrompt={handleSelectPrompt}
                onNotify={notify}
              />

              <SceneDesk
                data={activeResponse}
                prompt={scenePrompt}
                setPrompt={setScenePrompt}
                mode={sceneMode}
                setMode={setSceneMode}
                draftedScenes={draftedScenes}
                onAddScene={handleAddScene}
                onDeleteScene={handleDeleteScene}
                onNotify={notify}
                autoTriggerToken={autoTriggerToken}
              />
            </>
          ) : (
            <div className="rounded-xl bg-[#111114] border border-[#242429] p-12 md:p-16 text-center">
              <p className="text-xs font-medium text-[#E5A93B]">Story Folio</p>
              <h3 className="font-display text-2xl font-medium text-[#F4F3EE] mt-2">
                Your adaptation will appear here
              </h3>
              <p className="text-sm text-[#9898A2] max-w-md mx-auto mt-2 leading-relaxed">
                Choose one of the curated tracks above, or upload your own recording and lyrics to generate a full narrative dossier.
              </p>
            </div>
          )}
        </section>
      </main>

      {/* Quiet Editorial Footer */}
      <footer className="border-t border-[#1E1E24] py-8 mt-8">
        <div className="max-w-[1280px] mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#767680]">
          <span>Sonic Script — Analytical Audio &amp; Story Adaptation Studio</span>
          <div className="flex items-center gap-6">
            <a href="#studio-section" className="hover:text-[#D4D3CC] transition-editorial">
              Studio
            </a>
            <button
              type="button"
              onClick={() => setIsArchiveOpen(true)}
              className="hover:text-[#D4D3CC] transition-editorial cursor-pointer"
            >
              Chronicle Archive
            </button>
          </div>
        </div>
      </footer>

      {/* Archive Slide-Over Drawer */}
      <HistoryDrawer
        isOpen={isArchiveOpen}
        onClose={() => setIsArchiveOpen(false)}
        items={historyItems}
        selectedId={selectedHistoryId}
        onSelect={handleSelectHistory}
        onDelete={handleDeleteHistory}
      />

      {/* Non-blocking Inline Toast */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-5 right-5 z-50 max-w-sm rounded-lg px-4 py-3 border shadow-lg flex items-center gap-3 text-sm ${
            toast.type === "error"
              ? "bg-[#1A1113] border-rose-500/40 text-rose-200"
              : "bg-[#16161B] border-[#2E2E36] text-[#F4F3EE]"
          }`}
        >
          <span className="flex-1 leading-snug">{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="text-[#9898A2] hover:text-[#F4F3EE] cursor-pointer"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
