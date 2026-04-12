import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, ngrok-skip-browser-warning, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
};

const DEFAULT_BACKEND_API_URL = "https://farmlink-ethiopia.onrender.com/api";
const REQUEST_TIMEOUT_MS = Number(Deno.env.get("BACKEND_PROXY_TIMEOUT_MS") ?? "45000");
const MAX_ATTEMPTS = 2;
const RETRYABLE_STATUS = new Set([502, 503, 504]);

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const withCorsHeaders = (headers: Headers) => {
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Headers", corsHeaders["Access-Control-Allow-Headers"]);
  headers.set("Access-Control-Allow-Methods", corsHeaders["Access-Control-Allow-Methods"]);
  return headers;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const incomingUrl = new URL(req.url);
    const configuredBackend = Deno.env.get("BACKEND_API_URL") || DEFAULT_BACKEND_API_URL;
    const backendBaseUrl = trimTrailingSlash(configuredBackend);

    const functionPath = "/backend-proxy";
    const pathIndex = incomingUrl.pathname.indexOf(functionPath);
    const proxiedPath = pathIndex >= 0
      ? incomingUrl.pathname.slice(pathIndex + functionPath.length)
      : incomingUrl.pathname;

    if (!proxiedPath || proxiedPath === "/") {
      return new Response(
        JSON.stringify({ error: "Missing API path. Use /backend-proxy/<endpoint>." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const targetUrl = `${backendBaseUrl}${proxiedPath}${incomingUrl.search}`;
    const canHaveBody = req.method !== "GET" && req.method !== "HEAD";
    const requestBody = canHaveBody ? await req.arrayBuffer() : undefined;

    let backendResponse: Response | null = null;
    let lastError: unknown = null;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      const forwardHeaders = new Headers(req.headers);
      [
        "host",
        "content-length",
        "x-forwarded-host",
        "x-forwarded-port",
        "x-forwarded-proto",
        "x-real-ip",
        "cf-connecting-ip",
        "cf-ray",
      "origin",
      "referer",
      ].forEach((h) => forwardHeaders.delete(h));

      if (canHaveBody && !forwardHeaders.has("content-type")) {
        forwardHeaders.set("content-type", "application/json");
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

      try {
        backendResponse = await fetch(targetUrl, {
          method: req.method,
          headers: forwardHeaders,
          body: canHaveBody ? requestBody : undefined,
          redirect: "follow",
          signal: controller.signal,
        });

        if (attempt < MAX_ATTEMPTS && RETRYABLE_STATUS.has(backendResponse.status)) {
          await sleep(350 * attempt);
          continue;
        }

        break;
      } catch (error) {
        lastError = error;
        const isAbort = error instanceof Error && error.name === "AbortError";

        if (attempt < MAX_ATTEMPTS && (isAbort || error instanceof TypeError)) {
          await sleep(350 * attempt);
          continue;
        }

        throw error;
      } finally {
        clearTimeout(timeoutId);
      }
    }

    if (!backendResponse) {
      throw lastError instanceof Error
        ? lastError
        : new Error("No response returned from backend");
    }

    const responseHeaders = withCorsHeaders(new Headers(backendResponse.headers));

    return new Response(backendResponse.body, {
      status: backendResponse.status,
      headers: responseHeaders,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return new Response(
        JSON.stringify({ error: "Backend request timed out", details: "Backend may be cold-starting. Please retry." }),
        {
          status: 504,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    return new Response(
      JSON.stringify({
        error: "Proxy request failed",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
