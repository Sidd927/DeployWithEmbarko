# Voiceover Quality Report (24 Nov 2026)

**Voiced cut (B):** `video/exports/protein-recharge-final-voiced-9x16.mp4`. Local only and git-ignored until you approve it.
**Unnarrated cut (A):** `video/exports/protein-recharge-demo-9x16.mp4`, the current official version.
**Status:** B is rendered and machine-verified. **It is waiting for your listening approval** before it replaces A as the recommended upload.

## How it was made
- **Your voice:** `me.m4a.aifc` (25.3 s, lossless), cloned zero-shot with NarraReel `clone --i-have-consent` (consent recorded 2026-11-24T06:04:58Z). Profile `siddhant-clean` = your recording after a gentle denoise, chosen by you from four samples.
- **Engine:** Chatterbox original (MIT) on Apple M5 via MPS, through NarraReel's own `speak` pipeline. Energy 0.75 (some segments 0.65 or 0.85 where those takes scored better), speed 1.0× everywhere, each segment normalised to -16 LUFS. Resemble's inaudible Perth watermark is on.
- **Structure:** 14 segments, each placed at its scene's time in the existing HyperFrames timeline (`video/hf/assets/vo/manifest.json`). **No footage was regenerated.**
- **Quality control per segment:** take selection by local Whisper transcript, tails trimmed 0.3 s after the last aligned word, and retakes where a word failed.

## What testing found and fixed
| Issue | Fix |
|---|---|
| First pass: 8 of 14 segments had a mispronounced or garbled word, or trailing sound (one sped to 1.32× by a 2.4 s tail) | Multi-take generation, automatic tail trim, best take chosen by transcript |
| Chatterbox reliably mangled "Claude" (plot/cloud/blog), "Dockerfile" (docket fight), "weekly" (Wiki) and sentence-initial "Try" | Reworded those lines. The on-screen titles still show "Claude Code" and "Dockerfile" |
| Scene-change whooshes partly masked the first word of two lines | Moved those lines 0.35 s and 0.4 s later |
| **Accuracy:** the narration and a subtitle said *you* copied and pasted the Embarko prompt. Claude Code actually fetched and followed it | Corrected the narration, the prompt-scene subtitle and the social and bonus drafts |
| ffmpeg occasionally crashed (signal, exit -5) inside NarraReel's resampler | Automatic retry; the manifest is saved after every segment |

## Final measurements (on the encoded MP4s)
| | A: unnarrated | B: voiced |
|---|---|---|
| Duration | 89.0 s | 89.0 s |
| Video | 1080 × 1920 H.264 @30 | **identical frames** (PSNR ∞ against A) |
| Integrated loudness | -18.6 LUFS | **-13.2 LUFS** (social target about -14) |
| Loudness range | 16.1 LU | **7.5 LU** (even and easy to follow on phone speakers) |
| Peak | -4.4 dBFS | -1.0 dBFS |
| Spoken words found by full-track transcript | n/a | 186 / 188. The 2 "missing" words were present when their windows were transcribed alone (a transcriber artefact) |
| Lines inside their scene windows | n/a | 14 / 14 |
| Narration over the "Goal hit" (37.1 s) and "Live" (71.5 s) pops | n/a | none (silent gaps kept) |
| Speed changes | n/a | none (all segments at 1.0×) |
| Decode check | clean | clean |

## A vs B, judged against the competition criteria
| Criterion | A | B |
|---|---|---|
| Hook | Strong visual hook, muted | Same picture, plus "Hi, I'm Siddhant. Quick question for everyone living on mess food." **Introduces the entrant**, which A couldn't do |
| Ease of following | Titles only | Titles plus a voice that adds context without repeating them |
| Storytelling | Good structure, no human presence | A clearer founder narrative: problem, build, demo, deploy |
| Shows Embarko | Real footage | Same footage, plus a spoken explanation of the prompt, deploy and claim |
| Authenticity risk | None | AI voice clone. **Must be disclosed** (drafts updated, platform AI labels on) |

**Recommendation:** B, provided your listening review is happy with these points.

## What only your ears can judge
1. Does it sound like you? The speaker-embedding similarity of this profile was 0.81–0.83 (your own recording against itself: 0.99; a different person: 0.61).
2. "Siddhant": the transcriber hears "Siddhan" in the final mix. The clone may soften the final "t".
3. Naturalness, accent and energy. Pace is lively, about 4 words a second in most lines, with breathing room between lines.

If any line sounds wrong, tell me which one and I'll retake just that segment and re-render, in about 3 minutes.

## Captions
NarraReel's word timings produced `video/voiceover/protein-recharge-final-voiced.srt` (44 short cues that follow the spoken words). They're **not burned into the picture**: the film already shows large titles, and a second caption layer would clash with them and cover the app UI. Upload the SRT as closed captions on YouTube, and use Instagram's auto-captions if you want on-screen captions.

## Privacy
Your recording, both voice profiles (`~/.narrareel/voices/siddhant*`), every generated take, the narration WAVs and the voiced MP4 are local and git-ignored. None of them were uploaded anywhere. GitHub only has the scripts, the text, the timing data and these reports.
