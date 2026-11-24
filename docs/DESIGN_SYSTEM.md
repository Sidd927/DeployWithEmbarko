# Design System: Protein Recharge

## Concept
**The prepaid recharge voucher, redesigned.** In India, value comes printed on bright vouchers: a price, what you get, and how long it lasts. The **voucher card** is the single bold element of the product: a saturated haldi-yellow slip with a notched, perforated edge, a large rupee price and a protein figure. Everything around it is quiet: cool steel-grey surfaces, like a stainless thali, with disciplined type and generous spacing.

## Review against generic defaults (what I changed and why)
- First instinct: a cream background, serif display and terracotta accent. **Rejected**, because it is the most common generated look. I use a *cool steel* base instead, which comes from the subject (steel thali, tiffin).
- Second instinct: a dark UI with a neon-green "fitness" accent. **Rejected**, because it is a gym-app cliché. Green appears only as a *status* (goal hit).
- No uppercase eyebrows, no monospace micro-labels, no numbered sections, no gradient washes. Cards differ by role: the voucher (notched, saturated), food rows (flat list on white) and sheets (rounded top only).

## Colour
| Token | Hex | Use |
|---|---|---|
| `--steel` | `#E6EAEA` | App background (cool, slightly blue-green steel) |
| `--paper` | `#FFFFFF` | Surfaces, lists |
| `--ink` | `#14241E` | Text, primary buttons (deep leaf-black) |
| `--ink-2` | `#4D5D57` | Secondary text (AA on paper and steel) |
| `--haldi` | `#FFC21A` | Voucher fill, slider thumb. The signature colour |
| `--hari` | `#13824A` | Goal reached, positive deltas |
| `--mirchi` | `#C8381F` | Gaps, errors |
| `--line` | `#CCD4D2` | Hairlines, input borders |

Contrast: ink on haldi is 11.6:1, ink-2 on paper is 6.9:1, and white on hari is 4.9:1.

## Type
- **Bricolage Grotesque** (variable, OFL) for display text, prices and big numbers. It is a characterful grotesque with ink-trap quirks that reads "printed voucher, not SaaS". Tabular figures are used for prices.
- **Figtree** (variable, OFL) for body text and UI. Open, friendly and very legible at small sizes. *Revision:* I first chose Atkinson Hyperlegible Next, but its slashed zero made prices like "₹7.0" look broken to non-designers in testing, so I swapped it out.
- Scale (1.25 ratio, base 16 px): 12.8 / 16 / 20 / 25 / 31.25 / 39 / 61 (hero price). Body line-height is 1.5 and display line-height is 1.02–1.1. Measure is 65 characters or less.
- The price on the voucher **is** the typography: "₹49" set at 61 px or more with a tight track, and "/day" small and baseline-aligned beside it.

## Layout
Mobile-first single column (padding 20 px) with a bottom tab bar (Plan · Foods · List). Tablet and desktop (≥ 900 px): two columns, with controls and packs on the left and the plate sticky on the right. The tab bar becomes a top segmented control.

```
mobile                         desktop
┌──────────────────┐           ┌───────────────────────────────┬──────────────────┐
│ goal / mess / gap│           │ goal summary                  │  PLATE (sticky)   │
│ [voucher strip →]│           │ [voucher][voucher][voucher]   │  meter            │
│ budget slider ₹49│           │ budget slider                 │  food rows        │
│ meter ███████░   │           │                               │  totals           │
│ food rows        │           └───────────────────────────────┴──────────────────┘
│ ── tab bar ──    │
```
Left-aligned text everywhere except the voucher price block.

## Shape & depth
- Voucher: radius 18, semicircular notches 12 px on both sides at 62% height, a dashed perforation between them, and a 2 px ink border (a printed feel, no soft shadow).
- Lists: flat white with hairline separators.
- Buttons: 14 px radius, minimum height 48 px. Primary is ink on white text; secondary is a 1.5 px ink outline.
- One shadow token only, for sheets: `0 -8px 30px rgba(20,36,30,.18)`.

## Motion
- **One orchestrated moment:** when the plate changes, rows animate height and the protein meter fills over 400 ms. When the goal is crossed, the meter switches to hari with a single tick pulse.
- Voucher selection: a 150 ms lift (translateY −2 px) only in response to a tap.
- `prefers-reduced-motion` turns all transitions off.

## Iconography
A custom 24 px line icon set (1.75 px stroke, round caps), drawn for each food (soya nugget, egg, milk glass, peanut, bowl of dal, paneer cube…) plus UI glyphs. No emoji.

## Copy voice
Plain, friendly and specific. Sentence case. Buttons say exactly what happens: "Build my plan", "Don't suggest", "Copy list". Numbers come before adjectives.
