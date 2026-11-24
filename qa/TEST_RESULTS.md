# Test Results (24 Nov 2026)

Everything below was actually run. The commands are in the Test Plan.

## Unit: Vitest
`15 passed (15)`: optimizer.test.ts (5 tests, including **600 randomised brute-force comparisons**) and plan.test.ts (10).

## Type check and build
`tsc -b --noEmit`: no errors. `vite build`: OK. JS 193 KB (62 KB gzip), CSS 27 KB (6 KB gzip).

## E2E: Playwright
| Target | Result |
|---|---|
| Local production build (`vite preview`) | **31 passed, 2 skipped** (the keyboard test runs only on desktop by design) |
| Live https://protein-recharge.embarko.app, first run | 29 passed, **2 failed** (Android, iPhone): "embarko-badge intercepts pointer events" on the Plan tab |
| Live, after the fix (deploy #2) | **31 passed, 2 skipped** |
| Live, after the a11y/robots fixes (deploy #4) | **31 passed, 2 skipped** |

Every watched journey asserts zero console errors, zero page errors and zero failed requests, and every one passed. Every journey that takes a screenshot asserts there is no horizontal page scroll.

## Lighthouse 12, mobile, live URL (before the final a11y fix)
Performance **97**, Accessibility **95**, Best Practices **100**, SEO **91**.
FCP 2.0 s, LCP 2.0 s, CLS 0.048, TBT 0 ms.
Fixed afterwards: `aria-prohibited-attr` (aria-label on a plain span became role="img") and the invalid robots.txt (added `public/robots.txt`, verified live). Not re-measured after these fixes.
Not fixable from the app: cache TTL headers (set by Embarko), and the render-blocking stylesheet (a single 6 KB CSS file).

## Bugs found and fixed during QA
| # | Severity | Bug | Found by | Fix |
|---|---|---|---|---|
| 1 | High | Profile chip and pack strip made the plan page 700 px wide on a 375 px phone | Manual review in the browser | `minmax(0,1fr)` grid columns, chip ellipsis |
| 2 | High | Food sheet inputs overflowed sideways | Manual review | Grid min-width fixes, input width 100% |
| 3 | High | Embarko's injected badge blocked the Plan tab on phones (live only) | Live e2e | Badge gets its own slot in the tab bar via `:has()` |
| 4 | Medium | Cheapest pack sat offscreen in the strip | Manual review | Auto-scroll the selected pack into view |
| 5 | Medium | Slashed-zero body font made "₹7.0" look broken | Visual review | Body font changed to Figtree |
| 6 | Medium | "This week ₹755" vs "₹52/day" looked contradictory | Visual review | Split into "First shop, whole packs" and "Average spend a week" |
| 7 | Low | "Nothing" kitchen label in the chip, "1000 g" instead of "1 kg" | Visual review | Short labels, friendly units |
| 8 | Low | Hooks-order risk in PlanScreen (useMemo after an early return) | Code review | Removed the conditional hook |
| 9 | Low | ARIA prohibited attribute, invalid robots.txt | Lighthouse | Fixed and redeployed |

## Video
`hyperframes check`: **0 errors** (lint, runtime, layout, contrast 40/40, craft, audio). Duration 83.0 s. 1080 × 1920 @30. -18.6 LUFS integrated, -4.1 dBFS peak. Snapshots reviewed at 13 timestamps.

## Not tested
- Real physical phones. Emulation only (Chromium with mobile metrics). **Safari/WebKit was not run.** The CSS `mask` notch uses both `-webkit-mask` and `mask`, and `:has()` is supported from iOS 15.4, but neither is verified on a real iPhone.
- The video hasn't been listened to by a human.
