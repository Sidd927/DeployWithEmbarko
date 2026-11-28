"""Protein Recharge v3: dark brand stage, one persistent screen card, caption lane that never covers the UI.
Real voice (video/v2/hf/assets/vo-real, git-ignored) drives the timeline. Run: python3 video/v3/build_v3.py
"""
import json
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent
PROJECT = ROOT.parents[1]
HF = ROOT / "hf"
W, H = 1080, 1920
INK, HALDI, STEEL, MUTED = "#14241E", "#FFC21A", "#E6EAEA", "#9FB0AA"
CARD = dict(x=40, y=230, w=1000, h=850, r=40)
S = CARD["w"] / 1170                      # footage frames are 1170 x 2532
FOOT_H = 2532 * S
LANE_TOP = 1094                           # caption lane: below the card, above the Reels/Shorts bottom UI

# ---------------------------------------------------------------- scaffold
for d in ("compositions", "assets/footage", "assets/fonts"):
    (HF / d).mkdir(parents=True, exist_ok=True)
for name in ("rank", "packs", "setup", "slider2", "exclude", "list", "embarko", "deploy"):
    src, dst = PROJECT / "video/footage" / f"{name}.mp4", HF / "assets/footage" / f"{name}.mp4"
    if src.exists() and (not dst.exists() or dst.stat().st_mtime < src.stat().st_mtime):
        shutil.copy2(src, dst)
for f in ("bricolage.woff2", "figtree.woff2"):
    shutil.copy2(PROJECT / "video/hf/assets/fonts" / f, HF / "assets/fonts" / f)
if not (HF / ".media").exists():
    shutil.copytree(PROJECT / "video/hf/.media", HF / ".media")
vo_src = PROJECT / "video/v2/hf/assets/vo-real"
if (HF / "assets/vo-real").exists():
    shutil.rmtree(HF / "assets/vo-real")
shutil.copytree(vo_src, HF / "assets/vo-real")
for f in ("hyperframes.json", "package.json"):
    shutil.copy2(PROJECT / "video/hf" / f, HF / f)
(HF / "meta.json").write_text(json.dumps({"id": "protein-recharge-v3", "name": "Protein Recharge v3"}))
(HF / "assets/mark.svg").write_text(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M4 6h24a2 2 0 0 1 2 2v5a3 3 0 0 0 0 6v5a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-5a3 3 0 0 0 0-6V8a2 2 0 0 1 2-2Z" '
    'fill="#FFC21A" stroke="#14241E" stroke-width="1.6"/><path d="M11 11h9M11 14.5h9M11 11c4 0 4 7 0 7h-1l7 5" fill="none" stroke="#14241E" '
    'stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>')

# ---------------------------------------------------------------- voice timeline
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
end_ = lambda i: vo[i]["start"] + vo[i]["dur"]
cue_at = lambda i, k: vo[i]["start"] + vo[i]["cues"][min(k, len(vo[i]["cues"]) - 1)]["start"]

FONTS = """
@font-face{font-family:'Bricolage';src:url('assets/fonts/bricolage.woff2') format('woff2');font-weight:200 800;font-display:block}
@font-face{font-family:'Figtree';src:url('assets/fonts/figtree.woff2') format('woff2');font-weight:300 900;font-display:block}
"""
BASE = f"""
#root{{position:absolute;inset:0;overflow:hidden;background:{INK};color:#fff;font-family:'Figtree',sans-serif}}
.card{{position:absolute;left:{CARD['x']}px;top:{CARD['y']}px;width:{CARD['w']}px;height:{CARD['h']}px;border-radius:{CARD['r']}px;
      overflow:hidden;background:{STEEL};box-shadow:0 0 0 2px rgba(255,255,255,.08)}}
.cam{{position:absolute;left:0;top:0;width:{CARD['w']}px;transform-origin:0 0}}
.cam video{{display:block;width:{CARD['w']}px;height:auto}}
.ring{{position:absolute;border:6px solid {HALDI};border-radius:20px}}
.chip{{position:absolute;background:{HALDI};color:{INK};font-family:'Bricolage',sans-serif;font-weight:800;font-size:46px;
      letter-spacing:-.02em;padding:10px 22px 12px;border-radius:16px;white-space:nowrap}}
.flash{{position:absolute;left:{CARD['x'] - 8}px;top:{CARD['y'] - 8}px;width:{CARD['w'] + 16}px;height:{CARD['h'] + 16}px;
       border:8px solid {HALDI};border-radius:{CARD['r'] + 8}px;opacity:0}}
"""


