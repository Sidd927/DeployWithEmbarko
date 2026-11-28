# V5 Final: caption-only polish of V4 (28 Nov 2026)

**File:** `video/exports/protein-recharge-v5-final-9x16.mp4`. It's local only and git-ignored because it contains your voice.
- 46.37 s · 1080 × 1920 · 9:16 · 30 fps · H.264 + AAC 48 kHz.
- -13.2 LUFS, -0.96 dBTP, 0 black frames, clean decode, `hyperframes check` 0 errors.

**Platform subtitles:** `video/v5/protein-recharge-v5.srt` (the same 24 cues, at your voice timing).

V4 (`protein-recharge-v4-9x16.mp4`) and every earlier file are untouched.

## The one change
The burned-in captions are **removed**. Nothing else changed:
- **Audio:** bit-identical to V4 (max sample difference 0.0).
- **Picture:** outside the old caption strip, identical apart from encoder noise (mean difference 0.16 / 255).

## Why removal, not a lower position
I measured what sits under a lower caption band (y 1290–1440: below mid-screen, but about 480 px clear of the bottom platform overlays and left of x 888, clear of the Shorts button column) at the start, middle and end of all 24 cues.

The app is full-bleed, so there is no empty strip at the bottom of a phone screen. **20 of 24 cues would cover real UI:**

| Shot | What the band would cover |
|---|---|
| Hook | Food rows with values |
| Equation | The ₹53 "Cheapest to hit goal" pack |
| Landing | "Build my plan" / "Open a sample plan" buttons |
| Setup | The selected "Typical" option and other answer cards |
| Budget payoff | The plate rows rebuilding |
| Skip | The **Don't suggest** button |
| Shopping list | Prices |
| Embarko site | The Copy deployment prompt button, as it scrolls into place |
| Final shots | Buttons below the highlighted line, and the Shopping list button |

Applying the rule "remove the caption for any shot where it conflicts" would leave captions only on the blurred "½ kg" beat and the deploy terminal, 2 of 12 shots, which would look accidental.

The story's facts are on screen in the app itself:
- 37.1 g vs 4.1 g per ₹10
- ½ kg of soya. Every day?
- 109 − 30 = 79 g
- the setup questions
- ₹20 · 37 g short → ₹53 · Goal hit
- Don't suggest
- Weekly shopping list
- `live (success)`
- Free, no sign-up
- Link copied
- the URL card

## Verification
- Captions layer removed from the composition, so no caption can appear at any time.
- Encoded-file contact sheet (every 1.5 s, 31 frames) and per-cue frames: no caption anywhere, no centre text except the designed "½ kg" beat and the end card, which were part of V4's visuals.
- Rings, the deploy clock chip and the end card are unchanged.

## Captions for muted viewers (viewer-controlled, never over the video master)
- **YouTube Shorts:** upload `protein-recharge-v5.srt` as English subtitles.
- **Instagram Reels:** turn **on** auto-generated captions when posting (Advanced settings).
- **X:** attach `protein-recharge-v5.srt` as the video's captions when uploading on the web.
