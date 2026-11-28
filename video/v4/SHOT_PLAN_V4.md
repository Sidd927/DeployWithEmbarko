# V4 Shot Plan: the app is the frame

## Diagnosis of V3
The app sat in a 1000 × 850 card at the top, and the rest of the frame was ink. On a phone, about 55% of every product shot was empty, and the UI shrank to 85% of its captured size. The cause was in the *source*: the footage was 390 px-wide phone captures (1170 × 2532, 9:19.5), which can't fill a 9:16 frame without either shrinking or losing the top and bottom.

## Capture method (chosen after testing)
The live app was tested at 390 × 693, 360 × 640 and 430 × 764 phone viewports, and in its full-page layout.
- **Chosen: 360 × 640 CSS px, an exact 9:16 phone viewport, recorded at 4.5× density (1620 × 2880 frames).**
  - 360 is the narrowest standard Android width, so the app's own phone layout renders its *largest* text: 14 px body = 42 px on the 1080 canvas, about 15 pt on a phone.
  - At this size one screen holds the whole budget story: "Daily budget ₹N", the slider, the note, the meter and the first plate rows.
  - 9:16 at the source means every shot fills the 1080 × 1920 frame with no letterboxing.
  - 4.5× density keeps 1.0–1.5× camera push-ins pixel-sharp: there's no upscaling until 1.5×.
- **Rejected:**
  - 390 / 430 wide: smaller UI, and the wrong aspect ratio.
  - Desktop layout: the UI becomes unreadable when it's put in portrait.
  - Full-page stitched captures: they aren't real interaction.
- **One continuous recording per shot,** each made for its moment in the edit: nine purpose-built clips, all on the live app, embarko.ai or the real deploy recording.

## Captions
Tested over the real budget frame: a soft band, a tight ink pill, and a shadow only.
- **Shadow only:** unreadable over app UI.
- **Ink pills:** solid blocks over rows.
- **Chosen: a soft ink band** (about one row tall, feathered edges, 75%) at **y 1150–1248**, the bottom of the shared Reels/Shorts text-safe area (y 288–1248). The app stays visible through it and is full-brightness above and below it.

Every shot is framed so its key numbers sit in y 290–1080, above the band.

## Shots (times are the unchanged v3 voice timeline)
| # | Time | Voice | Shot | Framing and motion | Purpose |
|---|---|---|---|---|---|
| 1 | 0.00–4.37 | "Per rupee, soya chunks give you nine times the protein of whey." | **Foods ranking**, real | Opens close (1.3×) on "Ranked by protein you get for ₹10 · Soya chunks **37.1 g** per ₹10". On "nine" (1.92) the real list scrolls down 10 rows to whey, and a ring lands on **4.1 g** at "whey" (3.16) | Frame 0 is real proof, large |
| 2 | 4.37–6.56 | "Whey is way down the list." | Same take | Camera pulls back from 1.3× to 1.0×, showing whey among the rows | The list position *is* the joke |
| 3 | 6.56–9.71 | "But nobody's eating half a kilo of soya every day." | **Type over the app**: the list blurs and dims behind "½ kg / of soya. / Every day?" | Type lands on its words; the background drifts | The turn: the only non-UI beat |
| 4 | 9.71–15.12 | "Mess food… thirty grams… you need over a hundred." | **Plan equation**, real | 1.35× on "109 g daily goal − 30 g from meals → **79 g** to top up". Rings: 30 g at "30" (10.88), 109 g at "100" (14.18); slow pan between | The problem, in the app's own numbers |
| 5 | 15.12–18.28 | "So I built an app that does the math for you." | **Landing hero**, real | Push-in on "Hit your protein on a hostel budget." A finger taps **Build my plan** at the end | The product reveal *is* the product |
| 6 | 18.28–21.68 | "Your weight, your diet, your kettle, your mess meals." | **Setup**, real, 4 cuts on 4 words | weight (18.48): typing 68 · diet (19.28): Veg + eggs · kettle (20.06): Electric kettle · mess meals (20.80): 2 meals | Match cuts on the beat |
| 7 | 21.68–28.99 | "Now drag your budget. And watch the plate rebuild… At ₹53 a day, you actually hit your goal." | **Budget**, real drag ₹20 → ₹53 | Full frame: ₹20, the meter **red "short"**, rows. The finger drags, rows rebuild, and the meter goes green on "53" (≈26.1). Then a slow push to 1.3× on **79 of 79 g · Goal hit** | The payoff |
| 8 | 28.99–32.83 | "Skip any food you don't like, and it finds a new plan instantly." | **Exclude**, real | Tap soya → sheet → **Don't suggest** → new plan | Control |
| 9 | 32.83–35.02 | "Then it writes your shopping list." | **List**, real | Tap Shopping list → list scrolls | Utility |
| 10 | 35.02–36.81 | "I put it online with Embarko." | **embarko.ai**, real | Scroll to and tap **Copy deployment prompt** | The prompt |
| 11 | 36.81–39.85 | "My coding agent followed one prompt and it was live" | **Real deploy recording** | Full-bleed terminal from the first command to `live (success)`. Clock = the recording's real elapsed time (live at 0:37) | Truthful process |
| 12 | 39.85–43.15 | "…under a minute. It's free, with no sign-up." | **Live app loading by URL**, real | The page loads; a URL chip reads protein-recharge.embarko.app. Pan to "Free, no sign-up" on "free" | Proof it's live |
| 13 | 43.15–44.60 | "Send this to your gym friend." | **Share plan**, real | Tap **Share plan** → the app's **"Link copied"** toast | The CTA, done in the app |
| 14 | 44.60–46.36 | — | **End card** | Full-frame haldi: URL, #DeployWithEmbarko | Where to go |
