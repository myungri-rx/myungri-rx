/**
 * Local dev API server — proxied by Vite on /api/*
 * Run: npx tsx api/dev-server.ts
 *
 * Supports two handler styles:
 *  - Web API:  `handler(request: Request) => Response`       (Edge runtime)
 *  - Node:     `handler(req, res) => void`                    (Serverless runtime)
 * Detected by handler.length (function arity).
 */
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { config } from "dotenv";

config();

type WebHandler = (req: Request) => Promise<Response>;
type NodeHandler = (req: IncomingMessage, res: ServerResponse) => Promise<void>;
type AnyHandler = WebHandler | NodeHandler;

async function loadHandler(name: string): Promise<AnyHandler> {
  const mod = await import(`./${name}.ts`);
  return mod.default as AnyHandler;
}

const ROUTES: Record<string, string> = {
  "/analyze": "analyze",
  "/compatibility": "compatibility",
  "/share": "share",
};

async function readRawBody(req: IncomingMessage): Promise<string> {
  let body = "";
  for await (const chunk of req) {
    body += typeof chunk === "string" ? chunk : chunk.toString("utf8");
  }
  return body;
}

async function runWebHandler(
  handler: WebHandler,
  req: IncomingMessage,
  res: ServerResponse,
  rawBody: string,
): Promise<void> {
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value) headers.set(key, Array.isArray(value) ? value[0] : value);
  }
  const webRequest = new Request(`http://localhost:3001${req.url}`, {
    method: req.method,
    headers,
    body: req.method === "POST" ? rawBody : undefined,
  });

  const response = await handler(webRequest);

  const resHeaders: Record<string, string | string[]> = {};
  const setCookies =
    typeof response.headers.getSetCookie === "function" ? response.headers.getSetCookie() : [];
  for (const [key, value] of response.headers.entries()) {
    if (key.toLowerCase() === "set-cookie") continue;
    resHeaders[key] = value;
  }
  if (setCookies.length > 0) resHeaders["set-cookie"] = setCookies;
  res.writeHead(response.status, resHeaders);

  if (response.body) {
    const reader = response.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(value);
    }
  }
  res.end();
}

async function runNodeHandler(
  handler: NodeHandler,
  req: IncomingMessage,
  res: ServerResponse,
  rawBody: string,
): Promise<void> {
  // Mimic Vercel's pre-parsed body behavior for application/json
  if (req.method === "POST" && rawBody) {
    const ct = req.headers["content-type"] || "";
    if (ct.includes("application/json")) {
      try {
        (req as IncomingMessage & { body?: unknown }).body = JSON.parse(rawBody);
      } catch {
        (req as IncomingMessage & { body?: unknown }).body = rawBody;
      }
    } else {
      (req as IncomingMessage & { body?: unknown }).body = rawBody;
    }
  }
  await handler(req, res);
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://localhost:3001`);
  const path = url.pathname.replace(/^\/api/, "");

  const modulePath = ROUTES[path];
  if (!modulePath) {
    res.writeHead(404);
    res.end("Not found");
    return;
  }

  const rawBody = req.method === "POST" ? await readRawBody(req) : "";

  try {
    const handler = await loadHandler(modulePath);
    if (handler.length >= 2) {
      await runNodeHandler(handler as NodeHandler, req, res, rawBody);
    } else {
      await runWebHandler(handler as WebHandler, req, res, rawBody);
    }
  } catch (error) {
    console.error("Dev API error:", error);
    if (!res.headersSent) {
      res.writeHead(500, { "Content-Type": "application/json" });
    }
    res.end(JSON.stringify({ error: "Internal server error" }));
  }
});

server.listen(3001, () => {
  console.log("API dev server running on http://localhost:3001");
});
