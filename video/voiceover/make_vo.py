"""Generate the narration, one segment per scene, with NarraReel's own speak pipeline.

Run with NarraReel's isolated interpreter (never our project's):
    ~/tools/NarraReel/.venv/bin/python video/voiceover/make_vo.py --voice <voice-id> [--energy 0.65] [--only 03,06b]
    ~/tools/NarraReel/.venv/bin/python video/voiceover/make_vo.py --voice <voice-id> --sample   # one test line

Outputs (all git-ignored, personal voice data):
    video/voiceover/private/segments/<id>/{voice.wav,voice.mp3,words.json,captions.srt}
    video/hf/assets/vo/seg<id>.wav and video/hf/assets/vo/manifest.json (read by video/hf/build.py)
"""
from __future__ import annotations

import argparse, json, os, shutil, sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
PROJECT = HERE.parents[1]
PRIVATE = HERE / "private"
ASSETS_VO = PROJECT / "video" / "hf" / "assets" / "vo"
LUFS = -16.0   # every segment normalised to the same loudness
MAX_WORDS_PER_CUE = 6


def cues_from_words(words: list[dict]) -> list[dict]:
    """Group word timings into short caption lines that end at punctuation or 6 words."""
    cues, cur = [], []
    for w in words:
        cur.append(w)
        t = w["text"].rstrip()
        if len(cur) >= MAX_WORDS_PER_CUE or t.endswith((".", "?", "!")) or (t.endswith((",", ":")) and len(cur) >= 3):
            cues.append({"start": round(cur[0]["start"], 3), "end": round(cur[-1]["end"], 3),
                         "text": " ".join(x["text"] for x in cur).strip()})
            cur = []
    if cur:
        cues.append({"start": round(cur[0]["start"], 3), "end": round(cur[-1]["end"], 3),
                     "text": " ".join(x["text"] for x in cur).strip()})
    return cues


def caption_words(words: list[dict], say: str, text: str) -> list[dict]:
    """Words come from what the voice said; show the real spelling in captions when only spelling differs."""
    sw, tw = say.split(), text.split()
    if say == text or len(sw) != len(tw) or len(words) != len(tw):
        return words
    return [{**w, "text": t} for w, t in zip(words, tw)]


def trim_tail(wav_path: Path, words: list[dict], pad: float = 0.3) -> float:
    """Cut anything more than `pad` s after the last aligned word (Chatterbox sometimes adds a breath or
    mumble), with a 40 ms fade. Returns the new duration."""
    import numpy as np
    import soundfile as sf

    x, sr = sf.read(wav_path, dtype="float32")
    if not words:
        return len(x) / sr
    end = min(len(x), int((words[-1]["end"] + pad) * sr))
    y = x[:end].copy()
    fade = min(len(y), int(0.04 * sr))
    y[-fade:] *= np.linspace(1.0, 0.0, fade, dtype="float32")[:, None] if y.ndim == 2 else np.linspace(1.0, 0.0, fade, dtype="float32")
    sf.write(wav_path, y, sr, subtype="PCM_24")
    return len(y) / sr


_ASR = None


