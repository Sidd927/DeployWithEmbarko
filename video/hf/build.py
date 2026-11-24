"""Generates the HyperFrames scenes for the Protein Recharge demo film from one shot list.
Run: python3 build.py   (then: npx hyperframes check --json)
"""
import json
from pathlib import Path

W, H = 1080, 1920
ROOT = Path(__file__).parent
(ROOT / "compositions").mkdir(exist_ok=True)

FONTS = """
@font-face{font-family:'Bricolage';src:url('assets/fonts/bricolage.woff2') format('woff2');font-weight:200 800;font-display:block}
@font-face{font-family:'Figtree';src:url('assets/fonts/figtree.woff2') format('woff2');font-weight:300 900;font-display:block}
"""

BASE_CSS = """
#root{position:absolute;inset:0;overflow:hidden;background:var(--g,#E6EAEA);color:#14241E;font-family:'Figtree',sans-serif}
.t{position:absolute;left:104px;right:128px;top:312px;margin:0;font-family:'Bricolage',sans-serif;font-weight:800;
   font-size:80px;line-height:1.0;letter-spacing:-0.03em;font-variation-settings:'opsz' 96}
.t .in{display:block;clip-path:inset(0 100% 0 0)}
.s{position:absolute;left:106px;right:128px;top:508px;margin:0;font-weight:600;font-size:38px;line-height:1.25;color:#4D5D57}
.s .in{display:block;clip-path:inset(0 100% 0 0)}
.win{position:absolute;left:60px;top:636px;width:960px;height:1124px;border:4px solid #14241E;border-radius:44px;
     overflow:hidden;background:#fff}
.pan{position:absolute;left:0;top:0;width:952px}
.pan video{display:block;width:952px;height:auto}
"""


def esc(s):
    return s.replace("&", "&amp;").replace("<", "&lt;")


SCENE_TEXT = {}


def scene(sid, dur, titles=(), subs=(), video=None, ground=None, body="", extra_css="", extra_tl="", instant=False, cues=None):
    """titles/subs: list of (text, start, end). video: dict(src, media_start, rate, pans=[(t, y, d)], start_y).
    cues: explicit subtitle cues [(text, start, end)] for scenes without titles."""
    SCENE_TEXT[sid] = (list(titles), list(subs), list(cues or []))
    html, tl = [], []
    for i, (text, a, b) in enumerate(titles):
        eid = f"{sid}-t{i}"
        html.append(
            f'<h1 id="{eid}" class="t clip" data-start="{a}" data-duration="{round(b - a, 3)}"><span class="in">{text}</span></h1>'
        )
        if instant and a == 0:
            tl.append(f'tl.set("#{eid} .in",{{clipPath:"inset(0 0% 0 0)"}},0);')
        else:
            tl.append(
                f'tl.fromTo("#{eid} .in",{{clipPath:"inset(0 100% 0 0)"}},{{clipPath:"inset(0 0% 0 0)",duration:0.34,ease:"power3.out"}},{a});'
            )
    for i, (text, a, b) in enumerate(subs):
        eid = f"{sid}-s{i}"
        html.append(
            f'<p id="{eid}" class="s clip" data-start="{a}" data-duration="{round(b - a, 3)}"><span class="in">{text}</span></p>'
        )
        if instant and a < 0.5:
            tl.append(f'tl.set("#{eid} .in",{{clipPath:"inset(0 0% 0 0)"}},0);')
        else:
            tl.append(
                f'tl.fromTo("#{eid} .in",{{clipPath:"inset(0 100% 0 0)"}},{{clipPath:"inset(0 0% 0 0)",duration:0.4,ease:"power3.out"}},{a + 0.12});'
            )
    if video:
        vid = f"{sid}-v"
        y0 = video.get("start_y", 0)
        html.append(
            f'<div class="win" id="{sid}-win"><div class="pan" id="{sid}-pan" data-layout-allow-overflow>'
            f'<video id="{vid}" class="clip" src="assets/footage/{video["src"]}" data-start="0" data-duration="{dur}" '
            f'data-media-start="{video.get("media_start", 0)}" data-playback-rate="{video.get("rate", 1)}" '
            f'data-track-index="2" muted playsinline></video></div></div>'
        )
        tl.append(f'tl.set("#{sid}-pan",{{y:{-y0}}},0);')
        for t, y, d in video.get("pans", []):
            tl.append(f'tl.to("#{sid}-pan",{{y:{-y},duration:{d},ease:"power2.inOut"}},{t});')
    html.append(body)
    tl.append(extra_tl)
    g = f"--g:{ground};" if ground else ""
    doc = f"""<template>
  <style>{FONTS}{BASE_CSS}{extra_css}</style>
  <div id="root" data-composition-id="{sid}" data-width="{W}" data-height="{H}" style="{g}">
    {chr(10).join(html)}
  </div>
  <script>
    const tl = gsap.timeline({{ paused: true }});
    {chr(10).join(tl)}
    window.__timelines["{sid}"] = tl;
  </script>
</template>
"""
    (ROOT / "compositions" / f"{sid}.html").write_text(doc)
    return sid, dur


