import type { Lesson } from '@/content/types';
import { speakLessons } from './lessons.speak';
import { eatLessons } from './lessons.eat';
import { moveLessons } from './lessons.move';
import { vibeLessons } from './lessons.vibe';
import { workLessons } from './lessons.work';
import { reallifeLessons } from './lessons.reallife';

export const lessons: Lesson[] = [
  ...speakLessons,
  ...eatLessons,
  ...moveLessons,
  ...vibeLessons,
  ...workLessons,
  ...reallifeLessons,
];