def asr_errors(wav_path: Path, text: str) -> tuple[int, str]:
    """Words the local Whisper transcript disagrees with (lower is better), plus what it heard."""
    import difflib
    import re
    import subprocess

    import numpy as np
    from faster_whisper import WhisperModel

    global _ASR
    if _ASR is None:
        _ASR = WhisperModel("small.en", device="cpu", compute_type="int8")
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(wav_path), "-ac", "1", "-ar", "16000", "-f", "f32le",
                          "pipe:1"], capture_output=True, check=True).stdout
    audio = np.frombuffer(raw, "<f4").copy()  # arrays, not paths: faster-whisper 1.2.1 + PyAV 19 breaks on paths
    segs, _ = _ASR.transcribe(audio, language="en")
    heard = " ".join(s.text.strip() for s in segs)

    def norm(t: str) -> list[str]:
        t = t.lower().replace("-", " ")
        t = re.sub(r"(?<=[a-z])\.(?=[a-z])", " dot ", t)          # proteinrecharge.embarko.app -> ... dot ...
        t = t.replace("proteinrecharge", "protein recharge").replace("deploywithembarko", "deploy with embarko")
        t = re.sub(r"\b5\b", "five", t)
        return re.sub(r"[^a-z ]", "", t).split()

    ref, hyp = norm(text), norm(heard)
    sm = difflib.SequenceMatcher(None, ref, hyp)
    errs = sum(max(i2 - i1, j2 - j1) for tag, i1, i2, j1, j2 in sm.get_opcodes() if tag != "equal")
    return errs, heard


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--voice", required=True, help="NarraReel voice id (see `narrareel voices`)")
    ap.add_argument("--energy", type=float, default=0.65)
    ap.add_argument("--only", default="", help="comma-separated segment ids to (re)generate")
    ap.add_argument("--sample", action="store_true", help="generate one evaluation line only")
    ap.add_argument("--timing", default="aligned", choices=["aligned", "estimated", "auto"])
    ap.add_argument("--takes", default="", help="comma-separated energies to try per segment; keeps the best take")
    args = ap.parse_args()

    from narrareel.jobs.workspace import Workspace
    from narrareel.models import VoiceSelection
    from narrareel.pipeline.speak import speak

    selection = VoiceSelection.parse(f"chatterbox:{args.voice}", speed=1.0, energy=args.energy)

    if args.sample:
        out = PRIVATE / "samples" / f"sample_e{args.energy:.2f}"
        if out.exists():
            shutil.rmtree(out)
        r = speak("So I built Protein Recharge, and put it live on Embarko with one prompt.", selection,
                  Workspace(out), timing="estimated", loudness=LUFS)
        print(json.dumps({"sample": str(r.audio_wav), "duration": round(r.duration, 2)}))
        return

    segs = json.loads((HERE / "segments.json").read_text())
    only = {s.strip() for s in args.only.split(",") if s.strip()}
    ASSETS_VO.mkdir(parents=True, exist_ok=True)
    manifest_path = ASSETS_VO / "manifest.json"
    manifest = {m["id"]: m for m in json.loads(manifest_path.read_text())} if manifest_path.exists() else {}
    report = []
    for seg in segs:
        if only and seg["id"] not in only:
            continue
        window = round(seg["end"] - seg["start"], 2)
        energies = [float(e) for e in args.takes.split(",") if e.strip()] or [args.energy]
        best = None
        for e in energies:
            sel = VoiceSelection.parse(f"chatterbox:{args.voice}", speed=1.0, energy=e)
            out = PRIVATE / "segments" / seg["id"] / f"take_e{e:.2f}"
            if out.exists():
                shutil.rmtree(out)
            say = seg.get("say", seg["text"])

            def run(**kw):
                for attempt in (1, 2):  # ffmpeg occasionally dies with a signal (exit -5); one retry
                    try:
                        if out.exists():
                            shutil.rmtree(out)
                        return speak(say, sel, Workspace(out), timing=args.timing, loudness=LUFS, **kw)
                    except Exception as exc:  # noqa: BLE001
                        print(json.dumps({"id": seg["id"], "energy": e, "retry": attempt, "error": str(exc)[:120]}),
                              flush=True)
                        if attempt == 2:
                            return None

            r = run()
            if r is None:
                continue
            dur = trim_tail(Path(r.audio_wav), [w.model_dump() for w in r.words])
            fitted = False
            if dur > window:  # still too long after trimming junk: let NarraReel fit it (pauses first, then speed)
                r = run(target_seconds=window)
                if r is None:
                    continue
                dur = trim_tail(Path(r.audio_wav), [w.model_dump() for w in r.words])
                fitted = True
            errs, heard = asr_errors(Path(r.audio_wav), seg["text"])
            score = (errs, abs(r.speed - 1.0), abs(e - args.energy))
            print(json.dumps({"id": seg["id"], "energy": e, "errors": errs, "dur": round(dur, 2), "speed": r.speed,
                              "heard": heard}), flush=True)
            if best is None or score < best[0]:
                best = (score, r, dur, fitted, e, errs, heard)
        if best is None:
            print(json.dumps({"id": seg["id"], "failed": "no usable take"}), flush=True)
            continue
        _, r, dur, fitted, chosen_e, errs, heard = best
        words = caption_words([w.model_dump() for w in r.words], seg.get("say", seg["text"]), seg["text"])
        dst = ASSETS_VO / f"seg{seg['id']}.wav"
        shutil.copyfile(r.audio_wav, dst)
        manifest[seg["id"]] = {"id": seg["id"], "file": f"vo/seg{seg['id']}.wav", "start": seg["start"],
                               "duration": round(dur, 3), "text": seg["text"], "energy": chosen_e,
                               "cues": cues_from_words(words), "speed": r.speed, "fitted": fitted,
                               "asr_errors": errs, "asr_heard": heard}
        report.append({"id": seg["id"], "window": window, "duration": round(dur, 2), "energy": chosen_e,
                       "fitted": fitted, "speed": round(r.speed, 3), "asr_errors": errs, "heard": heard})
        print("CHOSEN " + json.dumps(report[-1]), flush=True)
        ordered = [manifest[k] for k in sorted(manifest, key=lambda k: manifest[k]["start"])]
        manifest_path.write_text(json.dumps(ordered, indent=1))
    ordered = [manifest[k] for k in sorted(manifest, key=lambda k: manifest[k]["start"])]
    manifest_path.write_text(json.dumps(ordered, indent=1))
    (PRIVATE / "generation_report.json").write_text(json.dumps(report, indent=1))


if __name__ == "__main__":
    sys.exit(main())
