# Decisions Log

| # | Date | Decision | Why | Alternatives rejected |
|---|---|---|---|---|
| 1 | 24 Nov | Build **Protein Recharge** | Highest weighted score (84/100). The obvious student ideas each have 9–12 live competitors in 2026 (see research/) | Attendance planner (70.5), used-phone inspector (69), CTC decoder (67) |
| 2 | 24 Nov | Exact DP optimiser in the browser, no AI API | Deterministic, instant, free, works offline, and not "an AI wrapper". Embarko's in-app AI needs pay-as-you-go billing | LLM meal planner (cost, non-determinism), greedy (suboptimal under caps) |
| 3 | 24 Nov | One DP table answers both goal and budget queries | The slider becomes an O(P) lookup with no recomputation, which is what makes it feel live | Re-solving per slider tick |
| 4 | 24 Nov | Max 5 distinct foods per plan, with per-food daily caps | Plans people will actually follow. Caps prevent "300 g soya" answers | Unconstrained cost minimum |
| 5 | 24 Nov | Static Vite + React + TS, localStorage | Most reliable on Embarko (nothing to crash during judging), private by default | Node + SQLite server (no product need) |
| 6 | 24 Nov | Recharge-voucher visual identity; steel/ink/haldi | It comes from the subject's own vernacular and avoids the generic AI-dashboard look | Cream + serif (generated-design cliché), dark + neon (gym-app cliché) |
| 7 | 24 Nov | Swapped body font Atkinson → Figtree | Atkinson's slashed zero made prices like "₹7.0" look broken | — |
| 8 | 24 Nov | Deploy via Embarko HTTP API from Claude Code, following the official prompt | The documented route for agents with network access. The Vite source is sent and Embarko builds it | Uploading a prebuilt dist (kept as a fallback) |
| 9 | 24 Nov | Badge-aware tab bar via `body:has(#__embarko_orphan_footer)` | Embarko's badge is non-dismissable by design and blocked taps on phones | Hiding the badge (against Embarko's intent) |
| 10 | 24 Nov | Video built in HyperFrames from real captures only | Deterministic, editable, and honest. The deploy clip is a real deploy recorded live | Screen-recorded mockups, a fabricated terminal |
| 11 | 24 Nov | Corrected the hook from "No kitchen" to "Mess food" | The demo profile uses a kettle, so the original line was untrue | — |
| 12 | 24 Nov | No voiceover or music generated | Free voice/music tools need the entrant's sign-in, and macOS system voices have unclear licensing for public posts. The entrant's own voice scores better anyway | `say` TTS, code-synthesised music |
| 13 | 24 Nov | Did not request an Embarko key or claim on the entrant's behalf | Claiming creates or uses an Embarko account in the entrant's name and needs their inbox or sign-in | — |
