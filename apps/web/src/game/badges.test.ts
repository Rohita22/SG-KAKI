import { describe, expect, it } from 'vitest';
import { evaluateNewBadges } from './badges';
import { activeCountryPack } from '@/content/activeCountryPack';
import { createInitialProgress } from '@/services/storage/progressStorage';

describe('evaluateNewBadges (against real Singapore content)', () => {
  it('awards nothing for a fresh player', () => {
    expect(evaluateNewBadges(createInitialProgress(), activeCountryPack)).toEqual([]);
  });

  it('awards "Can Lah!" once the Speak mission is completed', () => {
    const progress = { ...createInitialProgress(), completedMissionIds: ['speak'] };
    expect(evaluateNewBadges(progress, activeCountryPack)).toContain('can-lah');
  });

  it('does not re-award a badge already in earnedBadgeIds', () => {
    const progress = {
      ...createInitialProgress(),
      completedMissionIds: ['speak'],
      earnedBadgeIds: ['can-lah'],
    };
    expect(evaluateNewBadges(progress, activeCountryPack)).not.toContain('can-lah');
  });

  it('awards "On Fire" once the streak reaches 3 days', () => {
    const progress = { ...createInitialProgress(), streakDays: 3 };
    expect(evaluateNewBadges(progress, activeCountryPack)).toContain('on-fire');
  });

  it('awards "Kopi Expert" once the kopi-code lesson is completed', () => {
    const progress = { ...createInitialProgress(), completedLessonIds: ['eat-l3'] };
    expect(evaluateNewBadges(progress, activeCountryPack)).toContain('kopi-expert');
  });

  it('awards "Read the Room" after a read-the-room challenge is answered', () => {
    const progress = {
      ...createInitialProgress(),
      completedChallengeIds: ['vibe-l2-c1'],
    };
    expect(evaluateNewBadges(progress, activeCountryPack)).toContain('read-the-room-badge');
  });

  it('awards "Phrase Collector" once 10 phrases are unlocked', () => {
    const progress = {
      ...createInitialProgress(),
      unlockedPhraseIds: Array.from({ length: 10 }, (_, i) => `p${i}`),
    };
    expect(evaluateNewBadges(progress, activeCountryPack)).toContain('phrase-collector');
  });

  it('does not award "Phrase Collector" below 10 phrases', () => {
    const progress = {
      ...createInitialProgress(),
      unlockedPhraseIds: Array.from({ length: 9 }, (_, i) => `p${i}`),
    };
    expect(evaluateNewBadges(progress, activeCountryPack)).not.toContain('phrase-collector');
  });

  it('awards "Culture Scholar" once every culture topic is unlocked', () => {
    const progress = {
      ...createInitialProgress(),
      unlockedCultureTopicIds: activeCountryPack.cultureTopics.map((t) => t.id),
    };
    expect(evaluateNewBadges(progress, activeCountryPack)).toContain('culture-scholar');
  });
});
