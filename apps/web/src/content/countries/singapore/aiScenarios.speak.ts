import type { AIPracticeScenario } from '@/content/types';

export const speakAiScenarios: AIPracticeScenario[] = [
  {
    id: 'first-classmate',
    title: 'Meeting a Classmate',
    setup:
      "You are a new student who just joined a local secondary school. A friendly classmate approaches you before class starts to say hi. Chat with him and try to use the Singlish words you've learned!",
    skills: [
      'Casual communication',
      'Understanding Singlish',
      'Responding naturally',
    ],
    suggestedOpeners: [
      'Hello!',
      'Hi, nice to meet you.',
    ],
    completionXp: 50,
    sceneKey: 'classroom',
    personaName: 'Wei Jie',
    personaDescription:
      'a laid-back, friendly Secondary 2 student who sees the new student (the user) and proactively walks over to introduce himself before class starts. ' +
      'He knows the user is brand new and warmly welcomes them, starting the conversation first. ' +
      'He speaks like a Singaporean teenager — casual, warm, using light Singlish particles (lah, leh, sia) mixed into ordinary English. NEVER use generic American greetings like "Hey, what\'s up". Start with a very local greeting like "Eh, hello!" or "You new here ah?". ' +
      'Since he knows the user is trying to pick up local slang, he naturally incorporates the Singlish words the user has learned into his own sentences to show how they are used, and reacts encouragingly if the user tries using local terms. ' +
      'Typical ground: introducing himself, asking where they moved from, and helping them settle in.',
    schoolName: 'Raffles Secondary School',
    className: 'Class 2A',
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
