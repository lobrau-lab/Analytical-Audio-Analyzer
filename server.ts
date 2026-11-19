import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY is not defined in environment variables. Please add it via the Settings > Secrets menu.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    songAnalysis: {
      type: Type.OBJECT,
      properties: {
        themes: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "List of key thematic elements, motifs, or mood markers discovered in the song."
        },
        emotionalArc: {
          type: Type.STRING,
          description: "Detail of how the emotions of the song shift, build, resolve, or spiral from the beginning to the end."
        },
        storytellingStyle: {
          type: Type.STRING,
          description: "The stylistic type of the song, e.g., metaphor-heavy narrative, circular/repetitive, stream-of-consciousness, or a direct narrative."
        },
        literalMeaning: {
          type: Type.STRING,
          description: "Surface-level narrative. What is literally taking place in the lyrics or the audio's situational context?"
        },
        hiddenMeaning: {
          type: Type.STRING,
          description: "Deep symbolic interpretation, themes of subtext, underlying messages, allegories, or double meanings."
        }
      },
      required: ["themes", "emotionalArc", "storytellingStyle", "literalMeaning", "hiddenMeaning"]
    },
    storyPlot: {
      type: Type.OBJECT,
      properties: {
        title: {
          type: Type.STRING,
          description: "An elegant, captivating title for the story plot inspired by the song but suited for a standalone literary piece."
        },
        genre: {
          type: Type.STRING,
          description: "The main genre used to structure the plot (matching user setting or adapted organically from the song)."
        },
        setting: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING, description: "A rich, sensory description of the environment, location, or world where this story plot unfolds." },
            era: { type: Type.STRING, description: "The timeline, historical period, futuristic era, or general epoch." },
            mood: { type: Type.STRING, description: "The overarching emotional atmosphere or visual color of the setting." }
          },
          required: ["description", "era", "mood"]
        },
        protagonist: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "Name of the protagonist." },
            role: { type: Type.STRING, description: "Profession, status, or defining purpose of this character." },
            backStory: { type: Type.STRING, description: "Deeply developed backstory framing the starting emotional/social conflict of the protagonist." },
            arc: { type: Type.STRING, description: "Description of the protagonist's growth, deterioration, or change throughout this narrative." },
            traits: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3 to 5 core personality traits or behavior patterns."
            }
          },
          required: ["name", "role", "backStory", "arc", "traits"]
        },
        supportingCharacters: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: "Name of the supporting character." },
              role: { type: Type.STRING, description: "Their relationship, dynamic, or structural purpose to the protagonist's quest." },
              definition: { type: Type.STRING, description: "Their primary traits and dramatic function in the plot." }
            },
            required: ["name", "role", "definition"]
          }
        },
        chapters: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "Chapter or phase name (metaphorically aligned with key song markers, e.g., Verse 1 / Chorus / Outro)." },
              summary: { type: Type.STRING, description: "Comprehensive, dramatic summary of the events occurring in this phase." },
              keyMetaphor: { type: Type.STRING, description: "How a specific lyric, lyric's subtext, or musical sonic shift inspired this chapter's sequence." },
              emotionalBeat: { type: Type.STRING, description: "The core conflict or internal emotional state of the character during this section." }
            },
            required: ["title", "summary", "keyMetaphor", "emotionalBeat"]
          }
        },
        conclusion: {
          type: Type.STRING,
          description: "The poetic resolution, tragedy, or open-ended finale of the story that echoes the ending energy-signature of the track."
        },
        lyricalConnections: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              quoteOrTimestamp: { type: Type.STRING, description: "A concrete line from the lyrics, a key word, or an audio cue (such as 'The swelling violins' or 'The screeching electric solo')." },
              narrativeTranslation: { type: Type.STRING, description: "Exactly how that specific lyrical or auditory moment was translated into a character trait, physical object, or plot shift." }
            },
            required: ["quoteOrTimestamp", "narrativeTranslation"]
          }
        }
      },
      required: [
        "title",
        "genre",
        "setting",
        "protagonist",
        "supportingCharacters",
        "chapters",
        "conclusion",
        "lyricalConnections"
      ]
    },
    suggestedPrompts: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Exactly 3 distinct, compelling follow-up prompt suggestions that the user can run to explore a specific scene, draft a dialogue, or spin off an alternative ending."
    }
  },
  required: ["songAnalysis", "storyPlot", "suggestedPrompts"]
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Use large body parser limits to accommodate song audio files easily
  app.use(express.json({ limit: "60mb" }));
  app.use(express.urlencoded({ limit: "60mb", extended: true }));

  // API router
  app.post("/api/analyze", async (req, res) => {
    try {
      const { fileData, fileName, mimeType, lyrics, context, storySettings } = req.body;

      if (!lyrics && !fileData) {
        return res.status(400).json({
          error: "Incomplete input. Please provide either the song lyrics or an uploaded audio file to analyze."
        });
      }

      console.log(`Starting audio/lyric analysis. Audio: ${!!fileData}, Lyrics length: ${lyrics?.length || 0}`);

      const ai = getGeminiClient();

      // Assemble content parts for multimodal input
      const contentsParts: any[] = [];

      if (fileData && mimeType) {
        contentsParts.push({
          inlineData: {
            data: fileData,
            mimeType: mimeType
          }
        });
      }

      const promptText = `
Analyze the following song's artistry, sound, or words, and generate a fully realized structured storyplot with deep character development.

${lyrics ? `LYRICS / SONG WORDS:\n${lyrics}\n\n` : ''}
${context ? `CONTEXT / SONG OR ARTIST PROFILE / NOTES:\n${context}\n\n` : ''}

STORYPLOT TARGET SETTINGS:
- Desired Genre: ${storySettings?.genre || 'Adaptive (match song style)'}
- Narrative Tone: ${storySettings?.tone || 'Adaptive (match song style)'}
- Core Era/Setting Concept: ${storySettings?.era || 'Adaptive (match song style)'}

INSTRUCTIONS:
1. Decode the themes, emotional arc, storytelling style, literal meaning, and deep hidden meaning of this track, including metaphors and artistic subtext.
2. Develop a standalone fictional story plot inspired by this analytical understanding.
3. Design a distinct Protagonist (name, role, deep backstory, transformational arc, specific traits) and at least 2 detailed Supporting Characters.
4. Layout the plot across 4 to 6 Chapters (or narrative phases) inspired by the song's verse-chorus-outro progression. Include what lyrics or audio cue (sonic changes, beat switches, instrumentation) inspired that phase, the summary, and the emotional beat.
5. Create a poetic, emotionally matching conclusion.
6. Connect specific lyric quotes, lines, or auditory descriptors (e.g. guitar solos, tempo drops, raw vocals) directly to their literal narrative translation.
7. Write 3 actionable follow-up prompt questions the user can choose to explore this story world further.
`;

      contentsParts.push({ text: promptText });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contentsParts,
        config: {
          systemInstruction: "You are a master literary analyst, musicologist, and novelist. You excel at extracting deep symbolic meaning from songs and mapping their narrative structures, instrumentation cues, and emotional arcs into cohesive, profound story plots with detailed character development.",
          responseMimeType: "application/json",
          responseSchema: responseSchema,
          temperature: 1.0,
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Empty response received from the Gemini model.");
      }

      const resultData = JSON.parse(responseText.trim());
      return res.json(resultData);

    } catch (err: any) {
      console.error("Analysis failed:", err);
      return res.status(500).json({
        error: err.message || "An unexpected error occurred during audio or lyrics analysis."
      });
    }
  });

  app.post("/api/expand", async (req, res) => {
    try {
      const { storyPlot, songAnalysis, query } = req.body;

      if (!storyPlot || !query) {
        return res.status(400).json({ error: "Missing required story details or query parameter." });
      }

      console.log(`Starting plot expansion query: "${query}" for story: "${storyPlot.title}"`);

      const ai = getGeminiClient();

      const promptText = `
Given the following fictional storyplot and its lyrical analysis, address the user's special expansion scene request or instruction.

STORYPLOT CONTEXT:
- Title: ${storyPlot.title}
- Genre: ${storyPlot.genre}
- Setting: ${storyPlot.setting?.description} (Era: ${storyPlot.setting?.era}, Mood: ${storyPlot.setting?.mood})
- Protagonist: ${storyPlot.protagonist?.name} (${storyPlot.protagonist?.role}) 
  * Backstory: ${storyPlot.protagonist?.backStory}
  * Arc: ${storyPlot.protagonist?.arc}
- Discovered Themes: ${songAnalysis?.themes ? songAnalysis.themes.join(", ") : "Adapted lyrical metrics"}

USER EXPANSION INSTRUCTION / TASK:
"${query}"

INSTRUCTIONS:
Compose engaging, high-quality, emotionally evocative draft scenery or character dialogue prose (approximately 250-450 words) addressing the instruction. Focus purely on writing rich literary prose. Use highly vivid, atmospheric descriptions and realistic character dialogue matching the tone and world. Do NOT insert any conversational conversational meta-commentary, introduction headers, lists, or conclusions. Provide only the direct prose.
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: promptText,
        config: {
          systemInstruction: "You are a master creative novelist and dialogue scriptwriter. You excel at turning high-level storyplot structures, song lyrics, and character roles into fully drafted prose, descriptive descriptions, and cinematic conversations.",
          temperature: 1.0,
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Empty response received from the Gemini model during plot expansion.");
      }

      return res.json({ prose: responseText.trim() });

    } catch (err: any) {
      console.error("Prose expansion failed:", err);
      return res.status(500).json({
        error: err.message || "An unexpected error occurred during prose generation."
      });
    }
  });

  // Serve static files in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Analytical Audio Analyzer Server listening on port ${PORT}`);
  });
}

startServer().catch((e) => {
  console.error("Critical server compilation and start failure:", e);
});
