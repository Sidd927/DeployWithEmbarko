"""Protein Recharge v4: the app IS the frame.
Every product shot is a full-bleed, purpose-built 360 x 640 (9:16) capture of the live app at 4.5x density
(video/v4/capture_v4.mjs). The voice, script and caption timing are unchanged from v3.
Run: python3 video/v4/build_v4.py   then render from video/v4/hf.
"""
import json
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent
PROJECT = ROOT.parents[1]
HF = ROOT / "hf"
W, H = 1080, 1920
INK, HALDI, MUTED = "#14241E", "#FFC21A", "#9FB0AA"
K = 3.0                     # output px per CSS px at zoom 1 (360-wide app footage)
KD = 1080 / 390             # deploy footage: 390-wide terminal recording
DEPLOY_H = 2532 * 1080 / 1170
CAP_TOP = 1114              # caption text top; text-safe band for Reels/Shorts is y 288-1248, x 48-888

# ---------------------------------------------------------------- scaffold
for d in ("compositions", "assets/footage", "assets/fonts"):
    (HF / d).mkdir(parents=True, exist_ok=True)
for name in ("foods", "plan", "setup", "budget", "exclude", "list", "embarko", "live", "share", "deploy13"):
    src, dst = ROOT / "footage" / f"{name}.mp4", HF / "assets/footage" / f"{name}.mp4"
    if not dst.exists() or dst.stat().st_mtime < src.stat().st_mtime:
        shutil.copy2(src, dst)
# deploy13.mp4 = the real deploy recording (video/footage/deploy.mp4) from 0.4 s, sped up 13.09x with ffmpeg setpts
for f in ("bricolage.woff2", "figtree.woff2"):
    shutil.copy2(PROJECT / "video/hf/assets/fonts" / f, HF / "assets/fonts" / f)
if not (HF / ".media").exists():
    shutil.copytree(PROJECT / "video/hf/.media", HF / ".media")
if (HF / "assets/vo-real").exists():
    shutil.rmtree(HF / "assets/vo-real")
shutil.copytree(PROJECT / "video/v2/hf/assets/vo-real", HF / "assets/vo-real")   # your real voice, unchanged
shutil.copy2(PROJECT / "video/v3/hf/assets/mark.svg", HF / "assets/mark.svg")
for f in ("hyperframes.json", "package.json"):
    shutil.copy2(PROJECT / "video/hf" / f, HF / f)
(HF / "meta.json").write_text(json.dumps({"id": "protein-recharge-v4", "name": "Protein Recharge v4"}))
MARKS = json.loads((ROOT / "footage/marks.json").read_text())

# ---------------------------------------------------------------- voice timeline (identical to v3)
segs = json.loads((PROJECT / "video/v2/segments_v2.json").read_text())
man = {m["id"]: m for m in json.loads((HF / "assets/vo-real/manifest.json").read_text())}
GAP = {"h1": 0.2, "h2": 0.3, "p1": 0.15, "p2": 0.35, "s1": 0.1, "s2": 0.25, "w1": 0.1, "w2": 0.05,
       "w3": 0.55, "x1": 0.25, "l1": 0.3, "e1": 0.1, "e2": 0.4, "c1": 0.12, "c2": 0.0}
t = 0.3
vo = {}
for s in segs:
    m = man[s["id"]]
    vo[s["id"]] = {"start": round(t, 3), "dur": m["duration"], "file": m["file"], "cues": m["cues"]}
    t += m["duration"] + GAP[s["id"]]
TOTAL = round(max(t + 1.7, 41.0), 2)
at = lambda i: vo[i]["start"]
WORDS = json.loads((ROOT / "words.json").read_text())        # absolute word times from your clips


def word(line, w, k=0):
    hits = [x for x in WORDS[line] if x[0].lower().strip(".,?!").startswith(w)]
    return hits[k][1]


