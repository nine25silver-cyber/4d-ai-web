# Digit Analysis Pro release candidate

Target: 4dai88.com web Worker only. Candidate starts at verified deployed web master 8ce1a131653aed565b0e87254b18fea3800729be. Previous Worker rollback version: 53293976-ae38-4f30-a6f4-c1a10391434c. Reconfirm before releasing.

- Localized toolbox card retains four existing feature destinations and desktop grouping, using the approved 4D-pair, 3D-pair, full-width analysis sequence on mobile.
- Analysis: /{locale}/tools/digit-analysis-pro, with app-equivalent provider order, three mode guides, separate Double/Triple filters and metric sheets.
- GET /api/digit-analysis-pro authenticates the per-request Supabase access token and calls get_user_access_state as that user. Active authoritative Pro or Trial only. No service role, legacy table fallback, local plan flag or ad unlock. Confirmed authoritative lifetime and Play buffer/grace rules are preserved rather than interpreting the displayed original purchase expiry as final.
- The API reads the three fixed Android Cloudflare URLs only after permission; uses bounded reads and projection. Output and denial are private/no-store. The existing upstream tracker feeds were already public and are outside the scope of this web access gate.
- History/AI recommendation inputs, backend feed generation, database, billing, and Android are untouched.

## Validation

Run `npm ci` followed by `npm run typecheck`, `node --experimental-strip-types --test tests/digit-analysis*.test.mjs`, `npm run test:smart-link` and `npm run cf:build`. Never use `cf:deploy` for preflight. Build may already be blocked on stock master by an obsolete OpenNext support cutoff; keep any dependency update separate from this feature.

Before releasing, verify all three actual feed schemas and values against the same draw and provider; verify that config binds the correct existing membership project. Verify the guest/forbidden/error cases do not read upstream or expose values. Exercise existing authorized Pro and Trial plus Free if suitable accounts are already available; no invented membership, test purchase, or entitlement write. Preserve current cache and billing environment. Verify release SHA corresponds to exact Worker version, active traffic, no cache cross-account, and expected permission/success behavior. Roll back the Worker if the release breaks existing routes or the auth boundary.
