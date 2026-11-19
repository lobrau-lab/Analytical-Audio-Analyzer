// test-interactions.js
import { GoogleGenAI } from "@google/genai";

const key = process.env.GEMINI_API_KEY;
console.log("Initializing SDK with key length:", key ? key.length : 0);

const ai = new GoogleGenAI({
  apiKey: key,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function run() {
  try {
    console.log("Calling ai.interactions.create...");
    const response = await ai.interactions.create({
      model: "gemini-3.5-flash",
      input: "Hello! Tell me a one-sentence joke.",
    });
    console.log("Interactions API call succeeded!");
    console.log("Response (output_text):", response.output_text);
  } catch (err) {
    console.error("Interactions API call failed with error:");
    console.error(err);
  }
}

run();