def cam_xy(fx, fy, z, cy):
    """Card-local translate so footage point (fx, fy) sits at card (500, cy) at zoom z, clamped to the footage."""
    tx = min(0.0, max(CARD["w"] - CARD["w"] * z, CARD["w"] / 2 - fx * S * z))
    ty = min(0.0, max(CARD["h"] - FOOT_H * z, cy - fy * S * z))
    return round(tx, 1), round(ty, 1)


def to_stage(fx, fy, cam):
    fx0, fy0, z, cy = cam
    tx, ty = cam_xy(fx0, fy0, z, cy)
    return CARD["x"] + fx * S * z + tx, CARD["y"] + fy * S * z + ty


scenes = []


def write_scene(sid, start, dur, inner, css="", tl=""):
    doc = f"""<template>
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
"""
    (HF / "compositions" / f"{sid}.html").write_text(doc)
    scenes.append((sid, round(start, 3), round(dur, 3)))


def card_scene(sid, start, dur, src, ms, rate, cam0, cam1=None, extra="", extra_tl="", enter="settle", inside=""):
    """A product shot in the persistent screen card. cam = (fx, fy, zoom, card_cy)."""
    x0, y0 = cam_xy(*cam0)
    inner = (f'<div class="card" id="{sid}-card"><div class="cam" id="{sid}-cam">'
             f'<video id="{sid}-v" class="clip" src="assets/footage/{src}" data-start="0" data-duration="{round(dur, 3)}" '
             f'data-media-start="{ms}" data-playback-rate="{rate}" data-track-index="2" muted playsinline></video>{inside}</div></div>{extra}')
    tl = [f'tl.set("#{sid}-cam",{{x:{x0},y:{y0},scale:{cam0[2]}}},0);']
    if enter == "settle":   # content settles in like a feed scroll; the card itself never moves
        tl.append(f'tl.fromTo("#{sid}-cam",{{y:{y0 + 70},opacity:0.2}},{{y:{y0},opacity:1,duration:0.32,ease:"power3.out"}},0);')
    elif enter == "rise":   # coming from a full-screen beat: the card rises into place
        tl.append(f'tl.fromTo("#{sid}-card",{{y:120,scale:0.94,opacity:0}},{{y:0,scale:1,opacity:1,duration:0.4,ease:"power3.out"}},0);')
    if cam1:
        x1, y1 = cam_xy(*cam1[:4])
        tl.append(f'tl.to("#{sid}-cam",{{x:{x1},y:{y1},scale:{cam1[2]},duration:{cam1[5]},ease:"sine.inOut"}},{cam1[4]});')
    tl.append(extra_tl)
    write_scene(sid, start, dur, inner, tl="\n".join(tl))


