# NarraReel Setup Report (24 Nov 2026)

## What NarraReel actually does (from its source, commit `29eb3d3`)
- `narrareel clone <file> --name … --i-have-consent` decodes the recording with ffmpeg and checks it. The checks are: length ≥ 8 s, clipping, speech above -35 dB, background noise, and speech ratio. It then trims silence, keeps the cleanest 30 s, and normalises to -20 LUFS. It saves `~/.narrareel/voices/<id>/{reference.wav, profile.json}`. **Consent is mandatory** and is stored with a timestamp. Cloning is zero-shot, with no training step.
- `speak` uses Chatterbox **original** (0.5B) on Apple Silicon via MPS. Energy maps to `exaggeration` = 0.3 + 0.6e and `cfg_weight` = 0.6 − 0.3e, with a fixed seed per voice so the voice stays consistent across sentences. Speed is a post time-stretch. Output: `voice.wav` and `voice.mp3` (48 kHz, loudness-normalised), `words.json` and `captions.srt`.
- Chatterbox has no native word timings. "Aligned" timing uses faster-whisper on an in-memory array.
- Resemble AI's **Perth watermark** is always on. We saw "loaded PerthNet (Implicit)" at load time.
- README caveat: the clone engine is "verified with a stand-in model in tests", and MPS is "not verified by the maintainers". **We verified it on this Mac (below).**

## Installation (isolated, nothing in our app's dependencies changed)
| Item | Value |
|---|---|
| Location | `~/tools/NarraReel` (outside our repository) |
| Python | Homebrew 3.12.13, venv `~/tools/NarraReel/.venv` (1.4 GB) |
| Installed | `pip install -e ".[clone,align]"`: chatterbox-tts 0.1.7, torch/torchaudio 2.6.0, faster-whisper 1.2.1, resemble-perth 1.0.1, setuptools 80.10.2 (<81, as required) |
| Model weights | ResembleAI/chatterbox (MIT), about 3 GB in `~/.cache/huggingface/hub` (download plus first load took 254 s) |
| Hardware | Apple M5, 16 GB RAM, 445 GB free disk. `torch.backends.mps.is_available() = True` |
| `narrareel doctor` | NarraReel, Python, ffmpeg, ffprobe, Edge voices and Chatterbox OK. **libass FAIL** (this ffmpeg lacks it). That only blocks NarraReel's caption *video* rendering, which we don't use: our HyperFrames project renders the picture |

## Verification with the real model (no cloning: model's built-in voice)
| Test | Result |
|---|---|
| Load on MPS | ✅ 24 kHz, watermarker loaded |
| Generate (energy 0.5) | 3.32 s audio in 27.7 s (first call) |
| Generate (energy 0.8) | 3.48 s audio in 18.0 s (~5× real-time) |
| Intelligibility (Whisper small.en, local) | ✅ Both: "So I built protein recharge and put it live on Embarko with one prompt." (14/14 words) |
| Pace | ⚠️ 4.4–4.6 words/s with the default voice, faster than natural narration (about 2.5–3). A clone follows the reference's pace. If it's still fast: NarraReel `speed` 0.85–0.9 and/or higher energy (lower cfg_weight) |

## Issue found
- `faster-whisper 1.2.1` + `PyAV 19`: `WhisperModel.transcribe(<file path>)` crashes (`av.open() got an unexpected keyword argument 'metadata_errors'`). **NarraReel isn't affected**, because its aligner passes NumPy arrays. Our own evaluation script decodes with ffmpeg and passes arrays too.

## Our integration
- `video/voiceover/segments.json`: 14 timed segments from FINAL_VOICEOVER_SCRIPT.md.
- `video/voiceover/make_vo.py`: runs with **NarraReel's interpreter** and calls its `speak` pipeline in-process (the model loads once). Each segment is normalised to -16 LUFS. If the natural delivery overruns its scene window, NarraReel fits it (pauses first, then speed). It writes `video/hf/assets/vo/seg*.wav` and `manifest.json`, with word-timed caption cues.
- `video/hf/build.py`: when `assets/vo/manifest.json` exists, it places each segment at its scene time. Effects drop to 45% under the voice, except the "Goal hit" and "Live" pops, which land in the silent gaps. It also writes `video/voiceover/protein-recharge-final-voiced.srt` from the spoken words.
- Private, git-ignored: `video/voiceover/private/` (recording, generated segments, samples), `video/hf/assets/vo*`, and the voiced export. The clone profile lives in `~/.narrareel`, outside the repository.
