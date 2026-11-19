// test-headers.js
async function run() {
  try {
    const res = await fetch("https://httpbin.org/headers");
    const json = await res.json();
    console.log("Outgoing headers received by httpbin:");
    console.log(JSON.stringify(json.headers, null, 2));
  } catch (err) {
    console.error("Failed to query httpbin:", err);
  }
}
run();