# ---------------------------------------------------------------- 1 HOOK: designed real-data comparison
SOYA, WHEY = 37.1, 4.1
BAR = 920
s0, d0 = 0.0, at("h2") - 0.05
stamp_t = cue_at("h1", 1) - 0.05
write_scene("hook", s0, d0, f"""
<div id="hook-g">
  <p id="hook-lbl">Protein you get for ₹10</p>
  <div class="hrow" id="hook-soya"><span class="nm">Soya chunks</span><span class="big hal">37 g</span>
    <div class="bar"><i id="hook-b1" style="width:{BAR}px;background:{HALDI}"></i></div></div>
  <div class="hrow" id="hook-whey"><span class="nm">Whey protein</span><span class="big">4 g</span>
    <div class="bar"><i id="hook-b2" style="width:{round(BAR * WHEY / SOYA)}px;background:#fff"></i></div></div>
  <div id="hook-x">9×</div>
  <p id="hook-src">Typical Indian shop prices, from the app</p>
</div>""",
css=f"""
#hook-g{{position:absolute;inset:0;transform-origin:8% 40%}}
#hook-lbl{{position:absolute;left:80px;top:312px;font-size:46px;font-weight:700;color:{MUTED}}}
.hrow{{position:absolute;left:80px;right:80px}}
#hook-soya{{top:420px}} #hook-whey{{top:748px}}
.nm{{display:block;font-size:54px;font-weight:700;color:#fff}}
.big{{display:block;font-family:'Bricolage',sans-serif;font-weight:800;font-size:205px;line-height:.95;letter-spacing:-.05em;color:#fff;margin-top:6px}}
.big.hal{{color:{HALDI}}}
.bar{{height:42px;margin-top:12px;border-radius:21px;background:rgba(255,255,255,.12);overflow:hidden}}
.bar i{{display:block;height:100%;border-radius:18px}}
#hook-x{{position:absolute;left:600px;top:760px;width:250px;height:250px;border-radius:50%;background:{HALDI};color:{INK};
  display:flex;align-items:center;justify-content:center;font-family:'Bricolage',sans-serif;font-weight:800;font-size:124px;letter-spacing:-.05em}}
#hook-src{{position:absolute;left:80px;top:372px;font-size:30px;font-weight:600;color:{MUTED}}}
""",
tl=f"""
tl.fromTo("#hook-g",{{scale:1}},{{scale:1.045,duration:{round(d0, 2)},ease:"none"}},0);
tl.fromTo("#hook-b1",{{width:{BAR - 120}}},{{width:{BAR},duration:0.45,ease:"power3.out"}},0);
tl.set("#hook-whey",{{opacity:0}},0);
tl.set("#hook-x",{{opacity:0,scale:0.4,rotation:-14}},0);
tl.fromTo("#hook-whey",{{opacity:0,y:40}},{{opacity:1,y:0,duration:0.28,ease:"power3.out"}},{round(stamp_t, 2)});
tl.fromTo("#hook-b2",{{width:0}},{{width:{round(BAR * WHEY / SOYA)},duration:0.35,ease:"power2.out"}},{round(stamp_t + 0.1, 2)});
tl.to("#hook-x",{{opacity:1,scale:1,rotation:-8,duration:0.34,ease:"back.out(2.2)"}},{round(stamp_t + 0.45, 2)});
""")

# ---------------------------------------------------------------- 2 PROOF: the real ranking scrolls to whey
s1 = at("h2") - 0.05
d1 = at("p1") - 0.05 - s1
WHEY_CAM = (585, 1040, 1.0, 380)
wx0, wy0 = to_stage(20, 920, WHEY_CAM)
wx1, wy1 = to_stage(1150, 1160, WHEY_CAM)
card_scene("proof", s1, d1, "rank.mp4", 1.55, 1.45, WHEY_CAM, enter="rise", cam1=(585, 1040, 1.03, 380, 0.4, round(d1 - 0.4, 2)),
           extra=f'<div class="ring" id="proof-r" style="left:{round(wx0)}px;top:{round(wy0)}px;width:{round(wx1 - wx0)}px;height:{round(wy1 - wy0)}px;opacity:0"></div>',
           extra_tl=f'tl.to("#proof-r",{{opacity:1,duration:0.12}},{round(min(d1 - 0.5, 1.3), 2)});')

