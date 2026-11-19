import React from "react";
import { Chapter } from "../types";

interface TensionCurveChartProps {
  chapters: Chapter[];
  activeChapterIdx: number | null;
  onSelectChapter: (index: number) => void;
}

export default function TensionCurveChart({
  chapters,
  activeChapterIdx,
  onSelectChapter,
}: TensionCurveChartProps) {
  if (!chapters || chapters.length === 0) return null;

  const scores = chapters.map((ch, i) => {
    if (typeof ch.tensionScore === "number" && Number.isFinite(ch.tensionScore)) {
      return Math.max(10, Math.min(100, ch.tensionScore));
    }
    // Graceful fallback curve for legacy saved items without tensionScore
    const progress = chapters.length > 1 ? i / (chapters.length - 1) : 0.5;
    return Math.round(35 + Math.sin(progress * Math.PI * 0.85) * 55);
  });

  const width = 880;
  const height = 190;
  const padX = 48;
  const padTop = 26;
  const padBottom = 42;
  const plotW = width - padX * 2;
  const plotH = height - padTop - padBottom;

  const points = scores.map((score, i) => {
    const x =
      chapters.length === 1
        ? width / 2
        : padX + (i / (chapters.length - 1)) * plotW;
    const y = padTop + plotH - (score / 100) * plotH;
    return { x, y, score, chapter: chapters[i], index: i };
  });

  // Smooth cubic bezier curve through points
  const linePath = points.reduce((acc, pt, i) => {
    if (i === 0) return `M ${pt.x} ${pt.y}`;
    const prev = points[i - 1];
    const cpX = (prev.x + pt.x) / 2;
    return `${acc} C ${cpX} ${prev.y}, ${cpX} ${pt.y}, ${pt.x} ${pt.y}`;
  }, "");

  const areaPath =
    points.length > 1
      ? `${linePath} L ${points[points.length - 1].x} ${padTop + plotH} L ${points[0].x} ${padTop + plotH} Z`
      : "";

  const peakScore = Math.max(...scores);
  const peakIdx = scores.indexOf(peakScore);

  return (
    <div className="rounded-xl bg-[#111114] border border-[#242429] p-6">
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-4 border-b border-[#242429] mb-4">
        <div>
          <h3 className="font-display text-lg font-medium text-[#F4F3EE]">
            Dramatic Tension &amp; Movement Arc
          </h3>
          <p className="text-xs text-[#9898A2] mt-0.5">
            Select any movement node to inspect its chapter beat
          </p>
        </div>
        <div className="text-xs font-mono tabular-nums text-[#9898A2]">
          Peak Intensity <span className="text-[#E5A93B]">{peakScore}/100</span> ·{" "}
          {chapters[peakIdx]?.songSection || `Act ${peakIdx + 1}`}
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full min-w-[540px] h-auto select-none"
          role="img"
          aria-label="Dramatic tension curve across story chapters"
        >
          <defs>
            <linearGradient id="amberTensionFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E5A93B" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#E5A93B" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal reference gridlines */}
          {[25, 50, 75, 100].map((val) => {
            const y = padTop + plotH - (val / 100) * plotH;
            return (
              <g key={val}>
                <line
                  x1={padX}
                  y1={y}
                  x2={width - padX}
                  y2={y}
                  stroke="#202026"
                  strokeWidth="1"
                  strokeDasharray="3 4"
                />
                <text
                  x={padX - 10}
                  y={y + 3}
                  textAnchor="end"
                  fill="#686873"
                  fontSize="10"
                  fontFamily="IBM Plex Mono, monospace"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Baseline */}
          <line
            x1={padX}
            y1={padTop + plotH}
            x2={width - padX}
            y2={padTop + plotH}
            stroke="#27272E"
            strokeWidth="1"
          />

          {/* Area fill */}
          {areaPath && <path d={areaPath} fill="url(#amberTensionFill)" />}

          {/* Tension curve stroke */}
          <path
            d={linePath}
            fill="none"
            stroke="#E5A93B"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Interactive nodes */}
          {points.map((pt) => {
            const isActive = activeChapterIdx === pt.index;
            const sectionLabel =
              pt.chapter.songSection || `Act 0${pt.index + 1}`;
            return (
              <g
                key={pt.index}
                onClick={() => onSelectChapter(pt.index)}
                className="cursor-pointer group"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelectChapter(pt.index);
                  }
                }}
              >
                {/* Larger invisible hit area */}
                <circle cx={pt.x} cy={pt.y} r="16" fill="transparent" />

                {isActive && (
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="10"
                    fill="#E5A93B"
                    fillOpacity="0.18"
                  />
                )}

                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isActive ? 5.5 : 4}
                  fill={isActive ? "#F4F3EE" : "#09090B"}
                  stroke="#E5A93B"
                  strokeWidth="2"
                />

                {/* Score readout above node */}
                <text
                  x={pt.x}
                  y={pt.y - 12}
                  textAnchor="middle"
                  fill={isActive ? "#F4F3EE" : "#9898A2"}
                  fontSize="10.5"
                  fontWeight={isActive ? "600" : "400"}
                  fontFamily="IBM Plex Mono, monospace"
                >
                  {pt.score}
                </text>

                {/* Musical section label below baseline */}
                <text
                  x={pt.x}
                  y={padTop + plotH + 22}
                  textAnchor="middle"
                  fill={isActive ? "#E5A93B" : "#9898A2"}
                  fontSize="11"
                  fontFamily="Plus Jakarta Sans, sans-serif"
                  fontWeight={isActive ? "600" : "500"}
                >
                  {sectionLabel.length > 14
                    ? `${sectionLabel.slice(0, 13)}…`
                    : sectionLabel}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
