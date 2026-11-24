# Competitor & Originality Analysis

All competitors listed here came from live web searches on 24 Nov 2026. I have **not** used these products hands-on. Their descriptions are summarised from their own pages and search snippets, so they are evidence that the products exist, not an audit of their quality.

## A. Protein-on-a-budget (selected direction)

| Product | Form | What it does (per its listing) | Gap we address |
|---|---|---|---|
| FitKharcha (fitkharcha.com) | Android app | Tracks protein, suggests budget Indian foods, uses a **greedy cheapest-food algorithm** and a "Fix a Gap" button | Greedy choices are not optimal and ignore caps and interactions. It is install-only (no web link to share), and there is no kitchen-access model |
| PlatePilot (GitHub Pages) | Hackathon web app | You enter what your mess serves, and it suggests what to buy outside. ₹120 non-veg demo | Closest to our idea. It appears to be a fixed demo profile, not a full optimiser with editable prices or exclusions |
| Thaliwise (DEV post) | FastAPI + LLM | An LLM drafts the week and code re-totals it | Needs a server and an LLM, so it costs money per user and gives non-deterministic results |
| CostBite (iOS) | App | Cheapest macro plan | US stores and US prices |
| Blog tables (kabo.co.in, gourmetstaples, rebalance.kitchen, budget-fuel-guide, gymbuddyindia) | Static articles | "Protein per ₹10" rankings | Not personalised, no optimisation, and prices can't be edited |

**Is it a generic AI wrapper?** No. The core is a deterministic exact optimiser (bounded knapsack via dynamic programming) running in the browser. It gives the same answer every time, works offline, and has no API cost.

**What is genuinely different (and demonstrable):**
1. **Exact optimiser vs greedy.** With caps (for example, at most 50 g soya chunks a day), greedy algorithms overspend. Our DP finds the true minimum-cost plate. *Demo:* the slider rebuilds an optimal plate in under 16 ms.
2. **Kitchen access as a first-class constraint.** None, kettle or full kitchen. Hostel students without a kitchen get plans that only use foods they can actually prepare (soaking soya chunks in kettle water is a known hostel method).
3. **Top-up thinking.** It counts the protein your mess meals already give and plans only the gap.
4. **Recharge-pack framing.** Plans are shown as ₹/day tiers, like phone recharges, which makes the trade-off between price and protein instant to read.
5. **Your prices.** Every price is an editable estimate and is saved on your device, so it reflects your city or campus.
6. **A shopping list** turns the daily plan into weekly pack quantities.

**Honest risks:** PlatePilot shows the idea of "mess-aware top-ups" is not unprecedented. Our claim is **a better execution of a real need**, not invention from nothing.

## B. Directions rejected for saturation (evidence)

- **Attendance / bunk calculators:** canibunk.com, bunkbudget.netlify.app, letsbunk.me, bunkr.website, classtracks.app, bunkattendancecalculator.in, attendancepercentagecalculator.com, studenthubnp.com, attendance4utracker.vercel.app, toolsarena.in, calcbharat.online, attendflow.app.
- **Browser phone inspection:** testingphone.com, diagnosemyphone.com, testanydevice.com, utilorax.com, mxmob.com (with a shareable report), devicevet.com, testmyphone.online, a2z.tools, tensecondcheck.com.
- **Scam SMS checkers (India):** EnfoldAI, ScamRakshak (on-device Gemma), TrustCopilot, PhishGuard, and Sanchar Saathi (government).
- **ISL fingerspelling:** Handspell, ISL Sign Tutor, SignDarpan, SignBridge, SignSpeak, Finger-Talk.
- **AQI best-time:** AirAhead, Aeriqo, IQAir, and the Atovio/BeyondAQI guides.

## C. Problem evidence used in the product

- ICMR-NIN *Dietary Guidelines for Indians 2024*: protein RDA of **0.83 g/kg/day** (EAR 0.66). It also says intake above about **1.6 g/kg/day** doesn't add to resistance-training muscle gain. Source: nin.res.in/dietaryguidelines/pdfjs/locale/DGI_2024.pdf (as quoted in search results).
- The claim that 73–80% of Indians are protein-deficient appears only on commercial blogs (it traces back to an industry-funded survey). **We do not use this number** in the app or video.
- Soya chunks consistently rank as the cheapest protein per rupee in every source, at roughly ₹0.2–0.3 per gram of protein. Our model reproduces this.
