# Clone Sample Review (24 Nov 2026)

**Voice profiles** (stored locally in `~/.narrareel/voices/`, never committed). Each has consent recorded:
- `siddhant`: NarraReel's cleaned reference from `me.m4a.aifc` (22.8 s). Consent recorded 2026-11-24T06:04:18Z.
- `siddhant-clean`: the same recording after gentle denoise (`highpass 80 Hz, afftdn nr=14`). Consent recorded 2026-11-24T06:04:58Z.

**Recording diagnosis:** lossless 48 kHz/32-bit, 25.3 s, no clipping (peak -11.2 dBFS), but quiet (-31 LUFS) with an SNR of about 16 dB (broadband room noise). NarraReel warned "Background noise" and "Only 39% speech".

**Sample text:** "Hi, I'm Siddhant. Quick question for everyone living on mess food. So I built Protein Recharge, and put it live on Embarko with one prompt." (23 words). Generated with NarraReel `speak`, Chatterbox original on MPS, -16 LUFS.

| Sample | Speaker similarity* | Transcript (Whisper small.en) | Errors | Pace | Length |
|---|---:|---|---|---:|---:|
| Your recording vs itself | 0.991 | n/a | n/a | n/a | n/a |
| Model default voice (different person) | 0.608 | n/a | n/a | 4.64 w/s | n/a |
| A, as recorded, energy 0.5 | **0.868** | "…so I **bit** protein recharge…" | 1 | 3.64 w/s | 7.4 s |
| A, as recorded, energy 0.75 | **0.872** | "Hi, I'm **Siddhan**… So I **bid**…" | 2 | 3.74 w/s | 7.3 s |
| B, denoised, energy 0.5 | 0.809 | exact | 0 | 3.46 w/s | 7.7 s |
| B, denoised, energy 0.75 | 0.831 | exact | 0 | **2.60 w/s** | 10.2 s |

\*Cosine similarity of Chatterbox's own speaker embeddings (VoiceEncoder) against the original recording.

**Reading:** A is closer in timbre but slurs "built" and "Siddhant". B is perfectly intelligible, and at energy 0.75 its pace (2.6 w/s) matches the script's timing budget. Both are far closer to the entrant than the baseline (0.61). The metrics can't judge accent, warmth or naturalness, **which is why the entrant listens before full generation**.

**Provisional recommendation:** B at energy 0.75, pending the entrant's listening review. If B sounds "less like you", the better fix is a re-record in a quieter spot (about 35 dB SNR), not more processing.
