import type { AIPracticeScenario } from '@/content/types';
import { speakAiScenarios } from './aiScenarios.speak';
import { eatAiScenarios } from './aiScenarios.eat';
import { moveAiScenarios } from './aiScenarios.move';
import { workAiScenarios } from './aiScenarios.work';
import { vibeAiScenarios } from './aiScenarios.vibe';

// Order matters: this is the order scenarios are listed in the Practice hub,
// so the ungated opener comes first and the rest follow their mission's order.
export const aiScenarios: AIPracticeScenario[] = [
  ...speakAiScenarios,
  ...eatAiScenarios,
  ...moveAiScenarios,
  ...workAiScenarios,
  ...vibeAiScenarios,
];
