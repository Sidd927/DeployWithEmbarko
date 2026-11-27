# Recording Kit: Your Real Voice for v2 (optional, recommended)

v2 is fully built with your approved voice clone. Your **real** voice will almost certainly sound more natural, because the clone runs at about 4 words a second and sometimes reads like a script. Recording takes about 10 minutes. Drop in the file and Claude rebuilds the video automatically.

## Before you press record (this matters more than the mic)
Your first recording had a lot of room noise (about 16 dB SNR). Fix the room, not the file:
1. **Record inside a wardrobe or with a thick blanket over your head and phone.** Clothes and blankets kill echo. A bed with pillows around you also works.
2. Turn off fans, AC and the fridge if it's nearby. Close the windows. Put your phone in Do Not Disturb.
3. **Use your phone's mic** (it's usually better than the laptop's). Hold it **15 cm from your mouth, slightly to the side** of your lips, so your breath doesn't hit it.
4. App: iPhone **Voice Memos** (Settings → Voice Memos → Audio Quality → **Lossless**), or Android's recorder at its highest quality.
5. Do one 5-second test and play it back on earphones. You should hear no hum and no echo.

## How to deliver it
- Talk to **one friend**, not an audience. Smile slightly, which you can hear.
- **Energetic but relaxed.** About 2.5–3 words a second, slower than you think.
- **Pause about 1 second between lines** (the gaps let Claude cut it).
- Read the whole script **twice**. Claude keeps the better take of each line.
- Mistakes are fine. Pause, then restart that line.

## The script (read top to bottom; **bold** = lean on it)
1. Per rupee, soya chunks give you **nine times** the protein of whey.
2. Whey is **way** down the list. *(a little smile on the pun)*
3. But nobody's eating **half a kilo** of soya every day.
4. Mess food gets you maybe **thirty** grams. If you work out, you need over a **hundred**.
5. So I built an app that **does the math** for you.
6. Your weight, your diet, your kettle, your mess meals.
7. Now **drag** your budget.
8. Watch the plate rebuild as you go…
9. …and at **fifty-three rupees** a day, you actually **hit your goal**. *(the payoff: let it land)*
10. Skip any food you don't like, and it finds a **new plan** instantly.
11. Then it writes your shopping list.
12. I put it online with **Embarko**.
13. My coding agent followed **one prompt**, and it was **live in under a minute**.
14. It's **free**, with no sign-up.
15. **Send this** to your gym friend.

(Line 1 is a hook, so say it like you're sharing a surprising fact, not reading a statistic.)

## Save it as
```
/Users/siddhant_patil/Projects/DeployWithEmbarko/video/voiceover/private/v2-real.m4a
```
(Any format works: m4a, wav or mp3. The folder is git-ignored and never goes to GitHub.)

## Then tell Claude "v2 recording saved"
Claude will:
1. Split it into the 15 lines by transcript, keeping the better of your two takes for each.
2. Clean it gently (80 Hz high-pass, light denoise, de-ess, gentle compression, -16 LUFS), keeping your breaths and character.
3. Rebuild and render `protein-recharge-v2-real-voice-9x16.mp4`, then check it end to end.
4. Drop the "AI clone" disclosure, since it's your real voice.
