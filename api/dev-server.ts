/**
 * Local dev API server — proxied by Vite on /api/*
 * Run: npx tsx api/dev-server.ts
 */
import { createServer } from "node:http";
import { config } from "dotenv";

// Load .env
config();

// Dynamic import of API handlers
async function loadHandler(name: string) {
  const mod = await import(`./${name}.ts`);
  return mod.default;
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://localhost:3001`);
  const path = url.pathname.replace(/^\/api/, "");

  // Read body for POST
  let body = "";
  if (req.method === "POST") {
    for await (const chunk of req) {
      body += chunk;
    }
  }

  // Build a Web API Request from Node request
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value) headers.set(key, Array.isArray(value) ? value[0] : value);
  }

  const webRequest = new Request(`http://localhost:3001${req.url}`, {
    method: req.method,
    headers,
    body: req.method === "POST" ? body : undefined,
  });

  try {
    let handler: (req: Request) => Promise<Response>;

    if (path === "/analyze") {
      handler = await loadHandler("analyze");
    } else if (path === "/compatibility") {
      handler = await loadHandler("compatibility");
    } else if (path === "/share") {
      handler = await loadHandler("share");
    } else {
      res.writeHead(404);
      res.end("Not found");
      return;
    }

    const response = await handler(webRequest);

    // Copy response headers
    res.writeHead(response.status, Object.fromEntries(response.headers.entries()));

    // Stream the response body
    if (response.body) {
      const reader = response.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
    }
    res.end();
  } catch (error) {
    console.error("Dev API error:", error);
    res.writeHead(500);
    res.end(JSON.stringify({ error: "Internal server error" }));
  }
});

server.listen(3001, () => {
  console.log("API dev server running on http://localhost:3001");
});
