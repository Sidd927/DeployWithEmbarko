"""Protein Recharge v2: "The ₹10 test". Builds a HyperFrames project in video/v2/hf from
real footage + the narration manifest (video/v2/hf/assets/vo/manifest.json, git-ignored).

The edit follows the voice: each narration line is placed back to back with small breaths, and every
scene's start/length is derived from the lines it covers. Run: python3 video/v2/build_v2.py
"""
import json
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent
PROJECT = ROOT.parents[1]
HF = ROOT / "hf"
W, H = 1080, 1920
FPS_SCALE = 1080 / 1170          # footage frames are 1170 px wide
FOOT_H = 2532 * FPS_SCALE        # displayed footage height at zoom 1 (2337 px)

# ------------------------------------------------------------------ project scaffold
(HF / "compositions").mkdir(parents=True, exist_ok=True)
(HF / "assets" / "footage").mkdir(parents=True, exist_ok=True)
(HF / "assets" / "fonts").mkdir(parents=True, exist_ok=True)
for name in ("hook", "rank", "packs", "setup", "slider", "exclude", "list", "embarko", "deploy", "live"):
    src = PROJECT / "video" / "footage" / f"{name}.mp4"
    dst = HF / "assets" / "footage" / f"{name}.mp4"
    if src.exists() and (not dst.exists() or dst.stat().st_mtime < src.stat().st_mtime):
        shutil.copy2(src, dst)
for f in ("bricolage.woff2", "figtree.woff2"):
    shutil.copy2(PROJECT / "video" / "hf" / "assets" / "fonts" / f, HF / "assets" / "fonts" / f)
if not (HF / ".media").exists():
    shutil.copytree(PROJECT / "video" / "hf" / ".media", HF / ".media")
for f in ("hyperframes.json", "package.json"):
    shutil.copy2(PROJECT / "video" / "hf" / f, HF / f)
(HF / "meta.json").write_text(json.dumps({"id": "protein-recharge-v2", "name": "Protein Recharge v2"}))

# ------------------------------------------------------------------ narration timeline
segs = json.loads((ROOT / "segments_v2.json").read_text())
import os
VO_DIR = os.environ.get("VO_DIR", "vo")          # "vo" = voice clone, "vo-real" = your own recording
REAL_VOICE = VO_DIR != "vo"
man = {m["id"]: m for m in json.loads((HF / "assets" / VO_DIR / "manifest.json").read_text())}
GAP = {"h1": 0.25, "h2": 0.35, "p1": 0.2, "p2": 0.45, "s1": 0.15, "s2": 0.3, "w1": 0.15, "w2": 0.1,
       "w3": 0.6, "x1": 0.3, "l1": 0.35, "e1": 0.15, "e2": 0.45, "c1": 0.15, "c2": 0.0}
LEAD = 0.25                       # first word at 0.25 s: the picture already moves at frame 0
t = LEAD
vo = {}
for s in segs:
    m = man[s["id"]]
    vo[s["id"]] = {"start": round(t, 3), "dur": m["duration"], "file": m["file"], "cues": m["cues"]}
    t += m["duration"] + GAP[s["id"]]
END_HOLD = 2.4
TOTAL = round(max(t + END_HOLD, 42.0), 2)   # competition minimum is 40 s; keep margin


def at(i):  # start of a narration line
    return vo[i]["start"]


def end(i):
    return vo[i]["start"] + vo[i]["dur"]


FONTS = """
@font-face{font-family:'Bricolage';src:url('assets/fonts/bricolage.woff2') format('woff2');font-weight:200 800;font-display:block}
@font-face{font-family:'Figtree';src:url('assets/fonts/figtree.woff2') format('woff2');font-weight:300 900;font-display:block}
"""
BASE = """
#root{position:absolute;inset:0;overflow:hidden;background:#E6EAEA;color:#14241E;font-family:'Figtree',sans-serif}
.cam{position:absolute;left:0;top:0;width:1080px;transform-origin:0 0}
.cam video{display:block;width:1080px;height:auto}
.ring{position:absolute;border:6px solid #FFC21A;border-radius:22px;box-shadow:0 0 0 4px #14241E}
.chip{position:absolute;background:#14241E;color:#FFC21A;font-family:'Bricolage',sans-serif;font-weight:800;
      font-size:48px;letter-spacing:-.02em;padding:10px 22px;border-radius:16px;white-space:nowrap}
"""


