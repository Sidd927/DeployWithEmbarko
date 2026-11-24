# Competition Requirements: Deploy With Embarko Student Challenge 2026

Research date: 24 Nov 2026. Sources were read directly. Anything marked **[ASSUMPTION]** is my interpretation and not stated by an official source.

**Primary sources**
- Rules (last updated 11 Nov 2026): https://embarko.ai/challenge/rules
- Challenge page: https://embarko.ai/challenge?cref=UNSTOP
- Guides index: https://embarko.ai/guides and https://embarko.app/guides/llms.txt
- Claude guide: https://embarko.ai/guides/host-website-built-with-claude/llms.txt
- Agent docs: https://embarko.ai/llms.txt, /docs/prerequisites.md, /docs/quickstart.md, /docs/deploy.md, /docs/static-sites.md, /docs/claim.md, /docs/data.md, /docs/ai.md

---

## 1. Overview
- **Sponsor:** SuperHeroes Inc., which operates Embarko (Delaware, USA). Contact: hello@embarko.ai.
- **Pitch:** "Build an app with AI. Put it live on Embarko. Win 250 prizes." Hashtag **#DeployWithEmbarko**.
- **Entry:** Free. Registration takes under a minute and does not need an Embarko account.
- **Prizes:** 250 in total. 1st: iPhone 16. 2nd–3rd: PS5 bundle. 4th–8th: AirPods. 9th–50th: backpack. 51st–150th: bottle. 151st–250th: T-shirt. Each person can win only one prize.

## 2. Verified deadlines
| Item | Date | Source |
|---|---|---|
| Entry and submission period ends | **30 Nov 2026, 11:59 PM IST** | Rules |
| Registration deadline | 30 Nov 2026 | Challenge page |
| Resubmission allowed | Until 30 Nov (same email + mobile) | Challenge page |
| Winners / final ranks | ~5 Dec 2026 | Rules |
| Winner reply window | 7 days after contact | Rules |
| App live + posts public | **Until winners are announced** | Rules |

## 3. Eligibility
- Students enrolled in a school, college, university or recognised educational programme, anywhere in the world.
- Aged 13 or over. Entrants under the age of majority need guardian consent.
- Sponsor employees and their families cannot enter.
- Winners may have to prove their age and student status, or be disqualified.
- **Individual only:** one entry per person, and team entries are not allowed.

## 4. Judging criteria (exact)
Each entry is scored out of 1,000 points, with bonus points added on top.

| Component | Max | Criteria (official wording) |
|---|---:|---|
| Work (app) | 400 | Visual appearance, originality, works on a phone |
| Video | 300 | Opening hook, ease of following, storytelling, how it shows Embarko |
| Reach | 300 | Views and engagement on submitted posts, as visible at judging |

**Points added to the total:**
- Submission: +50 per eligible entry.
- Platform posts: +50 per platform (Instagram, X, YouTube), up to +150. A second link on the same platform adds nothing.
- Writing bonus: Medium +10, LinkedIn/X/Reddit +5 each, up to 25. Each post must include **#embarko.ai** and **#DeployWithEmbarko**, and the link is claimed on the challenge page under "My points".
- Referrals: +1 per registration, +5 per app put live, +10 per submitted entry (for the referrer). Referrals are weighted to 20% of the overall score at final evaluation. Self-referral is banned, and referrals only count after email confirmation.
- **Tie-breaks:** higher Work score first, then higher Video score.

## 5. Application requirements
- Built with any AI tool and live at a `*.embarko.app` address.
- When the AI agent offers to keep the app, **accept**. Otherwise it is deleted after 24 hours.
- Must be the entrant's own work and must not have won a prize in another contest.
- Must not infringe copyright, trademark or privacy, or contain unlawful, hateful, explicit, violent or misleading content, or malware.
- Must stay live until winners are announced. An app that is offline at judging can be disqualified.
- Judges score it on visual appearance, originality and how well it works on a phone. The page's tip is to test on a phone.

