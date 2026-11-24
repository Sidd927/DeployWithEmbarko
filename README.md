# Protein Recharge

**The cheapest way to hit your daily protein, planned around your mess meals, your kettle and your budget.**

Live: **https://protein-recharge.embarko.app** · Built with Claude Code · Hosted on Embarko · #DeployWithEmbarko

Mess food leaves most hostel students well short on protein. Protein Recharge asks five questions (weight, goal, diet, kitchen access, mess meals) and an exact optimiser finds the cheapest mix of foods that closes the gap. Plans are shown as daily "recharge packs". Drag the budget and the plate re-optimises live. Skip or pin foods, set your own shop's prices, and get a weekly shopping list in real pack sizes. Free, no sign-up, and your data stays on your device.

## How it works
- `src/lib/optimizer.ts`: a bounded knapsack solved by dynamic programming over protein (0.1 g steps), with an extra dimension limiting plans to 5 foods. One table answers both "cheapest plan for ≥ N g" and "most useful protein for ≤ ₹B", so the slider never recomputes. Verified against brute force on 600 random instances.
- `src/data/foods.ts`: 19 foods with per-100 g or per-piece nutrition (IFCT 2017 / USDA FDC / pack labels), daily caps, kitchen requirement, diet group and a typical pack price (editable).
- `src/lib/profile.ts`: targets follow ICMR-NIN Dietary Guidelines for Indians 2024 (0.83 / 1.2 / 1.6 g per kg).

## Develop
```bash
npm install
npm run dev        # http://localhost:5173
npm run check      # typecheck + unit tests + build
npm run e2e        # Playwright on Android, iPhone and desktop sizes
BASE_URL=https://protein-recharge.embarko.app npm run e2e   # against the live app
```

## Deploy (Embarko)
Follows the official prompt (`deployment/EMBARKO_DEPLOYMENT_PROMPT.md`). Embarko builds the Vite project itself.
```bash
tar -czf /tmp/app.tar.gz --exclude='*.test.ts' package.json package-lock.json index.html vite.config.ts tsconfig.json embarko.json src public
curl -sS -X POST https://ship.embarko.ai/apps -H 'X-App-Name: protein-recharge' -H 'X-Agent-Name: claude-code' -F source=@/tmp/app.tar.gz
```
Once the app is claimed, add `--oauth2-bearer $DEPLOY_TOKEN` (your Embarko key).

## Repository map
| Folder | Contents |
|---|---|
| `research/` | Competition requirements, idea discovery, competitor analysis, evaluation, selection |
| `docs/` | PRD, user journeys, architecture, design system |
| `src/`, `public/`, `e2e/` | App, assets, end-to-end tests |
| `qa/` | Test plan, results, final audit, screenshots |
| `deployment/` | Deployment report, official Embarko prompt |
| `video/` | Footage, HyperFrames project, exports, script |
| `submission/` | Social copy, bonus content, final submission sheet |
| `scripts/` | Footage capture, OG image and thumbnail generators |

Nutrition values are typical figures and prices are estimates. This is general information, not medical advice.