FONTS = """
@font-face{font-family:'Bricolage';src:url('assets/fonts/bricolage.woff2') format('woff2');font-weight:200 800;font-display:block}
@font-face{font-family:'Figtree';src:url('assets/fonts/figtree.woff2') format('woff2');font-weight:300 900;font-display:block}
"""
BASE = f"""
#root{{position:absolute;inset:0;overflow:hidden;background:{INK};color:#fff;font-family:'Figtree',sans-serif}}
.cam{{position:absolute;left:0;top:0;width:{W}px;height:{H}px;transform-origin:0 0}}
.cam video{{position:absolute;left:0;top:0;width:{W}px;height:{H}px;display:block}}
.cam video.dep{{height:{DEPLOY_H:.1f}px}}
.ring{{position:absolute;border:6px solid {HALDI};border-radius:18px;box-shadow:0 0 0 3px rgba(20,36,30,.18)}}
.chip{{position:absolute;display:flex;align-items:center;gap:14px;background:{INK};color:#fff;font-weight:700;font-size:34px;
      padding:12px 24px 14px;border-radius:999px;white-space:nowrap}}
.chip i{{width:16px;height:16px;border-radius:50%;background:#3ccf7e;display:block}}
.chip b{{color:{HALDI};font-weight:800}}
"""


def cam_t(z, fx=None, fy=None, sx=540, sy=None, tx=None, ty=None, kk=K, fh=H):
    """Camera transform: put CSS point (fx, fy) at stage (sx, sy) at zoom z, clamped so footage always fills the frame."""
    if tx is None:
        tx = sx - fx * kk * z if fx is not None else (W - W * z) / 2
    if ty is None:
        ty = sy - fy * kk * z if fy is not None else 0.0
    tx = min(0.0, max(W - W * z, tx))
    ty = min(0.0, max(H - fh * z, ty))
    return round(tx, 1), round(ty, 1), z


def box(x0, y0, x1, y1, pad=8, kk=K):
    """Ring box in camera-local px from a CSS-px element box."""
    return (f"left:{round((x0 - pad) * kk)}px;top:{round((y0 - pad) * kk)}px;"
            f"width:{round((x1 - x0 + 2 * pad) * kk)}px;height:{round((y1 - y0 + 2 * pad) * kk)}px")


scenes = []


def write_scene(sid, start, dur, inner, css="", tl=""):
    (HF / "compositions" / f"{sid}.html").write_text(f"""<template>
  <style>{FONTS}{BASE}{css}</style>
  <div id="root" data-composition-id="{sid}" data-width="{W}" data-height="{H}">
    {inner}
  </div>
  <script>
    const tl = gsap.timeline({{ paused: true }});
    {tl}
    window.__timelines["{sid}"] = tl;
  </script>
</template>
""")
    scenes.append((sid, round(start, 3), round(dur, 3)))


def shot(sid, start, end, clips, cam0, moves=(), inside="", extra="", tl_extra="", css="", deploy=False):
    """A full-bleed shot. clips: [(src, local_start, local_dur, media_start, rate)]. moves: [(t, (tx,ty,z), dur, ease)]."""
    dur = round(end - start, 3)
    vids = "".join(
        f'<video id="{sid}-v{i}" class="clip{" dep" if deploy else ""}" src="assets/footage/{src}" data-start="{round(ls, 3)}" '
        f'data-duration="{round(ld, 3)}" data-media-start="{round(ms, 3)}" data-playback-rate="{rate}" data-track-index="{2 + i}" muted playsinline></video>'
        for i, (src, ls, ld, ms, rate) in enumerate(clips))
    tx, ty, z = cam0
    tl = [f'tl.set("#{sid}-cam",{{x:{tx},y:{ty},scale:{z}}},0);']
    for (mt, (mx, my, mz), md, ease) in moves:
        tl.append(f'tl.to("#{sid}-cam",{{x:{mx},y:{my},scale:{mz},duration:{round(md, 3)},ease:"{ease}"}},{round(mt, 3)});')
    tl.append(tl_extra)
    write_scene(sid, start, dur, f'<div class="cam" id="{sid}-cam">{vids}{inside}</div>{extra}', css=css, tl="\n".join(tl))
    return dur


def ring_in(sel, t_, d=0.22):
    return f'tl.fromTo("{sel}",{{opacity:0,scale:1.12}},{{opacity:1,scale:1,duration:{d},ease:"power3.out"}},{round(t_, 3)});'


# ================================================================= SHOTS
cut = lambda i, lead=0.05: at(i) - lead

