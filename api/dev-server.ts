/**
 * Local dev API server — proxied by Vite on /api/*
 * Run: npx tsx api/dev-server.ts
 */
import { createServer } from "node:http";
import { config } from "dotenv";

// Load .env
config();

// Dynamic import of API handlers
async function loadHandler(modulePath: string) {
  const mod = await import(`./${modulePath}.ts`);
  return mod.default;
}

const ROUTES: Record<string, string> = {
  "/analyze": "analyze",
  "/compatibility": "compatibility",
  "/share": "share",
  "/auth/kakao/login": "auth/kakao/login",
  "/auth/kakao/callback": "auth/kakao/callback",
  "/auth/me": "auth/me",
  "/auth/logout": "auth/logout",
};

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
    const modulePath = ROUTES[path];
    if (!modulePath) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    const handler = (await loadHandler(modulePath)) as (req: Request) => Promise<Response>;

    const response = await handler(webRequest);

    // Pass through headers — Set-Cookie may appear multiple times; keep it as an array
    const resHeaders: Record<string, string | string[]> = {};
    const setCookies =
      typeof response.headers.getSetCookie === "function" ? response.headers.getSetCookie() : [];
    for (const [key, value] of response.headers.entries()) {
      if (key.toLowerCase() === "set-cookie") continue;
      resHeaders[key] = value;
    }
    if (setCookies.length > 0) {
      resHeaders["set-cookie"] = setCookies;
    }
    res.writeHead(response.status, resHeaders);

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
