# Test Plan

## Levels
| Level | Tool | Where | What |
|---|---|---|---|
| Unit | Vitest (`npm test`) | `src/lib/*.test.ts` | Optimiser exactness against brute force, budget mode with a ceiling, pins, the greedy-beating case, empty plan; catalogue sanity; planner diet/kitchen correctness, exclusions/pins, price edits, monotonic budget plans, covered goal, share-link round trip, ICMR targets |
| Type / build | `tsc -b`, `vite build` (`npm run check`) | whole app | Strict TypeScript, production bundle |
| End-to-end | Playwright (`npm run e2e`) | `e2e/app.spec.ts` | 11 journeys × 3 devices (Android 360 × 740, iPhone 13 390 × 844, desktop 1280 × 860), run locally **and against the live Embarko URL** (`BASE_URL=…`) |
| Responsive / visual | Playwright full-page screenshots + manual review in the browser | `qa/screenshots/` | No horizontal scroll (asserted), layout at 360/375/390/1280 |
| Console / network | Playwright listeners | every e2e journey that watches | Zero console errors, zero page errors, zero failed requests |
| Performance / a11y / SEO | Lighthouse 12 (mobile) | live URL | Category scores, Core Web Vitals |
| Video | HyperFrames `check`, snapshots, ffprobe, EBU R128 | `video/` | Lint, runtime, layout safe zones, contrast, duration, loudness |

## E2E journeys
1. Landing explains the product. The live demo slider changes the voucher price and verdict.
2. Full setup (72 kg, muscle, vegetarian, no kitchen, 3 typical meals) gives the correct equation (115 / 45 / 70 g) and a plan with no eggs, chicken, soya, dal or oats.
3. Weight validation: 12 kg is rejected with a clear message, 64 kg is accepted.
4. Budget slider: ₹15 shows "short" and costs ≤ ₹15. "Jump there" restores the goal.
5. Selecting a pack sets the budget to that pack's price.
6. Exclude soya and pin milk with a custom price. The plan updates, **survives reload**, and resetting prices works.
7. Shopping list rounds to packs, and the copy button puts text on the clipboard.
8. A share link rebuilds the profile (84 g / 74 g), shows the banner and cleans the URL.
9. Meals that already cover the goal show the empty state.
10. An impossible goal (200 kg vegan, no kitchen, 0 meals) explains why and offers the max pack.
11. Keyboard: the food sheet opens with Enter, closes with Escape, and returns focus.