# 1-2 HOOK: real Foods ranking, close on soya 37.1 g; the real list scrolls 10 rows down to whey; pull back.
S1, E1 = 0.0, cut("p1")
ms1 = round(MARKS["foods"]["scroll"] - (word("h1", "9") + 0.08), 3)        # the list starts moving on "nine"
scroll_t = MARKS["foods"]["scroll"] - ms1
whey_t = word("h1", "whey") - 0.18
shot("hook", S1, E1, [("foods.mp4", 0, E1 - S1, ms1, 1)],
     cam_t(1.08),
     moves=[(scroll_t, cam_t(1.08, ty=-120), 0.6, "power2.inOut"),
            (scroll_t + 0.6, cam_t(1.12, ty=-150), at("h2") - 0.05 - scroll_t - 0.6, "sine.inOut"),
            (at("h2") - 0.05, cam_t(1.0), 1.4, "power2.inOut")],
     inside=f'<div class="ring" id="hook-s" style="{box(28, 212, 332, 297, 6)}"></div>'
            f'<div class="ring" id="hook-r" style="{box(28, 250, 332, 336, 6)};opacity:0"></div>',
     tl_extra=f'tl.to("#hook-s",{{opacity:0,duration:0.12}},{round(scroll_t - 0.05, 3)});\n' + ring_in("#hook-r", whey_t))

# 3 THE TURN: the ranking blurs back, the line lands as type over it
S2, E2 = E1, cut("p2")
k2 = vo["p1"]["start"] + vo["p1"]["cues"][min(1, len(vo["p1"]["cues"]) - 1)]["start"] - S2
shot("turn", S2, E2, [("foods.mp4", 0, E2 - S2, 6.2, 1)], cam_t(1.0),
     moves=[(0, cam_t(1.08), E2 - S2, "none")],
     extra="""<div id="tn-g"><div id="tn-a">½ kg</div><div id="tn-b">of soya.</div><div id="tn-c">Every day?</div></div>""",
     css=f"""
#turn-cam video{{filter:blur(16px) brightness(.38) saturate(.7)}}
#tn-g{{position:absolute;inset:0;transform-origin:20% 45%}}
#tn-a{{position:absolute;left:80px;top:380px;font-family:'Bricolage',sans-serif;font-weight:800;font-size:330px;line-height:.9;letter-spacing:-.05em;color:{HALDI}}}
#tn-b,#tn-c{{position:absolute;left:86px;font-family:'Bricolage',sans-serif;font-weight:800;font-size:130px;line-height:1;letter-spacing:-.04em;color:#fff}}
#tn-b{{top:730px}} #tn-c{{top:870px}}""",
     tl_extra=f"""
tl.fromTo("#turn-cam",{{opacity:0.3}},{{opacity:1,duration:0.25}},0);
tl.fromTo("#tn-g",{{scale:1}},{{scale:1.05,duration:{round(E2 - S2, 2)},ease:"none"}},0);
tl.fromTo("#tn-a",{{scale:1.3,opacity:0,transformOrigin:"0% 60%"}},{{scale:1,opacity:1,duration:0.32,ease:"back.out(1.8)"}},0.05);
tl.fromTo("#tn-b",{{clipPath:"inset(0 100% 0 0)"}},{{clipPath:"inset(0 0% 0 0)",duration:0.3,ease:"power3.out"}},{round(max(0.35, k2 - 0.1), 2)});
tl.fromTo("#tn-c",{{clipPath:"inset(0 100% 0 0)"}},{{clipPath:"inset(0 0% 0 0)",duration:0.3,ease:"power3.out"}},{round(word("p1", "every") - S2 - 0.1, 2)});""")

# 4 THE GAP: the app's own equation, close; rings follow the voice (30 g, then 109 g)
S3, E3 = E2, cut("s1")
shot("gap", S3, E3, [("plan.mp4", 0, E3 - S3, 0.3, 1)],
     cam_t(1.3, tx=W - W * 1.3, ty=0),
     moves=[(0, cam_t(1.34, tx=W - W * 1.34, ty=0), 2.4, "sine.inOut"),
            (word("p2", "if") - S3 - 0.1, cam_t(1.34, tx=0, ty=0), 1.3, "power2.inOut"),
            (word("p2", "100") - S3 + 0.3, cam_t(1.38, tx=0, ty=0), E3 - word("p2", "100") - 0.3, "sine.out")],
     inside=f'<div class="ring" id="gap-a" style="{box(217, 138, 276, 174, 7)};opacity:0"></div>'
            f'<div class="ring" id="gap-b" style="{box(16, 138, 93, 174, 7)};opacity:0"></div>',
     tl_extra=ring_in("#gap-a", word("p2", "30") - S3 - 0.05) +
     f'\ntl.to("#gap-a",{{opacity:0,duration:0.2}},{round(word("p2", "100") - S3 - 0.1, 3)});\n' +
     ring_in("#gap-b", word("p2", "100") - S3 - 0.05))

