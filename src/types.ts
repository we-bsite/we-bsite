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
  content: string;
  letterInteractionData: LetterInteractionData;

  // Not persisted
  initialPersistenceData: LetterPersistenceData;
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

type RGB = `rgb(${number}, ${number}, ${number})`;
type RGBA = `rgba(${number}, ${number}, ${number}, ${number})`;
type HEX = `#${string}`;

export type Color = RGB | RGBA | HEX | string;

export type LetterInteractionData = Record<Color, LetterInteraction>;

interface LetterInteraction {
  numOpens: number;
  numDrags: number;
}

export type ApiLetter = Omit<LetterInterface, "initialPersistenceData">;

export interface Person extends PersonInfo {
  url?: string;
  color: Color;
}

/**
 * DB TYPES
 */
interface PersonInfo {
  name: string;
  stamp?: string;
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
