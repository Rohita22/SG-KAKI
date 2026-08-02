import type { ComponentType } from 'react';
import type { ChallengeType } from '@/content/types';
import type { ChallengeComponentProps } from './types';
import { MultipleChoiceChallenge } from './MultipleChoiceChallenge';
import { CanCannotChallenge } from './CanCannotChallenge';
import { PickReplyChallenge } from './PickReplyChallenge';
import { ReadTheRoomChallenge } from './ReadTheRoomChallenge';
import { SortChallenge } from './SortChallenge';
import { MatchChallenge } from './MatchChallenge';
import { CultureCard } from './CultureCard';

export const CHALLENGE_RENDERERS: Record<
  ChallengeType,
  ComponentType<ChallengeComponentProps<never>>
> = {
  'multiple-choice': MultipleChoiceChallenge as ComponentType<ChallengeComponentProps<never>>,
  'scenario-decision': MultipleChoiceChallenge as ComponentType<ChallengeComponentProps<never>>,
  'can-cannot': CanCannotChallenge as ComponentType<ChallengeComponentProps<never>>,
  'pick-reply': PickReplyChallenge as ComponentType<ChallengeComponentProps<never>>,
  'read-the-room': ReadTheRoomChallenge as ComponentType<ChallengeComponentProps<never>>,
  sort: SortChallenge as ComponentType<ChallengeComponentProps<never>>,
  match: MatchChallenge as ComponentType<ChallengeComponentProps<never>>,
  'culture-card': CultureCard as ComponentType<ChallengeComponentProps<never>>,
};
