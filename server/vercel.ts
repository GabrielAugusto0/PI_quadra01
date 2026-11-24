// Entry point of the Vercel serverless function (bundled by scripts/build-vercel.mjs).
// The static front-end is served by Vercel itself; this function only handles /api/*.
import { createApp } from "./_core/app";

export default createApp();
