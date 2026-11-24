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
`hyperframes check`: **0 errors** (lint, runtime, layout, contrast 40/40, craft, audio). Duration 89.0 s (after the post-claim revision). 1080 × 1920 @30. -18.6 LUFS integrated, -4.1 dBFS peak. Snapshots reviewed at 13 timestamps.

## Post-claim verification (24 Nov, after the entrant claimed the app)
| Check | Result |
|---|---|
| `GET /` on the live URL | 200, 0.29 s |
| Embarko "will be deleted" banner | Gone (claimed). Badge still injected, and the tab bar still reserves its slot |
| Live e2e, Chromium (Android, iPhone, desktop) | **31 passed, 2 skipped** |
| Live e2e, **WebKit** (iPhone 13, Safari engine 27.2) | **9 passed, 1 failed, 1 skipped**. The failure is `grantPermissions: Unknown permission: clipboard-write`, a WebKit test-harness limitation, not an app defect |
| WebKit visual check | Voucher notches (CSS mask), badge slot and layout identical to Chromium |
| Unit | **17 passed** (adds the meter regression test, which fails on the old code and passes on the fix) |

## Bug found after the claim
| # | Severity | Bug | Found by | Status |
|---|---|---|---|---|
| 10 | Medium | Meter showed "79 of 79 g · 0 g short" for a 78.8 g plan (rounding in the display) | Frame-by-frame review of the video | **Fixed and deployed** (deploy #5). Unit regression plus e2e regression; **34/34 live Chromium, WebKit 10 passed** |

## Not tested
- Real physical phones. Emulation only. WebKit (Safari's engine) was run after the claim, see above. The CSS `mask` notch uses both `-webkit-mask` and `mask`, and `:has()` is supported from iOS 15.4, but neither is verified on a real iPhone.
- The video hasn't been listened to by a human.
