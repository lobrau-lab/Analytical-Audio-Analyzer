// test-vertex-rest.js
const apiKey = process.env.GEMINI_API_KEY;
const projectId = "ais-us-west1-501e870fe628449d9";
const location = "us-west1";
const model = "gemini-1.5-flash"; // Standard robust Vertex model

const url = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${model}:generateContent?key=${apiKey}`;

async function run() {
  try {
    console.log("Calling Vertex AI REST endpoint...");
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: "Hello! Tell me a one-sentence joke." }]
        }]
      })
    });

    console.log("Status:", res.status);
    const text = await res.text();
    console.log("Response:", text);
  } catch (err) {
    console.error("Failed Vertex REST call:", err);
  }
}

run();