MARK = (
    '<svg viewBox="0 0 32 32" width="{s}" height="{s}"><path d="M4 6h24a2 2 0 0 1 2 2v5a3 3 0 0 0 0 6v5a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-5a3 3 0 0 0 0-6V8a2 2 0 0 1 2-2Z" '
    'fill="#FFC21A" stroke="#14241E" stroke-width="1.6"/><path d="M11 11h9M11 14.5h9M11 11c4 0 4 7 0 7h-1l7 5" fill="none" stroke="#14241E" '
    'stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
)

shots = []

# 1 Hook: the live demo voucher with its price climbing.
shots.append(scene("hook", 5.0,
    titles=[("₹50 a day. Mess food.", 0, 2.6), ("Enough protein?", 2.6, 5.0)],
    subs=[("A hostel student needs 109 g a day.", 0, 5.0)],
    video=dict(src="hook.mp4", media_start=1.2, rate=1.25, start_y=20), instant=True))

# 2 Gap: the app's own equation.
shots.append(scene("gap", 5.5,
    titles=[("Mess meals give ~30 g.", 0, 2.7), ("The gap is 79 g.", 2.7, 5.5)],
    subs=[("Real numbers from the app's sample profile.", 0.3, 5.5)],
    video=dict(src="packs.mp4", media_start=0.2, rate=0.25, start_y=60, pans=[(2.6, 150, 0.7)])))

# 3 Reveal on haldi.
reveal_css = """
#reveal-mark{position:absolute;left:50%;top:420px;margin-left:-110px;width:220px;height:220px}
.rw{position:absolute;left:0;right:0;text-align:center;font-family:'Bricolage',sans-serif;font-weight:800;font-size:150px;
    line-height:.95;letter-spacing:-.045em;font-variation-settings:'opsz' 96}
.rw .in{display:inline-block;clip-path:inset(0 100% 0 0)}
#reveal-w1{top:700px}#reveal-w2{top:850px}
#reveal-sub{position:absolute;left:130px;right:150px;top:1100px;text-align:center;font-weight:700;font-size:46px;line-height:1.25}
#reveal-sub .in{display:inline-block;clip-path:inset(0 100% 0 0)}
#reveal-by{position:absolute;left:130px;right:150px;top:1268px;text-align:center;font-weight:600;font-size:36px;color:#14241E}
#reveal-by .in{display:inline-block;clip-path:inset(0 100% 0 0)}
"""
shots.append(scene("reveal", 3.5, ground="#FFC21A", extra_css=reveal_css,
    body=f"""<div id="reveal-mark" class="clip" data-start="0" data-duration="3.5"><div id="reveal-mk">{MARK.format(s=220)}</div></div>
<div id="reveal-w1" class="rw clip" data-start="0.25" data-duration="3.25"><span class="in">Protein</span></div>
<div id="reveal-w2" class="rw clip" data-start="0.45" data-duration="3.05"><span class="in">Recharge</span></div>
<p id="reveal-sub" class="clip" data-start="1.0" data-duration="2.5"><span class="in">Daily protein packs, priced like a phone recharge</span></p>
<p id="reveal-by" class="clip" data-start="1.5" data-duration="2.0"><span class="in">Built by Siddhant Patil with Claude Code</span></p>""",
    cues=[("Protein Recharge\nDaily protein packs, priced like a phone recharge.\nBuilt by Siddhant Patil with Claude Code.", 0, 3.5)],
    extra_tl="""tl.fromTo("#reveal-mk",{scale:0.2,rotation:-12},{scale:1,rotation:0,duration:0.46,ease:"back.out(1.6)"},0);
tl.fromTo("#reveal-w1 .in",{clipPath:"inset(0 100% 0 0)"},{clipPath:"inset(0 0% 0 0)",duration:0.34,ease:"power3.out"},0.25);
tl.fromTo("#reveal-w2 .in",{clipPath:"inset(0 100% 0 0)"},{clipPath:"inset(0 0% 0 0)",duration:0.34,ease:"power3.out"},0.45);
tl.fromTo("#reveal-sub .in",{clipPath:"inset(0 100% 0 0)"},{clipPath:"inset(0 0% 0 0)",duration:0.5,ease:"power3.out"},1.0);
tl.fromTo("#reveal-by .in",{clipPath:"inset(0 100% 0 0)"},{clipPath:"inset(0 0% 0 0)",duration:0.45,ease:"power3.out"},1.5);"""))

