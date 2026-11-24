# Final Project Selection: **Protein Recharge**

> **The cheapest way to hit your protein, planned around your mess, your kettle and your budget.**

## Why this project wins over the alternatives
1. **Originality where it counts.** The obvious student tools (attendance, scam checking, phone testing) each have 9–12 live competitors in 2026. Budget protein planning has two thin ones, and neither does exact optimisation, models kitchen access, or lets you edit prices on the web.
2. **A real algorithm, not an AI wrapper.** A bounded-knapsack dynamic program finds the *minimum-cost* top-up that reaches your protein target, or the *maximum protein* within a budget. It respects diet, kitchen, daily caps and your preferences. It is deterministic, instant, works offline and costs nothing.
3. **Culturally native, so it gets shared.** Plans are shown as **recharge packs**, the ₹/day price-tier format every Indian student already understands. "₹49/day, 112 g protein" works as a caption by itself, and protein is a strong trend in India right now.
4. **A clear 3-second hook for the video (300 pts):** "I have ₹50 a day and no kitchen. Can I still hit 100 g of protein?"
5. **Phone-first by nature (part of the 400 Work points):** it is used in the hostel room and at the kirana shop.
6. **Deployment-safe:** a static Vite build with no server, secrets or database on Embarko, so there is nothing to crash during judging.

## The three layers the brief asks for
- **Immediate impact:** the landing screen says *"Hit your protein on ₹__ a day"* next to a live recharge-pack preview.
- **Product depth:** a personal profile (weight, goal, diet, kitchen, mess meals), editable prices, food exclusions/locks, a shopping list, sharing, and saved plans.
- **Memorable moment:** the **budget slider**. Drag from ₹20 to ₹120 and watch the optimal plate rebuild and the protein meter fill, with the "Goal hit" tick landing at the exact rupee where it becomes possible.

## Rejected (summary)
Leeway (attendance) has too many competitors. Used-phone inspection is saturated and weak on iOS. The ISL tutor is too risky technically. The CTC decoder is crowded and depends on tax rules. Clean-air windows rely on coarse forecast data that could mislead users.

## Scope guardrails
- No accounts, no backend, no AI API. Everything runs on the device and is saved in localStorage.
- Every price is labelled as an editable estimate, and nutrition values cite their source class (IFCT 2017 / USDA FDC / typical label).
- Not medical advice. Targets follow ICMR-NIN 2024 (0.83 g/kg RDA, with no extra benefit above about 1.6 g/kg).
