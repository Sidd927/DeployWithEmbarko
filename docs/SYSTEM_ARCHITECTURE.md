# System Architecture

## Stack (and why)
- **Vite + React 18 + TypeScript.** Fast to build, type-safe, and a static output that Embarko serves as a website (documented: "Vite… send the project with its package.json and build script").
- **Plain CSS with custom properties.** A distinctive design system without utility-class sameness, and no runtime CSS-in-JS.
- **Self-hosted fonts via @fontsource.** No third-party font CDN at runtime, so nothing breaks under Embarko's CSP.
- **No backend.** Nothing in the product needs one. Embarko static sites go live in about 2 s, have no process to crash, and stay up through judging.
- **Vitest** for the optimiser and the data. **Playwright** for end-to-end runs, responsive screenshots and video footage.

## Modules
```
src/
  data/foods.ts        food catalogue: nutrition per 100 g/ml or per piece, default pack price, caps, kitchen, diet, source
  lib/optimizer.ts     bounded-knapsack DP: buildTable(foods, opts) → minCost by protein; planForGoal / planForBudget
  lib/profile.ts       Profile type, targets (ICMR g/kg), mess estimates, URL encode/decode
  lib/storage.ts       versioned localStorage with safe fallbacks
  lib/format.ts        ₹, grams, natural units ("2 eggs", "1 glass milk")
  state/store.tsx      React context: profile, prices, exclusions, pins; derived DP table (memoised)
  components/…         Voucher, Plate, Meter, BudgetSlider, FoodRow, Stepper, Sheet, TabBar, Icons
  screens/…            Landing, Setup, Plans, Foods, ShoppingList
```

## Optimiser
- Protein is discretised to 0.1 g (an integer). Costs are in paise (integers).
- `dp[k][p]` is the minimum cost to get *exactly* p (capped at P_MAX) protein using at most k distinct foods (k ≤ 5). Foods are processed one at a time, with a choice of 0..cap servings each, giving a bounded knapsack with a distinct-items dimension.
- Pinned foods force at least 1 serving. Excluded foods and foods outside the diet or kitchen are filtered before the DP runs.
- Choices are stored per food layer (Int8Array) so the plan can be reconstructed.
- One table answers both questions. **Goal mode:** min over p ≥ need of dp[K][p]. **Budget mode:** max p with dp[K][p] ≤ budget. The slider is then an O(P) lookup, with no recomputation while dragging.
- Complexity: about 20 foods × 6 k × 2,500 p × ≤6 choices ≈ 2M operations, roughly 5–15 ms. It is recomputed only when the profile, prices or toggles change.

## Data & persistence
- `localStorage['protein-recharge:v1']` holds `{profile, priceOverrides, excluded, pinned, onboarded}`. Writes are wrapped in try/catch, so private mode degrades to the session only.
- The share link fragment `#p=` holds base64url JSON of `{w, g, d, k, m, q}`. No name, email or identifiers.

## Deployment
- The Embarko HTTP API (see deployment/DEPLOYMENT_REPORT.md) sends the source tar.gz and Embarko builds and serves `dist/`. Fallback: upload the built `dist/` as a plain static site.
- No env vars or secrets.
