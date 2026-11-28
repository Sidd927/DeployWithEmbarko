"""QA for the rendered v4 file. Run with NarraReel's interpreter (faster-whisper):
    ~/tools/NarraReel/.venv/bin/python -I video/v4/qa_v4.py
Prints technical, audio, motion, transcript and caption-sync results.
"""
import difflib
import json
import re
import subprocess
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent
PROJECT = ROOT.parents[1]
VID = PROJECT / "video/exports/protein-recharge-v4-9x16.mp4"
FF, FP = "/opt/homebrew/bin/ffmpeg", "/opt/homebrew/bin/ffprobe"
T = json.loads((ROOT / "timing_v4.json").read_text())
MAN = {m["id"]: m for m in json.loads((ROOT / "hf/assets/vo-real/manifest.json").read_text())}


def run(args, **kw):
    return subprocess.run(args, capture_output=True, text=True, **kw)


def main():
    pr = json.loads(run([FP, "-v", "error", "-show_streams", "-show_format", "-of", "json", str(VID)]).stdout)
    v = next(s for s in pr["streams"] if s["codec_type"] == "video")
    a = next(s for s in pr["streams"] if s["codec_type"] == "audio")
    print("FORMAT", v["codec_name"], v["width"], "x", v["height"], v["r_frame_rate"], v.get("pix_fmt"),
          "| audio", a["codec_name"], a["sample_rate"], a["channels"], "ch | dur", pr["format"]["duration"],
          "| size MB", round(int(pr["format"]["size"]) / 1e6, 1))
    dec = run([FF, "-v", "error", "-i", str(VID), "-f", "null", "-"])
    print("DECODE errors:", dec.stderr.strip() or "none")
    ln = run([FF, "-hide_banner", "-i", str(VID), "-af", "loudnorm=print_format=json", "-f", "null", "-"]).stderr
    j = json.loads(ln[ln.rfind("{"):ln.rfind("}") + 1])
    print("LOUDNESS I", j["input_i"], "LUFS | TP", j["input_tp"], "dBTP | LRA", j["input_lra"])
    bd = run([FF, "-hide_banner", "-i", str(VID), "-vf", "blackdetect=d=0.1:pix_th=0.05", "-an", "-f", "null", "-"]).stderr
    print("BLACK segments:", len(re.findall(r"black_start", bd)))
    sd = run([FF, "-hide_banner", "-i", str(VID), "-af", "silencedetect=n=-45dB:d=1.0", "-vn", "-f", "null", "-"]).stderr
    print("SILENCE >1s:", re.findall(r"silence_start: ([\d.]+)", sd), re.findall(r"silence_duration: ([\d.]+)", sd))

    # motion: mean abs frame difference per second (small grey frames)
    W, H = 108, 192
    raw = subprocess.run(
        [FF, "-v", "error", "-i", str(VID), "-vf", f"scale={W}:{H},format=gray", "-f", "rawvideo", "-"],
        capture_output=True).stdout
    fr = np.frombuffer(raw, np.uint8).reshape(-1, H, W).astype(np.float32)
    diff = np.abs(np.diff(fr, axis=0)).mean((1, 2))
    per_s = [float(diff[i * 30:(i + 1) * 30].mean()) for i in range(len(diff) // 30)]
    static = [i for i, x in enumerate(per_s) if x < 0.6]
    print(f"MOTION near-static seconds: {len(static)}/{len(per_s)} -> {static}")
    last = fr[-1]
    print("LAST frame mean luma", round(float(last.mean()), 1), "(not black)" if last.mean() > 10 else "(BLACK!)")

    # audio of the mix, 16 kHz mono
    pcm = subprocess.run([FF, "-v", "error", "-i", str(VID), "-ac", "1", "-ar", "16000", "-f", "f32le", "-"],
                         capture_output=True).stdout
    au = np.frombuffer(pcm, "<f4").copy()
    sr = 16000
    from faster_whisper import WhisperModel
    asr = WhisperModel("small.en", device="cpu", compute_type="int8")
    srt = (ROOT / "protein-recharge-v4.srt").read_text()
    cues = []
    for blk in srt.strip().split("\n\n"):
        L = blk.splitlines()
        t0, t1 = L[1].split(" --> ")
        f = lambda s: int(s[:2]) * 3600 + int(s[3:5]) * 60 + float(s[6:].replace(",", "."))
        cues.append((f(t0), f(t1), " ".join(L[2:])))
    overl = [i for i in range(len(cues) - 1) if cues[i][1] > cues[i + 1][0]]
    print("CAPTIONS", len(cues), "cues | overlapping:", overl or "none")

    print("\nLINE | expected | heard in final mix | match | caption lead(+)/lag(-) vs voice onset")
    leads = []
    for lid, (st, du) in T["vo"].items():
        seg = au[int(st * sr):int((st + du) * sr)]
        cs, _ = asr.transcribe(seg, language="en")
        heard = " ".join(x.text.strip() for x in cs)
        exp = MAN[lid]["text"]
        n = lambda s: re.sub(r"[^a-z0-9 ]", "", s.lower().replace("₹", "rupees ").replace("-", " "))
        r = difflib.SequenceMatcher(None, n(exp), n(heard)).ratio()
        # voice onset in the mix: first 10 ms frame within 30 dB of the line's peak (window starts 0.2 s early)
        w0 = max(0, int((st - 0.03) * sr))   # clips start ~60 ms before the voice; avoid the previous line's tail
        win = au[w0:int((st + 1.0) * sr)]
        frs = win[: len(win) // 160 * 160].reshape(-1, 160)
        db = 20 * np.log10(np.sqrt((frs ** 2).mean(1)) + 1e-9)
        ref = 20 * np.log10(np.sqrt((seg ** 2).mean()) + 1e-9) + 6
        on = w0 / sr + float(np.argmax(db > ref - 26)) * 0.01
        first = min((c for c in cues if c[0] >= st - 0.3), key=lambda c: c[0])
        lead = on - first[0]
        leads.append(lead)
        print(f"{lid:3} | {exp[:46]:46} | {heard[:52]:52} | {r:.2f} | {lead:+.2f}s")
    la = np.abs(leads)
    print(f"CAPTION SYNC line starts: median {np.median(la):.2f}s, max {la.max():.2f}s")


if __name__ == "__main__":
    main()
