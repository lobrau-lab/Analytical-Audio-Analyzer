import React, { useMemo, useState } from "react";
import {
  Download,
  Copy,
  Check,
  PenTool,
  Search,
  ArrowUpRight,
} from "lucide-react";
import { AnalyzeResponse, Chapter, DraftedScene } from "../types";
import TensionCurveChart from "./TensionCurveChart";

interface AnalysisDisplayProps {
  data: AnalyzeResponse;
  draftedScenes: DraftedScene[];
  onDraftChapter: (chapter: Chapter, index: number) => void;
  onSelectPrompt: (prompt: string) => void;
  onNotify: (message: string, type?: "info" | "error") => void;
}

export function buildMarkdownDossier(
  data: AnalyzeResponse,
  draftedScenes: DraftedScene[]
): string {
  const { songAnalysis, storyPlot } = data;
  const lines: string[] = [
    `# ${storyPlot.title}`,
    "",
    storyPlot.logline ? `> ${storyPlot.logline}` : "",
    "",
    `**Genre:** ${storyPlot.genre} | **Era:** ${storyPlot.setting.era} | **Mood:** ${storyPlot.setting.mood}`,
    "",
    "---",
    "",
    "## Song Analytical Decoding",
    `- **Themes:** ${songAnalysis.themes.join(", ")}`,
    `- **Literal Narrative:** ${songAnalysis.literalMeaning}`,
    `- **Symbolic Subtext:** ${songAnalysis.hiddenMeaning}`,
    `- **Emotional Arc:** ${songAnalysis.emotionalArc}`,
    `- **Storytelling Style:** ${songAnalysis.storytellingStyle}`,
    songAnalysis.musicalCues ? `- **Musical & Sonic Cues:** ${songAnalysis.musicalCues}` : "",
    "",
    "## World & Setting",
    storyPlot.setting.description,
    storyPlot.centralConflict ? `\n**Central Conflict:** ${storyPlot.centralConflict}` : "",
    storyPlot.setting.sensoryDetails?.length
      ? `\n**Sensory Anchors:** ${storyPlot.setting.sensoryDetails.join(" · ")}`
      : "",
    "",
    "## Cast",
    `### ${storyPlot.protagonist.name} — ${storyPlot.protagonist.role}`,
    `- **Traits:** ${storyPlot.protagonist.traits.join(", ")}`,
    storyPlot.protagonist.desire ? `- **Desire:** ${storyPlot.protagonist.desire}` : "",
    storyPlot.protagonist.flaw ? `- **Fatal Flaw:** ${storyPlot.protagonist.flaw}` : "",
    `- **Backstory:** ${storyPlot.protagonist.backStory}`,
    `- **Evolution Arc:** ${storyPlot.protagonist.arc}`,
    "",
    ...storyPlot.supportingCharacters.flatMap((c) => [
      `### ${c.name} — ${c.role}`,
      c.definition,
      "",
    ]),
    "## Narrative Chronology",
    ...storyPlot.chapters.flatMap((ch, idx) => [
      `### 0${idx + 1}. ${ch.title}${ch.songSection ? ` (${ch.songSection})` : ""}`,
      `- **Emotional Beat:** ${ch.emotionalBeat}${typeof ch.tensionScore === "number" ? ` · Tension ${ch.tensionScore}/100` : ""}`,
      `- **Synopsis:** ${ch.summary}`,
      `- **Lyric Anchor:** "${ch.keyMetaphor}"`,
      "",
    ]),
    "## Finale",
    storyPlot.conclusion,
    "",
    "## Lyrical Transformation Matrix",
    "| Source Quote / Sonic Cue | Narrative Translation |",
    "| --- | --- |",
    ...storyPlot.lyricalConnections.map(
      (c) => `| "${c.quoteOrTimestamp.replace(/\|/g, "\\|")}" | ${c.narrativeTranslation.replace(/\|/g, "\\|")} |`
    ),
  ];

  if (draftedScenes.length > 0) {
    lines.push("", "---", "", "## Drafted Scenes");
    draftedScenes.forEach((scene, i) => {
      lines.push(
        "",
        `### Scene ${i + 1}: ${scene.prompt} (${scene.mode})`,
        "",
        scene.content
      );
    });
  }

  return lines.filter((l) => l !== undefined).join("\n");
}

