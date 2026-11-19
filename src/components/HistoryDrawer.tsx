import React, { useMemo, useState } from "react";
import { X, Search, Trash2, ArrowUpRight, Volume2 } from "lucide-react";
import { HistoryItem } from "../types";

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: HistoryItem[];
  selectedId?: string;
  onSelect: (item: HistoryItem) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
}

export default function HistoryDrawer({
  isOpen,
  onClose,
  items,
  selectedId,
  onSelect,
  onDelete,
}: HistoryDrawerProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.result.storyPlot.title.toLowerCase().includes(q) ||
        item.songName.toLowerCase().includes(q) ||
        item.artistName.toLowerCase().includes(q) ||
        item.result.storyPlot.genre.toLowerCase().includes(q)
    );
  }, [items, search]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="Adaptation Archive"
    >
      {/* Scrim */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs"
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div className="relative z-10 w-full max-w-md bg-[#0E0E11] border-l border-[#242429] h-full flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#242429]">
          <div>
            <h2 className="font-display text-xl font-medium text-[#F4F3EE]">
              Chronicle Archive
            </h2>
            <p className="text-xs text-[#9898A2] font-mono tabular-nums mt-0.5">
              {items.length} saved {items.length === 1 ? "adaptation" : "adaptations"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-[#9898A2] hover:text-[#F4F3EE] hover:bg-white/5 transition-editorial cursor-pointer focus-visible:outline-2 focus-visible:outline-[#E5A93B]"
            aria-label="Close archive"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search input */}
        <div className="px-6 py-4 border-b border-[#242429]">
          <div className="relative">
            <Search className="w-4 h-4 text-[#767680] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by title, artist, or genre..."
              className="w-full min-h-[40px] bg-[#141418] border border-[#242429] rounded-lg pl-10 pr-3.5 py-2 text-sm text-[#F4F3EE] placeholder-[#686873] focus:outline-none focus:border-[#E5A93B] transition-editorial"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#1D1D22]">
          {filtered.length === 0 ? (
            <div className="p-10 text-center">
              <p className="font-display text-base text-[#F4F3EE]">
                {items.length === 0 ? "No adaptations saved yet" : "No matching entries"}
              </p>
              <p className="text-xs text-[#9898A2] mt-1.5 leading-relaxed">
                {items.length === 0
                  ? "Every analyzed track is automatically stored locally for quick revisiting."
                  : "Try clearing your search query."}
              </p>
            </div>
          ) : (
            filtered.map((item) => {
              const isSelected = selectedId === item.id;
              const formattedDate = new Date(item.timestamp).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });
              const sceneCount = item.scenes?.length || 0;

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelect(item);
                    onClose();
                  }}
                  className={`group px-6 py-4 cursor-pointer transition-editorial flex items-start justify-between gap-4 ${
                    isSelected ? "bg-[#16161B]" : "hover:bg-[#131317]"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 text-xs text-[#767680] font-mono tabular-nums">
                      <span>{formattedDate}</span>
                      <span aria-hidden="true">·</span>
                      <span>{item.result.storyPlot.genre}</span>
                      {item.hasAudio && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="inline-flex items-center gap-1 text-[#E5A93B]">
                            <Volume2 className="w-3 h-3" /> Audio
                          </span>
                        </>
                      )}
                    </div>

                    <h3
                      className={`font-display text-base font-medium mt-1 truncate ${
                        isSelected ? "text-[#E5A93B]" : "text-[#F4F3EE] group-hover:text-[#E5A93B]"
                      } transition-editorial`}
                    >
                      {item.result.storyPlot.title || item.songName}
                    </h3>

                    <div className="mt-1 flex items-center gap-2 text-xs text-[#9898A2]">
                      <span className="truncate">{item.artistName || item.songName}</span>
                      {sceneCount > 0 && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums shrink-0">
                            {sceneCount} {sceneCount === 1 ? "scene" : "scenes"}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 pt-1">
                    <button
                      type="button"
                      onClick={(e) => onDelete(item.id, e)}
                      className="min-h-[34px] min-w-[34px] flex items-center justify-center rounded-lg text-[#767680] hover:text-rose-400 hover:bg-rose-500/10 transition-editorial cursor-pointer"
                      aria-label={`Delete ${item.result.storyPlot.title}`}
                      title="Remove from archive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <ArrowUpRight className="w-4 h-4 text-[#767680] group-hover:text-[#F4F3EE] transition-editorial" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
