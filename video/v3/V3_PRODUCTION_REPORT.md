# V3 Production Report: the creator cut (28 Nov 2026)

**Final file:** `video/exports/protein-recharge-v3-9x16.mp4`. It's local only and git-ignored because it contains your voice.
- Duration 46.4 s, 1080 × 1920, 9:16, 30 fps, H.264 + AAC 48 kHz.
- Subtitles: `video/v3/protein-recharge-v3.srt`.
- Covers: `video/exports/cover-v3-reels-1080x1920.png` and `video/exports/thumbnail-v3-youtube-1280x720.png`.

No earlier version was touched. These files keep their original sizes and timestamps:
- `protein-recharge-v2-real-voice-9x16.mp4`
- `protein-recharge-v2-9x16.mp4`
- `protein-recharge-final-voiced-9x16.mp4`
- `protein-recharge-demo-9x16.mp4`

The voice clips, the recording and the v2 sources are also unchanged. v3 reads copies.

## What changed and why
The full audit is in `AUDIT_V3.md`.

| v2 problem | v3 answer |
|---|---|
| Boxed captions sat on top of app data in 5+ shots | **A caption lane on the stage, under the screen card.** Captions can't touch the UI by construction. They're plain white subtitles with key words (numbers, ₹, soya, whey, goal, live) in haldi, and no boxes |
| One light-grey look for 47 s felt like a screen-recording slideshow | **An ink stage with one persistent screen card.** App content settles in like a feed scroll. Full-screen typographic beats ("½ kg of soya. Every day?", the brand stamp) and a full-bleed terminal change the rhythm |
| Frame 0 was an app list with a small chip | **A designed real-data hook at frame 0:** "Protein you get for ₹10 · Soya chunks **37 g**", then the whey row lands with a tiny bar and a **9×** stamp on "nine times" |
| The "₹53 a day" chip covered "Your daily top-up" at the payoff | The camera frames the budget value, slider and meter together. The goal hit is a **haldi border flash on the card**, with nothing drawn over the UI |
| Static stretches (6 frozen seconds) | Every beat has a reason to move: slow pushes on all shots and type, and rings that follow the voice ("thirty grams" → **30 g**, "over a hundred" → **109 g**, both from the app's own screen). A real-time deploy clock ticks in the terminal chip. **0 frozen seconds** |
| The deploy shot didn't match the rest | Full-bleed terminal on the same ink colour, a soft top fade, and a ring on `live (success)` + the live URL |

Kept from v2: your real voice (all 15 lines, light cleanup), the real footage and honest data, the story order, and the brand system. One new capture, `slider2.mp4`, comes from the live app with the same drag, framed so "Daily budget ₹N" stays in view.

## Mini-story and timeline (seconds)
| Time | Beat | Visual |
|---|---|---|
| 0.0–4.4 | **Hook**: the surprising fact | Full-screen comparison: soya 37 g vs whey 4 g per ₹10, 9× stamp |
| 4.4–6.6 | **Proof** | The real Foods ranking scrolls down to whey, ringed |
| 6.6–9.7 | **Turn** | "½ kg of soya. Every day?" |
| 9.7–15.1 | **Problem** | The app's own equation 109 g − 30 g = 79 g, with voice-timed rings |
| 15.1–18.2 | **Reveal** | Haldi brand stamp |
| 18.2–21.7 | **Setup** | Real 5-question setup at 1.9× |
| 21.7–29.0 | **Payoff** | Budget drag. The plate rebuilds and the meter turns **green at 26.4 s**, on "At ₹53 a day" |
| 29.0–35.0 | **Depth** | Skip a food → new plan; weekly shopping list |
| 35.0–41.3 | **Ship** | embarko.ai, then the real deploy at 9×. `live (success)` at 39.5 s, with the clock at 0:37 of real time |
| 41.3–46.4 | **CTA** | Haldi URL voucher, #DeployWithEmbarko, credit. The video ends 1.8 s after your last word, so the loop restarts quickly |

## QA on the encoded file
| Check | v2 real voice | **v3** |
|---|---|---|
| Duration | 47.8 s | **46.4 s** (≥ 40 s) |
| Format and decode | 1080×1920, 30 fps, clean | 1080×1920, 30 fps, **clean, 0 errors** |
| Loudness / true peak | -13.1 LUFS / -1.00 dBTP | **-13.2 LUFS / -1.02 dBTP**, LRA 2.5 |
| Black frames | 0 | **0** |
| Silences over 1 s | none | only the 1.8 s end hold |
| Frozen seconds (frame change < 0.1) | 6 (s 5, 7, 17, 38, 40, 46) | **0** |
| Captions over app UI | 5+ shots | **0, by construction** |
| Caption overlaps / sync | none / 0.12 s max | **none / line starts 0.00 s median, 0.12 s max** (measured against voice onset in the mix) |
| `hyperframes check` | 0 errors | **0 errors, 0 Instagram Reels / YouTube Shorts safe-area flags** |
| Lines intelligible | 15/15 | **15/15** (Whisper on the final mix; misreads below) |

**Visual QA:**
- A frame-by-frame contact sheet every 1.5 s, plus phone-size (390 px wide) checks of the payoff, deploy and skip shots.
- **Fixed during QA:**
  - The camera push cropped "Daily budget ₹53" at the payoff.
  - The hook's "4 g" overlapped the source line.
  - The end credit and brand name sat on the Shorts right edge.
  - Slow pushes nudged hook text past the Reels left edge.
  - The voice-timed ring didn't render (a script error).
  - The terminal's top line was cut in half.
  - The brand panel and deploy end were frozen.

**Accuracy:**
- Every number shown is from the app: 37.1 → "37 g", 4.1 → "4 g", 9.05× → "9×"; ₹53 → 79 of 79 g; 109 g − 30 g = 79 g.
- The deploy clock is the recording's own elapsed time. "live (success)" appears at media 37.17 s, which I measured independently.

**Audio:**
- Your voice is at full level. The light cleanup is unchanged from v2: 80 Hz high-pass, light denoise, de-esser, 2:1 compression, no pitch or time changes.
- SFX are restrained, each tied to an on-screen event: 9× stamp, two whooshes, brand pop, goal riser + pop, hashtag pop, URL ticks. They're from HyperFrames' bundled library. There's **no music in the file**: add platform-native music in the app if you want it (see the platform package).

## Known limitations (honest)
- **Line 15 ("Send this to your gym friend.") transcribes as "gym freak now"** in both Whisper models and in both of your takes. The audio isn't clipped: it fades out naturally over 300 ms. That's how the word came out in the recording. The caption shows "gym friend". **Listen at 43.2–44.7 s**; if it bothers you, re-record that one line.
- Short-window misreads that read correctly in context: "so Algernes" for "soya chunks" and "Mesh Foods" for "Mess food".
- Below y ≈ 1140 the frame is plain ink on purpose: Reels and Shorts put the username, caption and buttons there. On a phone that area is covered by the platform UI.
- Not machine-checkable: how it *feels*. Watch it once on your phone with sound.
