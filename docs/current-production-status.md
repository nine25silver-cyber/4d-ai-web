# 4D AI Web Current Production Status

## Deployment

- Production domain: https://4dai88.com
- Cloudflare Workers/OpenNext deployed
- GitHub branch: master
- Build command: `npm run cf:build`
- Deploy command: `npx wrangler deploy`
- Compatibility date: 2025-05-25
- `nodejs_compat` enabled
- Do not use workers.dev as canonical domain

## Git / Repo

- Repo: `C:\Users\William\Documents\4d AI Web`
- GitHub: `nine25silver-cyber/4d-ai-web`
- `master` is the production branch
- Current repo should remain separate from Flutter App and backend

## Supabase Auth

- Web uses Supabase Auth with browser anon key only
- No service role key in frontend
- Login/logout smoke test passed
- Redirect callback paths:
  - `/en/auth/callback`
  - `/zh/auth/callback`
  - `/ms/auth/callback`

## Membership / Pro Entitlement

- Official source of Pro: `public.user_membership_entitlements`
- Frontend only reads entitlement
- Frontend must not insert/update/delete `plan`, `is_pro`, or `status`
- Missing row = Free
- Error/unconfigured = Free
- Reward/ad unlock remains separate temporary feature unlock, not Pro membership

## Current Pro Gate Migration Status

Completed:

- Account panel
- Header badge
- ProAccessGate
- AI gates
- Hot/Cold
- Package Ranking
- Search export/download
- Thousand Hits export/download

## Local Member State

- `member-state` localStorage is only UI/login/email cache
- It should not grant formal Pro
- Legacy metadata/profile/subscription/user_entitlements heuristics removed
- Development-only local plan controls are hidden in production

## SEO

- `robots.txt` active
- `sitemap.xml` active
- Canonical domain: https://4dai88.com
- Account/auth noindexed/excluded
- Public sitemap excludes account/auth callback

## Production Smoke Test Baseline

Reference: `docs/production-smoke-test-checklist.md`

Important URLs:

- https://4dai88.com
- https://4dai88.com/zh/results/west-malaysia
- https://4dai88.com/zh/account
- https://4dai88.com/zh/ai/west-malaysia
- https://4dai88.com/zh/tools/hot-cold
- https://4dai88.com/zh/tools/package-ranking
- https://4dai88.com/zh/tools/search
- https://4dai88.com/zh/tools/thousand-hits
- https://4dai88.com/robots.txt
- https://4dai88.com/sitemap.xml

## High-risk Provider Notes

- `grand_dragon` and `nine_lotto` are Cambodia providers
- `sarawak` is East Malaysia
- `da_ma_cai` is West Malaysia
- Do not change provider JSON contract for Web UI convenience
- Do not alter latest/home/provider JSON semantics
- Da Ma Cai and Sarawak special number structures must remain protected

## Known Remaining Work

- UI large redesign can start later by page/phase
- Possible cleanup: unused old `PackageRankingToolClient.tsx`, only after read-only confirmation
- Further member-state simplification can be separate small phase
- Search Console / Bing Webmaster sitemap submission
- OG image / favicon / SEO Phase 2 later after UI wording stabilizes

## Safety Rules Going Forward

- Do not modify Flutter App folder from Web tasks
- Do not modify backend/Railway/R2 publisher from Web tasks
- Do not expose env/secret/service role
- Do not let frontend write entitlement
- Commit only after typecheck/build
- Push only when William approves
- Deploy is automatic via Cloudflare Git integration unless manually approved
