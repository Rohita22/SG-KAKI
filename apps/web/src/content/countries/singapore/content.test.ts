import { describe, expect, it } from 'vitest';
import { activeCountryPack } from '@/content/activeCountryPack';

describe('Singapore content pack referential integrity', () => {
  const phraseIds = new Set(activeCountryPack.phrases.map((p) => p.id));
  const cultureTopicIds = new Set(activeCountryPack.cultureTopics.map((t) => t.id));
  const missionIds = new Set(activeCountryPack.missions.map((m) => m.id));

  it('every lesson.phraseIds entry resolves to a real phrase', () => {
    for (const lesson of activeCountryPack.lessons) {
      for (const id of lesson.phraseIds ?? []) {
        expect(phraseIds.has(id), `lesson ${lesson.id} references unknown phrase ${id}`).toBe(
          true,
        );
      }
    }
  });

  it('every lesson.cultureTopicIds entry resolves to a real culture topic', () => {
    for (const lesson of activeCountryPack.lessons) {
      for (const id of lesson.cultureTopicIds ?? []) {
        expect(
          cultureTopicIds.has(id),
          `lesson ${lesson.id} references unknown culture topic ${id}`,
        ).toBe(true);
      }
    }
  });

  it('every guidedPractice phraseId/distractorPhraseIds resolves to a real phrase', () => {
    for (const lesson of activeCountryPack.lessons) {
      for (const exercise of lesson.guidedPractice ?? []) {
        if (exercise.kind === 'tap-phrase' || exercise.kind === 'match-pronunciation') {
          expect(
            phraseIds.has(exercise.phraseId),
            `lesson ${lesson.id} guided practice ${exercise.id} references unknown phrase ${exercise.phraseId}`,
          ).toBe(true);
          for (const distractorId of exercise.distractorPhraseIds) {
            expect(
              phraseIds.has(distractorId),
              `lesson ${lesson.id} guided practice ${exercise.id} references unknown distractor ${distractorId}`,
            ).toBe(true);
          }
        }
      }
    }
  });

  it('every phrase.missionId and cultureTopic.missionId resolves to a real mission', () => {
    for (const phrase of activeCountryPack.phrases) {
      expect(
        missionIds.has(phrase.missionId),
        `phrase ${phrase.id} references unknown mission ${phrase.missionId}`,
      ).toBe(true);
    }
    for (const topic of activeCountryPack.cultureTopics) {
      expect(
        missionIds.has(topic.missionId),
        `culture topic ${topic.id} references unknown mission ${topic.missionId}`,
      ).toBe(true);
    }
  });

  it('every AI Practice scenario.unlocksAfterMissionId resolves to a real mission', () => {
    for (const scenario of activeCountryPack.aiScenarios) {
      if (scenario.unlocksAfterMissionId) {
        expect(
          missionIds.has(scenario.unlocksAfterMissionId),
          `scenario ${scenario.id} references unknown mission ${scenario.unlocksAfterMissionId}`,
        ).toBe(true);
      }
    }
  });

  it('has no duplicate phrase or culture topic ids', () => {
    expect(activeCountryPack.phrases.length).toBe(phraseIds.size);
    expect(activeCountryPack.cultureTopics.length).toBe(cultureTopicIds.size);
  });
});