# ---------------------------------------------------------------- 3 PROBLEM: kinetic type
s2 = at("p1") - 0.05
d2 = at("p2") - 0.05 - s2
k2 = cue_at("p1", 1) - s2
write_scene("problem", s2, d2, """
<div id="pr-g"><div id="pr-a">½ kg</div><div id="pr-b">of soya.</div><div id="pr-c">Every day?</div></div>""",
css=f"""
#pr-a{{position:absolute;left:80px;top:390px;font-family:'Bricolage',sans-serif;font-weight:800;font-size:330px;line-height:.9;letter-spacing:-.05em;color:{HALDI}}}
#pr-b,#pr-c{{position:absolute;left:86px;font-family:'Bricolage',sans-serif;font-weight:800;font-size:130px;line-height:1;letter-spacing:-.04em;color:#fff}}
#pr-b{{top:740px}} #pr-c{{top:880px}}
#pr-g{{position:absolute;inset:0;transform-origin:20% 45%}}
""",
tl=f"""
tl.fromTo("#pr-g",{{scale:1}},{{scale:1.06,duration:{round(d2, 2)},ease:"none"}},0);
tl.fromTo("#pr-a",{{scale:1.3,opacity:0,transformOrigin:"0% 60%"}},{{scale:1,opacity:1,duration:0.32,ease:"back.out(1.8)"}},0.02);
tl.fromTo("#pr-b",{{clipPath:"inset(0 100% 0 0)"}},{{clipPath:"inset(0 0% 0 0)",duration:0.3,ease:"power3.out"}},{round(max(0.3, k2 - 0.1), 2)});
tl.fromTo("#pr-c",{{clipPath:"inset(0 100% 0 0)"}},{{clipPath:"inset(0 0% 0 0)",duration:0.3,ease:"power3.out"}},{round(max(0.5, k2 + 0.45), 2)});
""")

# ---------------------------------------------------------------- 4 THE GAP: the app's own equation
s3 = at("p2") - 0.05
d3 = at("s1") - 0.05 - s3
def fbox(x0, y0, x1, y1):
    return f"left:{round(x0 * S)}px;top:{round(y0 * S)}px;width:{round((x1 - x0) * S)}px;height:{round((y1 - y0) * S)}px"
B30, B109 = (645, 592, 855, 705), (45, 592, 310, 705)
t30 = round(at("p2") - s3 + 1.0, 2)                       # "...maybe thirty grams"
t109 = round(at("p2") - s3 + vo["p2"]["cues"][-1]["end"] - 0.55, 2)   # "...over a hundred"
card_scene("gap", s3, d3, "packs.mp4", 0.2, 0.2, (585, 735, 1.0, 425), cam1=(585, 735, 1.06, 435, 0.3, round(d3 - 0.4, 2)), enter="rise",
           inside=f'<div class="ring" id="gap-r" style="{fbox(*B30)};opacity:0"></div><div class="ring" id="gap-r2" style="{fbox(*B109)};opacity:0"></div>',
           extra_tl=f'''tl.fromTo("#gap-r",{{opacity:0,scale:1.25}},{{opacity:1,scale:1,duration:0.22,ease:"power3.out"}},{t30});
tl.to("#gap-r",{{opacity:0,duration:0.15}},{t109});
tl.fromTo("#gap-r2",{{opacity:0,scale:1.25}},{{opacity:1,scale:1,duration:0.22,ease:"power3.out"}},{t109});''')

# ---------------------------------------------------------------- 5 BRAND: haldi panel above the caption lane
s4 = at("s1") - 0.05
d4 = at("s2") - 0.05 - s4
write_scene("brand", s4, d4, """
<div id="br-p"><div id="br-m"></div><div id="br-n">Protein<br>Recharge</div></div>""",
css=f"""
#br-p{{position:absolute;left:0;right:0;top:0;height:1080px;background:{HALDI};display:flex;flex-direction:column;align-items:center;justify-content:center;gap:36px;padding-top:120px}}
#br-m{{width:200px;height:200px;background:url('assets/mark.svg') center/contain no-repeat}}
#br-n{{font-family:'Bricolage',sans-serif;font-weight:800;font-size:170px;line-height:.92;letter-spacing:-.045em;color:{INK};text-align:center}}
""",
tl=f"""
tl.fromTo("#br-p",{{clipPath:"inset(100% 0 0 0)"}},{{clipPath:"inset(0% 0 0 0)",duration:0.32,ease:"power3.out"}},0);
tl.fromTo("#br-m",{{scale:0.3,rotation:-14}},{{scale:1,rotation:0,duration:0.4,ease:"back.out(1.8)"}},0.12);
tl.fromTo("#br-n",{{clipPath:"inset(0 100% 0 0)"}},{{clipPath:"inset(0 0% 0 0)",duration:0.3,ease:"power3.out"}},0.22);
tl.fromTo("#br-n",{{y:0}},{{y:-22,duration:{round(d4 - 0.5, 2)},ease:"none"}},0.5);
tl.to("#br-m",{{rotation:8,scale:1.08,duration:{round(d4 - 0.55, 2)},ease:"none"}},0.52);
""")

