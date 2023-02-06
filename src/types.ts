export interface Person {
  name: string;
  url?: string;
  fullName?: string;
  stamp?: string;
}

export enum LetterType {
  IFrame = "IFrame",
  Content = "Content",
}
export const LetterTypeToDisplay: Record<LetterType, string> = {
  [LetterType.IFrame]: "Link to another site",
  [LetterType.Content]: "Write a letter here",
};

export interface LetterInterface {
  id: string;
  type: LetterType;
  to: Person | string;
  from: Person;
  date: Date;
  initialPersistenceData: LetterPersistenceData;
  content: string;

  // Not persisted
  ctaContent?: React.ReactNode;
}

interface LetterContent {
  content: string;
  type: LetterType;
}

// TODO: just generate these randomly and then persist to local storage, we don't need to hardcode these or persist them
export interface LetterPersistenceData {
  rotation?: number;
  x?: number;
  y?: number;
  z?: number;
}

export interface LetterInteractionData {
  numOpens: number;
  numDrags: number;
}

export type ApiLetter = Omit<LetterInterface, "initialPersistenceData">;

/**
 * DB TYPES
 */
interface PersonInfo {
  name: string;
  stamp: string;
}

export interface DatabaseLetter {
  id: number;
  to_person: string;
  from_person: PersonInfo;
  creation_timestamp: number;
  letter_content: LetterContent;
  interaction_data: LetterInteractionData;
}

export type DatabaseLetterInsertInfo = Omit<
  DatabaseLetter,
  "id" | "creation_timestamp"
>;