def cam_xy(fx, fy, z, cy=640):
    """Translate/scale so footage point (fx, fy) [frame px] sits at canvas (540, cy), clamped to the frame."""
    sx, sy = fx * FPS_SCALE * z, fy * FPS_SCALE * z
    tx = min(0.0, max(W - W * z, 540 - sx))
    ty = min(0.0, max(H - FOOT_H * z, cy - sy))
    return round(tx, 1), round(ty, 1)


scenes = []


def scene(sid, start, dur, video=None, cam=(), body="", css="", tl_extra="", ground=None):
    """cam: [(t, fx, fy, zoom, cy, move_dur)], first entry is the opening framing (set, not tweened)."""
    html, tl = [], []
    if video:
        html.append(
            f'<div class="cam" id="{sid}-cam"><video id="{sid}-v" class="clip" src="assets/footage/{video["src"]}" '
            f'data-start="0" data-duration="{round(dur, 3)}" data-media-start="{video.get("ms", 0)}" '
            f'data-playback-rate="{video.get("rate", 1)}" data-track-index="2" muted playsinline></video></div>'
        )
        for k, (ct, fx, fy, z, cy, md) in enumerate(cam):
            x, y = cam_xy(fx, fy, z, cy)
            if k == 0:
                tl.append(f'tl.set("#{sid}-cam",{{x:{x},y:{y},scale:{z}}},0);')
            else:
                tl.append(f'tl.to("#{sid}-cam",{{x:{x},y:{y},scale:{z},duration:{md},ease:"power3.inOut"}},{ct});')
    html.append(body)
    tl.append(tl_extra)
    g = f' style="background:{ground}"' if ground else ""
    doc = f"""<template>
  <style>{FONTS}{BASE}{css}</style>
  <div id="root" data-composition-id="{sid}" data-width="{W}" data-height="{H}"{g}>
    {chr(10).join(html)}
  </div>
  <script>
    const tl = gsap.timeline({{ paused: true }});
    {chr(10).join(tl)}
    window.__timelines["{sid}"] = tl;
  </script>
</template>
"""
    (HF / "compositions" / f"{sid}.html").write_text(doc)
    scenes.append((sid, round(start, 3), round(dur, 3)))


# Footage landmarks (frame px in the 1170 x 2532 captures), measured from frames.
SOYA_ROW = (585, 780)           # soya card row spans y 655-905
WHEY_ROW = (585, 1170)          # after the scroll: whey 920-1160, paneer 1180-1420
METER = (585, 800)              # slider clip: "Your daily top-up" meter block 630-950
EQUATION = (585, 575)           # packs clip: 109 g - 30 g = 79 g, y 460-690


def to_canvas(fx, fy, cam_fx, cam_fy, z, cy):
    tx, ty = cam_xy(cam_fx, cam_fy, z, cy)
    return fx * FPS_SCALE * z + tx, fy * FPS_SCALE * z + ty

