# V2 Creative Audit and Concept Selection (27 Nov 2026)

Baseline audited: `video/exports/protein-recharge-final-voiced-9x16.mp4` (89 s, cloned voice), plus the unnarrated cut, all footage in `video/footage/`, the HyperFrames project `video/hf/`, the NarraReel pipeline and every doc. **Nothing in v1 is modified; v2 lives in `video/v2/` with new filenames.**

## 1. Measured, not guessed
| Measurement (on the encoded v1 file) | Result | Why it matters |
|---|---|---|
| Seconds where the picture barely changes (mean frame difference < 0.6, sampled at 10 fps) | **54 of 88 s** | Static stretches are where people swipe. Worst: packs 25–30 s, list 45–55 s, deploy terminal 66–74 s |
| Motion in seconds 0–2 | 0.7–1.2 (low) | The hook is a slow drag inside a small window |
| First spoken words | "Hi, I'm Siddhant. Quick question for everyone living on mess food." | Spends the most valuable second on a name nobody knows |
| Product size on screen | The phone window is 960 × 1124 inside a 1080 × 1920 frame, with UI at about 82% of its real size | Readable, but never *big*. There are no punch-ins on the moment that matters |
| Length | 89 s | Instagram judges seconds *and* % watched. 89 s halves the share of people who finish |

## 2. Audit
**Genuinely strong (keep):** real product footage throughout. The slider moment (the meter turns green at "Goal hit at ₹53 a day"). The honest real-deploy clip. A distinctive brand system (haldi voucher, Bricolage). A clean, licence-safe soundtrack. Accurate claims.

**Mediocre:** titles that restate what the voice says. A tour-like structure (questions → packs → slider → exclude → list), roughly the app in chronological order. The Embarko section runs 20 s (prompt + terminal + claim) inside an 89 s video.

**Actively hurting retention:**
1. The name-first opener, which violates the new brief.
2. 54 static seconds.
3. The hook asks a question ("Enough protein?") but doesn't show anything surprising.
4. 89 s is too long for a cold audience.
5. The narration reads like a script ("mathematically the cheapest mix"), and the cloned voice is fast in places (~4 words/s).

**Remove:** "Hi, I'm Siddhant" as the opener, the 3.5 s haldi brand card, the 6 s "No Dockerfile" beat, the 7 s packs tour, most of the static terminal.

**Rebuild:** the hook (a surprising, provable fact), the pacing (cut to the voice, ~45–50 s), the framing (full-bleed product with punch-ins), and the text (VO-synced captions instead of separate titles).

**Reuse:** setup, slider, exclude, list, embarko, deploy and live footage (all real, 3× resolution, so punch-ins up to ~1.6× stay sharp), the brand fonts and colours, the sound effects, the NarraReel voice pipeline, the capture script.

**New assets needed:** a capture of the Foods ranking scrolling from soya (top) to whey (near the bottom), and a new conversational script. Optionally, **your own fresh voice recording** (see §4).

## 3. Concepts explored
| # | Concept | Hook (first 2 s) | Strongest moment | Weakness | Retention (qualitative) |
|---|---|---|---|---|---|
| 1 | **Answer-first** | Meter snaps to green: "₹53 a day. 79 g protein." | The drag | The answer up front removes curiosity | Medium |
| 2 | **The ₹10 test** (contrarian fact, then product) | Real ranking: soya **37 g per ₹10** vs whey **4 g**. "Per rupee, soya chunks give you 9× the protein of whey." | Fact → "but nobody eats half a kilo of soya" → app finds the real plan → meter goes green | Must stay precise ("per rupee", "typical prices") | **High**: surprising, provable, **sendable** to a gym friend |
| 3 | Recharge-ad parody | Indian telecom-ad style "₹53 plan: 79 g/day" | Cultural recognition | Gimmick, less product; can read as an ad | Medium-high in India, low elsewhere |
| 4 | Hostel POV mini-story | You at a mess plate, "this is 15 g of protein" | Human relatability | Needs live-action filming by you; 3 days left | High, but not feasible to do well in time |
| 5 | Influencer diet vs optimiser | "₹200/day influencer diet vs ₹53" | Big contrast | Needs an invented "influencer plan", which is misleading | Rejected (accuracy) |
| 6 | Talking-head creator + screen | Your face, a fast claim | Trust | Needs filming; a voice-only version is weaker | High if filmed |

**Selected: Concept 2, "The ₹10 test"**, with one beat borrowed from #1: the meter turning green is the payoff.
- It opens on a surprising **fact proven inside the real app** (not a claim over stock footage), so the first frame is product *and* hook at once.
- The fact creates a problem the product solves ("you can't live on soya, so what's the cheapest *real* plan?"). The story is cause and effect, not a feature tour.
- It's the most *sendable*: "send this to the friend spending ₹2,000 on whey".
- It works muted (big captions) and globally (rupees are local, but the idea is universal).
- Concepts 4 and 6 would be stronger with a face, but they need filming that the timeline and environment can't guarantee. If you film a 3-second face clip, it slots in at 0:00 (see the recording kit).

## 4. Voice options, evaluated
| Option | Verdict |
|---|---|
| **A. Fresh recording of your real voice** | **Best for authenticity and natural cadence**, if recorded properly. Your first recording had only ~16 dB SNR (room noise), so the recording kit fixes the environment. You'll need to record it, and the pipeline accepts it by just dropping files in |
| B. Enhance your recording | Gentle chain (high-pass 80 Hz, light FFT denoise, de-ess, 2:1 compression, -16 LUFS). Used automatically on your takes |
| C. Your voice clone (NarraReel/Chatterbox) | Works now, and you approved it, but it can't fix itself: lively ~4 w/s pace, some mispronunciations, a slightly read-aloud feel. **Used for the v2 build today, with a rewritten conversational script**, so a complete v2 exists without waiting on you |

Decision: build v2 now with the clone and the conversational script. Make the voice track swappable, so your real takes replace it with one command. Recommend A if you can record in a quiet room before posting.