# ---------------------------------------------------------------- 6 SETUP at 1.9x
s5 = at("s2") - 0.05
d5 = at("w1") - 0.05 - s5
card_scene("setup", s5, d5, "setup.mp4", 0.5, 1.9, (585, 690, 1.0, 425), enter="rise")

# ---------------------------------------------------------------- 7 WOW: budget, slider and meter in one frame
s6 = at("w1") - 0.05
d6 = at("x1") - 0.05 - s6
GREEN_MEDIA, MS6 = 6.367, 0.5
want = at("w3") + 0.7 - s6
rate6 = round(max(0.8, min(1.8, (GREEN_MEDIA - MS6) / want)), 3)
green = round((GREEN_MEDIA - MS6) / rate6, 3)
WOW_CAM = (585, 790, 1.0, 425)          # frame 330-1371: "Daily budget ₹N", slider, meter, first row
card_scene("wow", s6, d6, "slider2.mp4", MS6, rate6, WOW_CAM,
           cam1=(585, 790, 1.04, 425, 0.35, round(green + 0.3, 2)),
           extra='<div class="flash" id="wow-f"></div>',
           extra_tl=f"""
tl.fromTo("#wow-f",{{opacity:0}},{{opacity:1,duration:0.08}},{round(green, 2)});
tl.to("#wow-f",{{opacity:0.0,duration:0.5,ease:"power2.out"}},{round(green + 0.5, 2)});
""")

# ---------------------------------------------------------------- 8 SKIP A FOOD, 9 LIST, 10 EMBARKO SITE
s7 = at("x1") - 0.05
d7 = at("l1") - 0.05 - s7
card_scene("skip", s7, d7, "exclude.mp4", 0.7, 1.25, (585, 640, 1.0, 400), cam1=(585, 640, 1.04, 420, 0.3, round(d7 - 0.4, 2)))
s8 = at("l1") - 0.05
d8 = at("e1") - 0.05 - s8
card_scene("list", s8, d8, "list.mp4", 0.8, 1.4, (585, 640, 1.0, 400), cam1=(585, 640, 1.04, 420, 0.3, round(d8 - 0.4, 2)))
s9 = at("e1") - 0.05
d9 = at("e2") - 0.05 - s9
card_scene("site", s9, d9, "embarko.mp4", 1.6, 1.0, (585, 1050, 1.0, 430), cam1=(585, 1050, 1.05, 450, 0.2, round(d9 - 0.3, 2)))

