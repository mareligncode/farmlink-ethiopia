import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, ngrok-skip-browser-warning",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
};

const DEFAULT_BACKEND_API_URL = "https://farmlink-ethiopia.onrender.com/api";

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

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
    ].forEach((header) => forwardHeaders.delete(header));

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    let backendResponse: Response;
    try {
      backendResponse = await fetch(targetUrl, {
        method: req.method,
        headers: forwardHeaders,
        body: req.method === "GET" || req.method === "HEAD" ? undefined : req.body,
        redirect: "follow",
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }

    const responseHeaders = new Headers(backendResponse.headers);
    responseHeaders.set("Access-Control-Allow-Origin", "*");
    responseHeaders.set("Access-Control-Allow-Headers", corsHeaders["Access-Control-Allow-Headers"]);
    responseHeaders.set("Access-Control-Allow-Methods", corsHeaders["Access-Control-Allow-Methods"]);

    return new Response(backendResponse.body, {
      status: backendResponse.status,
      headers: responseHeaders,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return new Response(
        JSON.stringify({ error: "Backend request timed out" }),
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