# 4 Setup at 1.25x.
shots.append(scene("setup", 9.8,
    titles=[("Five quick questions", 0, 9.8)],
    subs=[("Weight, goal, diet, kettle, mess meals.", 0.3, 9.8)],
    video=dict(src="setup.mp4", media_start=0.3, rate=1.25, start_y=0)))

# 5 Packs.
shots.append(scene("packs", 7.3,
    titles=[("Pick a daily pack", 0, 7.3)],
    subs=[("Each one is the exact cheapest mix for that price.", 0.3, 7.3)],
    video=dict(src="packs.mp4", media_start=0, rate=1, start_y=330)))

# 6 Slider payoff.
shots.append(scene("slider", 10.8,
    titles=[("Drag the budget", 0, 6.0), ("Goal hit at ₹53 a day", 6.0, 10.8)],
    subs=[("The plate re-optimises as you drag.", 0.3, 6.0), ("79 g top-up: soya, sattu, eggs, peanuts, chana.", 6.0, 10.8)],
    video=dict(src="slider.mp4", media_start=0.4, rate=1, start_y=0)))

# 7 Exclude soya.
shots.append(scene("exclude", 8.8,
    titles=[("Hate soya chunks?", 0, 3.4), ("It re-plans without it", 3.4, 8.8)],
    subs=[("Tap any food to skip it, pin it or set your price.", 0.3, 8.8)],
    video=dict(src="exclude.mp4", media_start=0, rate=1, start_y=0)))

# 8 Shopping list.
shots.append(scene("list", 5.5,
    titles=[("Then it writes your list", 0, 5.5)],
    subs=[("Weekly amounts in real pack sizes.", 0.3, 5.5)],
    video=dict(src="list.mp4", media_start=0.6, rate=1.2, start_y=0)))

# 9 Embarko prompt (real embarko.ai).
shots.append(scene("prompt", 5.7,
    titles=[("How it went live", 0, 2.3), ("One Embarko prompt", 2.3, 5.7)],
    subs=[("Claude Code followed Embarko's deployment prompt.", 0.3, 5.7)],
    video=dict(src="embarko.mp4", media_start=0, rate=1, start_y=0, pans=[(1.6, 330, 0.8)])))

# 10 Real deploy at 3x.
shots.append(scene("deploy", 14.1,
    titles=[("Claude Code deployed it", 0, 9.6), ("Live in under a minute", 9.6, 14.1)],
    subs=[("Real deploy to Embarko, sped up 3×.", 0.3, 14.1)],
    video=dict(src="deploy.mp4", media_start=0, rate=3, start_y=0, pans=[(3.0, 150, 1.0)])))

# 10b The Embarko experience, over the claimed live app loaded by URL.
shots.append(scene("kept", 6.0,
    titles=[("No Dockerfile. No repo.", 0, 3.0), ("Claimed it. It stays live.", 3.0, 6.0)],
    subs=[("The first deploy needed no account.", 0.3, 3.0), ("One sign-in made it permanent.", 3.1, 6.0)],
    video=dict(src="live.mp4", media_start=0.4, rate=1, start_y=0)))

