// test-sdk.js
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
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Hello! Tell me a one-sentence joke.",
    });
    console.log("SDK call succeeded!");
    console.log("Response:", response.text);
  } catch (err) {
    console.error("SDK call failed with error:");
    console.error(err);
  }
}

run();
