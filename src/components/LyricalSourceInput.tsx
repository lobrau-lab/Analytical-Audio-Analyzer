import React, { useRef, useState } from "react";
import { Music, FileAudio, Upload, Trash2, BookOpen, AlertCircle, Sparkles } from "lucide-react";

interface LyricalSourceInputProps {
  lyrics: string;
  setLyrics: (val: string) => void;
  audioFile: File | null;
  setAudioFile: (file: File | null) => void;
  onClearAll: () => void;
  onQuickLoad: (preset: { lyrics: string; context: string; settings: { genre: string; tone: string; era: string } }) => void;
}

const SONG_PRESETS = [
  {
    name: "🚀 Space Oddity",
    artist: "David Bowie",
    description: "Sci-Fi Isolation & Melancholic Voyage",
    genre: "Sci-Fi & Cyberpunk",
    tone: "Melancholic & Haunting",
    era: "Hypertech Neo-Future",
    context: "Space Oddity by David Bowie. A dialogue of isolated cosmic voyage and disconnection from Earth.",
    lyrics: `Ground Control to Major Tom
Ground Control to Major Tom
Take your protein pills and put your helmet on
Ground Control to Major Tom (ten, nine, eight, seven, six)
Commencing countdown, engines on (five, four, three)
Check ignition and may God's love be with you (two, one, liftoff)

This is Ground Control to Major Tom
You've really made the grade
And the papers want to know whose shirts you wear
Now it's time to leave the capsule if you dare
"This is Major Tom to Ground Control
I'm stepping through the door
And I'm floating in a most peculiar way
And the stars look very different today

For here am I sitting in a tin can
Far above the world
Planet Earth is blue
And there's nothing I can do"`
  },
  {
    name: "🏨 Hotel California",
    artist: "The Eagles",
    description: "Desert Gothic Noir & Eternal Trap",
    genre: "Noir & Hardboiled Thriller",
    tone: "Melancholic & Haunting",
    era: "Mid-20th Century Retrospect",
    context: "Hotel California by The Eagles. Mystical hotel which serves as a luxurious trap for weary travelers.",
    lyrics: `On a dark desert highway, cool wind in my hair
Warm smell of colitas, rising up through the air
Up ahead in the distance, I saw a shimmering light
My head grew heavy and my sight grew dim
I had to stop for the night.

There she stood in the doorway;
I heard the mission bell
And I was thinking to myself
'This could be heaven or this could be hell'
Then she lit up a candle and she showed me the way
There were voices down the corridor,
I thought I heard them say

Welcome to the Hotel California
Such a lovely place (such a lovely place)
Such a lovely face.
Plenty of room at the Hotel California
Any time of year (any time of year) you can find it here.

Last thing I remember, I was running for the door
I had to find the passage back to the place I was before
'Relax' said the night man, 'We are programmed to receive.
You can check out any time you like, but you can never leave!'`
  },
  {
    name: "🎻 Eleanor Rigby",
    artist: "The Beatles",
    description: "Victorian Tragedy & Silent Solitude",
    genre: "Chamber Victorian Gothic",
    tone: "Melancholic & Haunting",
    era: "Gilded Victorian Age",
    context: "Eleanor Rigby by The Beatles. Orchestral study of extreme isolation, unseen lives, and church-side sorrow.",
    lyrics: `Ah, look at all the lonely people
Ah, look at all the lonely people

Eleanor Rigby picks up the rice in the church where a wedding has been
Lives in a dream
Waits at the window, wearing the face that she keeps in a jar by the door
Who is it for?

All the lonely people
Where do they all come from?
All the lonely people
Where do they all belong?

Father McKenzie writing the words of a sermon that no one will hear
No one comes near.
Look at him working, darning his socks in the night when there's nobody there
What does he care?

Eleanor Rigby died in the church and was buried along with her name
Nobody came.
Father McKenzie wiping the dirt from his hands as he walks from the grave
No one was saved.`
  }
];