# 5 THE REVEAL: the app's own landing hero, slow push
S4, E4 = E3, word("s2", "weight") - 0.15
shot("reveal", S4, E4, [("setup.mp4", 0, E4 - S4, 0.0, 0.8)], cam_t(1.1, tx=-14 * K * 1.1, ty=0),
     moves=[(0, cam_t(1.13, tx=-14 * K * 1.13, ty=0), E4 - S4, "sine.inOut")])

# 6 SETUP: four real answers, cut on four words
S5, E5 = E4, word("w1", "now") - 0.1
c_diet, c_kettle, c_mess = word("s2", "diet") - 0.12, word("s2", "kettle") - 0.12, word("s2", "mess") - 0.12
sm = MARKS["setup"]
shot("setup", S5, E5, [
    ("setup.mp4", 0, c_diet - S5, sm["q_weight"] + 0.05, 1.0),
    ("setup.mp4", c_diet - S5, c_kettle - c_diet, sm["q_diet"] + 0.05, 1.0),
    ("setup.mp4", c_kettle - S5, c_mess - c_kettle, sm["q_kitchen"] + 0.05, 1.0),
    ("setup.mp4", c_mess - S5, E5 - c_mess, sm["q_mess"] + 0.05, 1.0)],
    cam_t(1.0),
    moves=[(c_diet - S5, cam_t(1.2, tx=0, ty=-384), 0.001, "none"),
           (c_kettle - S5, cam_t(1.06, tx=-32, ty=-60), 0.001, "none"),
           (c_mess - S5, cam_t(1.0), 0.001, "none")])

# 7 THE PAYOFF: real drag ₹20 -> ₹53; the meter goes from red "short" to green "Goal hit" on "53"
S6, E6 = E5, cut("x1")
GREEN_MEDIA = 6.70                      # measured: first frame with the meter green
DOWN_MEDIA = MARKS["budget"]["drag"]    # finger down on the slider
green_at = word("w3", "53") + 0.22
rate6 = round((GREEN_MEDIA - DOWN_MEDIA) / (green_at - (word("w1", "drag") + 0.02)), 3)
ms6 = round(DOWN_MEDIA - (word("w1", "drag") + 0.02 - S6) * rate6, 3)
g6 = green_at - S6
shot("payoff", S6, E6, [("budget.mp4", 0, E6 - S6, ms6, rate6)], cam_t(1.0),
     moves=[(g6 + 0.25, cam_t(1.07, tx=-38, ty=0), E6 - S6 - g6 - 0.4, "sine.inOut")],
     inside=f'<div class="ring" id="pay-r" style="{box(16, 238, 344, 352, 4)};opacity:0"></div>',
     tl_extra=f"""tl.fromTo("#pay-r",{{opacity:0}},{{opacity:1,duration:0.08}},{round(g6, 3)});
tl.to("#pay-r",{{opacity:0,duration:0.6,ease:"power2.out"}},{round(g6 + 0.9, 3)});""")

# 8 SKIP A FOOD
S7, E7 = E6, cut("l1")
xm = MARKS["exclude"]
rate7 = 1.4
ms7 = round(xm["tap_row"] - (word("x1", "skip") + 0.25 - S7) * rate7, 3)
shot("skip", S7, E7, [("exclude.mp4", 0, E7 - S7, ms7, rate7)], cam_t(1.0),
     moves=[(0.2, cam_t(1.04, tx=-22, ty=0), E7 - S7 - 0.3, "sine.inOut")])

# 9 SHOPPING LIST
S8, E8 = E7, cut("e1")
lm = MARKS["list"]
ms8 = round(lm["tap"] - 0.15 * 1.2, 3)
shot("list", S8, E8, [("list.mp4", 0, E8 - S8, ms8, 1.2)], cam_t(1.0),
     moves=[(0.2, cam_t(1.04, tx=-22, ty=0), E8 - S8 - 0.3, "sine.inOut")])