# 1. Hook, two shots: (a) the real ranking held on soya while the claim is spoken, ring + chip;
#    (b) the real scroll down to whey, timed to "Whey is way down the list".
#    The UI runs edge to edge, so zoom stays <= 1.08 (deeper zooms crop the numbers).
s1 = 0.0
d1a = at("h2") - 0.1
Z1, CY1 = 1.06, 760
rx0, ry0 = to_canvas(30, 655, *SOYA_ROW, Z1, CY1)
rx1, ry1 = to_canvas(1140, 905, *SOYA_ROW, Z1, CY1)
scene("hook", s1, d1a, video={"src": "rank.mp4", "ms": 0.2, "rate": 0.25},
      cam=[(0, SOYA_ROW[0], SOYA_ROW[1], 1.0, CY1, 0), (0.05, SOYA_ROW[0], SOYA_ROW[1], Z1, CY1, 0.6)],
      body='<div class="ring" id="hook-r1"></div><div class="chip" id="hook-c1">37 g vs 4 g per ₹10</div>',
      tl_extra=f"""
tl.set("#hook-r1",{{left:{max(14, round(rx0))},top:{round(ry0)},width:{min(1052, round(rx1 - rx0))},height:{round(ry1 - ry0)},opacity:0}},0);
tl.set("#hook-r1",{{opacity:1}},0);
tl.set("#hook-c1",{{left:130,top:{round(ry0) - 112},opacity:1,scale:1,transformOrigin:"0 100%"}},0);
tl.fromTo("#hook-c1",{{scale:1}},{{scale:1.12,duration:0.14,yoyo:true,repeat:1,ease:"power2.out"}},{round(at('h1') + 1.5, 2)});""")
s1b = d1a
d1b = at("p1") - s1b
wx0, wy0 = to_canvas(30, 920, WHEY_ROW[0], WHEY_ROW[1], 1.0, 760)
wx1, wy1 = to_canvas(1140, 1160, WHEY_ROW[0], WHEY_ROW[1], 1.0, 760)
scene("hook2", s1b, d1b, video={"src": "rank.mp4", "ms": 1.55, "rate": 1.45},
      cam=[(0, WHEY_ROW[0], WHEY_ROW[1], 1.0, 760, 0)],
      body='<div class="ring" id="hook2-r1"></div>',
      tl_extra=f"""
tl.set("#hook2-r1",{{left:{max(14, round(wx0))},top:{round(wy0)},width:{min(1052, round(wx1 - wx0))},height:{round(wy1 - wy0)},opacity:0}},0);
tl.to("#hook2-r1",{{opacity:1,duration:0.12}},{round(min(d1b - 0.4, 1.25), 2)});""")

# 2. Problem: kinetic type on steel, then the app's own equation.
s2 = at("p1") - 0.05
d2 = at("s1") - s2
scene("problem", s2, d2, video={"src": "packs.mp4", "ms": 0.2, "rate": 0.2},
      cam=[(0, EQUATION[0], EQUATION[1], 1.0, 620, 0), (0.2, EQUATION[0], EQUATION[1], 1.06, 640, 2.5)],
      body='<div id="problem-block"><span>½ kg of soya</span><span>a day?</span></div>',
      css="""#problem-block{position:absolute;inset:0;background:#E6EAEA;display:flex;flex-direction:column;justify-content:flex-start;padding-top:430px !important;
             padding:0 120px 0 130px;font-family:'Bricolage',sans-serif;font-weight:800;font-size:140px;line-height:.95;letter-spacing:-.045em;opacity:0}""",
      tl_extra=f"""
tl.set("#problem-block",{{opacity:1}},0);
tl.fromTo("#problem-block span",{{clipPath:"inset(0 100% 0 0)"}},{{clipPath:"inset(0 0% 0 0)",duration:0.25,stagger:0.18,ease:"power3.out"}},0.05);
tl.set("#problem-block",{{opacity:0}},{round(at('p2') - s2 - 0.1, 2)});""")

# 3. Reveal + setup: brand stamp (0.9 s), then the real setup at 2x.
s3 = at("s1") - 0.05
d3 = at("w1") - s3
scene("setup", s3, d3, video={"src": "setup.mp4", "ms": 0.5, "rate": 1.9},
      cam=[(0, 585, 900, 1.12, 760, 0)],
      body='<div id="setup-brand"><div id="setup-mark"></div><div id="setup-name">Protein<br>Recharge</div></div>',
      css="""#setup-brand{position:absolute;inset:0;background:#FFC21A;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;padding-top:380px;gap:30px}
             #setup-mark{width:190px;height:190px;background:url('assets/mark.svg') center/contain no-repeat}
             #setup-name{font-family:'Bricolage',sans-serif;font-weight:800;font-size:150px;line-height:.92;letter-spacing:-.045em;text-align:center}""",
      tl_extra=f"""
tl.fromTo("#setup-mark",{{scale:0.3,rotation:-14}},{{scale:1,rotation:0,duration:0.38,ease:"back.out(1.7)"}},0);
tl.fromTo("#setup-name",{{clipPath:"inset(0 100% 0 0)"}},{{clipPath:"inset(0 0% 0 0)",duration:0.28,ease:"power3.out"}},0.12);
tl.to("#setup-brand",{{yPercent:-100,duration:0.35,ease:"power3.in"}},{round(max(1.0, at('s2') - s3 - 0.25), 2)});""")

