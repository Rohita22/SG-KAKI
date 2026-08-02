import { test, expect, type Page } from '@playwright/test';

/**
 * Golden-path smoke test (plan §23): walk through Discover → Phrase Card →
 * Example Conversation → Guided Practice → assessment → Lesson Recap for every
 * lesson in Speak Like a Local, complete the mission, see the celebration,
 * unlock the next mission, and confirm progress persists across a reload.
 *
 * Math.random is forced to 0 so the review-phrase weaving in Guided Practice
 * (game/review.ts) always resolves to the same phrase — with it stubbed, the
 * weighted-pick always lands on the *first* candidate in unlock order, which
 * makes the review exercise's correct answer fully predictable. Nothing else
 * in the app depends on Math.random for correctness (seededShuffle uses its
 * own seeded PRNG); only cosmetic confetti particles are affected.
 *
 * Real (non-review) Match and Sort challenges are pre-completed via seeded
 * localStorage rather than simulated mouse drags — dnd-kit drag interactions
 * are exercised in manual QA; simulating them here would make this regression
 * test slow and drag-timing-flaky for coverage this test isn't meant to own.
 * Guided Practice's "rearrange" kind is tap-to-build, not drag, so it's driven
 * through the real UI like everything else.
 */

async function answerAndContinue(page: Page, optionText: string) {
  await page.getByText(optionText, { exact: true }).click();
  const continueBtn = page.getByRole('button', { name: 'Continue' }).last();
  await expect(continueBtn).toBeVisible({ timeout: 5000 });
  await continueBtn.click();
}

async function clickThroughDiscover(page: Page, factCount: number) {
  // The small round arrow button is also labelled "Next" via aria-label — target
  // the full-width primary button by its text node instead to disambiguate.
  for (let i = 0; i < factCount - 1; i++) {
    await page.getByText('Next', { exact: true }).click();
  }
  await page.getByRole('button', { name: 'Continue' }).click();
}

async function clickThroughPhrases(page: Page, phraseCount: number) {
  for (let i = 0; i < phraseCount - 1; i++) {
    await page.getByText('Next Phrase', { exact: true }).click();
  }
  await page.getByRole('button', { name: 'Continue' }).click();
}

async function tapOption(page: Page, label: string) {
  await page.getByText(label, { exact: true }).click();
}

async function tapWordsInOrder(page: Page, words: string[]) {
  for (const word of words) {
    await page.getByText(word, { exact: true }).click();
  }
}

async function finishLessonRecap(page: Page) {
  await expect(page.getByText('Today you learned')).toBeVisible({ timeout: 5000 });
  await page.getByRole('button', { name: 'Continue' }).click();
}

