# Idea Evaluation

Each concept is rated 0–10 on each dimension, and the rating is scaled by the dimension's weight (rating/10 × weight). **Originality ratings reflect the competitor counts found in the searches**, not gut feel.

| # | Concept | Useful (20) | Original (20) | Competition fit (15) | Visual (15) | Demo wow (10) | Feasible (10) | Mobile (5) | Share (5) | **Total** |
|---|---|---|---|---|---|---|---|---|---|---:|
| 5 | **Protein Recharge** | 8→16 | 7→14 | 9→13.5 | 9→13.5 | 9→9 | 9→9 | 9→4.5 | 9→4.5 | **84.0** |
| 1 | Leeway (attendance) | 8→16 | 3→6 | 8→12 | 7→10.5 | 8→8 | 9→9 | 9→4.5 | 9→4.5 | **70.5** |
| 3 | Used-phone inspection | 8→16 | 2→4 | 8→12 | 8→12 | 9→9 | 8→8 | 10→5 | 6→3 | **69.0** |
| 6 | CTC offer decoder | 8→16 | 4→8 | 7→10.5 | 7→10.5 | 7→7 | 7→7 | 8→4 | 8→4 | **67.0** |
| 7 | Clean-air windows | 7→14 | 5→10 | 6→9 | 8→12 | 7→7 | 6→6 | 8→4 | 6→3 | **65.0** |
| 10 | Timetable wallpaper | 4→8 | 5→10 | 7→10.5 | 8→12 | 7→7 | 9→9 | 9→4.5 | 8→4 | **65.0** |
| 8 | Exam gap allocator | 7→14 | 5→10 | 7→10.5 | 6→9 | 6→6 | 8→8 | 7→3.5 | 6→3 | **64.0** |
| 2 | Scam explainer | 9→18 | 3→6 | 6→9 | 6→9 | 7→7 | 6→6 | 8→4 | 8→4 | **63.0** |
| 4 | ISL fingerspelling | 7→14 | 3→6 | 6→9 | 8→12 | 9→9 | 3→3 | 5→2.5 | 6→3 | **58.5** |
| 16 | Loan true-cost | 6→12 | 5→10 | 5→7.5 | 6→9 | 5→5 | 8→8 | 7→3.5 | 4→2 | **57.0** |
| 14 | Speaking coach | 6→12 | 4→8 | 6→9 | 7→10.5 | 7→7 | 5→5 | 5→2.5 | 5→2.5 | **56.5** |
| 11 | Receipt splitter | 7→14 | 2→4 | 6→9 | 6→9 | 7→7 | 5→5 | 8→4 | 6→3 | **55.0** |
| 9 | Consumer complaint | 7→14 | 6→12 | 4→6 | 4→6 | 4→4 | 7→7 | 6→3 | 4→2 | **54.0** |
| 15 | Rent split | 5→10 | 6→12 | 4→6 | 5→7.5 | 4→4 | 7→7 | 6→3 | 3→1.5 | **51.0** |
| 12 | Lab report explainer | 7→14 | 3→6 | 4→6 | 6→9 | 6→6 | 4→4 | 7→3.5 | 4→2 | **50.5** |
| 13 | Scholarship finder | 8→16 | 2→4 | 5→7.5 | 4→6 | 4→4 | 4→4 | 7→3.5 | 6→3 | **48.0** |
| 17 | Slot clash solver | 6→12 | 3→6 | 5→7.5 | 5→7.5 | 4→4 | 5→5 | 6→3 | 5→2.5 | **47.5** |
| 18 | Lost & found | 6→12 | 2→4 | 5→7.5 | 5→7.5 | 3→3 | 6→6 | 7→3.5 | 5→2.5 | **46.0** |

## Round 2: critical review of the top three

### Protein Recharge (84)
- **Technical risk:** low. A static site, no API keys, and a DP optimiser that is easy to unit-test.
- **Time:** about 2 days to a polished build. That leaves 3+ days for deploy, video and posting before the 30 Nov deadline.
- **Dependencies:** React, Vite and self-hosted fonts. Nothing external at runtime.
- **Saturation:** two thin competitors (a greedy Android app and a hackathon page). We beat them on optimality, constraints, polish, a shareable web link and price editing.
- **Demo:** "₹49/day → 112 g protein, no kitchen." The value is clear in about 5 seconds.
- **Risks:** nutrition and price accuracy (mitigated with cited per-100 g values, editable prices, and explicit "estimate" labelling), and health liability (mitigated with ICMR ranges, a 1.6 g/kg cap and a non-medical disclaimer).

### Leeway (70.5)
- It scores high on reach, but originality is capped by at least 12 live competitors. Judges probably see several bunk calculators among the submissions themselves (Embarko's own starter ideas lean the same way). **Rejected on originality.**

### Used-phone inspection (69)
- The best "works on a phone" story, but at least 9 polished competitors exist, including report and QR sharing (mxmob, tensecondcheck). Browser API gaps on iOS (vibration, torch, battery) would weaken the demo on iPhones. **Rejected on originality.**

## Bias check
I scored usefulness for Protein Recharge at 8, not 10. Most people do not need a protein optimiser. The score comes from originality relative to competitors, competition fit and visual potential, not from inflating usefulness. Even if originality dropped to 5, it would still score 80 and stay first.
