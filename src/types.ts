export interface StorySettings {
  genre: string; // e.g. "Drama", "Sci-Fi", "Fantasy", "Noir", "Adventure", "Romance", "Adaptive"
  tone: string;  // e.g. "Melancholic", "Uplifting", "Mysterious", "Dark", "Epic", "Humorous", "Adaptive"
  era: string;   // e.g. "Modern", "Futuristic", "Historical", "Timeless", "Adaptive"
}

export interface SongAnalysis {
  themes: string[];
  emotionalArc: string;
  storytellingStyle: string;
  literalMeaning: string;
  hiddenMeaning: string;
}

export interface Character {
  name: string;
  role: string;
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
  summary: string;
  keyMetaphor: string;
  emotionalBeat: string;
}

export interface LyricalConnection {
  quoteOrTimestamp: string;
  narrativeTranslation: string;
}

export interface StoryPlot {
  title: string;
  genre: string;
  setting: {
    description: string;
    era: string;
    mood: string;
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

export interface HistoryItem {
  id: string;
  timestamp: string;
  songName: string;
  artistName: string;
  lyricsSnippet: string;
  hasAudio: boolean;
  result: AnalyzeResponse;
}
