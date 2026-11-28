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
        tgt = " ".join(target)
        n = len(target)
        cands = []
        for i in range(len(toks)):
            for L in range(max(1, n - 3), n + 4):
                window = [t for t, _ in toks[i:i + L]]
                if len(window) < L:
                    break
                # character-level: "embarco" still counts for "embarko", so edge words are kept
                r = difflib.SequenceMatcher(None, tgt, " ".join(window)).ratio()
                cands.append((r, i, L))
        mid = words[-1].end / 2 if words else 0
        def best_in(take):
            pool = [c for c in cands if (toks[c[1]][1].start > mid) == (take == 2)]
            pool.sort(key=lambda c: (-round(c[0], 2), c[2] * 0, -c[1]))
            return pool[0] if pool else None
        options = [(t, best_in(t)) for t in (1, 2)]
        options = [(t, c) for t, c in options if c and c[0] >= 0.6]
        if not options:
            report.append({"id": ln["id"], "status": "NOT FOUND"})
            continue
        # export each take's version and transcribe it on its own; the clearer one wins (tie -> take 2)
        scored = []
        for t, (r_, i_, L_) in options:
            ws_ = [w for _, w in toks[i_:i_ + L_]]
            a0_ = max(0.0, ws_[0].start - 0.12)
            a1_ = min(len(audio) / SR, ws_[-1].end + 0.22)
            c_ = audio[int(a0_ * SR):int(a1_ * SR)]
            raw16 = subprocess.run([FF, "-v", "error", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "pipe:0",
                                    "-ar", "16000", "-f", "f32le", "pipe:1"], input=c_.astype("<f4").tobytes(),
                                   capture_output=True, check=True).stdout
            cs_, _ = asr.transcribe(np.frombuffer(raw16, "<f4").copy(), language="en")
            h_ = " ".join(x.text.strip() for x in cs_)
            q_ = difflib.SequenceMatcher(None, tgt, " ".join(norm(h_))).ratio()
            scored.append((round(q_, 3), t, r_, i_, L_, h_))
        scored.sort(key=lambda x: (-x[0], -x[1]))
        q, tk, r, i, L, _h = scored[0]
        take = f"take {tk}"
        runner = {f"take {x[1]}": [x[0], x[5]] for x in scored}
        best = ((r, i), i, L, r)
        _, i, L, r = best
        # keep words glued to the end of the line (no gap): the transcriber sometimes splits one word in two
        starts = {tuple(norm(x["text"])[:2]) for x in lines if x["id"] != ln["id"]}
        while (i + L < len(toks) and toks[i + L][1].start - toks[i + L - 1][1].end < 0.08
               and tuple(t for t, _ in toks[i + L:i + L + 2]) not in starts):
            L += 1
        ws = [w for _, w in toks[i:i + L]]
        a0 = max(0.0, ws[0].start - 0.12)
        a1 = min(len(audio) / SR, ws[-1].end + 0.22)
        clip = audio[int(a0 * SR):int(a1 * SR)].copy()
        # trim leading silence to the real voice onset (Whisper's first-word start runs early),
        # keeping 60 ms so the first consonant is not clipped
        fr_n = int(0.01 * SR)
        frs = clip[: len(clip) // fr_n * fr_n].reshape(-1, fr_n)
        dbs = 20 * np.log10(np.sqrt((frs ** 2).mean(1)) + 1e-9)
        onset = float(np.argmax(dbs > dbs.max() - 30)) * 0.01
        trim = max(0.0, onset - 0.06)
        clip = clip[int(trim * SR):]
        a0 += trim
        voice_at = onset - trim
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
        shown = ln.get("spoken_real", ln["text"]).split()   # caption what was actually said
        timed = [(w.start - a0, w.end - a0) for w in ws]
        # align caption words to your actual words (spelling-tolerant), so every caption follows your timing
        spoken_n = [(norm(w.word) or [""])[0] for w in ws]
        shown_n = [(norm(t) or [""])[0] for t in shown]
        times = [None] * len(shown)
        sm = difflib.SequenceMatcher(None, shown_n, spoken_n, autojunk=False)
        for tag, i1, i2, j1, j2 in sm.get_opcodes():
            if tag == "equal" or (tag == "replace" and i2 - i1 == j2 - j1):
                for k in range(i2 - i1):
                    times[i1 + k] = timed[j1 + k]
            elif tag == "replace":  # different counts: spread these caption words over the spoken span
                s0_, s1_ = timed[j1][0], timed[j2 - 1][1]
                step = (s1_ - s0_) / (i2 - i1)
                for k in range(i2 - i1):
                    times[i1 + k] = (s0_ + k * step, s0_ + (k + 1) * step)
        # fill anything still unmatched between its neighbours
        for k in range(len(times)):
            if times[k] is None:
                prev = next((times[j] for j in range(k - 1, -1, -1) if times[j]), (timed[0][0], timed[0][0]))
                nxt = next((times[j] for j in range(k + 1, len(times)) if times[j]), (timed[-1][1], timed[-1][1]))
                times[k] = (prev[1], max(prev[1], nxt[0]))
        pairs = list(zip(shown, times))
        pairs = [(w_, (max(voice_at, t_[0]), max(voice_at, t_[1]))) for w_, (t_) in pairs]
        cues, cur = [], []
        for word, (s0, s1) in pairs:
            cur.append((word, s0, s1))
            if len(cur) >= 6 or word.endswith((".", "?", "!")) or (word.endswith((",", ":")) and len(cur) >= 3):
                cues.append({"start": round(cur[0][1], 3), "end": round(cur[-1][2], 3), "text": " ".join(x[0] for x in cur)})
                cur = []
        if cur:
            cues.append({"start": round(cur[0][1], 3), "end": round(cur[-1][2], 3), "text": " ".join(x[0] for x in cur)})
        # no orphans: merge 1-2 word cues into a neighbour when the result stays readable (<= 8 words)
        k = 0
        while k < len(cues):
            n_ = len(cues[k]["text"].split())
            if n_ <= 2 and len(cues) > 1:
                j = k - 1 if k > 0 else k + 1
                if len(cues[j]["text"].split()) + n_ <= 8:
                    a_, b_ = sorted([j, k])
                    cues[a_] = {"start": cues[a_]["start"], "end": cues[b_]["end"],
                                "text": cues[a_]["text"] + " " + cues[b_]["text"]}
                    del cues[b_]
                    k = max(0, a_ - 1)
                    continue
            k += 1
        manifest.append({"id": ln["id"], "file": f"vo-real/seg{ln['id']}.wav", "start": 0, "duration": round(dur, 3),
                         "text": ln.get("spoken_real", ln["text"]), "cues": cues})
        # verify the exported clip itself: re-transcribe it and compare with the script line
        chk = subprocess.run([FF, "-v", "error", "-i", str(dst), "-ac", "1", "-ar", "16000", "-f", "f32le", "pipe:1"],
                             capture_output=True, check=True).stdout
        cs, _ = asr.transcribe(np.frombuffer(chk, "<f4").copy(), language="en")
        heard_clip = " ".join(x.text.strip() for x in cs)
        clip_match = difflib.SequenceMatcher(None, tgt, " ".join(norm(heard_clip))).ratio()
        report.append({"id": ln["id"], "status": "ok", "chosen": take, "match": round(r, 2), "runner_up": runner,
                       "duration": round(dur, 2), "clip_check": round(clip_match, 2), "clip_heard": heard_clip})
    clean.unlink(missing_ok=True)
    (OUT / "manifest.json").write_text(json.dumps(manifest, indent=1))
    (PROJECT / "video/voiceover/private/v2-real-report.json").write_text(json.dumps(report, indent=1))
    for r_ in report:
        print(json.dumps(r_))
    missing = [r_["id"] for r_ in report if r_["status"] != "ok"]
    print("MISSING:" if missing else "ALL 15 LINES FOUND", missing or "")


if __name__ == "__main__":
    main()
