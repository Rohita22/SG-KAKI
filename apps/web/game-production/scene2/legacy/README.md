# Scene 2 legacy backup

This folder preserves the complete pre-game version of Quest 2 / AI Practice 2 / Scene 2 before `ordering-kopi` became the self-contained **Kopi Rush** drink-making game.

Contents:

- `aiScenarios.eat.before-kopi-game.ts.txt` — the original scenario configuration, persona prompt, visual-scene layering, and scripted ending.
- `background.png`, `auntie-poh.png`, `player.png`, and `counter.png` — the four original scene assets.

To restore the old experience, copy the `ordering-kopi` object from the backed-up scenario file into `src/content/countries/singapore/aiScenarios.eat.ts`, remove the `KopiGame` branch from `AIPracticeScreen.tsx`, and let the scenario route through `VisualNovelScene` again.
