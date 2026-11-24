# Shot list (all footage captured by `scripts/capture.mjs`)

| Clip | Source | Device | What happens | Used at |
|---|---|---|---|---|
| hook.mp4 | live app, landing | 390 × 844 @3x | finger drags the demo budget ₹20 → ₹62 | 0–5 s (1.25×) |
| packs.mp4 | live app, sample plan | same | equation, pack strip scroll, taps ₹29 then ₹53 | 5–10.5 s (0.25×, freeze-like), 23.8–31.1 s |
| setup.mp4 | live app | same | five-question setup tapped through | 14–23.8 s (1.25×) |
| slider.mp4 | live app (recaptured 24 Nov, lands exactly on ₹53) | same | budget ₹12 → ₹53, meter turns green at 6.37 s | 31.1–41.9 s |
| exclude.mp4 | live app | same | tap soya, Don't suggest, close, re-planned plate | 41.9–50.7 s |
| list.mp4 | live app | same | Shopping list button, weekly list, scroll | 50.7–56.2 s (1.2×) |
| embarko.mp4 | https://embarko.ai | same | scroll to and tap "Copy deployment prompt" | 56.2–61.9 s |
| live.mp4 | the **claimed** live app loaded by URL, nothing hidden | same | page loads, scrolls to the demo voucher | 76–82 s |
| deploy.mp4 | real `POST ship.embarko.ai/apps`, output streamed live | same | tar → upload → building → live (success) | 61.9–76 s (3×) |

Notes on authenticity:
- App footage comes from **https://protein-recharge.embarko.app**. Embarko's temporary "will be deleted in N hours" banner, which only shows while an app is unclaimed, is hidden in product shots. Embarko's badge is left as it is.
- The deploy clip is a real redeploy executed during recording (24 Nov 2026, 04:24 UTC). The terminal view prints the real command and the real responses as they arrive. Responses are in `video/footage/deploy-log.jsonl`.
- The embarko.ai clip is the real site. The clipboard text copied during capture is saved in `video/footage/embarko-copied-prompt.txt`.