# 10 EMBARKO: the real site, tap "Copy deployment prompt" on "Embarko"
S9, E9 = E8, cut("e2")
em = MARKS["embarko"]
ms9 = round(em["tap"] - (word("e1", "embarko") + 0.1 - S9) * 1.3, 3)
shot("site", S9, E9, [("embarko.mp4", 0, E9 - S9, ms9, 1.3)], cam_t(1.0),
     moves=[(0.1, cam_t(1.04, tx=-22, ty=0), E9 - S9 - 0.2, "sine.inOut")])

# 11 THE REAL DEPLOY: from the first command to live (success); the clock is the recording's own elapsed time
S10, E10 = E9, word("e2", "under") - 0.12
LIVE_MEDIA = 37.17                     # measured: first frame showing "status: live (success)"
live_t = word("e2", "live") - 0.08
rate10 = 13.09                         # deploy13.mp4 is pre-sped by exactly this factor
live_t = S10 + (LIVE_MEDIA - 0.4) / rate10
end_media = min(42.1, 0.4 + (E10 - S10) * rate10)
shot("deploy", S10, E10, [("deploy13.mp4", 0, E10 - S10, 0.0, 1)], (0.0, 250.0, 1.0),
     moves=[(0.45, (0.0, -420.0, 1.0), live_t - S10 - 0.5, "sine.inOut")],
     inside=f'<div class="ring" id="dp-r" style="left:-14px;top:{round(1432 * 1080 / 1170)}px;width:1108px;height:{round((1618 - 1432) * 1080 / 1170)}px;opacity:0"></div>',
     extra=f'<div class="chip" id="dp-c" style="left:60px;top:300px"><b>Real deploy</b> · {round(rate10)}× speed · <span id="dp-t">0:00</span></div>',
     deploy=True,
     tl_extra=f"""{ring_in("#dp-r", live_t - S10)}
tl.fromTo("#dp-c",{{opacity:0,y:-10}},{{opacity:1,y:0,duration:0.2}},0.1);
const clk = {{v:0.4}};
tl.to(clk,{{v:{round(end_media, 2)},duration:{round(E10 - S10, 3)},ease:"none",
  onUpdate:()=>{{const s=Math.floor(clk.v);document.querySelector("#dp-t").textContent="0:"+String(s).padStart(2,"0");}}}},0);""")

# 12 PROOF: the live app loaded by its URL, then "Free, no sign-up" on "free"
S11, E11 = E10, cut("c2")
lv = MARKS["live"]
rate11 = 1.5
ms11 = round(lv["scroll"] - (word("c1", "free") - 0.45 - S11) * rate11, 3)
shot("proof", S11, E11, [("live.mp4", 0, E11 - S11, max(0.0, ms11), rate11)], cam_t(1.0),
     moves=[(0.05, cam_t(1.06, tx=-32, ty=-40), E11 - S11 - 0.1, "sine.inOut")],
     inside=f'<div class="ring" id="pf-r" style="{box(16, 300, 344, 319, 9)};opacity:0"></div>',
     tl_extra=ring_in("#pf-r", word("c1", "free") - S11))

# 13 SEND IT: the app's real Share plan -> "Link copied"
S12, E12 = E11, round(word("c2", "freak") + 0.62, 2)
sh = MARKS["share"]
ms12 = round(sh["tap"] - (word("c2", "send") + 0.15 - S12), 3)
shot("share", S12, E12, [("share.mp4", 0, E12 - S12, ms12, 1.0)], cam_t(1.0),
     moves=[(0.1, cam_t(1.05, tx=-27, ty=-40), E12 - S12 - 0.15, "sine.inOut")])