# 11 End card.
end_css = """
#end-head{position:absolute;left:104px;right:128px;top:300px;display:flex;align-items:center;gap:22px;
          font-family:'Bricolage',sans-serif;font-weight:800;font-size:58px;letter-spacing:-.02em}
#end-v{position:absolute;left:100px;width:840px;top:430px;height:800px}
#end-card{position:absolute;inset:0;background:#FFC21A;border:6px solid #14241E;border-radius:44px;overflow:hidden;
  -webkit-mask:radial-gradient(circle at left 512px,transparent 26px,#000 27px),radial-gradient(circle at right 512px,transparent 26px,#000 27px);
  -webkit-mask-composite:source-in}
.ec-cap{position:absolute;left:56px;top:52px;font-weight:800;font-size:40px}
.ec-url{position:absolute;left:52px;right:40px;top:120px;font-family:'Bricolage',sans-serif;font-weight:800;font-size:86px;
        line-height:1.02;letter-spacing:-.04em;font-variation-settings:'opsz' 96;white-space:nowrap}
.ec-url span{opacity:0}
.ec-note{position:absolute;left:56px;right:56px;top:380px;font-weight:600;font-size:40px;line-height:1.3}
.ec-perf{position:absolute;left:56px;right:56px;top:504px;border-top:5px dashed rgba(20,36,30,.55)}
.ec-band{position:absolute;left:0;right:0;bottom:0;height:270px;background:#14241E;color:#FFC21A;display:flex;align-items:center;
         padding:0 56px;font-family:'Bricolage',sans-serif;font-weight:800;font-size:68px;letter-spacing:-.03em}
.ec-band .in{display:block;clip-path:inset(0 100% 0 0)}
"""
url = "protein-recharge.embarko.app"
url_spans = "".join(f'<span class="ch">{esc(c)}</span>' for c in "protein-recharge") + "<br>" + "".join(f'<span class="ch">{esc(c)}</span>' for c in ".embarko.app")
shots.append(scene("endcard", 7.0, extra_css=end_css,
    cues=[("Try it free: protein-recharge.embarko.app\n#DeployWithEmbarko", 0, 7.0)],
    body=f"""<div id="end-head" class="clip" data-start="0" data-duration="7">{MARK.format(s=84)}<span>Protein Recharge</span></div>
<div id="end-v" class="clip" data-start="0" data-duration="7"><div id="end-card">
  <div class="ec-cap">Try it free, on your phone</div>
  <div class="ec-url" id="end-url">{url_spans}</div>
  <div class="ec-note">No sign-up. Your plan stays on your device.</div>
  <div class="ec-perf"></div>
  <div class="ec-band"><span class="in" id="end-tag">#DeployWithEmbarko</span></div>
</div></div>""",
    extra_tl=f"""tl.fromTo("#end-card",{{clipPath:"inset(0 100% 0 0 round 44px)"}},{{clipPath:"inset(0 0% 0 0 round 44px)",duration:0.5,ease:"power3.out"}},0.1);
tl.fromTo("#end-url .ch",{{opacity:0}},{{opacity:1,duration:0.01,stagger:0.045}},0.55);
tl.fromTo("#end-tag",{{clipPath:"inset(0 100% 0 0)"}},{{clipPath:"inset(0 0% 0 0)",duration:0.45,ease:"power3.out"}},2.0);"""))

# ---------- root ----------
t = 0.0
hosts = []
starts = {}
for sid, dur in shots:
    starts[sid] = round(t, 3)
    hosts.append(
        f'<div id="{sid}" data-composition-id="{sid}" data-composition-src="compositions/{sid}.html" '
        f'data-start="{round(t, 3)}" data-duration="{dur}" data-track-index="1" data-track-kind="graphics" '
        f'data-width="{W}" data-height="{H}"></div>'
    )
    t += dur
total = round(t, 3)

S = starts
sfx = []


DUR = {"sfx_001": 0.4, "sfx_002": 0.6, "sfx_003": 0.7, "sfx_004": 10.0}


def fx(i, src, at, vol=1.0):
    d = DUR[src.rsplit('/', 1)[1].split('.')[0]]
    sfx.append(f'<audio id="fx{i}" class="clip" src="{src}" data-start="{round(at, 3)}" data-duration="{d}" data-track-index="{5 + i}" data-volume="{vol}"></audio>')


W1, W2, POP, CLK, RISE = (".media/audio/sfx/sfx_002.mp3", ".media/audio/sfx/sfx_002.mp3",
                          ".media/audio/sfx/sfx_003.mp3", ".media/audio/sfx/sfx_001.mp3", ".media/audio/sfx/sfx_004.mp3")
