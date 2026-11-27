"""Turn your own v2 recording into the 15 narration lines the v2 edit expects.

Run with NarraReel's interpreter (it has faster-whisper):
    ~/tools/NarraReel/.venv/bin/python -I video/v2/import_real_voice.py [path/to/recording]

Default input: video/voiceover/private/v2-real.m4a (git-ignored).
Output (git-ignored): video/v2/hf/assets/vo-real/seg<id>.wav + manifest.json, plus a match report.
Then: VO_DIR=vo-real python3 video/v2/build_v2.py
"""
import difflib
import json
import re
import subprocess
import sys
from pathlib import Path

import numpy as np
import soundfile as sf

ROOT = Path(__file__).resolve().parent
PROJECT = ROOT.parents[1]
SRC = Path(sys.argv[1]) if len(sys.argv) > 1 else PROJECT / "video/voiceover/private/v2-real.m4a"
OUT = ROOT / "hf/assets/vo-real"
FF = "/opt/homebrew/bin/ffmpeg"
SR = 48000
# gentle cleanup: keep breath and character, remove rumble, hiss and harsh "s"
CHAIN = ("highpass=f=80,afftdn=nr=10:nf=-45:tn=1,deesser=i=0.35,"
         "acompressor=threshold=-22dB:ratio=2:attack=8:release=120:makeup=2")


def norm(t):
    t = t.lower().replace("-", " ").replace("₹", " rupees ")
    nums = {"9": "nine", "30": "thirty", "53": "fifty three", "100": "hundred", "5": "five"}
    t = re.sub(r"\b(\d+)\b", lambda m: nums.get(m.group(1), m.group(1)), t)
    t = t.replace("weigh ", "whey ").replace("way down", "way down")
    return re.sub(r"[^a-z ]", "", t).split()


def main():
    if not SRC.exists():
        sys.exit(f"Recording not found: {SRC}")
    OUT.mkdir(parents=True, exist_ok=True)
    clean = OUT / "_clean.wav"
    subprocess.run([FF, "-v", "error", "-y", "-i", str(SRC), "-ac", "1", "-ar", str(SR), "-af", CHAIN,
                    "-c:a", "pcm_f32le", str(clean)], check=True)
    audio, _ = sf.read(clean, dtype="float32")

    from faster_whisper import WhisperModel
    asr = WhisperModel("small.en", device="cpu", compute_type="int8")
    a16 = subprocess.run([FF, "-v", "error", "-i", str(clean), "-ac", "1", "-ar", "16000", "-f", "f32le", "pipe:1"],
                         capture_output=True, check=True).stdout
    segs, _ = asr.transcribe(np.frombuffer(a16, "<f4").copy(), word_timestamps=True, language="en")
    words = [w for s in segs for w in s.words]
    toks = [(norm(w.word)[0] if norm(w.word) else "", w) for w in words]

    lines = json.loads((ROOT / "segments_v2.json").read_text())
    manifest, report = [], []
    for ln in lines:
        target = norm(ln["text"])
        n = len(target)
        best = None
        for i in range(len(toks)):
            for L in range(max(1, n - 3), n + 4):
                window = [t for t, _ in toks[i:i + L]]
                if len(window) < L:
                    break
                r = difflib.SequenceMatcher(None, target, window).ratio()
                # prefer the later take on near-ties: people usually improve on take 2
                key = (round(r, 2), i)
                if best is None or key > best[0]:
                    best = (key, i, L, r)
        if best is None or best[3] < 0.6:
            report.append({"id": ln["id"], "status": "NOT FOUND", "best_ratio": round(best[3], 2) if best else 0})
            continue
        _, i, L, r = best
        ws = [w for _, w in toks[i:i + L]]
        a0 = max(0.0, ws[0].start - 0.12)
        a1 = min(len(audio) / SR, ws[-1].end + 0.22)
        clip = audio[int(a0 * SR):int(a1 * SR)].copy()
        fade = int(0.02 * SR)
        clip[:fade] *= np.linspace(0, 1, fade, dtype="float32")
        clip[-fade:] *= np.linspace(1, 0, fade, dtype="float32")
        tmp = OUT / f"_seg{ln['id']}.wav"
        sf.write(tmp, clip, SR, subtype="FLOAT")
        dst = OUT / f"seg{ln['id']}.wav"
        subprocess.run([FF, "-v", "error", "-y", "-i", str(tmp), "-af", "loudnorm=I=-16:TP=-1.5:LRA=7",
                        "-ar", str(SR), "-c:a", "pcm_s24le", str(dst)], check=True)
        tmp.unlink()
        dur = sf.info(dst).duration
        # caption cues from your own word timings, shown with the script's spelling
        shown = ln["text"].split()
        timed = [(w.start - a0, w.end - a0) for w in ws]
        if len(shown) == len(timed):
            pairs = list(zip(shown, timed))
        else:  # fall back: spread the script words over the spoken span
            span = (timed[0][0], timed[-1][1])
            step = (span[1] - span[0]) / max(1, len(shown))
            pairs = [(t, (span[0] + k * step, span[0] + (k + 1) * step)) for k, t in enumerate(shown)]
        cues, cur = [], []
        for word, (s0, s1) in pairs:
            cur.append((word, s0, s1))
            if len(cur) >= 6 or word.endswith((".", "?", "!")) or (word.endswith((",", ":")) and len(cur) >= 3):
                cues.append({"start": round(cur[0][1], 3), "end": round(cur[-1][2], 3), "text": " ".join(x[0] for x in cur)})
                cur = []
        if cur:
            cues.append({"start": round(cur[0][1], 3), "end": round(cur[-1][2], 3), "text": " ".join(x[0] for x in cur)})
        manifest.append({"id": ln["id"], "file": f"vo-real/seg{ln['id']}.wav", "start": 0, "duration": round(dur, 3),
                         "text": ln["text"], "cues": cues})
        report.append({"id": ln["id"], "status": "ok", "match": round(r, 2), "duration": round(dur, 2),
                       "heard": " ".join(w.word.strip() for w in ws)})
    clean.unlink(missing_ok=True)
    (OUT / "manifest.json").write_text(json.dumps(manifest, indent=1))
    (PROJECT / "video/voiceover/private/v2-real-report.json").write_text(json.dumps(report, indent=1))
    for r_ in report:
        print(json.dumps(r_))
    missing = [r_["id"] for r_ in report if r_["status"] != "ok"]
    print("MISSING:" if missing else "ALL 15 LINES FOUND", missing or "")


if __name__ == "__main__":
    main()
