import React, { useEffect, useRef, useState } from "react";
import {
  Send,
  Square,
  Volume2,
  Copy,
  Check,
  Trash2,
  Download,
  Loader2,
} from "lucide-react";
import {
  AnalyzeResponse,
  DraftedScene,
  ExpansionMode,
  VoiceOption,
} from "../types";

interface SceneDeskProps {
  data: AnalyzeResponse;
  prompt: string;
  setPrompt: (value: string) => void;
  mode: ExpansionMode;
  setMode: (mode: ExpansionMode) => void;
  draftedScenes: DraftedScene[];
  onAddScene: (scene: DraftedScene) => void;
  onDeleteScene: (id: string) => void;
  onNotify: (message: string, type?: "info" | "error") => void;
  autoTriggerToken: number;
}

const MODES: { id: ExpansionMode; label: string }[] = [
  { id: "prose", label: "Literary Prose" },
  { id: "screenplay", label: "Screenplay" },
  { id: "monologue", label: "Monologue" },
  { id: "alternate_ending", label: "Alternate Ending" },
];

const VOICES: { id: VoiceOption; label: string }[] = [
  { id: "Charon", label: "Charon — Deep Baritone" },
  { id: "Kore", label: "Kore — Clear Editorial" },
  { id: "Fenrir", label: "Fenrir — Warm Resonant" },
  { id: "Zephyr", label: "Zephyr — Intimate & Calm" },
  { id: "Puck", label: "Puck — Crisp & Expressive" },
];

