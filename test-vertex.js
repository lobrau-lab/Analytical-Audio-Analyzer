// test-vertex.js
import { GoogleGenAI } from "@google/genai";

console.log("Initializing SDK in Vertex AI mode...");

// When initializing without explicit apiKey/project/location, the SDK in node
// environment attempts to auto-discover them from the GCP environment.
const ai = new GoogleGenAI({
  vertexai: true,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function run() {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Hello! Tell me a one-sentence joke.",
    });
    console.log("Vertex SDK call succeeded!");
    console.log("Response:", response.text);
  } catch (err) {
    console.error("Vertex SDK call failed with error:");
    console.error(err);
  }
}

run();
