# 🎀 StudyBunny 🐰💗

A dreamy baby-pink study companion that makes focusing a little sweeter! 🌸

### 💕 [Play StudyBunny](https://rianamalhotra.github.io/StudyBunny/)

## ✨ Features
- ⏱️ 25-minute focus timer and 5-minute break timer
- 🐰 An animated bunny that grows every three completed focus sessions
- 🥕 Earn two carrots for each completed focus session
- 🌸 Track completed sessions and total focus minutes
- 💾 Progress automatically saved in your browser
- 🎀 Responsive, baby-pink and pastel-purple design

*Little steps, big bunny dreams.* ♡

Made with HTML, CSS, and JavaScript. 💗

## 🐰 Bunny Buddy AI setup (Gemini free tier + Cloudflare Worker)

Bunny Buddy uses Google's Gemini API through a Cloudflare Worker, so the Gemini key **never appears in public GitHub Pages code**. The UI is ready, but **AI replies will not work until the Worker is deployed and connected**.

1. Get a free-tier Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey). Free availability and quotas depend on your account and model.
2. Create a free [Cloudflare](https://dash.cloudflare.com/) account, go to **Workers & Pages**, create a Worker, and replace its code with [worker.js](worker.js). Deploy.
3. Under Worker **Settings → Variables and Secrets**, add an encrypted **Secret** named `GEMINI_API_KEY` with the Gemini key. Redeploy if needed.
4. Copy your Worker URL (e.g. `https://studybunny-ai.your-subdomain.workers.dev`) and add `/chat`.
5. Edit [script.js](script.js): set `const AI_ENDPOINT="https://YOUR-WORKER.workers.dev/chat";` and commit to `main`. Refresh the site.
6. **Before sharing publicly**, configure Cloudflare rate limiting for the Worker route (e.g. `/chat`) to reduce abuse and protect your Gemini quota. Origin checking and a hidden API key do not stop automated abuse on a public endpoint. Keep the Gemini key only in Cloudflare Secrets.

The Worker restricts browser origin to `https://rianamalhotra.github.io`, caps question length, and limits context to recent messages. Free-tier usage is limited and may be temporarily unavailable. Questions are processed by Google Gemini, and its free-tier data policies apply. No StudyBunny account required.
