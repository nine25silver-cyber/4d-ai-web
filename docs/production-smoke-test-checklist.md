# Production Smoke Test Checklist

Production domain: https://4dai88.com

Use this checklist after a Cloudflare production build completes. This is a verification checklist only. Do not change provider data contracts, provider JSON shapes, result parsing rules, membership entitlement logic, payment logic, or Cloudflare configuration while performing these smoke tests.

## Standard URLs

- https://4dai88.com
- https://4dai88.com/zh
- https://4dai88.com/zh/results/west-malaysia
- https://4dai88.com/en/results/west-malaysia
- https://4dai88.com/ms/results/west-malaysia
- https://4dai88.com/zh/history/west-malaysia
- https://4dai88.com/zh/tools
- https://4dai88.com/zh/ai/west-malaysia
- https://4dai88.com/zh/account
- https://4dai88.com/zh/pricing
- https://4dai88.com/robots.txt
- https://4dai88.com/sitemap.xml
- https://4dai88.com/api/latest/west-malaysia

## High-Risk Provider Pairing

These URLs intentionally pair each provider with its correct region.

### AI

- https://4dai88.com/zh/ai/cambodia/grand_dragon
- https://4dai88.com/zh/ai/cambodia/nine_lotto
- https://4dai88.com/zh/ai/east-malaysia/sarawak
- https://4dai88.com/zh/ai/west-malaysia/da_ma_cai

### History

- https://4dai88.com/zh/history/cambodia/grand_dragon
- https://4dai88.com/zh/history/cambodia/nine_lotto
- https://4dai88.com/zh/history/east-malaysia/sarawak
- https://4dai88.com/zh/history/west-malaysia/da_ma_cai

## Manual Checks

- Page loads without a Server Components render error.
- Page loads without a client-side fatal exception.
- Browser console has no fatal red errors.
- Header navigation works across locale, results, history, AI, tools, pricing, and account pages.
- Login/logout smoke test works from the account page.
- `robots.txt` uses the production domain and disallows internal account/auth/API routes.
- `sitemap.xml` uses `https://4dai88.com` canonical URLs and excludes account/auth callback pages.
- High-risk provider pages load with the correct region/provider pairing listed above.
- API smoke test at `/api/latest/west-malaysia` returns JSON and does not expose secrets.

## Stop Conditions

- Stop if a smoke test suggests a provider data contract mismatch.
- Stop if a page requires changing provider result logic, tool calculation logic, auth logic, payment logic, or membership entitlement writes.
- Stop if any check appears to require Supabase, Cloudflare deploy, or backend/R2 publisher changes.
