# 4D AI Web (Next.js)

First version of a new Next.js website for 4D AI using only Cloudflare public JSON feeds.

## Features (v1)
- Home dashboard
- Provider selector tabs/buttons
- Latest result card for selected provider
- Draw date
- Draw number
- 1st prize / 2nd prize / 3rd prize
- Special numbers
- Consolation numbers
- Phase / status
- Manual refresh button
- Loading, error, and empty states
- Responsive layout for mobile and desktop

## Data Sources
- `https://data.4dai88.com/latest/home.json`
- `https://data.4dai88.com/latest/providers/{provider}.json`

Supported providers:
- magnum
- sports_toto
- da_ma_cai
- sabah88
- sarawak
- sandakan
- grand_dragon
- nine_lotto
- singapore

## Tech Stack
- Next.js (App Router)
- TypeScript
- React

## Local Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start development server:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:3000`

## Production Build
```bash
npm run build
npm run start
```

## Deployment (Vercel)
1. Push this repository to GitHub/GitLab/Bitbucket.
2. Import project into Vercel.
3. Framework preset: **Next.js**.
4. Build command: `npm run build`
5. Output: default Next.js output.

No API keys or secrets are required for this first version.
