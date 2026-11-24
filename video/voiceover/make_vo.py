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


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--voice", required=True, help="NarraReel voice id (see `narrareel voices`)")
    ap.add_argument("--energy", type=float, default=0.65)
    ap.add_argument("--only", default="", help="comma-separated segment ids to (re)generate")
    ap.add_argument("--sample", action="store_true", help="generate one evaluation line only")
    ap.add_argument("--timing", default="aligned", choices=["aligned", "estimated", "auto"])
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
        out = PRIVATE / "segments" / seg["id"]
        if out.exists():
            shutil.rmtree(out)
        r = speak(seg["text"], selection, Workspace(out), timing=args.timing, loudness=LUFS)
        fitted = False
        if r.duration > window:  # natural delivery too long: let NarraReel fit it (pauses first, then speed)
            shutil.rmtree(out)
            r = speak(seg["text"], selection, Workspace(out), target_seconds=window,
                      timing=args.timing, loudness=LUFS)
            fitted = True
        words = [w.model_dump() for w in r.words]
        dst = ASSETS_VO / f"seg{seg['id']}.wav"
        shutil.copyfile(r.audio_wav, dst)
        manifest[seg["id"]] = {"id": seg["id"], "file": f"vo/seg{seg['id']}.wav", "start": seg["start"],
                               "duration": round(r.duration, 3), "text": seg["text"],
                               "cues": cues_from_words(words), "speed": r.speed, "fitted": fitted}
        report.append({"id": seg["id"], "window": window, "duration": round(r.duration, 2),
                       "fitted": fitted, "speed": round(r.speed, 3), "note": r.note})
        print(json.dumps(report[-1]), flush=True)
    ordered = [manifest[k] for k in sorted(manifest, key=lambda k: manifest[k]["start"])]
    manifest_path.write_text(json.dumps(ordered, indent=1))
    (PRIVATE / "generation_report.json").write_text(json.dumps(report, indent=1))


if __name__ == "__main__":
    sys.exit(main())