fx(0, W1, S["reveal"] - 0.05, 0.6)
fx(1, POP, S["reveal"] + 0.1, 0.8)
fx(2, W2, S["setup"] - 0.05, 0.45)
fx(3, W1, S["prompt"] - 0.05, 0.5)
fx(4, W2, S["endcard"] + 0.05, 0.5)
fx(5, POP, S["slider"] + 6.0, 0.9)          # "Goal hit" lands (footage turns green at 5.97 s)
fx(6, RISE, S["slider"] + 6.0 - 10.03, 0.35)  # riser crests on goal hit
fx(7, POP, S["endcard"] + 2.0, 0.8)          # hashtag band
fx(8, POP, S["deploy"] + 9.6, 0.7)           # "Live"
for k in range(0, 28, 4):                     # soft ticks while the URL types
    fx(9 + k // 4, CLK, S["endcard"] + 0.55 + k * 0.045, 0.35)

# Optional narration (kept local, git-ignored): assets/vo/manifest.json lists
# [{"file": "vo/seg01.wav", "start": 0.2, "duration": 4.1}, ...] produced by video/voiceover/make_vo.py.
# With narration present, effects sit under the voice, except the two pops that land in silent gaps.
import re as _re
VO_MANIFEST = ROOT / "assets" / "vo" / "manifest.json"
VOICED = VO_MANIFEST.exists() and __import__("os").environ.get("HF_NO_VO") != "1"
if VOICED:
    segs = json.loads(VO_MANIFEST.read_text())
    keep_loud = {"fx5", "fx8"}  # "Goal hit" pop and "Live" pop sit in narration gaps

    def _duck(tag):
        fid = _re.search(r'id="(fx\d+)"', tag).group(1)
        if fid in keep_loud:
            return tag
        return _re.sub(r'data-volume="([0-9.]+)"', lambda m: f'data-volume="{round(float(m.group(1)) * 0.45, 3)}"', tag)

    sfx[:] = [_duck(x) for x in sfx]
    for i, seg in enumerate(segs):
        sfx.append(
            f'<audio id="vo{i + 1:02d}" class="clip" src="assets/{seg["file"]}" data-start="{seg["start"]}" '
            f'data-duration="{seg["duration"]}" data-track-index="{40 + i}" data-volume="1"></audio>'
        )

index = f"""<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width={W}, height={H}" />
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
    <style>
      * {{ margin: 0; padding: 0; box-sizing: border-box; }}
      html, body {{ margin: 0; width: {W}px; height: {H}px; overflow: hidden; background: #E6EAEA; }}
      #root {{ position: relative; width: 100%; height: 100%; }}
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="{total}" data-width="{W}" data-height="{H}">
      {chr(10).join(hosts)}
      {chr(10).join(sfx)}
    </div>
    <script>
      const tl = gsap.timeline({{ paused: true }});
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
"""
(ROOT / "index.html").write_text(index)
json.dump({"total": total, "starts": starts}, open(ROOT / "timing.json", "w"), indent=1)

# Subtitles generated from the same text the film shows.
def _ts(t):
    ms = int(round(t * 1000))
    return f"{ms // 3600000:02}:{ms // 60000 % 60:02}:{ms // 1000 % 60:02},{ms % 1000:03}"

cues = []
for sid, (titles, subs, extra) in SCENE_TEXT.items():
    st = starts[sid]
    for text, a, b in titles:
        mid = (a + b) / 2
        sub = next((x for x, sa, sb in subs if sa <= mid < sb), "")
        cues.append((st + a, st + b, text + ("\n" + sub if sub else "")))
    for text, a, b in extra:
        cues.append((st + a, st + b, text))
cues.sort()
srt = "\n".join(f"{i + 1}\n{_ts(a)} --> {_ts(b)}\n{t}\n" for i, (a, b, t) in enumerate(cues))
(ROOT.parent / "exports" / "protein-recharge-demo.srt").write_text(srt)

if VOICED:  # subtitles that match the spoken words (NarraReel word timings, offset to each segment)
    vcues = []
    for seg in segs:
        for c in seg.get("cues", []):
            vcues.append((seg["start"] + c["start"], seg["start"] + c["end"], c["text"]))
    vcues.sort()
    vsrt = "\n".join(f"{i + 1}\n{_ts(a)} --> {_ts(b)}\n{t}\n" for i, (a, b, t) in enumerate(vcues))
    (ROOT.parent / "voiceover" / "protein-recharge-final-voiced.srt").write_text(vsrt)
print("total", total, starts)
