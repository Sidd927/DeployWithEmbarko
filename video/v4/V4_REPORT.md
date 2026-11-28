# V4 Report: the app is the frame (28 Nov 2026)

**Final candidate:** `video/exports/protein-recharge-v4-9x16.mp4`. It's local only and git-ignored because it contains your voice.
- 46.4 s, 1080 × 1920, 9:16, 30 fps, H.264 + AAC 48 kHz stereo.
- Subtitles: `video/v4/protein-recharge-v4.srt`. Shot plan: `SHOT_PLAN_V4.md`.

v1, v2, v2 real-voice and v3 exports, your recordings and all v1–v3 sources are untouched.

## 1. What fundamentally changed from V3
| | V3 | V4 |
|---|---|---|
| Product footage | One 1000 × 850 card at the top of an ink stage, **41% of the frame**; the rest empty | **Full-bleed: the live app fills 100% of the frame** in every product shot |
| UI scale | 2.56 output px per CSS px (shrunk) | **3.0–3.9 px per CSS px**: text is 17–52% larger than V3 |
| Source | Re-used 390-wide phone captures (9:19.5) | **New purpose-built captures**: 9 shots, an exact 9:16 phone viewport, 4.5× density |
| Opening | Designed typographic stat card | **The real Foods ranking**, soya row ringed at frame 0, the real list scrolling to whey on "nine times" |
| Setup | One clip at 1.9× | **Four hard cuts on four words** (weight / diet / kettle / mess meals), each showing the real answer being entered |
| Budget payoff | Drag shot inside the card | **Full-frame:** ₹20 with the meter **red "37 g short"** → a real drag, rows rebuild → **green "79 of 79 g · Goal hit" at 26.27 s, on "₹53"**, ring + push |
| Deploy | Real terminal from 0:13; ended at "live" | **The same real recording from its first command**, pre-sped 13.09× with exact timestamps. It rises from `tar`/`curl` to `live (success)` on your word "live" (39.63 s vs 39.70 s). Then a **cut to the live URL loading** and a ring on the app's own "Free, no sign-up" |
| CTA | Haldi card | **The app's real Share plan → "Link copied"** on "Send this to your gym friend", then a full-frame haldi end card |
| Captions | White text in an ink lane under the card | Same text and timing, in a **compact ink pill hugging the words** at y 1114–1240, the bottom of the Reels/Shorts text-safe area. Every shot is framed so its key numbers sit above it |

**Kept unchanged:** your real voice (same 15 clips, same timeline), the script, the story order, the SFX palette (each hit now tied to a real tap or event), the brand colours and type, and the caption text and timing.

## 2. Capture method and why
**The live app (and embarko.ai), recorded with Chrome's screencast at a 360 × 640 CSS-px phone viewport (exactly 9:16) at 4.5× device density (1620 × 2880 frames), one purpose-built recording per shot.** `video/v4/capture_v4.mjs`
- **9:16 at the source** means every shot fills 1080 × 1920 with no letterboxing or empty stage.
- **360 px** is the narrowest common phone width. The app's own responsive phone layout renders its **largest** text there, and one screen still holds the complete budget story (budget value, slider, note, meter, rows).
- **4.5× density** keeps the 1.08–1.38× close-ups (equation, landing headline, diet question) sharp without upscaling.
- **One recording per shot**, prepared in its exact state first (sample plan loaded, budget preset to ₹20, scroll positions set, the unclaimed-app banner and the sample notice hidden). Each clip logs its event times (`marks.json`), so the edit can put real taps and scrolls on your words.
- **The deploy shot reuses the genuine recording.** `capture.mjs` ran the real `tar` + `curl` deploy and polled the real status endpoint every 10 s. A new deploy was not made: you asked not to redeploy unnecessarily.

