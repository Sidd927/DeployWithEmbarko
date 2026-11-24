# Recording Your Voice Reference (for NarraReel / Chatterbox)

The clone copies **how you speak** (pace, energy, warmth), not just how you sound. So record it the way you want the video to sound: a confident founder showing something they built. Upbeat, but not shouting.

## What NarraReel requires (from its source: `narrareel/voices.py`)
| Check | Requirement |
|---|---|
| Length | **At least 8 s.** Best is **25–30 s**. Anything over 30 s is trimmed to the cleanest 30 s, and up to 60 s is accepted |
| Clipping | Under 0.1% of samples at full scale. Don't get too close, or too loud |
| Loudness | Speech louder than about -35 dB |
| Background noise | Quiet between words (it copies the noise too) |
| Speech ratio | Talk continuously, with no long pauses |
| File | WAV, M4A or MP3, under 25 MB |

## How to record (about 5 minutes)
1. **Room:** a quiet room with soft furnishings (curtains, bed, clothes), so not a bathroom or an empty hall. Turn off fans and AC, close the window, and silence your phone.
2. **Microphone:** use the MacBook's built-in mic or a wired earphone mic. Sit about **20–30 cm** from the laptop, slightly off-centre so your breath doesn't hit the mic, and keep that distance the whole time.
3. **App:** QuickTime Player → File → **New Audio Recording**. Click the ⌄ next to the record button and choose **Quality: Maximum**. (Voice Memos also works: Settings → Audio Quality → **Lossless**.)
4. **Do a 3-second test** and play it back. It should sound clear, with no hiss or echo.
5. **Record about 30 s** reading the paragraph below once, naturally, with energy. Small stumbles are fine; just keep going. Don't add music or effects.
6. **Save it as:**
   ```
   /Users/siddhant_patil/Projects/DeployWithEmbarko/video/voiceover/private/me.m4a
   ```
   (`.wav` is fine too. This folder is excluded from Git, so it never reaches GitHub.)

## Read this (about 75 words, roughly 28 seconds)
> Hi, I'm Siddhant. I love building things that solve everyday problems. This one is called Protein Recharge. It helps students figure out the cheapest way to hit their daily protein, around mess food, a small budget, and whatever kitchen they actually have. You pick a daily pack, drag the budget, and the plate rebuilds instantly. I built it with Claude Code and put it live on Embarko with a single prompt. Honestly, it was much easier than I expected!

(It covers the product words the clone will need: Protein Recharge, Claude Code, Embarko, budget, plate.)

## Then tell Claude two things
1. That the file is saved.
2. **Your explicit consent**, in your own words, for example: *"This recording is my own voice and I consent to cloning it with NarraReel for this video."* NarraReel's `--i-have-consent` flag requires this, and records the confirmation and its time in the voice's `profile.json`.

## Privacy
- Your recording, the clone profile (`~/.narrareel/voices/…`) and the generated narration all stay on this Mac. Chatterbox runs locally, and nothing is uploaded. The only download is the model, from Hugging Face.
- None of it goes to GitHub: `video/voiceover/private/`, `video/hf/assets/vo*` and the voiced export are in `.gitignore`.
- Delete the voice any time: `narrareel voices` to find it, or remove `~/.narrareel/voices/<id>`.