export default function AnalysisDisplay({
  data,
  draftedScenes,
  onDraftChapter,
  onSelectPrompt,
  onNotify,
}: AnalysisDisplayProps) {
  const [viewMode, setViewMode] = useState<"folio" | "manuscript" | "matrix">("folio");
  const [activeChapterIdx, setActiveChapterIdx] = useState<number | null>(null);
  const [matrixQuery, setMatrixQuery] = useState("");
  const [copied, setCopied] = useState(false);

  const { songAnalysis, storyPlot, suggestedPrompts } = data;

  const filteredConnections = useMemo(() => {
    const q = matrixQuery.trim().toLowerCase();
    if (!q) return storyPlot.lyricalConnections;
    return storyPlot.lyricalConnections.filter(
      (c) =>
        c.quoteOrTimestamp.toLowerCase().includes(q) ||
        c.narrativeTranslation.toLowerCase().includes(q)
    );
  }, [storyPlot.lyricalConnections, matrixQuery]);

  const handleSelectChapterFromChart = (index: number) => {
    setActiveChapterIdx(index);
    const el = document.getElementById(`chapter-item-${index}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const handleCopyMarkdown = async () => {
    try {
      const md = buildMarkdownDossier(data, draftedScenes);
      await navigator.clipboard.writeText(md);
      setCopied(true);
      onNotify("Full story dossier copied as Markdown.", "info");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      onNotify("Clipboard copy was blocked by the browser.", "error");
    }
  };

  const handleExportMarkdown = () => {
    const md = buildMarkdownDossier(data, draftedScenes);
    const slug = storyPlot.title
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
    onNotify(`Exported "${slug || "story-dossier"}.md".`, "info");
  };

  return (
    <div className="space-y-8" id="analysis-display">
      {/* Masthead */}
      <div className="rounded-xl bg-[#111114] border border-[#242429] p-6 md:p-8">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-[#9898A2]">
              <span className="text-[#E5A93B] font-medium">{storyPlot.genre}</span>
              <span aria-hidden="true">·</span>
              <span>{storyPlot.setting.era}</span>
              <span aria-hidden="true">·</span>
              <span>{storyPlot.setting.mood}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">
                {storyPlot.chapters.length} Chapters
              </span>
            </div>

            <h2 className="font-display text-3xl md:text-4xl font-medium text-[#F4F3EE] tracking-tight leading-tight mt-3">
              {storyPlot.title}
            </h2>

            {storyPlot.logline && (
              <p className="mt-3 text-base text-[#C8C7C0] leading-relaxed max-w-2xl font-display italic">
                {storyPlot.logline}
              </p>
            )}
          </div>

          {/* Export Actions */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleCopyMarkdown}
              className="inline-flex items-center gap-2 px-4 py-2 min-h-[40px] rounded-lg border border-[#2C2C33] hover:border-[#4A4A55] text-xs font-medium text-[#E4E3DD] hover:text-[#F4F3EE] transition-editorial whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#E5A93B]"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#E5A93B]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied" : "Copy Markdown"}</span>
            </button>

            <button
              type="button"
              onClick={handleExportMarkdown}
              className="inline-flex items-center gap-2 px-4 py-2 min-h-[40px] rounded-lg bg-[#E5A93B] hover:bg-[#F0BD5E] text-[#09090B] text-xs font-semibold transition-editorial whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#F4F3EE]"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Dossier</span>
            </button>
          </div>
        </div>

        {/* View Mode Switcher Bar */}
        <div className="mt-7 pt-5 border-t border-[#242429] flex flex-wrap items-center justify-between gap-4">
          <div
            className="inline-flex items-center gap-1 p-1 rounded-lg bg-[#0A0A0D] border border-[#202026]"
            role="tablist"
            aria-label="Story Folio view mode"
          >
            {[
              { id: "folio" as const, label: "Folio Overview" },
              { id: "manuscript" as const, label: "Editorial Manuscript" },
              { id: "matrix" as const, label: "Lyric Matrix" },
            ].map((tab) => {
              const active = viewMode === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setViewMode(tab.id)}
                  className={`px-3.5 py-1.5 min-h-[34px] rounded-md text-xs font-medium transition-editorial whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#E5A93B] ${
                    active
                      ? "bg-[#1A1A20] text-[#F4F3EE]"
                      : "text-[#9898A2] hover:text-[#F4F3EE]"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#9898A2]">
            <span className="text-[#767680]">Motifs:</span>
            {songAnalysis.themes.map((theme, idx) => (
              <React.Fragment key={theme + idx}>
                {idx > 0 && <span aria-hidden="true">·</span>}
                <span className="text-[#D4D3CC]">{theme}</span>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* ==================== FOLIO OVERVIEW ==================== */}
      {viewMode === "folio" && (
        <div className="space-y-8">
          {/* Interactive Tension Curve */}
          <TensionCurveChart
            chapters={storyPlot.chapters}
            activeChapterIdx={activeChapterIdx}
            onSelectChapter={handleSelectChapterFromChart}
          />

          {/* Row 1: Song Analytical Decoding */}
          <section className="rounded-xl bg-[#111114] border border-[#242429] p-6 md:p-8">
            <div className="pb-4 border-b border-[#242429] mb-6 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <h3 className="font-display text-xl font-medium text-[#F4F3EE]">
                01. Song Analytical Decoding
              </h3>
              <span className="text-xs text-[#9898A2]">
                Lyrical surface, subtext, and acoustic structure
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
              <div>
                <h4 className="text-xs font-medium text-[#9898A2] mb-2">
                  Literal Surface
                </h4>
                <p className="text-[15px] text-[#E4E3DD] leading-relaxed">
                  {songAnalysis.literalMeaning}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-medium text-[#E5A93B] mb-2">
                  Symbolic &amp; Hidden Subtext
                </h4>
                <p className="text-[15px] text-[#E4E3DD] leading-relaxed">
                  {songAnalysis.hiddenMeaning}
                </p>
              </div>

              <div className="pt-6 border-t border-[#1E1E24]">
                <h4 className="text-xs font-medium text-[#9898A2] mb-2">
                  Emotional Arc
                </h4>
                <p className="text-[15px] text-[#C8C7C0] leading-relaxed">
                  {songAnalysis.emotionalArc}
                </p>
              </div>

              <div className="pt-6 border-t border-[#1E1E24]">
                <h4 className="text-xs font-medium text-[#9898A2] mb-2">
                  Storytelling Style &amp; Musical Cues
                </h4>
                <p className="text-[15px] text-[#C8C7C0] leading-relaxed">
                  {songAnalysis.storytellingStyle}
                  {songAnalysis.musicalCues ? ` ${songAnalysis.musicalCues}` : ""}
                </p>
              </div>
            </div>
          </section>

          {/* Row 2: Worldbuilding & Cast */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Setting & Central Conflict (5 cols) */}
            <div className="lg:col-span-5 rounded-xl bg-[#111114] border border-[#242429] p-6 md:p-8 flex flex-col justify-between">
              <div className="space-y-6">
                <div className="pb-4 border-b border-[#242429]">
                  <h3 className="font-display text-xl font-medium text-[#F4F3EE]">
                    02. World &amp; Atmosphere
                  </h3>
                  <div className="mt-1.5 flex items-center gap-2 text-xs text-[#9898A2]">
                    <span>{storyPlot.setting.era}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-[#E5A93B]">{storyPlot.setting.mood}</span>
                  </div>
                </div>

                <p className="text-[15px] text-[#E4E3DD] leading-relaxed">
                  {storyPlot.setting.description}
                </p>

                {storyPlot.centralConflict && (
                  <div className="pt-5 border-t border-[#1E1E24]">
                    <h4 className="text-xs font-medium text-[#9898A2] mb-2">
                      Central Dramatic Conflict
                    </h4>
                    <p className="text-[15px] text-[#C8C7C0] leading-relaxed">
                      {storyPlot.centralConflict}
                    </p>
                  </div>
                )}

                {storyPlot.setting.sensoryDetails &&
                  storyPlot.setting.sensoryDetails.length > 0 && (
                    <div className="pt-5 border-t border-[#1E1E24]">
                      <h4 className="text-xs font-medium text-[#9898A2] mb-2.5">
                        Recurring Sensory Anchors
                      </h4>
                      <ul className="space-y-2 text-sm text-[#C8C7C0]">
                        {storyPlot.setting.sensoryDetails.map((detail, i) => (
                          <li key={i} className="leading-relaxed">
                            <span className="font-mono text-xs text-[#767680] mr-2 tabular-nums">
                              0{i + 1}
                            </span>
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
              </div>
            </div>

            {/* Protagonist & Supporting Cast (7 cols) */}
            <div className="lg:col-span-7 rounded-xl bg-[#111114] border border-[#242429] p-6 md:p-8 flex flex-col justify-between">
              <div className="space-y-6">
                <div className="pb-4 border-b border-[#242429] flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                  <div>
                    <h3 className="font-display text-xl font-medium text-[#F4F3EE]">
                      03. {storyPlot.protagonist.name}
                    </h3>
                    <p className="text-xs text-[#E5A93B] mt-1">
                      Protagonist · {storyPlot.protagonist.role}
                    </p>
                  </div>
                  <div className="text-xs text-[#9898A2]">
                    {storyPlot.protagonist.traits.join(" · ")}
                  </div>
                </div>

                {(storyPlot.protagonist.desire || storyPlot.protagonist.flaw) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {storyPlot.protagonist.desire && (
                      <div>
                        <h4 className="text-xs font-medium text-[#9898A2] mb-1.5">
                          Driving Desire
                        </h4>
                        <p className="text-sm text-[#E4E3DD] leading-relaxed">
                          {storyPlot.protagonist.desire}
                        </p>
                      </div>
                    )}
                    {storyPlot.protagonist.flaw && (
                      <div>
                        <h4 className="text-xs font-medium text-[#9898A2] mb-1.5">
                          Internal Blind Spot
                        </h4>
                        <p className="text-sm text-[#E4E3DD] leading-relaxed">
                          {storyPlot.protagonist.flaw}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-5 border-t border-[#1E1E24]">
                  <div>
                    <h4 className="text-xs font-medium text-[#9898A2] mb-1.5">
                      Backstory
                    </h4>
                    <p className="text-sm text-[#C8C7C0] leading-relaxed">
                      {storyPlot.protagonist.backStory}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-[#E5A93B] mb-1.5">
                      Character Arc
                    </h4>
                    <p className="text-sm text-[#E4E3DD] leading-relaxed">
                      {storyPlot.protagonist.arc}
                    </p>
                  </div>
                </div>

                {/* Supporting Cast */}
                {storyPlot.supportingCharacters.length > 0 && (
                  <div className="pt-6 border-t border-[#242429]">
                    <h4 className="text-xs font-medium text-[#9898A2] mb-4">
                      Supporting Cast
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {storyPlot.supportingCharacters.map((char, idx) => (
                        <div key={idx}>
                          <div className="flex items-baseline justify-between gap-2">
                            <span className="font-display text-base font-medium text-[#F4F3EE]">
                              {char.name}
                            </span>
                            <span className="text-xs text-[#9898A2] shrink-0">
                              {char.role}
                            </span>
                          </div>
                          <p className="text-sm text-[#9898A2] leading-relaxed mt-1.5">
                            {char.definition}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Row 3: Narrative Chronology */}
          <section className="rounded-xl bg-[#111114] border border-[#242429] p-6 md:p-8">
            <div className="pb-4 border-b border-[#242429] mb-6 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <h3 className="font-display text-xl font-medium text-[#F4F3EE]">
                04. Narrative Chronology
              </h3>
              <span className="text-xs font-mono tabular-nums text-[#9898A2]">
                {storyPlot.chapters.length} Movements
              </span>
            </div>

            <div className="divide-y divide-[#1E1E24]">
              {storyPlot.chapters.map((chapter, idx) => {
                const isSelected = activeChapterIdx === idx;
                return (
                  <article
                    key={idx}
                    id={`chapter-item-${idx}`}
                    className={`py-6 first:pt-1 last:pb-2 transition-editorial ${
                      isSelected ? "bg-[#16161C] -mx-4 px-4 rounded-lg" : ""
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex-1 max-w-3xl">
                        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-[#9898A2]">
                          <span className="font-mono tabular-nums text-[#E5A93B]">
                            0{idx + 1}
                          </span>
                          {chapter.songSection && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="font-medium text-[#D4D3CC]">
                                {chapter.songSection}
                              </span>
                            </>
                          )}
                          <span aria-hidden="true">·</span>
                          <span>{chapter.emotionalBeat}</span>
                          {typeof chapter.tensionScore === "number" && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="font-mono tabular-nums">
                                Intensity {chapter.tensionScore}/100
                              </span>
                            </>
                          )}
                        </div>

                        <h4 className="font-display text-xl font-medium text-[#F4F3EE] mt-2">
                          {chapter.title}
                        </h4>

                        <p className="text-[15px] text-[#C8C7C0] leading-relaxed mt-2.5">
                          {chapter.summary}
                        </p>

                        <p className="mt-3 text-sm font-display italic text-[#9898A2]">
                          Anchor — &ldquo;{chapter.keyMetaphor}&rdquo;
                        </p>
                      </div>

                      <div className="shrink-0 pt-1">
                        <button
                          type="button"
                          onClick={() => onDraftChapter(chapter, idx)}
                          className="inline-flex items-center gap-2 px-3.5 py-2 min-h-[40px] rounded-lg border border-[#2C2C33] hover:border-[#E5A93B] text-xs font-medium text-[#E4E3DD] hover:text-[#E5A93B] transition-editorial whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#E5A93B]"
                        >
                          <PenTool className="w-3.5 h-3.5" />
                          <span>Draft Scene</span>
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Finale */}
            <div className="mt-6 pt-6 border-t border-[#242429]">
              <h4 className="text-xs font-medium text-[#E5A93B] mb-2">
                Story Resolution
              </h4>
              <p className="font-display text-lg text-[#F4F3EE] leading-relaxed max-w-4xl">
                {storyPlot.conclusion}
              </p>
            </div>
          </section>

          {/* Row 4: Lyrical Transformation Ledger */}
          <section className="rounded-xl bg-[#111114] border border-[#242429] p-6 md:p-8">
            <div className="pb-4 border-b border-[#242429] mb-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <h3 className="font-display text-xl font-medium text-[#F4F3EE]">
                05. Lyrical Transformation Matrix
              </h3>
              <span className="text-xs text-[#9898A2]">
                Direct mapping from track anchors to narrative structure
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#242429] text-xs text-[#9898A2]">
                    <th className="py-3 pr-6 font-medium w-2/5">
                      Lyric Quote or Acoustic Cue
                    </th>
                    <th className="py-3 font-medium">Narrative Translation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1D1D22] text-sm">
                  {storyPlot.lyricalConnections.map((conn, idx) => (
                    <tr key={idx}>
                      <td className="py-4 pr-6 align-top font-display italic text-[#E5A93B]/90 leading-relaxed">
                        &ldquo;{conn.quoteOrTimestamp}&rdquo;
                      </td>
                      <td className="py-4 align-top text-[#C8C7C0] leading-relaxed">
                        {conn.narrativeTranslation}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {/* ==================== EDITORIAL MANUSCRIPT VIEW ==================== */}
      {viewMode === "manuscript" && (
        <article className="rounded-xl bg-[#111114] border border-[#242429] px-6 py-10 md:px-14 md:py-14">
          <div className="max-w-[68ch] mx-auto space-y-10">
            <header className="pb-8 border-b border-[#242429] space-y-4">
              <p className="text-xs font-mono text-[#E5A93B]">
                {storyPlot.genre} · {storyPlot.setting.era}
              </p>
              <h2 className="font-display text-4xl font-medium text-[#F4F3EE] leading-tight">
                {storyPlot.title}
              </h2>
              {storyPlot.logline && (
                <p className="font-display italic text-lg text-[#C8C7C0] leading-relaxed">
                  {storyPlot.logline}
                </p>
              )}
            </header>

            <section className="space-y-4">
              <h3 className="font-display text-xl text-[#F4F3EE]">Premise &amp; Setting</h3>
              <p className="text-base text-[#D4D3CC] leading-[1.75]">
                {storyPlot.setting.description}
              </p>
              <p className="text-base text-[#C8C7C0] leading-[1.75]">
                {songAnalysis.hiddenMeaning}
              </p>
            </section>

            <section className="space-y-4 pt-6 border-t border-[#1E1E24]">
              <h3 className="font-display text-xl text-[#F4F3EE]">
                Principal Figures
              </h3>
              <p className="text-base text-[#D4D3CC] leading-[1.75]">
                <strong className="font-semibold text-[#F4F3EE]">
                  {storyPlot.protagonist.name}
                </strong>{" "}
                ({storyPlot.protagonist.role}) — {storyPlot.protagonist.backStory}{" "}
                {storyPlot.protagonist.arc}
              </p>
              {storyPlot.supportingCharacters.map((c, i) => (
                <p key={i} className="text-base text-[#C8C7C0] leading-[1.75]">
                  <strong className="font-semibold text-[#F4F3EE]">{c.name}</strong>{" "}
                  ({c.role}) — {c.definition}
                </p>
              ))}
            </section>

            <section className="space-y-8 pt-6 border-t border-[#1E1E24]">
              <h3 className="font-display text-xl text-[#F4F3EE]">Movements</h3>
              {storyPlot.chapters.map((ch, i) => (
                <div key={i} className="space-y-2.5">
                  <div className="flex items-baseline justify-between gap-4">
                    <h4 className="font-display text-lg font-medium text-[#F4F3EE]">
                      Chapter {i + 1}. {ch.title}
                    </h4>
                    <span className="text-xs font-mono text-[#9898A2] shrink-0">
                      {ch.songSection || `Act ${i + 1}`}
                    </span>
                  </div>
                  <p className="text-base text-[#D4D3CC] leading-[1.75]">
                    {ch.summary}
                  </p>
                  <p className="text-sm font-display italic text-[#9898A2]">
                    &ldquo;{ch.keyMetaphor}&rdquo;
                  </p>
                </div>
              ))}
            </section>

            <footer className="pt-8 border-t border-[#242429] space-y-3">
              <h3 className="font-display text-lg text-[#E5A93B]">Finale</h3>
              <p className="font-display text-lg text-[#F4F3EE] leading-[1.7]">
                {storyPlot.conclusion}
              </p>
            </footer>
          </div>
        </article>
      )}

      {/* ==================== LYRIC MATRIX VIEW ==================== */}
      {viewMode === "matrix" && (
        <section className="rounded-xl bg-[#111114] border border-[#242429] p-6 md:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#242429]">
            <div>
              <h3 className="font-display text-xl font-medium text-[#F4F3EE]">
                Complete Lyric-to-Story Matrix
              </h3>
              <p className="text-xs text-[#9898A2] mt-0.5">
                Filter specific lines, motifs, or sonic translations
              </p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-[#767680] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={matrixQuery}
                onChange={(e) => setMatrixQuery(e.target.value)}
                placeholder="Search quotes or translations..."
                className="w-full min-h-[40px] bg-[#0C0C0F] border border-[#242429] rounded-lg pl-10 pr-3.5 py-2 text-sm text-[#F4F3EE] placeholder-[#686873] focus:outline-none focus:border-[#E5A93B] transition-editorial"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#242429] text-xs text-[#9898A2]">
                  <th className="py-3 pr-4 font-medium w-12 font-mono">#</th>
                  <th className="py-3 pr-6 font-medium w-2/5">
                    Source Anchor
                  </th>
                  <th className="py-3 font-medium">Fictional Translation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1D1D22] text-sm">
                {filteredConnections.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-[#9898A2]">
                      No lyrical mappings match &ldquo;{matrixQuery}&rdquo;.
                    </td>
                  </tr>
                ) : (
                  filteredConnections.map((conn, idx) => (
                    <tr key={idx}>
                      <td className="py-4 pr-4 align-top font-mono text-xs tabular-nums text-[#767680]">
                        {(idx + 1).toString().padStart(2, "0")}
                      </td>
                      <td className="py-4 pr-6 align-top font-display italic text-[#E5A93B]/90 leading-relaxed">
                        &ldquo;{conn.quoteOrTimestamp}&rdquo;
                      </td>
                      <td className="py-4 align-top text-[#C8C7C0] leading-relaxed">
                        {conn.narrativeTranslation}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Suggested Scene Starters */}
      {suggestedPrompts && suggestedPrompts.length > 0 && (
        <div className="rounded-xl bg-[#111114] border border-[#242429] p-6">
          <div className="flex items-baseline justify-between gap-2 pb-4 border-b border-[#242429] mb-4">
            <h3 className="font-display text-lg font-medium text-[#F4F3EE]">
              Suggested Scene Directions
            </h3>
            <span className="text-xs text-[#9898A2]">
              Send directly to the Scene Desk
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {suggestedPrompts.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectPrompt(prompt)}
                className="group text-left p-4 rounded-lg bg-[#0C0C0F] border border-[#202026] hover:border-[#E5A93B]/60 transition-editorial flex items-start justify-between gap-3 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#E5A93B]"
              >
                <span className="text-sm text-[#D4D3CC] group-hover:text-[#F4F3EE] leading-relaxed">
                  {prompt}
                </span>
                <ArrowUpRight className="w-4 h-4 text-[#767680] group-hover:text-[#E5A93B] shrink-0 mt-0.5 transition-editorial" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
