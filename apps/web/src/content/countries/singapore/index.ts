import type { CountryPack } from '@/content/types';
import { missions } from './missions';
import { lessons } from './lessons';
import { challenges } from './challenges';
import { badges } from './badges';
import { levels } from './levels';
import { aiScenarios } from './aiScenarios';
import { phrases } from './phrases';
import { cultureTopics } from './cultureTopics';

export const singaporeCountryPack: CountryPack = {
  id: 'singapore',
  name: 'Singapore',
  missions,
  lessons,
  challenges,
  badges,
  levels,
  aiScenarios,
  phrases,
  cultureTopics,
};

export {
  missions,
  lessons,
  challenges,
  badges,
  levels,
  aiScenarios,
  phrases,
  cultureTopics,
};
