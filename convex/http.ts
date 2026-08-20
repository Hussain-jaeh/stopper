import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { auth } from "./auth";

const http = httpRouter();
auth.addHttpRoutes(http);

const VOICE_ID = "EXAVITQu4vr4xnSDxMaL";

function validateSecret(params: URLSearchParams): Response | null {
  const expected = process.env.APP_API_SECRET;
  if (!expected) return new Response("APP_API_SECRET not configured", { status: 500 });
  if (params.get("s") !== expected) return new Response("Forbidden", { status: 403 });
  return null;
}

// Proxy ElevenLabs TTS so the API key never leaves the server.
// GET /api/tts?text=Breathe+in+slowly&s=<secret>
http.route({
  path: "/api/tts",
  method: "GET",
  handler: httpAction(async (_ctx, request) => {
    const params = new URL(request.url).searchParams;
    const authError = validateSecret(params);
    if (authError) return authError;

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) return new Response("ELEVENLABS_API_KEY not set", { status: 500 });

    const text = params.get("text") ?? "";
    if (!text.trim()) return new Response("text param is required", { status: 400 });
    if (text.length > 300) return new Response("text too long (max 300 chars)", { status: 400 });

    const upstream = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: { "xi-api-key": apiKey, "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          voice_settings: { stability: 0.75, similarity_boost: 0.6 },
        }),
      },
    );

    if (!upstream.ok) return new Response("ElevenLabs TTS error", { status: 502 });

    return new Response(await upstream.arrayBuffer(), {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=604800",
      },
    });
  }),
});

// Proxy ElevenLabs Sound Effects for ambient background.
// GET /api/sfx?s=<secret>  (fixed calm-rain prompt, cached for 7 days)
http.route({
  path: "/api/sfx",
  method: "GET",
  handler: httpAction(async (_ctx, request) => {
    const authError = validateSecret(new URL(request.url).searchParams);
    if (authError) return authError;

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) return new Response("ELEVENLABS_API_KEY not set", { status: 500 });

    const upstream = await fetch("https://api.elevenlabs.io/v1/sound-generation", {
      method: "POST",
      headers: { "xi-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        text: "soft rain falling gently, calm peaceful nature, meditation background, quiet",
        duration_seconds: 22,
        prompt_influence: 0.4,
      }),
    });

    if (!upstream.ok) return new Response("ElevenLabs SFX error", { status: 502 });

    return new Response(await upstream.arrayBuffer(), {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=604800",
      },
    });
  }),
});

export default http;
