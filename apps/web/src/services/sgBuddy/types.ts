export interface SgBuddyContext {
  missionTitle: string;
  lessonTitle: string;
  phraseWord?: string;
  cultureTopicTitle?: string;
  masteryLabel?: string;
  /** Where the learner physically is and what they are trying to do right now,
   * for scenes where the answer depends on the spot they are standing in —
   * "on the NEL platform at Punggol, heading to Changi Business Park". */
  situation?: string;
}

export interface SgBuddyService {
  ask(context: SgBuddyContext, question: string): Promise<string>;
}
