# Scene 2: Kopi Rush

Scene 2 is intentionally split into three small areas:

- `src/components/practice/scene2/KopiGame.tsx` contains the game UI and interactions.
- `src/components/practice/scene2/kopiRecipes.ts` contains ingredient metadata, recipes, and game rules; its adjacent test file verifies those rules.
- `public/scenes/scene2/kopi-game/` contains the nine runtime image assets. The plastic cup and its changing contents are rendered directly by the game, so no cup image is required.

`RESEARCH.md` records the drink terminology and portion assumptions. `legacy/` is the self-contained rollback copy of the ordering scene and is not loaded by the current app.
