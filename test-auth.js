// test-auth.js
const key = process.env.GEMINI_API_KEY;
console.log("Testing auth with key length:", key ? key.length : 0);
console.log("Key starts with:", key ? key.slice(0, 10) : "null");

const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

const requestBody = {
  contents: [{ parts: [{ text: "Hello" }] }]
};

async function testApiKey() {
  console.log("\n--- Testing with x-goog-api-key header ---");
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": key
      },
      body: JSON.stringify(requestBody)
    });
    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Response:", text.slice(0, 300));
  } catch (err) {
    console.error("Fetch failed:", err);
  }
}

async function testBearerToken() {
  console.log("\n--- Testing with Authorization: Bearer header ---");
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${key}`
      },
      body: JSON.stringify(requestBody)
    });
    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Response:", text.slice(0, 300));
  } catch (err) {
    console.error("Fetch failed:", err);
  }
}

async function testApiKeyOverridingAuth() {
  console.log("\n--- Testing with x-goog-api-key and overridden empty Authorization header ---");
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": key,
        "Authorization": ""
      },
      body: JSON.stringify(requestBody)
    });
    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Response:", text.slice(0, 300));
  } catch (err) {
    console.error("Fetch failed:", err);
  }
}

async function run() {
  await testApiKey();
  await testApiKeyOverridingAuth();
  await testBearerToken();
}

run();