export default function LyricalSourceInput({
  lyrics,
  setLyrics,
  audioFile,
  setAudioFile,
  onClearAll,
  onQuickLoad,
}: LyricalSourceInputProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith("audio/")) {
      alert("Please upload a valid audio file (e.g. mp3, wav, m4a, ogg).");
      return;
    }
    setAudioFile(file);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(URL.createObjectURL(file));
  };

  const removeAudioFile = () => {
    setAudioFile(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handlePresetClick = (preset: typeof SONG_PRESETS[0]) => {
    onQuickLoad({
      lyrics: preset.lyrics,
      context: preset.context,
      settings: {
        genre: preset.genre,
        tone: preset.tone,
        era: preset.era,
      }
    });
  };

  return (
    <div className="space-y-6" id="lyrical-source-input">
      {/* Interactive Song Selection presets */}
      <div className="bg-[#0b0c10]/70 backdrop-blur-md rounded-2xl border border-white/10 p-5 shadow-xl shadow-black/40">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
          <h4 className="font-display font-bold text-white text-xs uppercase tracking-widest">Select Storytelling Masterpiece</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {SONG_PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => handlePresetClick(preset)}
              className="text-left p-3 bg-white/5 hover:bg-indigo-600/10 border border-white/5 hover:border-indigo-500/30 rounded-xl transition duration-200 group cursor-pointer"
              id={`preset-btn-${preset.artist.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <div className="font-bold text-xs text-slate-200 group-hover:text-indigo-400 truncate">
                {preset.name}
              </div>
              <div className="text-[10px] text-slate-400 group-hover:text-slate-350 mt-0.5">{preset.artist}</div>
              <div className="text-[10px] text-slate-500 mt-1 line-clamp-1 italic">
                {preset.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main input grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left item: Audio Upload */}
        <div className="bg-[#0b0c10]/70 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-xl shadow-black/40 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
                  <Music className="w-4 h-4" />
                </div>
                <span className="font-display font-semibold text-white text-sm uppercase tracking-wide">Acoustic Ingest</span>
              </div>
              <span className="text-[10px] font-mono bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full">
                AUDIO DATA
              </span>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              Upload an audio track to extract performance energy, instrumentation shifts, key transitions, and vocal textures.
            </p>

            {/* Drag & drop region */}
            {!audioFile ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border border-dashed rounded-xl p-8 text-center cursor-pointer transition duration-200 flex flex-col items-center justify-center min-h-[180px] ${
                  isDragOver
                    ? "border-indigo-400 bg-indigo-500/10 text-indigo-300"
                    : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:bg-white/[0.08]"
                }`}
                id="dropzone"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="audio/*"
                  className="hidden"
                />
                <Upload className="w-7 h-7 text-indigo-450 mb-3" />
                <span className="text-xs font-semibold text-slate-200">Drag & Drop Audio Track</span>
                <span className="text-[11px] text-slate-400 mt-0.5">or click to browse local files</span>
                <span className="text-[9px] text-slate-500 mt-3 font-mono uppercase tracking-wider">MP3, WAV, M4A up to 30MB</span>
              </div>
            ) : (
              <div className="border border-white/10 bg-white/5 rounded-xl p-4 flex flex-col gap-3 min-h-[180px] justify-between">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 rounded-lg animate-pulse">
                      <FileAudio className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-200 truncate max-w-[210px]" title={audioFile.name}>
                        {audioFile.name}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {(audioFile.size / (1024 * 1024)).toFixed(2)} MB • {audioFile.type || "Audio Track"}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeAudioFile}
                    className="p-1.5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-lg transition border border-transparent hover:border-rose-500/30"
                    title="Remove file"
                    id="remove-audio-file"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Simulated Audio play button */}
                {audioUrl && (
                  <div className="bg-[#0b0c10]/90 rounded-lg p-3 border border-white/5">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[9px] font-mono text-slate-450 uppercase">PLAY FORWARD FEED:</span>
                    </div>
                    <audio src={audioUrl} controls className="w-full h-8 outline-hidden text-xs invert" />
                  </div>
                )}

                <div className="flex items-center gap-2 text-[10px] text-indigo-300 bg-indigo-500/5 px-2.5 py-1.5 rounded-lg border border-indigo-500/10">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-indigo-400" />
                  <span>Acoustic metrics are isolated and safely analyzed on the processing unit.</span>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center text-[11px]">
            <span className="text-slate-500">Audio feedback layer is optional. Only lyrics required to generate.</span>
          </div>
        </div>

        {/* Right item: Lyrics Input */}
        <div className="bg-[#0b0c10]/70 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-xl shadow-black/40 flex flex-col justify-between">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
                  <BookOpen className="w-4 h-4" />
                </div>
                <span className="font-display font-semibold text-white text-sm uppercase tracking-wide">Poetic Verse Input</span>
              </div>
              <span className="text-[10px] font-mono bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full">
                WORDS INGESTION
              </span>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              Paste song lines, poems, or monologue segments to formulate symbolic anchors, themes, and motifs.
            </p>

            <textarea
              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs text-slate-100 font-sans focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all flex-grow min-h-[180px] placeholder:text-slate-550"
              placeholder={`Paste the song lyrics here...\n\ne.g.,\nAh, look at all the lonely people\nEleanor Rigby picks up the rice in the church...`}
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
              id="lyrics-textarea"
            />
          </div>

          <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center text-[11px]">
            <span className="text-slate-500">Parsing script checks for rhythmic progression structures.</span>
            {(lyrics.trim().length > 0 || audioFile !== null) && (
              <button
                type="button"
                onClick={onClearAll}
                className="text-xs text-rose-450 hover:text-rose-350 font-bold transition cursor-pointer"
                id="clear-all-inputs"
              >
                Clear Inputs
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
