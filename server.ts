import "dotenv/config";
import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error(
        "GEMINI_API_KEY is not configured. Please verify your key in Settings > Secrets."
      );
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

async function withRetry<T>(fn: () => Promise<T>, maxRetries = 2): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      const status = err?.status ?? err?.code;
      const isRetryable = status === 429 || (typeof status === "number" && status >= 500);
      if (!isRetryable || attempt === maxRetries) {
        throw err;
      }
      const delayMs = 600 * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  throw lastError;
}

const analyzeResponseSchema = {
  type: Type.OBJECT,
  properties: {
    songAnalysis: {
      type: Type.OBJECT,
      properties: {
        themes: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "4 to 6 concise thematic motifs discovered in the song.",
        },
        emotionalArc: {
          type: Type.STRING,
          description:
            "How the song's emotions shift, intensify, fracture, or resolve from opening bar to final fade.",
        },
        storytellingStyle: {
          type: Type.STRING,
          description:
            "Narrative perspective and poetic method (e.g., unreliable confessional, allegorical ballad, montage vignettes).",
        },
        musicalCues: {
          type: Type.STRING,
          description:
            "Sonic texture, rhythmic pacing, vocal delivery, or implied harmonic tension translated into dramatic atmosphere.",
        },
        literalMeaning: {
          type: Type.STRING,
          description: "Surface-level events literally taking place in the lyrics or audio context.",
        },
        hiddenMeaning: {
          type: Type.STRING,
          description: "Underlying allegory, psychological subtext, and double meanings.",
        },
      },
      required: [
        "themes",
        "emotionalArc",
        "storytellingStyle",
        "musicalCues",
        "literalMeaning",
        "hiddenMeaning",
      ],
    },
    storyPlot: {
      type: Type.OBJECT,
      properties: {
        title: {
          type: Type.STRING,
          description: "An evocative, literary standalone title inspired by the song.",
        },
        logline: {
          type: Type.STRING,
          description: "A crisp 1-2 sentence prestige cinema or novel jacket logline.",
        },
        genre: {
          type: Type.STRING,
          description: "Primary literary genre honoring user preference or adapted from the song.",
        },
        centralConflict: {
          type: Type.STRING,
          description: "The irreducible dramatic dilemma driving the entire story forward.",
        },
        setting: {
          type: Type.OBJECT,
          properties: {
            description: {
              type: Type.STRING,
              description: "Sensory-rich portrait of the world, geography, and architecture.",
            },
            era: {
              type: Type.STRING,
              description: "Historical epoch, contemporary milieu, or speculative era.",
            },
            mood: {
              type: Type.STRING,
              description: "Atmospheric signature (2-4 words, e.g., 'Amber Twilight Melancholy').",
            },
            sensoryDetails: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3 vivid recurring sensory details (sound, light, scent, or tactile object).",
            },
          },
          required: ["description", "era", "mood", "sensoryDetails"],
        },
        protagonist: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "Full name of the protagonist." },
            role: { type: Type.STRING, description: "Vocation, station, or defining identity." },
            desire: { type: Type.STRING, description: "What they urgently seek at the story's outset." },
            flaw: { type: Type.STRING, description: "The internal blind spot or vulnerability holding them back." },
            backStory: {
              type: Type.STRING,
              description: "Formative history establishing the character's opening pressure.",
            },
            arc: {
              type: Type.STRING,
              description: "How they transform, fracture, or awaken across the chapters.",
            },
            traits: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3 to 5 sharp character traits.",
            },
          },
          required: ["name", "role", "desire", "flaw", "backStory", "arc", "traits"],
        },
        supportingCharacters: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: "Supporting character's name." },
              role: { type: Type.STRING, description: "Dramatic foil, confidant, or catalyst role." },
              definition: { type: Type.STRING, description: "Motivation and narrative friction with the protagonist." },
            },
            required: ["name", "role", "definition"],
          },
        },
        chapters: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "Literary chapter title." },
              songSection: {
                type: Type.STRING,
                description: "Corresponding musical movement (e.g., 'Intro', 'Verse I', 'Chorus', 'Bridge', 'Outro').",
              },
              summary: {
                type: Type.STRING,
                description: "Dramatic synopsis of the chapter's action and turning point.",
              },
              keyMetaphor: {
                type: Type.STRING,
                description: "Specific lyric image or sonic shift anchored to this chapter.",
              },
              emotionalBeat: {
                type: Type.STRING,
                description: "Concise emotional state (2-4 words, e.g., 'Quiet Dread', 'Euphoric Rupture').",
              },
              tensionScore: {
                type: Type.INTEGER,
                description: "Dramatic intensity score from 15 to 100 reflecting the song's dynamic arc.",
              },
            },
            required: [
              "title",
              "songSection",
              "summary",
              "keyMetaphor",
              "emotionalBeat",
              "tensionScore",
            ],
          },
        },
        conclusion: {
          type: Type.STRING,
          description: "Resonant literary finale echoing the song's closing cadence.",
        },
        lyricalConnections: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              quoteOrTimestamp: {
                type: Type.STRING,
                description: "Specific lyric phrase or acoustic cue from the track.",
              },
              narrativeTranslation: {
                type: Type.STRING,
                description: "How that cue became a tangible story object, character quirk, or turning point.",
              },
            },
            required: ["quoteOrTimestamp", "narrativeTranslation"],
          },
        },
      },
      required: [
        "title",
        "logline",
        "genre",
        "centralConflict",
        "setting",
        "protagonist",
        "supportingCharacters",
        "chapters",
        "conclusion",
        "lyricalConnections",
      ],
    },
    suggestedPrompts: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description:
        "Exactly 4 compelling scene prompts the writer can run in the Scene Desk (covering prose, dialogue, monologue, and alternate ending).",
    },
  },
  required: ["songAnalysis", "storyPlot", "suggestedPrompts"],
};

