import React from "react";
import { HistoryItem } from "../types";
import { ListMusic, Volume2, Calendar, FileText, Trash2, ArrowRight } from "lucide-react";

interface HistoryListProps {
  items: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  selectedId?: string;
}

export default function HistoryList({ items, onSelect, onDelete, selectedId }: HistoryListProps) {
  if (items.length === 0) {
    return (
      <div className="bg-[#0b0c10]/70 backdrop-blur-md rounded-2xl border border-white/10 p-6 text-center text-slate-400 font-sans shadow-xl" id="history-empty">
        <ListMusic className="w-8 h-8 mx-auto mb-2 text-slate-600 animate-pulse" />
        <p className="text-xs font-semibold text-slate-300 uppercase tracking-widest mb-1">Vault Empty</p>
        <p className="text-[10px] text-slate-500 max-w-[200px] mx-auto">Your generated story plots will persist securely in local vaults.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#0b0c10]/70 backdrop-blur-md rounded-2xl border border-white/10 p-5 shadow-xl shadow-black/40" id="history-container">
      <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <ListMusic className="w-4 h-4 text-indigo-400" />
          <span className="font-display font-bold text-white text-xs uppercase tracking-widest">Chronicle Vault</span>
        </div>
        <span className="text-[10px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-mono px-2 py-0.5 rounded-full">
          {items.length} Plots
        </span>
      </div>

      <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
        {items.map((item) => {
          const isSelected = selectedId === item.id;
          const formattedDate = new Date(item.timestamp).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <div
              key={item.id}
              onClick={() => onSelect(item)}
              className={`group flex items-center justify-between p-3 rounded-xl border transition-all duration-150 cursor-pointer text-left ${
                isSelected
                  ? "bg-indigo-600/10 border-indigo-500/40 text-indigo-300"
                  : "bg-white/5 border-white/5 hover:bg-white/[0.08] hover:border-indigo-500/20 text-slate-300"
              }`}
              id={`history-item-${item.id}`}
            >
              <div className="min-w-0 pr-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[9px] font-mono font-bold text-slate-500 block truncate leading-none uppercase">
                    {formattedDate}
                  </span>
                  {item.hasAudio && (
                    <span className="text-[8px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-1 py-0.5 rounded flex items-center gap-0.5 leading-none">
                      <Volume2 className="w-2.5 h-2.5" /> AUDIO
                    </span>
                  )}
                </div>
                <h4 className="font-semibold text-xs truncate max-w-[155px] md:max-w-xs leading-tight text-slate-200">
                  {item.result.storyPlot.title || item.songName}
                </h4>
                <p className="text-[10px] text-slate-400 truncate mt-0.5 italic">
                  {item.artistName ? `${item.artistName}` : "Decoded Master"}
                </p>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  type="button"
                  onClick={(e) => onDelete(item.id, e)}
                  className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-rose-500/25 hover:text-rose-300 rounded-lg text-slate-505 border border-transparent hover:border-rose-500/20 transition"
                  title="Delete plot"
                  id={`delete-history-${item.id}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 transition-all transform group-hover:translate-x-0.5" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