# ---------------------------------------------------------------- 11 DEPLOY: real terminal, full-bleed, ends on live
s10 = at("e2") - 0.05
d10 = at("c1") - 0.05 - s10
RATE10, LIVE_MEDIA = 9.0, 40.0   # framing anchor; measured: "live (success)" first appears at media 37.17 s (render 39.5 s)
ms10 = round(max(8.0, LIVE_MEDIA - (d10 - 1.5) * RATE10), 2)
FS = 1080 / 1170
z10, cy10, fy10 = 1.07, 600, 1250
tx10 = round(min(0.0, max(1080 - 1080 * z10, 540 - 585 * FS * z10)), 1)
ty10 = round(min(0.0, max(1920 - 2532 * FS * z10, cy10 - fy10 * FS * z10)), 1)
write_scene("deploy", s10, d10, f"""
<div id="dp-w"><div class="fcam" id="dp-cam"><video id="dp-v" class="clip" src="assets/footage/deploy.mp4" data-start="0" data-duration="{round(d10, 3)}"
 data-media-start="{ms10}" data-playback-rate="{RATE10}" data-track-index="2" muted playsinline></video></div>
<div class="ring" id="dp-r" style="left:-12px;top:826px;width:1104px;height:196px;opacity:0"></div></div>
<div id="dp-fade" style="position:absolute;left:0;right:0;top:0;height:420px;background:linear-gradient({INK} 0%,{INK} 30%,rgba(20,36,30,0) 100%)"></div>
<div class="chip" id="dp-c" style="left:80px;top:1030px;font-size:36px;opacity:0">Real deploy · 9× speed · <span id="dp-t">0:{int(ms10):02d}</span></div>""",
css="#dp-w{position:absolute;inset:0}.fcam{position:absolute;left:0;top:0;width:1080px;transform-origin:0 0}.fcam video{display:block;width:1080px;height:auto}",
tl=f"""
tl.set("#dp-cam",{{x:{tx10},y:{ty10},scale:{z10}}},0);
tl.fromTo("#dp-cam",{{opacity:0}},{{opacity:1,duration:0.2}},0);
tl.fromTo("#dp-w",{{y:0}},{{y:-40,duration:{round(d10, 2)},ease:"none"}},0);
tl.to("#dp-c",{{opacity:1,duration:0.15}},0.15);
tl.to("#dp-r",{{opacity:1,duration:0.12}},{round(d10 - 1.4, 2)});
const clk = {{v:{ms10}}};
tl.to(clk,{{v:{min(42.2, ms10 + d10 * RATE10)},duration:{round(min(d10, (42.2 - ms10) / RATE10), 3)},ease:"none",
  onUpdate:()=>{{const s=Math.floor(clk.v);document.querySelector("#dp-t").textContent="0:"+String(s).padStart(2,"0");}}}},0);""")

# ---------------------------------------------------------------- 12 END CARD
s11 = at("c1") - 0.05
d11 = TOTAL - s11
spans = "".join(f'<span class="ch">{c}</span>' for c in "protein-recharge") + "<br>" + "".join(f'<span class="ch">{c}</span>' for c in ".embarko.app")
write_scene("end", s11, d11, f"""
<div id="ec"><div class="ec-cap">Free. No sign-up. On your phone.</div>
<div class="ec-url" id="ec-url">{spans}</div><div class="ec-perf"></div>
<div class="ec-band"><span id="ec-tag">#DeployWithEmbarko</span></div></div>
<div id="ec-credit">Built by Siddhant Patil with Claude Code · live on Embarko</div>""",
css=f"""
#ec{{position:absolute;left:{CARD['x']}px;top:{CARD['y'] + 20}px;width:{CARD['w']}px;height:620px;background:{HALDI};border-radius:40px;overflow:hidden;color:{INK}}}
.ec-cap{{position:absolute;left:56px;top:54px;font-weight:800;font-size:42px}}
.ec-url{{position:absolute;left:52px;top:124px;font-family:'Bricolage',sans-serif;font-weight:800;font-size:98px;line-height:1.02;letter-spacing:-.04em;white-space:nowrap}}
.ec-url span{{opacity:0}}
.ec-perf{{position:absolute;left:56px;right:56px;top:378px;border-top:5px dashed rgba(20,36,30,.5)}}
.ec-band{{position:absolute;left:0;right:0;bottom:0;height:236px;background:{INK};color:{HALDI};display:flex;align-items:center;padding:0 56px;
  font-family:'Bricolage',sans-serif;font-weight:800;font-size:74px;letter-spacing:-.03em}}
#ec-tag{{clip-path:inset(0 100% 0 0)}}
#ec-credit{{position:absolute;left:150px;right:150px;top:900px;text-align:center;font-weight:600;font-size:29px;color:{MUTED}}}
""",
tl="""
tl.fromTo("#ec",{y:120,scale:0.94,opacity:0},{y:0,scale:1,opacity:1,duration:0.4,ease:"power3.out"},0);
tl.fromTo("#ec-url .ch",{opacity:0},{opacity:1,duration:0.01,stagger:0.032},0.35);
tl.fromTo("#ec-tag",{clipPath:"inset(0 100% 0 0)"},{clipPath:"inset(0 0% 0 0)",duration:0.4,ease:"power3.out"},1.4);
tl.fromTo("#ec-credit",{opacity:0},{opacity:1,duration:0.3},1.8);
tl.fromTo("#ec",{scale:1},{scale:1.05,duration:5,ease:"none"},0.45);""")

