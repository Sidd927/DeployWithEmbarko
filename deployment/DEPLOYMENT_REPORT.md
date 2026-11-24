# Deployment Report

| Item | Value |
|---|---|
| Live URL | **https://protein-recharge.embarko.app** |
| Platform | Embarko (`ship.embarko.ai`) |
| Route | `http_api`: Claude Code with open network (per https://embarko.ai/docs/prerequisites.md) |
| Prompt followed | Official "Copy deployment prompt" text from embarko.ai (see EMBARKO_DEPLOYMENT_PROMPT.md): read the quickstart, deploy anonymously, share the URL, then keep it |
| App id | `cmwu6jjed0h4ingfffkiaktph` (saved in `embarko.json` as `appId`) |
| App kind | `service`: Embarko detected Vite, ran `npm install` + `npm run build`, and serves `dist/` |
| First deploy | 24 Nov 2026, 04:13 UTC (09:43 IST). Status `building` → `live` in about 40 s |
| Redeploys | #2 (badge-aware tab bar), status `live`, deploy `success` |
| **Claimed / kept** | **NOT YET.** `claimed: false`, `expiresAt: 2026-11-25T04:13:39Z` (**25 Nov, 09:43 IST**). Needs the entrant (see below) |

## Exact procedure used
1. Read `https://embarko.ai/docs/quickstart.md`, `prerequisites.md`, `deploy.md`, `static-sites.md`, `claim.md` and `data.md`.
2. Packaged only the app's source: `tar -czf app.tar.gz package.json package-lock.json index.html vite.config.ts tsconfig.json embarko.json src public`. No node_modules, dist, .git, .env, tests or media were included.
3. Ran `POST https://ship.embarko.ai/apps` with headers `X-App-Name: protein-recharge`, `X-Agent-Name: claude-code` (+ `X-App-Id` on redeploys) and multipart `source=@app.tar.gz`.
4. Polled `GET /apps/protein-recharge/status` every 10 s until `live`.
5. Verified the live app (below). "A 200 alone is not enough," so the full journey suite was run.

Raw first reply: `deploy-1-response.json` (the private claim code is redacted).

## Verification of the live URL (24 Nov 2026)
- `GET /` returns 200 `text/html` in 0.33 s. `/og.png` returns 200.
- Embarko's own CSP is applied. Fonts are self-hosted, so nothing is blocked.
- **Playwright e2e against the live URL: 31 passed, 2 skipped (keyboard test runs on desktop only)**, across Android 360 px, iPhone 13 and desktop 1280 px. The suite covers the landing demo, the full setup journey, weight validation, the budget slider, pack selection, exclude/pin/price-edit **with reload persistence**, the shopping list and copy, share links, the empty state (goal already met) and the infeasible-goal explanation. It also asserts **zero console errors, zero failed requests, and no horizontal scroll**.
- Visual check in the browser at 375 × 812.

## Finding: Embarko overlays on unclaimed apps
The live page gets two injected elements while the app is unclaimed:
- `#__embarko_orphan_banner`: a fixed top bar, "This app will be deleted in 23:57 hours…".
- `#__embarko_orphan_footer` (`<embarko-badge>`): a fixed 100 × 36 pill at the bottom left.

At first the pill covered the "Plan" tab of the mobile tab bar and **blocked taps**. The live e2e run caught this, because the test timed out with "embarko-badge intercepts pointer events". Fix: `body:has(#__embarko_orphan_footer) .tabs--bottom { padding-left: 120px }`, so the pill gets its own slot in the bar. After the fix, all tests pass live. Once the app is claimed these elements are expected to go away, and the rule then does nothing.

## Keeping the app (required by the rules)
The rules say to accept the keep offer, or the app is deleted after 24 hours. Both documented routes need the entrant personally:
- **A. Claim link** (from the first deploy reply): open it and sign in to Embarko. The app moves into your account with no redeploy. *(The link was given to the entrant privately and is not stored in this repo.)*
- **B. Embarko key by email:** `POST /api/public/deploy-tokens/request {"email": …}`. Embarko emails a key, the entrant pastes it, and Claude redeploys with `Authorization: Bearer` to get `claimed: true`. Route B also lets Claude Code keep redeploying updates.

**Status: waiting on the entrant.** After claiming, run `GET /apps/protein-recharge/status` (with the key) and confirm `claimed: true`. Then update this section.

## Known limitations
- Data lives in each visitor's localStorage. It is private, but it doesn't sync across devices (documented in the UI copy: "Everything stays on your phone").
- Prices are typical estimates (editable). Nutrition values are typical figures, not lab results.
