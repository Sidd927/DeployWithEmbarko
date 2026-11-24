# Voiceover Script (for you to record in your own voice)

The video works muted, but a real human voice is the biggest improvement left for the **Video** score (storytelling, hook). This script is timed to the final 89 s cut. Read it at a relaxed pace, about 2.5 words a second. Every line fits inside its section.

**Only say what's true for you.** Lines marked ✱ are personal. Change them if they don't match your life (for example, if you're a day scholar, say "my friends in the hostel" instead).

| Time | Section on screen | Say |
|---|---|---|
| 0:00–0:05 | ₹50 a day. Mess food. / Enough protein? | ✱ "Hi, I'm Siddhant. Mess food gives me a lot of rice and roti, and not much protein." |
| 0:05–0:10 | The gap is 79 g | "For a sixty-eight kilo person building muscle, that's a seventy-nine gram gap every day." |
| 0:10–0:14 | Protein Recharge (reveal) | "So I built Protein Recharge." |
| 0:14–0:24 | Five quick questions | "You answer five questions: your weight, your goal, what you eat, whether you have a kettle, and how many mess meals you eat." |
| 0:24–0:31 | Pick a daily pack | "It gives you daily packs, like a phone recharge. Each one is the exact cheapest mix of foods for that price." |
| 0:31–0:42 | Drag the budget → Goal hit at ₹53 | "Drag the budget and it re-plans the whole plate, live. The goal gets hit at fifty-three rupees a day." |
| 0:42–0:51 | Hate soya chunks? | "Don't like soya chunks? Tap it, and it re-plans without it. You can even put in your own shop's prices." |
| 0:51–0:56 | Then it writes your list | "Then it writes your weekly shopping list." |
| 0:56–1:02 | One Embarko prompt | "To put it online, I copied the deployment prompt from embarko dot A I…" |
| 1:02–1:16 | Claude Code deployed it → Live in under a minute | "…pasted it into Claude Code, and it packed the app and deployed it to Embarko. This is the real deploy, sped up. Live in under a minute." |
| 1:16–1:22 | No Dockerfile. No repo. / Claimed it. | "No Dockerfile, no repo, no account until it was live. One sign-in to keep it." |
| 1:22–1:29 | End card | "Try it free at protein recharge dot embarko dot app. Hashtag Deploy With Embarko." |

About 190 words.

## How to record
1. Use your phone's voice recorder in a quiet room with soft furnishings (a bedroom works better than a bathroom). Hold the phone about 20 cm from your mouth.
2. Play the video on a laptop with the sound off and read along. Leave a 1-second pause after "So I built Protein Recharge."
3. Save it as `video/hf/assets/vo.m4a` (or `.mp3` / `.wav`). Then run:
   ```bash
   cd video/hf && python3 build.py && npx hyperframes render --quality delivery --video-frame-format png -o ../exports/protein-recharge-demo-9x16-vo.mp4
   ```
   `build.py` adds your voice automatically and lowers the sound effects to 60%.
4. **Or the simpler way:** in the Instagram or YouTube editor, add your recording as a voiceover track on the existing video.

If you'd rather not record, the current video already works muted. The titles carry the whole story, and `protein-recharge-demo.srt` has captions.