# ---------------------------------------------------------------- CAPTIONS: small, clean, in the lane
KEY = re.compile(r"(\d|₹|nine|soya|whey|goal|free|Embarko|live)", re.I)
cues = []
for s in segs:
    v = vo[s["id"]]
    for c in v["cues"]:
        cues.append([round(v["start"] + c["start"], 3), round(v["start"] + c["end"] + 0.15, 3), c["text"]])
cues.sort()
for i in range(len(cues) - 1):
    cues[i][1] = min(cues[i][1], round(cues[i + 1][0] - 0.03, 3))
html, tl, srt = [], [], []
for n, (a, b, text) in enumerate(cues, 1):
    words = "".join(f'<b>{w}</b> ' if KEY.search(w) else f"{w} " for w in text.split()).strip()
    html.append(f'<div id="cap{n}" class="cap clip" data-start="{a}" data-duration="{round(max(0.3, b - a), 3)}"><span class="in">{words}</span></div>')
    tl.append(f'tl.fromTo("#cap{n} .in",{{y:10,opacity:0}},{{y:0,opacity:1,duration:0.12,ease:"power2.out"}},{a});')
    srt.append((a, b, text))
(HF / "compositions/captions.html").write_text(f"""<template>
  <style>{FONTS}
#root{{position:absolute;inset:0}}
.cap{{position:absolute;left:90px;right:90px;top:{LANE_TOP}px;display:flex;justify-content:center}}
.cap .in{{display:block;max-width:900px;text-align:center;font-family:'Figtree',sans-serif;font-weight:700;font-size:44px;line-height:1.16;
  color:#FFFFFF;letter-spacing:-.005em}}
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


(ROOT / "protein-recharge-v3.srt").write_text("\n".join(f"{i + 1}\n{ts(a)} --> {ts(b)}\n{t_}\n" for i, (a, b, t_) in enumerate(srt)))

# ---------------------------------------------------------------- SOUND (restrained, every hit has a cause)
fx = []


def sfx(i, name, t_, vol):
    dur = {"sfx_001": 0.4, "sfx_002": 0.6, "sfx_003": 0.7, "sfx_004": 10.0}[name]
    fx.append(f'<audio id="fx{i}" class="clip" src=".media/audio/sfx/{name}.mp3" data-start="{round(max(0, t_), 3)}" '
              f'data-duration="{dur}" data-track-index="{20 + i}" data-volume="{vol}"></audio>')


sfx(0, "sfx_003", s0 + stamp_t + 0.45, 0.35)     # 9x stamp
sfx(1, "sfx_002", s2 - 0.08, 0.22)               # into the kinetic problem beat
sfx(2, "sfx_003", s4 + 0.12, 0.3)                # brand stamp
sfx(3, "sfx_004", s6 + green - 10.0, 0.16)       # riser cresting on the goal
sfx(4, "sfx_003", s6 + green + 0.02, 0.6)        # goal hit
sfx(5, "sfx_002", s10 - 0.08, 0.2)               # into the deploy
sfx(6, "sfx_003", s11 + 1.4, 0.3)                # hashtag
for k in range(3):
    sfx(7 + k, "sfx_001", s11 + 0.4 + k * 0.22, 0.12)
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
           "green_at_abs": round(s6 + green, 3), "slider_rate": rate6}, open(ROOT / "timing_v3.json", "w"), indent=1)
print("total", TOTAL, "| green at", round(s6 + green, 2), "| slider rate", rate6)
