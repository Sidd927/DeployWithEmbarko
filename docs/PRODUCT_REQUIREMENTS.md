# Product Requirements: Protein Recharge

**Positioning:** The cheapest way to hit your daily protein, planned around your mess food, your kettle and your budget.

**Vision:** Every hostel and PG student in India knows exactly what to buy, for how much, to eat enough protein without a kitchen or a big allowance.

**Problem:** Mess food is cereal-heavy. Students know they need more protein but guess at *what* to add, picking expensive whey or random snacks. Soya chunks, roasted chana and sattu give several times more protein per rupee, but turning that into a daily plan that fits your diet, your kitchen and your money is a real optimisation problem.

## Personas
1. **Rohan, 20, B.Tech hostel, gym 4×/week.** Vegetarian plus eggs, owns an electric kettle, has ₹1,500/month to spare. Wants about 110 g/day and doesn't trust influencer diets.
2. **Ananya, 22, PG in Bengaluru, first job.** Vegan-curious, no kitchen at all. Wants to stop feeling hungry at 5 pm and spend less than she does on protein bars.
3. **Imran, 19, day scholar.** Non-veg, has a full kitchen at home, and wants to see how much cheaper eggs and dal are than chicken.

## Core journeys
1. **First run (about 20 s):** landing → "Build my plan" → weight → goal → diet → kitchen → mess meals → plans.
2. **Choose a pack:** compare recharge packs (₹/day tiers) → open one → see the exact daily plate.
3. **Explore:** drag the budget slider and the plate re-optimises live.
4. **Make it yours:** remove a food you dislike (it re-optimises), pin one you love, or set your local price.
5. **Shop:** a weekly shopping list with pack counts and total cost.
6. **Share:** copy or share a link that rebuilds the same plan on a friend's phone.

## Features (all functional)
| Feature | Acceptance criteria |
|---|---|
| Profile setup | Weight 30–200 kg; goal 0.83 / 1.2 / 1.6 g/kg; diet (vegan / veg / egg / non-veg); kitchen (none / kettle / full); mess meals 0–3 × quality preset. Saved in localStorage. |
| Exact optimiser | Finds the min-cost plan reaching the target and the max-protein plan under a budget. Respects diet, kitchen, per-food daily caps, excluded and pinned foods, and at most 5 distinct foods. Unit-tested against brute force. |
| Recharge packs | ₹19 / ₹29 / ₹49 / ₹79 / ₹119 tiers plus "Cheapest to hit goal". Each shows protein/day, % of goal and monthly cost. |
| Budget slider | ₹10–₹200. The plate and the meter update within one frame. |
| Plate view | Natural units ("2 eggs", "50 g soya chunks (dry)"), protein, cost, kcal, prep hint. Protein-quality note. |
| Foods & prices | A ranking by protein per ₹10. Price editor per pack. Exclude and pin toggles. Reset to defaults. |
| Shopping list | Weekly quantity and packs to buy. Weekly and monthly cost. |
| Share | URL fragment encodes the profile (no personal data beyond weight). Web Share API with a copy fallback. |
| Honesty | Prices labelled "typical estimate". Nutrition source per food. "Not medical advice" note. Sample profile clearly marked. |

## Non-goals
Accounts, calorie tracking, AI chat, a recipe database, or medical diets.

## Success criteria
- A new user reaches a plan in under 30 s on a 360 px phone.
- Lighthouse mobile performance of 90+, with no console errors.
- The optimiser beats a greedy baseline on test cases and matches brute force.