# 4. Wow: drag the budget; meter turns green exactly on "...hit your goal".
s4 = at("w1") - 0.05
d4 = at("x1") - s4
GREEN_MEDIA = 6.367              # green frame inside slider.mp4 (pixel-detected)
want_green = at("w3") + 0.75 - s4   # land on "fifty-three rupees"
ms4 = 0.5
rate4 = round(max(0.8, min(1.8, (GREEN_MEDIA - ms4) / want_green)), 3)
green_at = round((GREEN_MEDIA - ms4) / rate4, 3)  # scene-local time the meter turns green
scene("wow", s4, d4, video={"src": "slider.mp4", "ms": ms4, "rate": rate4},
      cam=[(0, 585, 700, 1.0, 560, 0),
           (0.6, METER[0], METER[1], 1.07, 600, 0.7)],
      body='<div class="chip" id="wow-c1">₹53 a day</div>',
      tl_extra=f"""
tl.set("#wow-c1",{{left:300,top:330,opacity:0,scale:0.7}},0);
tl.to("#wow-c1",{{opacity:1,scale:1,duration:0.24,ease:"back.out(2.2)"}},{round(green_at + 0.05, 2)});""")

# 5. Personalise: skip soya, re-plan.
s5 = at("x1") - 0.05
d5 = at("l1") - s5
scene("exclude", s5, d5, video={"src": "exclude.mp4", "ms": 0.7, "rate": 1.25},
      cam=[(0, 585, 900, 1.04, 720, 0)])

# 6. Shopping list.
s6 = at("l1") - 0.05
d6 = at("e1") - s6
scene("list", s6, d6, video={"src": "list.mp4", "ms": 0.8, "rate": 1.4},
      cam=[(0, 585, 900, 1.04, 760, 0)])

# 7. Embarko: the real site's prompt button, then the real deploy at 8x landing on "live".
s7 = at("e1") - 0.05
d7 = at("e2") - s7
scene("embarko", s7, d7, video={"src": "embarko.mp4", "ms": 1.6, "rate": 1.0},
      cam=[(0, 585, 1150, 1.0, 700, 0), (0.1, 585, 1150, 1.06, 720, 1.2)])
s8 = at("e2") - 0.05
d8 = at("c1") - s8
RATE8 = 9.0
LIVE_MEDIA = 40.0                 # the "Live: https://..." line prints at about 39.9 s in deploy.mp4
ms8 = round(max(8.0, LIVE_MEDIA - (d8 - 1.5) * RATE8), 2)
scene("deploy", s8, d8, video={"src": "deploy.mp4", "ms": ms8, "rate": RATE8},
      cam=[(0, 585, 1250, 1.07, 600, 0)],
      body='<div class="chip" id="deploy-c1">Real deploy, 9× speed</div><div class="ring" id="deploy-r1"></div>',
      tl_extra=f"""tl.set("#deploy-c1",{{left:130,top:1222,opacity:1}},0);
tl.set("#deploy-r1",{{left:-12,top:826,width:1104,height:196,opacity:0}},0);
tl.to("#deploy-r1",{{opacity:1,duration:0.12}},{round(d8 - 1.4, 2)});""")

