import type { AIPracticeScenario } from '@/content/types';

export const speakAiScenarios: AIPracticeScenario[] = [
  {
    id: 'first-classmate',
    title: 'Meeting a Classmate',
    setup:
      "You're meeting a Singaporean classmate for the first time before class starts. Start the conversation!",
    suggestedOpeners: [
      'Why you in Singapore?',
      'Which school you go?',
      'You free this weekend?',
    ],
    completionXp: 50,
    sceneKey: 'classroom',
    personaName: 'Wei Jie',
    personaDescription:
      'a laid-back, friendly Secondary 2 student who sits near you and is happy to chat in the few minutes before class starts. ' +
      'He is curious about the new classmate without interrogating them: he asks one thing at a time, reacts to the answer, and offers something about himself back rather than firing off questions. ' +
      'He speaks like a Singaporean teenager — casual, warm, light Singlish particles (lah, leh, sia) mixed into ordinary English, never formal or textbook. ' +
      'He is meeting this person for the first time, so he does not know their name, where they are from, or anything about them until they say so, and he never pretends otherwise. ' +
      'Typical ground: which class they are in, where they moved from, how they are settling in, teachers, canteen food, CCAs, what the homework was.',
    schoolName: 'Raffles Secondary School',
    className: 'Secondary 2 Amanda',
    autoOpen: true,
    hintCategories: ['lingo', 'socialVibes'],
    visualScene: {
      backgroundImage: '/scenes/scene1/background.png',
      characterImage: '/scenes/scene1/classmate.png',
      playerImage: '/scenes/scene1/player.png',
      teacherImage: '/scenes/scene1/teacher.png',
    },
    completionScript: {
      minTurns: 2,
      maxTurns: 6,
      teacherName: 'Ms Tan',
      teacherLine: 'Good morning, everyone!',
      classmateLine: "C'mon, let's go to our seats!",
    },
  },
];