## 3. Experiments performed
1. **Viewports.** I tested 390 × 693, 360 × 640 and 430 × 764, plus the full-page plan layout. 360 won on text size and on fitting the budget story in one screen; 430 was the smallest UI.
2. **Capture smoothness at 4.5×.** Frame gaps measured 16.7 ms (60 fps) during motion. The long gaps are only static holds.
3. **Caption treatments over real UI:**
   - **Shadow only:** unreadable.
   - **Full-width soft band:** readable, but in the rendered video it read as a heavy dark stripe over the light UI.
   - **Compact pill:** chosen.
4. **Hook framing:**
   - **1.15×:** cropped "oods and prices".
   - **1.08×, centred:** chosen. The rings were then narrowed to sit inside the frame; at first only their top and bottom edges showed.
5. **Diet close-up:**
   - **1.2×, centred:** cut the question title.
   - **Left-anchored:** chosen.
6. **Landing:**
   - **1.0×:** the caption pill sat on the dark "Build my plan" button.
   - **1.2–1.3×:** clipped the paragraph.
   - **1.10–1.13×, left-anchored:** chosen.
7. **Deploy:**
   - **13× playback inside the editor:** the preview showed "building" when "live" was due.
   - **Pre-spedding the real recording with ffmpeg (deterministic):** fixed it.
   - **Clock chip and live framing:** reworked three times.
8. **URL chip on the live-page shot:** dropped, because it sat on the hero headline. The ringed `Live: https://protein-recharge.embarko.app` line cuts straight to that page loading.
9. Three renders, each reviewed on the encoded file with a 1.5 s contact sheet and phone-size (390 px) frames.

## 4. Visual improvements achieved (measured on the encoded file)
- Product shots fill **100%** of the frame (V3: 41%).
- **Frozen seconds** (whole-frame change < 0.1): **0**.
- **Near-static seconds** (< 0.6): V4 **10 / 46**, V3 **31 / 46**, on the same whole-frame metric.
- Goal hit on "₹53" (26.27 s). "live (success)" on "live" (39.63 s).
- `hyperframes check`: **0 errors, 0 Reels/Shorts safe-area flags**. No caption overlaps; captions never cover the key numbers of a shot.

## 5. Final file
`video/exports/protein-recharge-v4-9x16.mp4`

## 6. Duration and technical specs
- **Video:** 46.37 s · 1080 × 1920 · 9:16 · 30 fps · H.264 yuv420p.
- **Audio:** AAC 48 kHz stereo · 19.7 MB.
- **Loudness:** -13.2 LUFS integrated, -0.96 dBTP, LRA 2.4.
- **Silence and black:** 0 black frames; only silence is the 1.1 s end-card hold.
- **Captions:** 24 cues; line starts 0.00 s median from your voice onset. The one exception, +0.32 s, is deliberate: the first caption is on screen from frame 0 for the hook and thumbnail.
- **Voice:** all 15 lines intelligible in the final mix.

## 7. Honest assessment
**Judged as a viewer:** V4 is a different class of video from V3. On a phone, every product moment is the app at full screen and full size, and real taps land on your words. The budget sequence reads as a story: **₹20 · red "37 g short" → drag → rows rebuild → green "Goal hit" at ₹53**. The deploy is true from first command to live URL. It no longer looks like a recording in a box.

**Remaining weaknesses:**
- **Frame 0 is less graphic than V3's designed stat card.** It's the real ranking with soya ringed and the caption, which is more authentic but a quieter thumbnail. For the Instagram grid, `cover-v3-reels-1080x1920.png` is still the stronger cover.
- **The caption pill covers a strip of secondary UI** (e.g. the price line under "Roasted peanuts" at the start, the first plate row during the drag). It never covers a shot's key number, but it does sit on app content.
- **The deploy clock chip briefly overlaps a command line** as the log rises past it (about 0.5 s). The bottom ~40% of that one shot is empty terminal, because the real log is only that long.
- The bottom tab bar and Embarko badge sit in the platform-UI zone: that's authentic app chrome, partly hidden by Instagram's own overlay.
- **The setup goal question (Q2) is cut,** because the voice doesn't mention it; the four shown answers are real.
- Line 15 still transcribes as "gym freak now" (how it was spoken; the caption reads "friend").
- **Not yet done: a human watch with sound on a phone.**