# 8. End card: URL, hashtag, credit, AI-voice disclosure.
s9 = at("c1") - 0.05
d9 = TOTAL - s9
URL1, URL2 = "protein-recharge", ".embarko.app"
spans = "".join(f'<span class="ch">{c}</span>' for c in URL1) + "<br>" + "".join(f'<span class="ch">{c}</span>' for c in URL2)
scene("end", s9, d9, ground="#E6EAEA",
      body=f"""<div id="end-card"><div class="ec-cap">Try it free, on your phone</div>
<div class="ec-url" id="end-url">{spans}</div><div class="ec-perf"></div>
<div class="ec-band"><span id="end-tag">#DeployWithEmbarko</span></div></div>
<div id="end-credit">Built by Siddhant Patil with Claude Code · live on Embarko{"" if REAL_VOICE else "<br>Narration: AI clone of my own voice"}</div>""",
      css="""#end-card{position:absolute;left:100px;right:120px;top:300px;height:640px;background:#FFC21A;border:6px solid #14241E;border-radius:44px;overflow:hidden}
.ec-cap{position:absolute;left:52px;top:50px;font-weight:800;font-size:42px}
.ec-url{position:absolute;left:48px;right:30px;top:118px;font-family:'Bricolage',sans-serif;font-weight:800;font-size:84px;line-height:1.02;letter-spacing:-.04em;white-space:nowrap}
.ec-url span{opacity:0}
.ec-perf{position:absolute;left:52px;right:52px;top:372px;border-top:5px dashed rgba(20,36,30,.55)}
.ec-band{position:absolute;left:0;right:0;bottom:0;height:240px;background:#14241E;color:#FFC21A;display:flex;align-items:center;padding:0 52px;
  font-family:'Bricolage',sans-serif;font-weight:800;font-size:66px;letter-spacing:-.03em}
#end-tag{clip-path:inset(0 100% 0 0)}
#end-credit{position:absolute;left:130px;right:150px;top:960px;font-weight:600;font-size:30px;line-height:1.4;color:#4D5D57;text-align:center}""",
      tl_extra="""
tl.fromTo("#end-card",{clipPath:"inset(0 100% 0 0 round 44px)"},{clipPath:"inset(0 0% 0 0 round 44px)",duration:0.4,ease:"power3.out"},0);
tl.fromTo("#end-url .ch",{opacity:0},{opacity:1,duration:0.01,stagger:0.035},0.35);
tl.fromTo("#end-tag",{clipPath:"inset(0 100% 0 0)"},{clipPath:"inset(0 0% 0 0)",duration:0.4,ease:"power3.out"},1.5);
tl.fromTo("#end-credit",{opacity:0},{opacity:1,duration:0.3},1.9);""")

# brand mark file for the reveal
(HF / "assets" / "mark.svg").write_text(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M4 6h24a2 2 0 0 1 2 2v5a3 3 0 0 0 0 6v5a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-5a3 3 0 0 0 0-6V8a2 2 0 0 1 2-2Z" '
    'fill="#FFC21A" stroke="#14241E" stroke-width="1.6"/><path d="M11 11h9M11 14.5h9M11 11c4 0 4 7 0 7h-1l7 5" fill="none" stroke="#14241E" '
    'stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>')

# ------------------------------------------------------------------ captions (word-timed, brand style)
KEY = re.compile(r"(\d|₹|nine|whey|soya|paneer|fifty|free|goal|budget|Embarko)", re.I)
cue_html, cue_tl, srt = [], [], []
cues = []
for s_ in segs:
    v = vo[s_["id"]]
    for c in v["cues"]:
        cues.append([round(v["start"] + c["start"], 3), round(v["start"] + c["end"] + 0.12, 3), c["text"]])
cues.sort()
for i in range(len(cues) - 1):
    cues[i][1] = min(cues[i][1], round(cues[i + 1][0] - 0.03, 3))
for n, (a, b, text) in enumerate(cues, 1):
    words = "".join(f'<b class="k">{wd}</b> ' if KEY.search(wd) else f"{wd} " for wd in text.split()).strip()
    cue_html.append(f'<div id="cap{n}" class="cap clip" data-start="{a}" data-duration="{round(max(0.3, b - a), 3)}"><span class="in">{words}</span></div>')
    cue_tl.append(f'tl.fromTo("#cap{n} .in",{{scale:0.9,opacity:0.4}},{{scale:1,opacity:1,duration:0.12,ease:"back.out(2)"}},{a});')
    srt.append((a, b, text))
