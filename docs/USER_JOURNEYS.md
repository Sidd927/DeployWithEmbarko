# User Journeys

## J1: First visit → plan (primary, used in the demo)
1. **Landing.** Headline "Hit your protein on a hostel budget." A live voucher preview shows a real optimised pack for a sample profile. Buttons: **Build my plan** (primary) and **See a sample plan** (labelled "sample profile").
2. **Setup (one screen per question on mobile, with a progress bar):** weight → goal → diet → kitchen → mess meals. Each screen has big tap targets and sensible defaults. "Back" is always available.
3. **Plans screen.** A summary of goal, mess and gap. A strip of recharge packs. The pack that hits the goal at the lowest price is selected automatically.
4. **Plate.** The foods, the protein meter filling to the goal, total ₹/day and ₹/month.

**Empty, edge and error states**
- The goal is already covered by mess food: "Your mess already covers your goal." Show a ₹0 pack and suggest a higher goal.
- The goal can't be reached with the current constraints: show the maximum reachable protein and its price, plus the top reasons (for example, "no kitchen limits options") with buttons to relax them.
- Invalid weight: an inline error with the valid range.
- localStorage unavailable: the app works for the session only, with a note.

## J2: Explore budget (wow moment)
Drag the slider and the plate rebuilds. When the slider passes the cheapest-to-goal price, the meter turns green and shows "Goal hit at ₹X/day".

## J3: Personalise
On the Foods tab, toggle "Don't suggest" or "Always include", or tap a price to edit it (pack size and pack price). Plans re-optimise immediately. "Reset prices" restores the defaults.

## J4: Shop
On the List tab: weekly quantities rounded up to real packs, with a ₹ total. Copy the list as text.

## J5: Share
"Share plan" opens the Web Share sheet on phones, or copies the link on desktop. Opening the link loads the same profile, with a banner: "Plan shared with you. Make it yours."
