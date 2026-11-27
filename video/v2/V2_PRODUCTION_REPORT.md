# V2 Production Report: "The ₹10 Test"

**Final v2 video:** `video/exports/protein-recharge-v2-9x16.mp4` (local, git-ignored: it contains the cloned voice).
**v1 is untouched:** `protein-recharge-final-voiced-9x16.mp4` and `protein-recharge-demo-9x16.mp4`, unchanged, as the rollback.

## A. Original video audit
Full detail is in `AUDIT_AND_CONCEPTS.md`. In short: v1 was accurate and well branded, but **54 of 88 seconds were nearly static** (measured). It opened on a name, the product stayed small, and at 89 s it was long for a cold audience. Strong and reused: the real footage, the slider moment, the honest deploy clip, the brand system.

## B. Creative direction
**"The ₹10 test."** It opens on a surprising fact proven inside the real app (soya 37.1 g vs whey 4.1 g per ₹10, a 9.05× ratio at the app's typical prices). That raises the problem ("nobody eats half a kilo of soya"), which the product solves, ending on the meter turning green at ₹53/day. It was chosen over answer-first, recharge-parody, hostel-POV, talking-head and before/after concepts. It's the most *sendable* (Instagram's strongest signal for reaching non-followers), proves its own claim on screen, works muted, and needs no filming you can't do by 30 Nov. The before/after concept was rejected because it would need an invented comparison plan.

## C. Final script (15 lines, 45.7 s)
| # | Line | Delivery note |
|---|---|---|
| 1 | Per rupee, soya chunks give you nine times the protein of whey. | Sharing a surprising fact; lean on "nine times" |
| 2 | Whey is way down the list. | Light, a small smile on the pun |
| 3 | But nobody's eating half a kilo of soya every day. | Turn |
| 4 | Mess food gets you maybe thirty grams. If you work out, you need over a hundred. | The problem, plain |
| 5 | So I built an app that does the math for you. | The reveal |
| 6 | Your weight, your diet, your kettle, your mess meals. | Brisk list |
| 7 | Now drag your budget. | Invitation |
| 8 | Watch the plate rebuild as you go, | Building |
| 9 | and at fifty-three rupees a day, you actually hit your goal. | **Payoff**, lands as the meter turns green |
| 10 | Skip any food you don't like, and it finds a new plan instantly. | Confident |
| 11 | Then it writes your shopping list. | Quick |
| 12 | I put it online with Embarko. | Matter-of-fact |
| 13 | My coding agent followed one prompt, and it was live in under a minute. | Accurate: Claude Code followed Embarko's prompt |
| 14 | It's free, with no sign-up. | Warm |
| 15 | Send this to your gym friend. | Call to action that asks for the send |

Lines that changed after testing the clone: "Paneer is even worse" (the clone couldn't say "paneer") became "Whey is way down the list". "If you train" (heard as "brain") became "If you work out". "It rebuilds" (heard as "remains") became "Watch the plate rebuild". "Don't like soya? … re-plans" (garbled) became "Skip any food you don't like…".

## D. Timeline (seconds, encoded file)
| Time | Visual | Narration | Treatment |
|---|---|---|---|
| 0.0–4.0 | Real Foods ranking held on soya, **ringed** with the "37 g vs 4 g per ₹10" chip, **visible at frame 0** | Lines 1 | Frame 0 doubles as the thumbnail; slow 1.06× push |
| 4.0–6.2 | Real scroll down to whey/paneer; whey ringed | 2 | Scroll at 1.45× |
| 6.2–8.4 | Kinetic type "½ kg of soya a day?" on steel | 3 | Pattern break, wipe-in, whoosh |
| 8.4–13.2 | The app's own equation: 109 g − 30 g = 79 g | 4 | Slow push |
| 13.2–20.3 | Brand stamp (haldi) → real setup at 1.9× | 5–6 | Pop on the stamp |
| 20.3–28.0 | **Wow:** budget drag, plate rebuilds, meter 42 → 74 → **79 · Goal hit** at 24.95 s, "₹53 a day" chip | 7–9 | Slider at 1.246×, solved so green lands on "fifty-three rupees"; riser crests on the pop |
| 28.0–31.9 | Food sheet → Don't suggest → new plan | 10 | 1.25× |
| 31.9–33.9 | Weekly shopping list | 11 | 1.4× |
| 33.9–35.8 | Real embarko.ai with "Copy deployment prompt" | 12 | Whoosh in |
| 35.8–39.5 | Real deploy at 9×, ends on **live (success)** + live URL, ringed | 13 | "Real deploy, 9× speed" label |
| 39.5–45.7 | End card: URL types in, #DeployWithEmbarko, credit, AI-voice disclosure | 14–15 | Ticks, pop on hashtag |

Captions: brand-style word-timed cues (2–6 words) at y 1040–1200, inside the Reels/Shorts safe band, with key words (₹, numbers, soya, whey, goal) on haldi.

## E. Voiceover
- **Used:** your approved clone (`siddhant-clean`, NarraReel + Chatterbox, local), with **15 lines × 3 takes**, the best kept by local transcription, and 6 lines rewritten after the takes failed.
- **Compared with v1's voice:** same voice. The difference is a conversational script, shorter lines, and no read-aloud phrases ("mathematically the cheapest mix" is gone). Every line in the final mix transcribes correctly.
- **Recommended upgrade:** your **real** voice via `RECORDING_KIT.md`. It's more natural than any clone, and with the room fixes it will also be cleaner than your first recording (~16 dB SNR). Record it and Claude rebuilds v2 automatically.

## F. What was created
`video/v2/` with `build_v2.py` (a narration-driven HyperFrames builder), `segments_v2.json`, the `hf/` project, the captions SRT, the audit, the recording kit and this report. New capture: `rank.mp4` (the live app's Foods ranking). New covers: `cover-v2-reels-1080x1920.png`, `thumbnail-v2-youtube-1280x720.png`. Generator upgrades in `make_vo.py`: segment-file and output arguments, and number-aware scoring. No app change and no redeploy.

## G. Final video
`video/exports/protein-recharge-v2-9x16.mp4`

## H. Quality assurance (on the encoded file)
| Check | v1 (voiced) | **v2** |
|---|---|---|
| Duration | 89.0 s | **45.7 s** (≥ 40 s rule ✅) |
| Format | 1080 × 1920, 30 fps, H.264/AAC | same |
| Near-static seconds | 54 / 88 (61%) | **13 / 45 (29%)** |
| Opening | "Hi, I'm Siddhant" | **Fact + ringed proof at frame 0** |
| Loudness | -13.2 LUFS, LRA 7.5 | **-13.1 LUFS, LRA 2.6**, peak -1.0 dBFS |
| Black frames | 0 | **0** |
| Narration intelligibility | 186/188 words | **15/15 lines correct** |
| Goal-hit sync | ±0.1 s | meter green at 24.95 s on "fifty-three rupees" |
| `hyperframes check` | 0 errors | **0 errors** |

Fixed during QA:
- Punch-ins that cropped "37.1 g", "109 g" and "Goal hit" (zoom capped at about 1.07).
- The highlight ring landing on the wrong row while the list scrolled.
- Overlapping captions.
- The caption over the brand name.
- The deploy shot ending before "live".
- The terminal URL hidden under a caption.

**Not done: a human listening pass of v2 with sound.** Please watch it once on your phone.

**Second creative review:**
- *Would I stop scrolling?* Yes for gym and hostel audiences: frame 0 is a number that contradicts common practice.
- *Watch it all?* 45 s with a payoff at 25 s and the meter as a visual reward. The Embarko section is the likeliest drop point, but it's 6 s and required.
- *Better than v1?* Yes on every measured axis.

## I–J. Platform deliverables and reach strategy
`submission/V2_PLATFORM_PACKAGE.md`

## K. Your required actions
1. Watch v2 with sound. Optionally record your real voice (`RECORDING_KIT.md`).
2. Post the Instagram Reel, YouTube Short and X post using the package (AI labels on, #DeployWithEmbarko, app link).
3. Keep the v1 posts public.
4. Resubmit with **all** post links (same email and phone) before 30 Nov, 11:59 PM IST.

## L. Submission update plan
In `submission/V2_PLATFORM_PACKAGE.md` → "Updating the competition submission".
