# Idea Discovery

Method: I went through the brief's domains looking for **recurring, concrete student/young-adult pains in India**, the challenge's main audience (it is promoted through Unstop). I then checked each idea against what already exists in Nov 2026 with live web searches (see COMPETITOR_ANALYSIS.md). Saturation was the single most important finding: in 2026, most single-formula calculators have already been built many times over.

Constraints for every idea: it must run reliably on Embarko (static or single-process, 256 MB, no WebSockets), cost nothing, use no paid AI keys (Embarko's in-app AI needs pay-as-you-go billing), and be demonstrable in 60 seconds on a phone.

Each concept below is summarised under these headings: Problem · Audience · Why it matters · Existing alternatives · Difference · Workflow · Wow · Feasibility · Data · Mobile · Demo appeal · Limits · Suitability.

---

### 1. Leeway: attendance trip planner
- **Problem:** Most Indian colleges debar students below 75% attendance (UGC/AICTE norms), and students can't tell whether a few days off will cost them.
- **Audience:** Indian undergraduates. **Matters:** being debarred costs a semester.
- **Existing:** 10+ live "bunk calculators" (canibunk.com, bunkbudget, letsbunk.me, bunkr.website, ClassTrack…). Bunk Budget already handles timetables and holidays.
- **Difference:** pick trip dates and see the impact on every subject, with a "best window" finder.
- **Workflow:** enter the timetable and attendance → pick dates → get a verdict and safer alternatives. **Wow:** a calendar heatmap that shows which days are cheap to miss.
- **Feasibility:** high. **Data:** user-entered. **Mobile:** excellent. **Demo:** "Can I go to Goa?" is relatable.
- **Limits:** a crowded category. Data entry is tedious. It also reads as encouraging students to skip class.
- **Suitability:** high reach potential, **low originality**.

### 2. Scam message explainer
- **Problem:** UPI/KYC/e-challan SMS fraud. **Audience:** students and their parents.
- **Existing:** EnfoldAI, ScamRakshak (on-device LLM), TrustCopilot, PhishGuard, Bitdefender Scamio, Truecaller, Sanchar Saathi Chakshu.
- **Difference:** explains the red flags inline, in plain language. **Wow:** the pasted message lights up with annotations.
- **Feasibility:** a rule-based engine is feasible but weaker than the LLM tools. **Limits:** a false "safe" verdict could cause real harm. **Suitability:** useful, but crowded, and has liability risk.

### 3. Used-phone pre-purchase inspection (web, no install)
- **Problem:** about 1 in 5 phones sold in India is refurbished or used (Counterpoint via Business Standard), and buyers miss dead touch zones, mics and speakers.
- **Existing:** testingphone.com, diagnosemyphone.com, testanydevice.com, mxmob.com, devicevet.com, tensecondcheck.com, a2z.tools and more.
- **Difference:** model-vs-screen mismatch detection and a CEIR/KYM IMEI step. **Wow:** painting the touch grid live.
- **Feasibility:** high. **Mobile:** it is the product. **Limits:** at least 9 direct competitors already. **Suitability:** great demo, **low originality**.

### 4. ISL fingerspelling tutor (webcam)
- **Existing:** Handspell, ISL Sign Tutor, SignDarpan, SignBridge, SignSpeak and many GitHub projects.
- **Limits:** recognising two-handed ISL without a trained model is risky, and the category is crowded. **Suitability:** a big wow, but high risk and low originality.

### 5. Protein Recharge: protein-on-a-budget optimizer for hostel students ★
- **Problem:** Indian student diets are cereal-heavy. Hostel or mess food covers part of the protein need, and students have little money, no kitchen and no idea what the cheapest way to close the gap is. ICMR-NIN's RDA is 0.83 g/kg/day for healthy adults, and its 2024 guidelines say intake above about 1.6 g/kg gives no extra muscle gain with resistance training.
- **Audience:** hostel and PG students and young professionals in India, including the many vegetarians. This overlaps strongly with the gym and "protein craze" audience on Instagram.
- **Existing:** blog "protein per ₹10" tables (kabo, gourmetstaples, rebalance), FitKharcha (an Android app with a *greedy* cheapest-food algorithm), PlatePilot (a GitHub Pages hackathon app), and LLM meal planners.
- **Difference:** an **exact optimizer** (bounded-knapsack DP) under real constraints: diet type, **kitchen access** (none/kettle/full), realistic daily caps, foods you refuse or always want, and your local prices. Plans are presented as **"recharge packs"** (₹29 / ₹49 / ₹79 a day…), the price-tier format every Indian already understands from mobile recharges. It plans only the **top-up** on top of the protein your mess meals already give.
- **Workflow:** 20-second setup → recharge packs → tap a pack to see the exact daily plate, prep hints and a weekly shopping list → adjust prices and exclusions, with re-optimising live.
- **Wow:** drag the budget slider and the plate rebuilds instantly, with the protein meter filling to goal. The "recharge pack" framing makes people smile.
- **Feasibility:** high. Runs entirely in the browser with no backend. **Data:** about 25 foods with per-100 g values (IFCT/USDA/typical labels) and typical retail prices, which are clearly marked as editable estimates.
- **Mobile:** natural, since people use it in the hostel or the shop. **Demo:** "₹49 a day, 110 g protein, no kitchen." Instantly clear.
- **Limits:** nutrition values are approximate and prices vary by city (prices are editable). It is not medical advice.
- **Suitability:** high on every axis.

### 6. Placement offer decoder (CTC → in-hand)
- **Problem:** freshers misread CTC, which bundles variable pay, joining bonus, PF, gratuity and ESOPs. **Timely:** Nov–Dec is placement season.
- **Existing:** ClearTax, Groww, AmbitionBox and dozens of in-hand calculators.
- **Wow:** a Sankey chart of where the CTC goes. **Limits:** the tax rules change and the category is crowded. **Suitability:** medium.

### 7. Clean-air windows (AQI timing planner)
- **Problem:** North Indian winter smog. When is the least bad hour to run or walk?
- **Existing:** AirAhead (iOS "next best window"), Aeriqo, IQAir forecasts, SAMEER (CPCB).
- **Data:** Open-Meteo CAMS forecasts, which are free, but at roughly 40 km resolution they can mislead for Indian cities. **Limits:** accuracy and honesty risk. **Suitability:** medium.

### 8. Exam gap-day revision allocator
- **Problem:** end-semester datesheets leave uneven gaps between exams, and students allocate prep badly.
- **Existing:** generic planners (MyStudyLife, Notion templates, AI planners).
- **Wow:** calendar reflow as you change difficulty. **Limits:** heavy data entry, and the output is "just a calendar". **Suitability:** medium.

### 9. Consumer complaint & escalation builder
- **Problem:** people don't know the path from grievance officer → National Consumer Helpline → e-Daakhil.
- **Existing:** NCH portal, lawyer blogs, AI legal bots.
- **Limits:** legal accuracy, and low visual wow. **Suitability:** useful but a poor demo.

### 10. Timetable lock-screen wallpaper generator
- **Problem:** checking the timetable takes several taps. **Existing:** Canva templates and some apps.
- **Wow:** a live phone-mockup preview. **Limits:** shallow utility. **Suitability:** fun, but thin.

### 11. Receipt photo bill-splitter
- **Existing:** Splitwise Pro, Tab and many OCR splitters. **Limits:** OCR reliability on Indian receipts. **Suitability:** low originality.

### 12. Lab report explainer
- **Existing:** many AI tools. **Limits:** medical liability, and it needs OCR. **Suitability:** low.

### 13. Scholarship eligibility finder
- **Existing:** myScheme.gov.in (an official government finder), NSP, Buddy4Study. **Limits:** a large, fast-changing dataset. **Suitability:** low.

### 14. Speaking coach (filler-word counter)
- **Existing:** Yoodli, Orai, Poised. **Limits:** Web Speech API support on mobile is patchy. **Suitability:** medium-low.

### 15. Rent/room split by room features (envy-free)
- **Existing:** Spliddit (an academic tool). **Limits:** niche, and hard to explain. **Suitability:** low.

### 16. Education-loan true-cost visualiser
- **Problem:** interest accrues during the moratorium. **Existing:** bank EMI calculators.
- **Limits:** niche, with a weak hook. **Suitability:** low-medium.

### 17. Elective / slot clash solver (FFCS-style)
- **Existing:** many university-specific student tools. **Limits:** each college formats slots differently. **Suitability:** low.

### 18. Campus lost & found board
- **Limits:** needs a network effect and is empty at demo time. **Suitability:** low.

---

**Takeaway:** the problems that are both useful and demo-friendly (#1, #2, #3) are already saturated in 2026. #5 is the strongest because it pairs a **real optimisation problem** (one that weak competitors solve greedily or with an LLM) with **culturally native framing** (recharge packs, mess top-ups, kettle cooking), during a moment when protein interest in India is very high.