# 14 END CARD: full-frame haldi voucher
S13 = E12
spans = "".join(f'<span class="ch">{c}</span>' for c in "protein-recharge") + "<br>" + "".join(f'<span class="ch">{c}</span>' for c in ".embarko.app")
write_scene("end", S13, TOTAL - S13, f"""
<div id="ec"><div id="ec-mark"></div><div class="ec-cap">Free. No sign-up. On your phone.</div>
<div class="ec-url">{spans}</div><div class="ec-perf"></div>
<div class="ec-tag" id="ec-tag">#DeployWithEmbarko</div>
<div id="ec-credit">Built by Siddhant Patil with Claude Code · live on Embarko</div></div>""",
css=f"""
#ec{{position:absolute;inset:0;background:{HALDI};color:{INK}}}
.ec-cap{{position:absolute;left:80px;top:520px;font-weight:800;font-size:50px}}
#ec-mark{{position:absolute;left:80px;top:330px;width:150px;height:150px;background:url('assets/mark.svg') center/contain no-repeat}}
.ec-url{{position:absolute;left:74px;top:600px;font-family:'Bricolage',sans-serif;font-weight:800;font-size:122px;line-height:1.0;letter-spacing:-.045em;white-space:nowrap}}
.ec-url span{{opacity:0}}
.ec-perf{{position:absolute;left:80px;width:800px;top:892px;border-top:6px dashed rgba(20,36,30,.45)}}
.ec-tag{{position:absolute;left:80px;top:940px;font-family:'Bricolage',sans-serif;font-weight:800;font-size:86px;letter-spacing:-.03em;clip-path:inset(0 100% 0 0)}}
#ec-credit{{position:absolute;left:80px;width:800px;top:1080px;font-weight:700;font-size:32px;color:rgba(20,36,30,.72)}}
""",
tl="""
tl.fromTo("#ec",{clipPath:"inset(100% 0 0 0)"},{clipPath:"inset(0% 0 0 0)",duration:0.32,ease:"power3.out"},0);
tl.fromTo("#ec-mark",{scale:0.4,rotation:-14},{scale:1,rotation:0,duration:0.4,ease:"back.out(1.8)"},0.1);
tl.fromTo("#ec .ch",{opacity:0},{opacity:1,duration:0.01,stagger:0.026},0.22);
tl.fromTo("#ec-tag",{clipPath:"inset(0 100% 0 0)"},{clipPath:"inset(0 0% 0 0)",duration:0.35,ease:"power3.out"},0.95);
tl.fromTo("#ec-credit",{opacity:0},{opacity:1,duration:0.3},1.2);""")

# ================================================================= CAPTIONS: v3 text and timing, on a soft band at the bottom of the safe area
KEY = re.compile(r"(\d|₹|nine|soya|whey|goal|free|Embarko|live)", re.I)
cues = []
for s in segs:
    v = vo[s["id"]]
    for c in v["cues"]:
        cues.append([round(v["start"] + c["start"], 3), round(v["start"] + c["end"] + 0.15, 3), c["text"]])
cues.sort()
for i in range(len(cues) - 1):
    cues[i][1] = min(cues[i][1], round(cues[i + 1][0] - 0.03, 3))
# the band shows while captions are on screen; groups merge across short gaps so it never flickers
cues[0][0] = 0.05                      # the first line is on screen from the first frame (hook / thumbnail)
html, tl, srt = [], [], []
for n, (a, b_, text) in enumerate(cues, 1):
    words = "".join(f'<b>{w}</b> ' if KEY.search(w) else f"{w} " for w in text.split()).strip()
    html.append(f'<div id="cap{n}" class="cap clip" data-start="{a}" data-duration="{round(max(0.3, b_ - a), 3)}" data-track-index="2"><div class="w"><span class="in">{words}</span></div></div>')
    tl.append(f'tl.fromTo("#cap{n} .w",{{y:10,opacity:0}},{{y:0,opacity:1,duration:0.12,ease:"power2.out"}},{a});')
    srt.append((a, b_, text))
(HF / "compositions/captions.html").write_text(f"""<template>
  <style>{FONTS}
#root{{position:absolute;inset:0}}
.cap{{position:absolute;left:60px;right:192px;top:{CAP_TOP}px;display:flex;justify-content:center;text-align:center}}
.cap .in{{display:inline;font-family:'Figtree',sans-serif;font-weight:800;font-size:44px;line-height:1.44;color:#FFFFFF;
  background:rgba(20,36,30,.9);padding:5px 20px 8px;border-radius:16px;-webkit-box-decoration-break:clone;box-decoration-break:clone}}
.cap .w{{display:block}}
.cap b{{color:{HALDI};font-weight:800}}
  </style>
  <div id="root" data-composition-id="captions" data-width="{W}" data-height="{H}">
    {chr(10).join(html)}
  </div>
  <script>
    const tl = gsap.timeline({{ paused: true }});
    {chr(10).join(tl)}
    window.__timelines["captions"] = tl;
  </script>
</template>
""")


