export interface SgBuddyContext {
  missionTitle: string;
  lessonTitle: string;
  phraseWord?: string;
  cultureTopicTitle?: string;
  masteryLabel?: string;
}

export interface SgBuddyService {
  ask(context: SgBuddyContext, question: string): Promise<string>;
}
