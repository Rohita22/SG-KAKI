import type { AIPracticeScenario } from '@/content/types';

export const vibeAiScenarios: AIPracticeScenario[] = [
  {
    id: 'lunch-invitation',
    title: 'Lunch Invitation',
    setup: 'A colleague wants to jio you for lunch. Respond and help settle on a plan.',
    suggestedOpeners: [
      'Wah sure, where you thinking?',
      'Can lah, what time?',
      'Today a bit tight, tomorrow can?',
    ],
    completionXp: 40,
    unlocksAfterMissionId: 'vibe',
    personaName: 'Jing Wen',
    personaDescription:
      'a friendly colleague jio-ing you out for lunch — warm, flexible, and easy to make plans with. ' +
      'You are on comfortable terms as workmates, so she is casual and uses natural Singlish, but this is a lunch invitation rather than deep personal catch-up. ' +
      'She makes real, specific proposals instead of vague ones: naming the kopitiam downstairs, the food court across the road, a particular cai fan or noodle place, suggesting a time, asking whether you want to walk or dabao back to the office. ' +
      'She adapts cheerfully if you are busy or want something different, and the exchange works toward actually settling on a place and time.',
    autoOpen: true,
    hintCategories: ['socialVibes', 'food', 'lingo'],
  },
  {
    id: 'weekend-plans',
    title: 'Weekend Plans',
    setup: 'A friend is texting you about weekend plans. Keep the casual back-and-forth going.',
    suggestedOpeners: [
      'Eh you free this weekend?',
      'Thinking of makan somewhere new, you in?',
      'Let\'s see how the weather is first.',
    ],
    completionXp: 40,
    unlocksAfterMissionId: 'vibe',
    personaName: 'Xin Yi',
    personaDescription:
      'a close friend texting you about what to do this weekend — relaxed, a bit playful, and easy company. ' +
      'She texts the way friends actually do: short messages, casual Singlish, the odd bit of teasing, no formality at all. ' +
      'She floats concrete ideas rather than asking "what do you want to do?" on repeat — specific places and plans like East Coast Park, Gardens by the Bay, a new cafe someone recommended, catching a movie, going to a night market, heading to Sentosa — and reacts honestly to what you suggest. ' +
      'She is happy to change plans, mentions practical things like weather and crowds, and the chat naturally works toward some loose plan for the weekend.',
    autoOpen: true,
    hintCategories: ['socialVibes', 'lingo'],
  },
];