def ts(x):
    ms = int(round(x * 1000))
    return f"{ms // 3600000:02}:{ms // 60000 % 60:02}:{ms // 1000 % 60:02},{ms % 1000:03}"


(ROOT / "protein-recharge-v4.srt").write_text("\n".join(f"{i + 1}\n{ts(a)} --> {ts(b_)}\n{t_}\n" for i, (a, b_, t_) in enumerate(srt)))

# ================================================================= SOUND: v3's restrained palette, every hit tied to a real event
fx = []


def sfx(i, name, t_, vol):
    dur = {"sfx_001": 0.4, "sfx_002": 0.6, "sfx_003": 0.7, "sfx_004": 10.0}[name]
    fx.append(f'<audio id="fx{i}" class="clip" src=".media/audio/sfx/{name}.mp3" data-start="{round(max(0, t_), 3)}" '
              f'data-duration="{dur}" data-track-index="{20 + i}" data-volume="{vol}"></audio>')


sfx(0, "sfx_003", whey_t, 0.3)                                    # ring lands on whey
sfx(1, "sfx_002", S2 - 0.08, 0.2)                                 # into the turn
sfx(2, "sfx_001", c_diet + 0.45, 0.14)                            # real taps in setup
sfx(3, "sfx_001", c_kettle + 0.45, 0.14)
sfx(4, "sfx_001", c_mess + 0.45, 0.14)
sfx(5, "sfx_004", S6 + g6 - 10.0, 0.16)                           # riser cresting on the goal
sfx(6, "sfx_003", S6 + g6 + 0.02, 0.55)                           # goal hit
sfx(7, "sfx_001", S7 + (xm["tap_row"] - ms7) / rate7, 0.14)       # tap soya
sfx(8, "sfx_001", S7 + (xm["tap_skip"] - ms7) / rate7, 0.14)      # Don't suggest
sfx(9, "sfx_001", S9 + (em["tap"] - ms9) / 1.3, 0.14)             # Copy deployment prompt
sfx(10, "sfx_002", S10 - 0.08, 0.2)                               # into the deploy
sfx(11, "sfx_003", live_t, 0.32)                                  # live
sfx(12, "sfx_001", S12 + (sh["tap"] - ms12), 0.16)                # Share plan
sfx(13, "sfx_003", S13 + 0.95, 0.3)                               # hashtag
for i, s in enumerate(segs):
    v = vo[s["id"]]
    fx.append(f'<audio id="vo{i + 1:02d}" class="clip" src="assets/{v["file"]}" data-start="{v["start"]}" '
              f'data-duration="{v["dur"]}" data-track-index="{40 + i}" data-volume="1"></audio>')

hosts = [f'<div id="{sid}" data-composition-id="{sid}" data-composition-src="compositions/{sid}.html" data-start="{st}" '
         f'data-duration="{du}" data-track-index="1" data-track-kind="graphics" data-width="{W}" data-height="{H}" style="z-index:1"></div>'
         for sid, st, du in scenes]
hosts.append(f'<div id="captions" data-composition-id="captions" data-composition-src="compositions/captions.html" data-start="0" '
             f'data-duration="{TOTAL}" data-track-index="5" data-track-kind="captions" data-width="{W}" data-height="{H}" style="z-index:10"></div>')
(HF / "index.html").write_text(f"""<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width={W}, height={H}" />
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
    <style>* {{ margin:0; padding:0; box-sizing:border-box; }} html, body {{ margin:0; width:{W}px; height:{H}px; overflow:hidden; background:{INK}; }} #root {{ position:relative; width:100%; height:100%; background:{INK}; }}</style>
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
           "green_at_abs": round(S6 + g6, 3), "payoff_rate": rate6, "deploy_rate": rate10, "live_at_abs": round(live_t, 3)},
          open(ROOT / "timing_v4.json", "w"), indent=1)
print("total", TOTAL, "| green", round(S6 + g6, 2), "rate", rate6, "| deploy rate", rate10, "live", round(live_t, 2),
      "| ms:", {"hook": ms1, "payoff": ms6, "skip": ms7, "site": ms9, "proof": ms11, "share": ms12})
