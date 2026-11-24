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
| Redeploys | #2 badge-aware tab bar · #3 video-capture redeploy · #4 a11y/robots · **#5 meter fix (claimed, with key)**. All `live` / `success` |
| **Claimed / kept** | **YES.** Claimed by the entrant on 24 Nov 2026. The Embarko dashboard shows protein-recharge **Live, Public, permanent**, retained in the entrant's account |

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

**Status: claimed (24 Nov 2026).** Evidence:
1. The entrant's Embarko dashboard: protein-recharge **Live · Public · permanent** (reported by the entrant; treated as authoritative).
2. The live page no longer carries Embarko's `#__embarko_orphan_banner` ("will be deleted in N hours"), checked in the browser after the claim.
3. `GET https://ship.embarko.ai/apps/protein-recharge/status` without a key now returns **404 not_found**. Per https://embarko.ai/docs/claim.md, "a claimed app answers 404 without it", so this is expected. **It doesn't mean the app is down:** `GET https://protein-recharge.embarko.app/` returns 200, and 31/31 journeys passed live after the claim.

## Deploy #5: meter fix (24 Nov 2026), with the entrant's Embarko key
- Key: an existing personal Embarko key saved by the entrant to `~/.embarko/credentials` (`-rw-------`, in a `drwx------` directory). It was read only inside commands, never printed, logged or committed. Validated first with a read-only authenticated status call: HTTP 200, `live`, `claimed: true`.
- Shipped commit `ce4b500` (fix(meter)), from tree `b9218df`. It's a same-name redeploy with `--oauth2-bearer` and `X-App-Id`. Reply: `success: true, action: updated, claimed: true`. Status went `building` ×5 → `live` / deploy `success`, and the app is still claimed.
- What changed for users: while dragging the budget, a 78.8 g plan now reads "78 of 79 g · 0.2 g short" instead of the contradictory "79 of 79 g · 0 g short". The optimiser's plans are unchanged (₹53 goal plan, 79.1 g).
- Verified live: `GET /` returns 200. **34/34 Chromium e2e pass** (Android, iPhone, desktop), including the new regression "meter is honest just below the goal". **WebKit 10 passed**; the one failure is the known test-harness clipboard-permission limit.
- Rollback, if ever needed: https://embarko.ai/docs/rollback.md, which puts the previous version back without a rebuild.

## Known limitations
- Data lives in each visitor's localStorage. It is private, but it doesn't sync across devices (documented in the UI copy: "Everything stays on your phone").
- Prices are typical estimates (editable). Nutrition values are typical figures, not lab results.