const MODE_INSTRUCTIONS: Record<string, string> = {
  prose:
    "Write rich, atmospheric literary fiction prose (300–480 words) with precise sensory details, subtext, and lyrical cadence. Output only the story prose without preambles or titles.",
  screenplay:
    "Write a vivid screenplay scene (300–480 words) using crisp sluglines (INT./EXT.), terse visual action lines, and subtext-heavy character dialogue. Output only the screenplay excerpt without meta-commentary.",
  monologue:
    "Write an intimate first-person interior monologue (250–400 words) from the protagonist's perspective at a pivotal moment, echoing the rhythm and imagery of the source song. Output only the monologue.",
  alternate_ending:
    "Write a haunting, surprising alternate ending (300–480 words) that inverts the story's established outcome while honoring every lyrical motif. Output only the narrative finale.",
};

const VALID_VOICES = new Set(["Charon", "Kore", "Fenrir", "Puck", "Zephyr"]);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "60mb" }));
  app.use(express.urlencoded({ limit: "60mb", extended: true }));

  // 1. Analyze Audio & Lyrics -> Structured Story Folio (gemini-4-hydrogen)
  app.post("/api/analyze", async (req, res) => {
    try {
      const { fileData, mimeType, lyrics, context, storySettings } = req.body;

      if (!lyrics?.trim() && !fileData) {
        return res.status(400).json({
          error: "Provide song lyrics or upload an audio track to begin analysis.",
        });
      }

      const ai = getGeminiClient();
      const contentsParts: any[] = [];

      if (fileData && mimeType) {
        contentsParts.push({
          inlineData: {
            data: fileData,
            mimeType,
          },
        });
      }

      const promptText = `Analyze the supplied song (lyrics, audio recording if present, and artistic context) and compose a complete, publication-grade literary story adaptation.

${lyrics ? `LYRICS:\n${lyrics}\n` : ""}
${context ? `ARTIST / CONTEXT NOTES:\n${context}\n` : ""}
ADAPTATION DIRECTIVES:
- Literary Genre: ${storySettings?.genre || "Adaptive (match song style)"}
- Narrative Tone: ${storySettings?.tone || "Adaptive (match song style)"}
- Historical Era / Setting: ${storySettings?.era || "Adaptive (match song style)"}

REQUIREMENTS:
1. Perform a nuanced musicological and literary decoding: literal narrative, symbolic subtext, emotional arc, storytelling style, musical/rhythmic cues, and 4–6 themes.
2. Construct a standalone literary story plot with a distinctive title, compelling logline, central conflict, sensory-rich setting, protagonist (with desire, fatal flaw, backstory, arc, and traits), and 2–3 well-drawn supporting characters.
3. Structure 5 to 6 chronological chapters mapped directly to musical movements (e.g., Intro, Verse I, Pre-Chorus, Chorus, Bridge, Outro), each with an honest tensionScore (15–100) tracing the dramatic rise and fall.
4. Provide 4 to 6 concrete Lyrical Connections translating specific quotes or sonic moments into story elements.
5. Provide 4 specific, evocative Scene Desk prompts to draft scenes, dialogue, monologues, or an alternate finale.`;

      contentsParts.push({ text: promptText });

      const response = await withRetry(() =>
        ai.models.generateContent({
          model: "gemini-4-hydrogen",
          contents: { parts: contentsParts },
          config: {
            systemInstruction:
              "You are a prestige literary editor, musicologist, and novelist. You decode songs with depth and restraint, translating lyrical subtext and acoustic dynamics into vivid, cohesive story plots without clichés.",
            responseMimeType: "application/json",
            responseSchema: analyzeResponseSchema,
          },
        })
      );

      const responseText = response.text;
      if (!responseText) {
        throw new Error("The model returned an empty response.");
      }

      const parsed = JSON.parse(responseText.trim());
      return res.json(parsed);
    } catch (err: any) {
      console.error("Analysis error:", err);
      const status = typeof err?.status === "number" && err.status >= 400 && err.status < 600 ? err.status : 500;
      return res.status(status).json({
        error: err?.message || "Failed to analyze the track. Please try again.",
      });
    }
  });

  // 2. Transcribe Audio -> Lyrics (gemini-3.5-transcribe)
  app.post("/api/transcribe", async (req, res) => {
    try {
      const { fileData, mimeType } = req.body;
      if (!fileData || !mimeType) {
        return res.status(400).json({ error: "An uploaded audio track is required for transcription." });
      }

      const ai = getGeminiClient();
      const response = await withRetry(() =>
        ai.models.generateContent({
          model: "gemini-3.5-transcribe",
          contents: {
            parts: [
              {
                inlineData: {
                  mimeType,
                  data: fileData,
                },
              },
              {
                text: "Transcribe the spoken or sung lyrics from this audio track accurately, formatted into natural verse and chorus line breaks. Output only the lyrics text.",
              },
            ],
          },
        })
      );

      const transcript = response.text?.trim();
      if (!transcript) {
        throw new Error("No vocals or lyrics could be extracted from this recording.");
      }

      return res.json({ lyrics: transcript });
    } catch (err: any) {
      console.error("Transcription error:", err);
      const status = typeof err?.status === "number" && err.status >= 400 && err.status < 600 ? err.status : 500;
      return res.status(status).json({
        error: err?.message || "Audio transcription failed.",
      });
    }
  });

  // 3. Streaming Scene Desk Expansion (gemini-4-hydrogen, SSE stream)
  app.post("/api/expand", async (req, res) => {
    try {
      const { storyPlot, songAnalysis, query, mode = "prose", stream = true } = req.body;

      if (!storyPlot || !query?.trim()) {
        return res.status(400).json({ error: "Story context and a scene prompt are required." });
      }

      const ai = getGeminiClient();
      const modeDirective = MODE_INSTRUCTIONS[mode] || MODE_INSTRUCTIONS.prose;

      const chaptersOutline = Array.isArray(storyPlot.chapters)
        ? storyPlot.chapters
            .map((ch: any, i: number) => `${i + 1}. ${ch.title} (${ch.songSection || "Movement"}): ${ch.summary}`)
            .join("\n")
        : "";

      const promptText = `STORY DOSSIER:
- Title: ${storyPlot.title}
- Genre: ${storyPlot.genre}
- Logline: ${storyPlot.logline || "N/A"}
- Setting: ${storyPlot.setting?.description} (Era: ${storyPlot.setting?.era}, Mood: ${storyPlot.setting?.mood})
- Protagonist: ${storyPlot.protagonist?.name} (${storyPlot.protagonist?.role})
  Desire: ${storyPlot.protagonist?.desire || "Unstated"}
  Flaw: ${storyPlot.protagonist?.flaw || "Unstated"}
  Backstory: ${storyPlot.protagonist?.backStory}
  Arc: ${storyPlot.protagonist?.arc}
- Themes: ${songAnalysis?.themes ? songAnalysis.themes.join(", ") : "Adapted lyrical motifs"}
${chaptersOutline ? `\nCHAPTERS:\n${chaptersOutline}\n` : ""}
WRITER'S PROMPT:
"${query.trim()}"

FORMAT INSTRUCTION:
${modeDirective}`;

      const systemInstruction =
        "You are an acclaimed literary novelist and screenwriter. Draft immersive, restrained, emotionally resonant scenes that honor the story dossier and song motifs. Never include conversational introductions or wrap-up notes.";

      if (!stream) {
        const response = await withRetry(() =>
          ai.models.generateContent({
            model: "gemini-4-hydrogen",
            contents: promptText,
            config: { systemInstruction },
          })
        );
        return res.json({ prose: (response.text || "").trim() });
      }

      res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
      res.setHeader("Cache-Control", "no-cache, no-transform");
      res.setHeader("Connection", "keep-alive");

      const responseStream = await ai.models.generateContentStream({
        model: "gemini-4-hydrogen",
        contents: promptText,
        config: { systemInstruction },
      });

      for await (const chunk of responseStream) {
        const text = chunk.text;
        if (text) {
          res.write(`data: ${JSON.stringify({ chunk: text })}\n\n`);
        }
      }

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      return res.end();
    } catch (err: any) {
      console.error("Scene expansion error:", err);
      if (res.headersSent) {
        res.write(`data: ${JSON.stringify({ error: err?.message || "Streaming failed." })}\n\n`);
        return res.end();
      }
      const status = typeof err?.status === "number" && err.status >= 400 && err.status < 600 ? err.status : 500;
      return res.status(status).json({
        error: err?.message || "Failed to draft scene.",
      });
    }
  });

  // 4. Narrate Scene Audio (gemini-3.8-flash-lite-tts -> unary complete WAV)
  app.post("/api/narrate", async (req, res) => {
    try {
      const { text, voice = "Charon", mood } = req.body;
      if (!text?.trim()) {
        return res.status(400).json({ error: "Scene text is required for audio narration." });
      }

      const selectedVoice = VALID_VOICES.has(voice) ? voice : "Charon";
      // Keep narration snippet well-paced and crisp (up to ~1800 chars)
      const trimmedText = text.trim().slice(0, 1800);
      const stylePrompt = mood
        ? `Measured literary audiobook narrator with a ${mood.toLowerCase()} atmosphere`
        : "Measured, intimate literary audiobook narrator with crisp diction and natural pauses";

      const ai = getGeminiClient();
      const response = await withRetry(() =>
        ai.models.generateContent({
          model: "gemini-3.8-flash-lite-tts",
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: trimmedText,
                  speechMetadata: {
                    style: stylePrompt,
                  },
                },
              ],
            },
          ],
          config: {
            responseModalities: ["AUDIO"],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: selectedVoice },
              },
            },
          },
        })
      );

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!base64Audio) {
        throw new Error("Audio narration model returned no audio output.");
      }

      return res.json({
        audioBase64: base64Audio,
        mimeType: "audio/wav",
        voice: selectedVoice,
      });
    } catch (err: any) {
      console.error("Narration error:", err);
      const status = typeof err?.status === "number" && err.status >= 400 && err.status < 600 ? err.status : 500;
      return res.status(status).json({
        error: err?.message || "Failed to generate audio narration.",
      });
    }
  });

  // Serve Vite middleware in dev or static dist in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Sonic Script server listening on port ${PORT}`);
  });
}

startServer().catch((e) => {
  console.error("Server failed to start:", e);
});