test('play through Speak Like a Local end-to-end and unlock Eat Like a Local', async ({ page }) => {
  await page.addInitScript(() => {
    Math.random = () => 0;
  });

  await page.goto('/');
  await page.evaluate(() => {
    const seeded = {
      schemaVersion: 1,
      xp: 0,
      streakDays: 0,
      lastActiveDate: '',
      // Pre-complete the drag-based real challenges (see file header).
      completedChallengeIds: ['speak-l3-c1', 'speak-l5-c1'],
      completedLessonIds: [],
      completedMissionIds: [],
      unlockedMissionIds: ['speak'],
      earnedBadgeIds: [],
      aiPracticeHistory: {},
      unlockedPhraseIds: [],
      unlockedCultureTopicIds: [],
      phraseMastery: {},
    };
    localStorage.setItem('sgmode:progress:v1', JSON.stringify(seeded));
  });

  // --- Lesson 1: Can, Cannot, Can Lah — no review yet (nothing unlocked). ---
  await page.goto('/lessons/speak-l1/play');
  await expect(page.getByText('Lesson 1 of 5')).toBeVisible();
  await clickThroughDiscover(page, 3);
  await clickThroughPhrases(page, 1);
  await page.getByRole('button', { name: 'Continue' }).click(); // example conversation
  await tapOption(page, 'Can'); // guided practice
  await answerAndContinue(page, 'Can');
  await answerAndContinue(page, "Don't sit — it's already reserved");
  await finishLessonRecap(page);

  // --- Lesson 2: Lah, Leh, Lor — reviews "Can". ---
  await expect(page.getByText('Lesson 2 of 5')).toBeVisible();
  await clickThroughDiscover(page, 3);
  await clickThroughPhrases(page, 2);
  await page.getByRole('button', { name: 'Continue' }).click();
  await tapOption(page, 'lah'); // guided practice (own)
  await tapOption(page, 'Can'); // guided practice (review)
  await answerAndContinue(page, 'lah');
  await answerAndContinue(page, 'Okay lor, you decide.');
  await finishLessonRecap(page);

  // --- Lesson 3: Everyday Words — its match challenge is pre-seeded complete
  // (see file header), which makes this a mid-lesson resume from the app's
  // point of view, so pre-assessment is correctly skipped straight to the one
  // remaining challenge (same behavior a real mid-lesson page refresh gets).
  await expect(page.getByText('Lesson 3 of 5')).toBeVisible();
  await answerAndContinue(page, "It's really good / satisfying");
  await finishLessonRecap(page);

  // --- Lesson 4: Kiasu, Blur, Steady & Siao — tap-to-build rearrange, reviews "Can". ---
  await expect(page.getByText('Lesson 4 of 5')).toBeVisible();
  await clickThroughDiscover(page, 3);
  await clickThroughPhrases(page, 4);
  await page.getByRole('button', { name: 'Continue' }).click();
  await tapWordsInOrder(page, ['Wah', 'you', 'very', 'blur', 'today', 'ah']); // guided practice (own)
  await tapOption(page, 'Can'); // guided practice (review)
  await answerAndContinue(page, 'Kiasu');
  await answerAndContinue(page, 'Wah you very blur today ah');
  await finishLessonRecap(page);

  // --- Lesson 5: Mission Challenge — its sort challenge is pre-seeded complete
  // (see file header), so this is also a mid-lesson resume: pre-assessment is
  // skipped and only the culture card remains, which completes both the lesson
  // and the mission in one tap.
  await expect(page.getByText('Lesson 5 of 5')).toBeVisible();
  await page.getByRole('button', { name: 'Continue' }).click();
  await finishLessonRecap(page);

  await expect(page.getByText('MISSION COMPLETE!')).toBeVisible({ timeout: 8000 });
  await expect(page.getByText('Speak Like a Local')).toBeVisible();

  await page.getByRole('button', { name: /See What's Next|Back to Journey/ }).click();
  await expect(page.getByText('New Mission Unlocked!')).toBeVisible({ timeout: 5000 });
  await expect(page.getByText('Eat Like a Local')).toBeVisible();

  await page.getByRole('button', { name: 'Start Mission' }).click();
  await expect(page).toHaveURL(/\/missions\/eat/);

  // Persistence: reload from scratch (into the Journey map, now the home page)
  // and confirm XP/level/phrases survived.
  await page.goto('/');
  await expect(page).toHaveURL(/\/map$/);
  await expect(page.getByText('Eat Like a Local').first()).toBeVisible();
  const persisted = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('sgmode:progress:v1') ?? '{}'),
  );
  expect(persisted.xp).toBeGreaterThan(0);
  expect(persisted.completedMissionIds).toContain('speak');
  expect(persisted.unlockedPhraseIds).toEqual(
    expect.arrayContaining([
      'can', 'lah', 'lor', 'shiok', 'paiseh', 'alamak', 'kiasu', 'blur', 'steady', 'siao',
    ]),
  );
});

test('Field Guide (phrases + culture tabs) and Monkey Bars are reachable and show locked/unlocked state', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Math.random = () => 0;
  });

  await page.goto('/');
  await page.evaluate(() => {
    const seeded = {
      schemaVersion: 1,
      xp: 150,
      streakDays: 1,
      lastActiveDate: '',
      completedChallengeIds: ['speak-l1-c1', 'speak-l1-c2', 'speak-l2-c1', 'speak-l2-c2'],
      completedLessonIds: ['speak-l1', 'speak-l2'],
      completedMissionIds: [],
      unlockedMissionIds: ['speak'],
      earnedBadgeIds: [],
      aiPracticeHistory: {},
      unlockedPhraseIds: ['can', 'lah', 'lor'],
      unlockedCultureTopicIds: ['singlish-code-switching'],
      phraseMastery: { can: 1, lah: 1, lor: 1 },
    };
    localStorage.setItem('sgmode:progress:v1', JSON.stringify(seeded));
  });

  await page.goto('/field-guide');
  await expect(page.getByRole('heading', { name: '🧭 Field Guide' })).toBeVisible();
  await expect(page.getByText('Recently Learned')).toBeVisible();
  await page.getByRole('button', { name: 'Can' }).first().click();
  await expect(page.getByText('Yes, sure, no problem', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: 'Close' }).click();

  await page.getByRole('button', { name: '🎓 Culture Notes' }).click();
  await expect(page.getByText('Singlish, Not "Broken English"')).toBeVisible();

  await page.goto('/missions/speak');
  await expect(page.getByRole('button', { name: '🐒 Rapid Review' })).toBeVisible();
  await page.getByRole('button', { name: '🐒 Rapid Review' }).click();
  await expect(page).toHaveURL(/\/missions\/speak\/monkey-bars/);
  await expect(page.getByText(/Bar 1 of/)).toBeVisible();
});
