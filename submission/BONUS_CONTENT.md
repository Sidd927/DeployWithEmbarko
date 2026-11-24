# Writing Bonus (up to +25 points)

Rules (§5A): Medium +10, LinkedIn +5, X +5, Reddit +5. Each platform counts once. The post must be **about Embarko or the challenge** and must include **both #embarko.ai and #DeployWithEmbarko**. Claim each one under "My points" on the challenge page with the post link. The sponsor verifies every link.

Each piece below is original and tells a different part of the story, so none of them is duplicate spam.

---

## 1. Medium (+10): "I shipped a protein optimiser for hostel students in a day: here's what deploying it with Embarko looked like"

**Subtitle:** One prompt, one tar.gz, one live link, plus the one thing I'd do differently.

Mess food is cereal-heavy. When I estimated my own day (two mess meals of dal, roti and rice), it came to roughly 30 g of protein. For a 68 kg person training for muscle, ICMR-NIN's guidance puts useful intake at up to about 1.6 g per kg, which is roughly 109 g. That leaves a 79 g gap, and a hostel budget.

**The problem is an optimisation problem.** Soya chunks give the most protein per rupee by far (about 37 g per ₹10 at typical prices), but nobody eats 150 g of soya a day. Add realistic daily caps, a diet type, and whether you have a kettle or a stove, and "cheapest way to close the gap" becomes a bounded knapsack. So Protein Recharge solves it exactly with dynamic programming in the browser. It finds the minimum-cost plan that reaches the target, using at most five foods, and the same table answers "most protein for ₹X" instantly. That's what makes the budget slider feel live.

**Plans as recharge packs.** Every Indian knows the ₹199 / ₹299 / ₹399 recharge format. Showing protein plans the same way (₹29 / ₹49 / ₹53 a day) made the trade-off obvious without a chart.

**Deploying with Embarko.** I built it with Claude Code, and Claude Code also deployed it, following the official deployment prompt from embarko.ai. That prompt tells the agent to read Embarko's quickstart, deploy anonymously, give the live link, and only then ask for an email to keep it. Claude Code packed the project (no node_modules, no .env), POSTed it to `ship.embarko.ai/apps`, and polled the status: building, building, live. About 40 seconds. Embarko detected Vite and built it itself. I didn't add a Dockerfile, choose a port or create a GitHub repo.

**What testing on the live URL caught.** I ran my Playwright suite against the live link, not just localhost. Embarko adds a small badge at the bottom left of the page, and on phones it covered the first tab of my bottom navigation, so one test failed. The fix was a single CSS rule that gives the badge its own slot in the tab bar. Lesson: test on the real host, on a real phone width.

**Keeping it.** Anonymous deploys are deleted after 24 hours unless you claim them (with a sign-in link or an emailed Embarko key). Do it straight away.

Try it: https://protein-recharge.embarko.app

#DeployWithEmbarko #embarko.ai

---

## 2. LinkedIn (+5)

I built and shipped a small product this week for a problem I see every day in hostel life: mess food leaves most of us short on protein, and nobody knows the cheapest fix.

Protein Recharge asks five questions (weight, goal, diet, kitchen, mess meals) and finds the exact cheapest daily plan to close your gap. It's a real optimiser, not a guess, and the plans are shown as "recharge packs".

What I learned shipping it with Embarko:
→ Deploying from Claude Code was one copied prompt and about 40 seconds to a live link.
→ Testing on the live URL found a bug localhost never would.
→ Constraints (no stove, ₹50/day) make better products than features do.

Try it on your phone: https://protein-recharge.embarko.app

#DeployWithEmbarko #embarko.ai #buildinpublic #students

---

## 3. X (+5), a separate post from the video post

Deployed my first app with @embarko from Claude Code:
1. Claude Code read Embarko's deployment prompt
2. it packed and uploaded the app itself
3. live link in ~40 s, no Dockerfile, no repo

Protein Recharge → protein-recharge.embarko.app

#DeployWithEmbarko #embarko.ai

(Check Embarko's real X handle on embarko.ai before tagging. If you can't confirm it, write "Embarko" without the @.)

---

## 4. Reddit (+5)

**Read the subreddit's rules first.** Many ban self-promotion. Good fits are subreddits that allow "I made this" posts, such as r/SideProject, r/webdev (Showoff Saturday only) and r/developersIndia (check its self-promotion thread or flair). Post once, in one place.

**Title:** I built a protein optimiser for hostel students (exact knapsack, not AI) and deployed it with Embarko from Claude Code. Feedback welcome

**Body:**
Mess food gives ~30 g protein/day. I wanted the cheapest way to close the gap under real constraints: veg/egg/non-veg, no stove vs a kettle, at most ~50 g soya a day, my own shop's prices.

It's a bounded knapsack solved with DP in the browser (at most 5 foods, ~3 ms). One table answers both "cheapest plan for 79 g" and "most protein for ₹49", so the budget slider re-plans live.

Deploy: Claude Code followed Embarko's official deployment prompt, packed the Vite project and POSTed it to their API. It was live in about 40 s. One gotcha: their badge overlapped my mobile tab bar, and my Playwright tests on the live URL caught it.

Link: https://protein-recharge.embarko.app. I'd love feedback on the prices (they're editable estimates) and the foods I'm missing.

#DeployWithEmbarko #embarko.ai