## 6. Video requirements
- **40 seconds to 3 minutes**, filmed on a phone or screen-recorded. The page says vertical works best for Reels and Shorts.
- Must show the app, and the challenge checklist requires that the video "shows how Embarko was used".
- Suggested structure (challenge page): introduce yourself and the project's purpose → click through the app → describe getting and using the Embarko prompt → show hosting on Embarko → the wow moment → show the embarko.app link and end with the hashtag.
- Judges score the hook (first 3 seconds), how easy it is to follow, the storytelling, and how well it shows the Embarko hosting step.
- No copyrighted music, images or logos without rights.

## 7. Submission requirements
- Form fields: the app link (`yourname.embarko.app`) and post link(s). More than one post link can be added.
- Three things must be confirmed before you can continue: the app is live on embarko.app, the video is posted with the hashtag and shows Embarko use, and both links are ready.
- The latest entry for the same email + mobile is the one judged. Only submitted entries appear on the leaderboard.

## 8. Social distribution requirements
- At least one **public** post on Instagram, X or YouTube.
- Each post must include **#DeployWithEmbarko** and a **link to the app**.
- Reach counts views and engagement **as visible at judging**, so posts must stay public.
- A post can be credited to only one entry.

## 9. Bonus opportunities (ranked by value/effort)
1. Post on all three platforms: +150 guaranteed, and adds reach.
2. Writing bonus: +25 (Medium 10 + LinkedIn 5 + X 5 + Reddit 5). Each post needs both hashtags.
3. Referrals: real friends only. Strong when weighted (20%), but it relies on genuine sharing. **No fake registrations.**

## 10. Disqualification risks
- App offline or posts private at judging.
- Bots, paid promotion, purchased followers or other artificial boosting of reach.
- Fake or duplicate registrations, temporary emails, self-referral.
- Infringing music, images or logos in the video.
- Team entry, or more than one entry per person.
- Misleading content. **[ASSUMPTION]** This includes fake deployment footage, so all Embarko footage must be real.

## 11. Deployment requirements (from the official agent docs)
- **Route for Claude Code: `http_api`.** Pack the app folder as a `.tar.gz` and `POST https://ship.embarko.ai/apps` with headers `X-App-Name` and `X-Agent-Name`. The first deploy needs no account and is temporary (24 hours).
- Static sites usually reply `200 live` within about 2 seconds. Vite single-page apps can be sent as source with `package.json` and Embarko builds them, or sent as plain HTML/assets.
- Poll `GET /apps/{name}/status` until `live`. Then **open the link and confirm the main feature works** ("a 200 alone is not enough").
- **Keep it (claim):** `POST /api/public/deploy-tokens/request {"email"}` emails an "Embarko key" to the person. They paste it back, and a redeploy with `Authorization: Bearer` returns `claimed: true`. **This step needs the entrant's inbox.**
- App name: `^[a-z0-9-]+$`, 3–63 characters, unique across Embarko.
- Embarko replaces the app's CSP with its own (`https:` and `data:` allowed, plus blob for media). No Dockerfile, no WebSockets, 256 MB of memory, one process.
- Static sites have no server: data lives in each visitor's localStorage.
- AI inside an app needs a claimed server app plus a workspace Owner enabling **pay-as-you-go**, so it costs money. Not used.
- Alternative "Option A": copy the **deployment prompt** from embarko.ai and paste it into Claude Code. Option B: `npx skills add embarko-ai/skill --skill embarko-deploy -g`.

## 12. Final compliance checklist
- [ ] Registered on embarko.ai/challenge (entrant, personally: needs name/email/phone)
- [ ] Email confirmed (required for leaderboard + referral credit)
- [ ] App live on `*.embarko.app`
- [ ] App **claimed / kept** (`claimed: true`)
- [ ] App works on a phone (tested at 360, 390 and 430 px widths)
- [ ] Video is 40 s–3 min, shows the app and the real Embarko deploy
- [ ] No unlicensed music, images or logos in the app or video
- [ ] Public post on Instagram / X / YouTube, each with #DeployWithEmbarko + app link
- [ ] Writing-bonus posts include #embarko.ai + #DeployWithEmbarko, and each is claimed under "My points"
- [ ] Submission form sent with the app link + every post link before 30 Nov 11:59 PM IST
- [ ] App kept live and posts kept public until ~5 Dec
