# Final Quality Audit: Judge Simulation

I scored the entry as a critical judge would, using the official criteria. The scores are my own estimates, not predictions.

## Work (400): visual appearance, originality, works on phone
| Aspect | Score /10 | Notes |
|---|---:|---|
| Visual appearance | 8.5 | A distinctive voucher identity (haldi, notches, perforation) and a disciplined steel/ink system, unlike the generic AI-dashboard look. Typography is characterful (Bricolage) and legible (Figtree). |
| Originality | 7.5 | Budget protein tools exist (FitKharcha, PlatePilot), but the combination of an exact optimiser, kitchen-aware constraints, recharge-pack framing and editable local prices is new. The recharge metaphor is memorable. |
| Works on phone | 9 | Built mobile-first, tested at 360/390 px with no sideways scroll, 48 px touch targets, a bottom tab bar, and Embarko's badge accommodated. Lighthouse Performance 97. |
| Real functionality | 9 | Every control works. The optimiser is tested against brute force, data persists across reloads, and share links work. |

## Video (300): hook, ease of following, storytelling, how it shows Embarko
| Aspect | Score /10 | Notes |
|---|---:|---|
| Hook | 8 | Frame 0 has a question and a moving live voucher. It could hit harder with a face or a voice. |
| Easy to follow | 8.5 | One profile and one set of numbers carried through, short titles. |
| Storytelling | 7 | A clear arc, but **no human voice or face yet**. This is the single biggest improvement available. |
| Shows Embarko | 8.5 | The real prompt button and a real deploy recorded live. The entrant's own Claude Code screen would make it stronger still. |

## Reach (300)
Depends entirely on posting and genuine sharing. There's a plan in SOCIAL_MEDIA_STRATEGY.md. The hook and the "comment your budget" call to action are designed for engagement.

## Weaknesses and what was done
| Weakness | Status |
|---|---|
| Mobile hero demo sits just below the fold | Accepted. The headline and CTAs are above the fold and the voucher peeks in. Moving it would push the CTAs down. |
| No music bed | Documented. Add via the in-app music library when posting, or a HyperFrames sign-in. |
| No voiceover or face in the video | The script is ready for the entrant to record (VIDEO_SCRIPT.md). |
| Prices are estimates | Labelled everywhere, and editable per food. |
| Data doesn't sync across devices | By design (no accounts). Stated on the landing page. |
| Not verified on real iOS Safari | Flagged in TEST_RESULTS.md. The entrant should open the link on their phone once. |
| App not yet claimed | **Critical, and needs the entrant.** It is deleted 25 Nov 09:43 IST otherwise. |

## Security and privacy review
- No backend, no secrets, no API keys in the source (verified: the deploy tarball contains only src/, public/ and config files).
- No personal data leaves the device. Share links encode only weight, goal, diet, kitchen and meals, with no name or contact.
- The claim code from Embarko's first deploy reply is redacted from repository files.
- Content: nutrition guidance cites ICMR-NIN and carries a non-medical disclaimer, with a kidney-disease caution.
