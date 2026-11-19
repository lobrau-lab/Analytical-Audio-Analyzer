// test-headers-echo.js
async function run() {
  try {
    console.log("Sending request to httpbin.org to echo headers...");
    const res = await fetch("https://httpbin.org/headers", {
      headers: {
        "x-goog-api-key": "test-key-value"
      }
    });
    const data = await res.json();
    console.log("Echoed Headers:", JSON.stringify(data.headers, null, 2));
  } catch (err) {
    console.error("Echo request failed:", err);
  }
}
run();
