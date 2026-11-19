// test-metadata.js
async function run() {
  try {
    const res = await fetch("http://metadata.google.internal/computeMetadata/v1/project/project-id", {
      headers: { "Metadata-Flavor": "Google" }
    });
    if (res.ok) {
      const projectId = await res.text();
      console.log("Metadata Server Project ID:", projectId);
    } else {
      console.log("Metadata Server returned status:", res.status);
    }
  } catch (err) {
    console.error("Failed to query metadata server:", err.message);
  }
}
run();
