# Scene 2 legacy backup

This folder preserves the complete pre-game version of Quest 2 / AI Practice 2 / Scene 2 before `ordering-kopi` became the self-contained **Kopi Rush** drink-making game.

Contents:

- `aiScenarios.eat.before-kopi-game.ts.txt` — the original scenario configuration, persona prompt, visual-scene layering, and scripted ending.
- `background.png`, `auntie-poh.png`, `player.png`, and `counter.png` — the four original scene assets.

These files are intentionally kept outside `public/` because the current game does not load them.

To restore the old experience:

1. Copy the `ordering-kopi` object from the backed-up scenario file into `src/content/countries/singapore/aiScenarios.eat.ts`.
2. Copy the four PNG files from this folder into `public/scenes/scene2/`, preserving their filenames.
3. Remove the `KopiGame` branch from `AIPracticeScreen.tsx` so the scenario routes through `VisualNovelScene` again.