(HF / "compositions" / "captions.html").write_text(f"""<template>
  <style>{FONTS}
#root{{position:absolute;inset:0}}
.cap{{position:absolute;left:110px;right:130px;top:1040px;display:flex;justify-content:center}}
.cap .in{{display:inline-block;max-width:940px;text-align:center;background:#FFFFFF;border:5px solid #14241E;border-radius:22px;
  padding:14px 26px 18px;font-family:'Bricolage',sans-serif;font-weight:800;font-size:66px;line-height:1.05;letter-spacing:-.02em;color:#14241E;
  box-shadow:0 8px 0 #14241E}}
.cap .k{{background:#FFC21A;border-radius:10px;padding:0 8px;font-weight:800}}
  </style>
  <div id="root" data-composition-id="captions" data-width="{W}" data-height="{H}">
    {chr(10).join(cue_html)}
  </div>
  <script>
    const tl = gsap.timeline({{ paused: true }});
    {chr(10).join(cue_tl)}
    window.__timelines["captions"] = tl;
  </script>
</template>
""")


def ts(x):
    ms = int(round(x * 1000))
    return f"{ms // 3600000:02}:{ms // 60000 % 60:02}:{ms // 1000 % 60:02},{ms % 1000:03}"


(ROOT / ("protein-recharge-v2-real-voice.srt" if REAL_VOICE else "protein-recharge-v2.srt")).write_text(
    "\n".join(f"{i + 1}\n{ts(a)} --> {ts(b)}\n{t_}\n" for i, (a, b, t_) in enumerate(srt)))

# ------------------------------------------------------------------ sound
fx = []


def sfx(i, name, at_, vol):
    dur = {"sfx_001": 0.4, "sfx_002": 0.6, "sfx_003": 0.7, "sfx_004": 10.0}[name]
    fx.append(f'<audio id="fx{i}" class="clip" src=".media/audio/sfx/{name}.mp3" data-start="{round(at_, 3)}" '
              f'data-duration="{dur}" data-track-index="{20 + i}" data-volume="{vol}"></audio>')


sfx(0, "sfx_002", s2 - 0.1, 0.35)            # cut to the problem
sfx(1, "sfx_003", s3 + 0.02, 0.45)           # brand stamp
sfx(2, "sfx_004", s4 + green_at - 10.0, 0.22)  # riser cresting on green
sfx(3, "sfx_003", s4 + green_at + 0.02, 0.8)   # goal hit
sfx(4, "sfx_002", s7 - 0.1, 0.3)             # into Embarko
sfx(5, "sfx_003", s9 + 1.5, 0.45)            # hashtag lands
for k in range(4):                           # URL typing ticks (rotated, quiet)
    sfx(6 + k, "sfx_001", s9 + 0.38 + k * 0.25, 0.18)
for i, s in enumerate(segs):
    v = vo[s["id"]]
    fx.append(f'<audio id="vo{i + 1:02d}" class="clip" src="assets/{v["file"]}" data-start="{v["start"]}" '
              f'data-duration="{v["dur"]}" data-track-index="{40 + i}" data-volume="1"></audio>')

hosts = [f'<div id="{sid}" data-composition-id="{sid}" data-composition-src="compositions/{sid}.html" data-start="{st}" '
         f'data-duration="{du}" data-track-index="1" data-track-kind="graphics" data-width="{W}" data-height="{H}" style="z-index:1"></div>'
         for sid, st, du in scenes]
hosts.append(f'<div id="captions" data-composition-id="captions" data-composition-src="compositions/captions.html" '
             f'data-start="0" data-duration="{TOTAL}" data-track-index="5" data-track-kind="captions" data-width="{W}" data-height="{H}" '
             f'style="z-index:10"></div>')
(HF / "index.html").write_text(f"""<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width={W}, height={H}" />
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
    <style>* {{ margin:0; padding:0; box-sizing:border-box; }} html, body {{ margin:0; width:{W}px; height:{H}px; overflow:hidden; background:#E6EAEA; }} #root {{ position:relative; width:100%; height:100%; }}</style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="{TOTAL}" data-width="{W}" data-height="{H}">
      {chr(10).join(hosts)}
      {chr(10).join(fx)}
    </div>
    <script>
      const tl = gsap.timeline({{ paused: true }});
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
""")
json.dump({"total": TOTAL, "scenes": scenes, "vo": {k: [v["start"], v["dur"]] for k, v in vo.items()},
           "slider_rate": rate4, "green_at_abs": round(s4 + green_at, 3)},
          open(ROOT / "timing_v2.json", "w"), indent=1)
print("total", TOTAL, "| slider rate", rate4, "| green at", round(s4 + green_at, 2))
