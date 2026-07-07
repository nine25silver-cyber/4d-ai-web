# 4D AI Web Deployment Env Checklist

This checklist is the production-ready env reference for the website.

## 1) Local development (`.env.local`)

Required:

- `NEXT_PUBLIC_SITE_URL=http://localhost:3003`
- `NEXT_PUBLIC_CLOUDFLARE_LATEST_BASE_URL=https://data.4dai88.com/latest/providers`
- `NEXT_PUBLIC_CLOUDFLARE_HISTORY_BASE_URL=https://data.4dai88.com/history_test`
- `NEXT_PUBLIC_CLOUDFLARE_HISTORY_TEST_BASE_URL=https://data.4dai88.com/history_test`
- `NEXT_PUBLIC_CLOUDFLARE_AI_HIT_HISTORY_BASE_URL=https://data.4dai88.com/ai_hit_history`
- `NEXT_PUBLIC_SUPABASE_URL=<your-supabase-project-url>`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>`

Optional:

- `NEXT_PUBLIC_CLOUDFLARE_AI_RECOMMENDATION_BASE_URL=<ai-recommendation-json-base>`
- `CLOUDFLARE_AI_HIT_HISTORY_BASE_URL=<server-side-override>`

## 2) Production environment

Set these in your hosting platform env settings:

- `NEXT_PUBLIC_SITE_URL=https://<your-domain>`
- `NEXT_PUBLIC_CLOUDFLARE_LATEST_BASE_URL=https://data.4dai88.com/latest/providers`
- `NEXT_PUBLIC_CLOUDFLARE_HISTORY_BASE_URL=https://data.4dai88.com/history_test` (or final history endpoint)
- `NEXT_PUBLIC_CLOUDFLARE_HISTORY_TEST_BASE_URL=https://data.4dai88.com/history_test` (if still needed)
- `NEXT_PUBLIC_CLOUDFLARE_AI_HIT_HISTORY_BASE_URL=https://data.4dai88.com/ai_hit_history`
- `NEXT_PUBLIC_CLOUDFLARE_AI_RECOMMENDATION_BASE_URL=<production-ai-recommendation-json-base>`
- `NEXT_PUBLIC_SUPABASE_URL=<your-supabase-project-url>`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>`
- `CLOUDFLARE_AI_HIT_HISTORY_BASE_URL=<optional-server-override>`
- `STRIPE_SECRET_KEY=<server-only>`
- `STRIPE_PRICE_PRO_MONTHLY=<server-only>`
- `STRIPE_WEBHOOK_SECRET=<server-only>`
- `SUPABASE_SERVICE_ROLE_KEY=<server-only>`

Cloudflare deploy must preserve runtime vars/secrets:

- `npm run cf:deploy`
- The deploy script must use `wrangler deploy --keep-vars`.

## 3) Security rules

- `NEXT_PUBLIC_SUPABASE_ANON_KEY` is public and safe for browser use.
- Never expose `service_role` key in frontend env.
- Do not place payment provider secrets (Stripe secret keys, webhook secrets, etc.) in `NEXT_PUBLIC_*`.
- Do not print service role keys, Stripe secrets, webhook secrets, or Authorization/apikey header values in logs.
- Do not commit service role keys, Stripe secrets, webhook secrets, or `.env.local` into the repo.

## 4) Quick verification after deploy

1. Open:
   - `/zh/tools/search`
   - `/zh/tools/hot-cold`
   - `/zh/tools/package-ranking`
   - `/zh/ai/west-malaysia/magnum`
2. Confirm no 500 errors.
3. Confirm language switch still works (`/en`, `/zh`, `/ms`).
4. Confirm login flow opens Supabase OAuth page.
5. Confirm locked pages show Pro/ad unlock UI.

## 5) Optional future env variables

- `NEXT_PUBLIC_AD_PROVIDER=<placeholder>`
- `NEXT_PUBLIC_AD_REWARDED_UNIT_ID=<placeholder>`
- `REVENUECAT_API_KEY=<server-only>`