export default function SceneDesk({
  data,
  prompt,
  setPrompt,
  mode,
  setMode,
  draftedScenes,
  onAddScene,
  onDeleteScene,
  onNotify,
  autoTriggerToken,
}: SceneDeskProps) {
  const [streamingText, setStreamingText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeSceneId, setActiveSceneId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Audio Narration state (gemini-3.8-flash-lite-tts)
  const [selectedVoice, setSelectedVoice] = useState<VoiceOption>("Charon");
  const [isNarratingId, setIsNarratingId] = useState<string | null>(null);
  const [narrationAudioByScene, setNarrationAudioByScene] = useState<
    Record<string, { url: string; voice: VoiceOption }>
  >({});

  const abortRef = useRef<AbortController | null>(null);
  const createdUrlsRef = useRef<Set<string>>(new Set());

  // Cleanup blob URLs on unmount
  useEffect(() => {
    const urls = createdUrlsRef.current;
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
      urls.clear();
    };
  }, []);

  // Automatically select newest scene when draftedScenes updates
  useEffect(() => {
    if (draftedScenes.length > 0 && !activeSceneId) {
      setActiveSceneId(draftedScenes[0].id);
    }
  }, [draftedScenes, activeSceneId]);

  const runStreamDraft = async (overridePrompt?: string, overrideMode?: ExpansionMode) => {
    const targetPrompt = (overridePrompt ?? prompt).trim();
    const targetMode = overrideMode ?? mode;
    if (!targetPrompt || isStreaming) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsStreaming(true);
    setStreamingText("");

    let accumulated = "";

    try {
      const response = await fetch("/api/expand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storyPlot: data.storyPlot,
          songAnalysis: data.songAnalysis,
          query: targetPrompt,
          mode: targetMode,
          stream: true,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `Request failed (${response.status})`);
      }

      const contentType = response.headers.get("content-type") || "";

      if (contentType.includes("text/event-stream") && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const events = buffer.split("\n\n");
          buffer = events.pop() || "";

          for (const evt of events) {
            const line = evt.trim();
            if (!line.startsWith("data:")) continue;
            const payloadStr = line.slice(5).trim();
            if (!payloadStr) continue;
            const parsed = JSON.parse(payloadStr);
            if (parsed.error) {
              throw new Error(parsed.error);
            }
            if (parsed.chunk) {
              accumulated += parsed.chunk;
              setStreamingText(accumulated);
            }
          }
        }
      } else {
        const json = await response.json();
        accumulated = json.prose || "";
        setStreamingText(accumulated);
      }

      const trimmed = accumulated.trim();
      if (trimmed) {
        const newScene: DraftedScene = {
          id: Math.random().toString(36).slice(2, 10),
          prompt: targetPrompt,
          mode: targetMode,
          content: trimmed,
          createdAt: new Date().toISOString(),
        };
        onAddScene(newScene);
        setActiveSceneId(newScene.id);
        setStreamingText("");
      }
    } catch (err: any) {
      if (err?.name === "AbortError") {
        const trimmed = accumulated.trim();
        if (trimmed) {
          const partialScene: DraftedScene = {
            id: Math.random().toString(36).slice(2, 10),
            prompt: targetPrompt,
            mode: targetMode,
            content: trimmed,
            createdAt: new Date().toISOString(),
          };
          onAddScene(partialScene);
          setActiveSceneId(partialScene.id);
          setStreamingText("");
        }
        onNotify("Drafting stopped.", "info");
      } else {
        onNotify(err?.message || "Could not draft scene.", "error");
      }
    } finally {
      setIsStreaming(false);
    }
  };

  // Allow chapter "Draft Scene" buttons in AnalysisDisplay to trigger drafting immediately
  useEffect(() => {
    if (autoTriggerToken > 0 && prompt.trim()) {
      runStreamDraft(prompt, mode);
    }
  }, [autoTriggerToken]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runStreamDraft();
  };

  const handleStop = () => {
    abortRef.current?.abort();
  };

  const handleCopyScene = async (scene: DraftedScene) => {
    try {
      await navigator.clipboard.writeText(scene.content);
      setCopiedId(scene.id);
      onNotify("Scene copied to clipboard.", "info");
      setTimeout(() => setCopiedId(null), 1800);
    } catch {
      onNotify("Clipboard copy failed.", "error");
    }
  };

  const handleNarrate = async (scene: DraftedScene) => {
    setIsNarratingId(scene.id);
    try {
      const response = await fetch("/api/narrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: scene.content,
          voice: selectedVoice,
          mood: data.storyPlot.setting.mood,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `Narration failed (${response.status})`);
      }

      const { audioBase64, mimeType } = await response.json();
      const binary = atob(audioBase64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: mimeType || "audio/wav" });
      const url = URL.createObjectURL(blob);
      createdUrlsRef.current.add(url);

      setNarrationAudioByScene((prev) => {
        if (prev[scene.id]?.url) {
          URL.revokeObjectURL(prev[scene.id].url);
          createdUrlsRef.current.delete(prev[scene.id].url);
        }
        return { ...prev, [scene.id]: { url, voice: selectedVoice } };
      });
      onNotify(`Audio narration ready (${selectedVoice}).`, "info");
    } catch (err: any) {
      onNotify(err?.message || "Failed to generate audio narration.", "error");
    } finally {
      setIsNarratingId(null);
    }
  };

  const activeScene =
    draftedScenes.find((s) => s.id === activeSceneId) || draftedScenes[0] || null;

  return (
    <section
      id="sandbox-section"
      className="rounded-xl bg-[#111114] border border-[#242429] p-6 md:p-8 space-y-6"
    >
      {/* Header & Mode Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[#242429]">
        <div>
          <p className="text-xs font-medium text-[#E5A93B]">Scene Desk</p>
          <h3 className="font-display text-2xl font-medium text-[#F4F3EE] mt-1">
            Draft &amp; Narrate Scenes
          </h3>
        </div>

        <div
          className="inline-flex flex-wrap items-center gap-1 p-1 rounded-lg bg-[#0A0A0D] border border-[#202026]"
          role="tablist"
          aria-label="Scene format"
        >
          {MODES.map((m) => {
            const active = mode === m.id;
            return (
              <button
                key={m.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setMode(m.id)}
                className={`px-3 py-1.5 min-h-[34px] rounded-md text-xs font-medium transition-editorial whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#E5A93B] ${
                  active
                    ? "bg-[#1A1A20] text-[#F4F3EE]"
                    : "text-[#9898A2] hover:text-[#F4F3EE]"
                }`}
              >
                {m.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Prompt Composer */}
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe a chapter moment, confrontation, monologue, or alternate ending..."
          disabled={isStreaming}
          className="flex-1 min-h-[44px] bg-[#0C0C0F] border border-[#242429] rounded-lg px-4 py-2.5 text-sm text-[#F4F3EE] placeholder-[#686873] focus:outline-none focus:border-[#E5A93B] transition-editorial"
        />
        {isStreaming ? (
          <button
            type="button"
            onClick={handleStop}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] rounded-lg border border-rose-500/40 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 text-xs font-semibold transition-editorial whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>Stop</span>
          </button>
        ) : (
          <button
            type="submit"
            disabled={!prompt.trim()}
            id="sandbox-submit-btn"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] rounded-lg bg-[#E5A93B] hover:bg-[#F0BD5E] disabled:bg-[#1E1E24] disabled:text-[#686873] text-[#09090B] text-xs font-semibold transition-editorial whitespace-nowrap shrink-0 cursor-pointer disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-[#F4F3EE]"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Draft Scene</span>
          </button>
        )}
      </form>

      {/* Live Streaming Canvas */}
      {isStreaming && (
        <div className="pt-6 border-t border-[#242429]">
          <div className="flex items-center justify-between text-xs text-[#E5A93B] mb-4">
            <span>Composing {MODES.find((m) => m.id === mode)?.label}...</span>
            <span className="font-mono tabular-nums text-[#9898A2]">
              {streamingText ? `${streamingText.split(/\s+/).length} words` : "Starting stream..."}
            </span>
          </div>
          <div
            className={`max-w-[68ch] text-[15px] text-[#E4E3DD] leading-[1.8] whitespace-pre-wrap ${
              mode === "screenplay" ? "font-mono text-sm" : "font-display"
            }`}
          >
            {streamingText || "Gathering imagery and character voice..."}
          </div>
        </div>
      )}

      {/* Drafted Scenes Notebook */}
      {!isStreaming && draftedScenes.length > 0 && activeScene && (
        <div className="pt-6 border-t border-[#242429] space-y-6">
          {/* Scene Tabs when multiple scenes exist */}
          {draftedScenes.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {draftedScenes.map((scene, idx) => {
                const isSelected = scene.id === activeScene.id;
                return (
                  <button
                    key={scene.id}
                    type="button"
                    onClick={() => setActiveSceneId(scene.id)}
                    className={`px-3 py-1.5 min-h-[34px] rounded-md text-xs transition-editorial whitespace-nowrap shrink-0 cursor-pointer border ${
                      isSelected
                        ? "border-[#E5A93B] bg-[#18181E] text-[#F4F3EE]"
                        : "border-[#242429] text-[#9898A2] hover:text-[#F4F3EE]"
                    }`}
                  >
                    Scene {draftedScenes.length - idx} ·{" "}
                    {MODES.find((m) => m.id === scene.mode)?.label || scene.mode}
                  </button>
                );
              })}
            </div>
          )}

          {/* Active Scene Toolbar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1E1E24]">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs text-[#9898A2]">
                <span className="text-[#E5A93B]">
                  {MODES.find((m) => m.id === activeScene.mode)?.label}
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">
                  {activeScene.content.split(/\s+/).length} words
                </span>
              </div>
              <p className="text-sm text-[#D4D3CC] truncate mt-1" title={activeScene.prompt}>
                {activeScene.prompt}
              </p>
            </div>

            {/* Narration & Utility Controls */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <select
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value as VoiceOption)}
                aria-label="Narrator voice"
                className="min-h-[38px] bg-[#0C0C0F] border border-[#242429] rounded-lg px-2.5 py-1.5 text-xs text-[#E4E3DD] focus:outline-none focus:border-[#E5A93B] cursor-pointer [&>option]:bg-[#111114]"
              >
                {VOICES.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.label}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => handleNarrate(activeScene)}
                disabled={isNarratingId === activeScene.id}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[38px] rounded-lg border border-[#2C2C33] hover:border-[#E5A93B] text-xs font-medium text-[#F4F3EE] hover:text-[#E5A93B] transition-editorial whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50"
              >
                {isNarratingId === activeScene.id ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Narrating...</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Listen</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleCopyScene(activeScene)}
                className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[38px] rounded-lg border border-[#2C2C33] hover:border-[#4A4A55] text-xs font-medium text-[#C8C7C0] hover:text-[#F4F3EE] transition-editorial whitespace-nowrap shrink-0 cursor-pointer"
              >
                {copiedId === activeScene.id ? (
                  <Check className="w-3.5 h-3.5 text-[#E5A93B]" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copiedId === activeScene.id ? "Copied" : "Copy"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onDeleteScene(activeScene.id);
                  setActiveSceneId(null);
                }}
                className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-lg text-[#767680] hover:text-rose-400 hover:bg-rose-500/10 transition-editorial cursor-pointer"
                aria-label="Delete scene"
                title="Delete scene"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Generated Narration Audio Player */}
          {narrationAudioByScene[activeScene.id] && (
            <div className="rounded-lg bg-[#0C0C0F] border border-[#242429] p-4 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="text-xs text-[#9898A2] shrink-0">
                Narration ·{" "}
                <span className="text-[#E5A93B]">
                  {narrationAudioByScene[activeScene.id].voice}
                </span>
              </div>
              <audio
                controls
                src={narrationAudioByScene[activeScene.id].url}
                className="flex-1 h-9"
              />
              <a
                href={narrationAudioByScene[activeScene.id].url}
                download={`scene-narration-${narrationAudioByScene[activeScene.id].voice.toLowerCase()}.wav`}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#C8C7C0] hover:text-[#E5A93B] whitespace-nowrap shrink-0 transition-editorial"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download WAV</span>
              </a>
            </div>
          )}

          {/* Scene Literary Prose */}
          <div
            className={`max-w-[68ch] text-base text-[#E4E3DD] leading-[1.85] whitespace-pre-wrap ${
              activeScene.mode === "screenplay" ? "font-mono text-sm leading-[1.7]" : "font-display"
            }`}
          >
            {activeScene.content}
          </div>
        </div>
      )}
    </section>
  );
}
