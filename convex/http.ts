import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { auth } from "./auth";

const http = httpRouter();
auth.addHttpRoutes(http);

const VOICE_ID = "EXAVITQu4vr4xnSDxMaL"; // Sarah — mature, reassuring

// Proxy ElevenLabs TTS so the API key never leaves the server.
// GET /api/tts?text=Breathe+in+slowly
http.route({
  path: "/api/tts",
  method: "GET",
  handler: httpAction(async (_ctx, request) => {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) return new Response("ELEVENLABS_API_KEY not set", { status: 500 });

    const text = new URL(request.url).searchParams.get("text") ?? "";

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
// GET /api/sfx  (fixed calm-rain prompt, cached for 7 days)
http.route({
  path: "/api/sfx",
  method: "GET",
  handler: httpAction(async (_ctx, _request) => {
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
