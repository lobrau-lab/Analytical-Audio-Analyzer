export interface StorySettings {
  genre: string;
  tone: string;
  era: string;
}

export interface SongAnalysis {
  themes: string[];
  emotionalArc: string;
  storytellingStyle: string;
  musicalCues?: string;
  literalMeaning: string;
  hiddenMeaning: string;
}

export interface Character {
  name: string;
  role: string;
  desire?: string;
  flaw?: string;
  backStory: string;
  arc: string;
  traits: string[];
}

export interface SupportCharacter {
  name: string;
  role: string;
  definition: string;
}

export interface Chapter {
  title: string;
  songSection?: string;
  summary: string;
  keyMetaphor: string;
  emotionalBeat: string;
  tensionScore?: number;
}

export interface LyricalConnection {
  quoteOrTimestamp: string;
  narrativeTranslation: string;
}

export interface StoryPlot {
  title: string;
  logline?: string;
  genre: string;
  centralConflict?: string;
  setting: {
    description: string;
    era: string;
    mood: string;
    sensoryDetails?: string[];
  };
  protagonist: Character;
  supportingCharacters: SupportCharacter[];
  chapters: Chapter[];
  conclusion: string;
  lyricalConnections: LyricalConnection[];
}

export interface AnalyzeResponse {
  songAnalysis: SongAnalysis;
  storyPlot: StoryPlot;
  suggestedPrompts?: string[];
}

export type ExpansionMode = "prose" | "screenplay" | "monologue" | "alternate_ending";

export type VoiceOption = "Charon" | "Kore" | "Fenrir" | "Puck" | "Zephyr";

export interface DraftedScene {
  id: string;
  prompt: string;
  mode: ExpansionMode;
  content: string;
  createdAt: string;
}

export interface HistoryItem {
  id: string;
  timestamp: string;
  songName: string;
  artistName: string;
  lyricsSnippet: string;
  hasAudio: boolean;
  result: AnalyzeResponse;
  scenes?: DraftedScene[];
}
