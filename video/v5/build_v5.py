"""Protein Recharge v5: V4 exactly, minus the burned-in captions (caption-only polish pass).

Why remove rather than move: on full-bleed app footage, the lower caption band (y 1290-1440, above the
platform overlays) sat on real UI for 20 of 24 cues (pack prices, buttons, selected options, the rebuilding
plate rows, "Don't suggest", shopping-list prices). Keeping only the non-conflicting cues would leave
captions in 2 of 12 shots. Platform captions (SRT upload / auto-captions) replace them for muted viewers.

Run: python3 video/v5/build_v5.py   then render from video/v5/hf.
"""
import json
import re
import shutil
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent
PROJECT = ROOT.parents[1]
V4 = PROJECT / "video/v4"
HF = ROOT / "hf"

# 1. regenerate V4's project unchanged (same footage, timing, audio, shots)
subprocess.run(["python3", str(V4 / "build_v4.py")], check=True)

# 2. copy it (V4's project and export stay untouched)
if HF.exists():
    shutil.rmtree(HF)
shutil.copytree(V4 / "hf", HF, ignore=shutil.ignore_patterns(".hyperframes"))

# 3. remove only the captions layer
idx = (HF / "index.html").read_text()
idx2 = re.sub(r'\s*<div id="captions"[^>]*></div>', "", idx)
assert idx2 != idx, "captions host not found"
(HF / "index.html").write_text(idx2)
(HF / "compositions/captions.html").unlink()
(HF / "meta.json").write_text(json.dumps({"id": "protein-recharge-v5", "name": "Protein Recharge v5 (final)"}))

# 4. subtitles for the platforms: V4's cues at their true voice timing (V4 showed cue 1 from frame 0)
srt = (V4 / "protein-recharge-v4.srt").read_text()
first_voice = 0.3 + json.loads((HF / "assets/vo-real/manifest.json").read_text())[0]["cues"][0]["start"]
srt = srt.replace("00:00:00,050 -->", f"00:00:00,{round(first_voice * 1000):03d} -->", 1)
(ROOT / "protein-recharge-v5.srt").write_text(srt)
shutil.copy2(V4 / "timing_v4.json", ROOT / "timing_v5.json")
print("v5 project ready:", HF, "| captions removed | SRT first cue at", round(first_voice, 3))
