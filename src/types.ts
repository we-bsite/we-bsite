export enum LetterType {
  IFrame = "IFrame",
  Content = "Content",
}
export const LetterTypeToDisplay: Record<LetterType, string> = {
  [LetterType.IFrame]: "Link your publicly hosted letter",
  [LetterType.Content]: "Write a letter here",
};

export interface LetterInterface {
  id: string;
  type: LetterType;
  to: PersonWithoutColor | string;
  from: PersonWithoutColor;
  date: Date;
  content: string;
  letterInteractionData: LetterInteractionData;

  // Not persisted
  ctaContent?: React.ReactNode;
}

interface LetterContent {
  content: string;
  type: LetterType;
  date?: number;
}

export interface LetterPersistenceData {
  x?: number;
  y?: number;
  z?: number;
}

type RGB = `rgb(${number}, ${number}, ${number})`;
type RGBA = `rgba(${number}, ${number}, ${number}, ${number})`;
type HEX = `#${string}`;

export type Color = RGB | RGBA | HEX | string;

export type LetterInteractionData = Record<Color, LetterInteraction>;
export type WebsiteAwarenessData = {
  user: Partial<Person> & Pick<Person, "color">;
  fingerprint?: {
    letterId: string;
    top: number;
    left: number;
  };
};

export type LiveLetterInteractionAwareness = Required<WebsiteAwarenessData>;

interface LetterInteraction {
  numOpens: number;
  numDrags: number;
}

export type ApiLetter = LetterInterface;

export interface Person extends PersonInfo {
  url?: string;
  color: Color;
}

type PersonWithoutColor = Omit<Person, "color">;

/**
 * DB TYPES
 */
interface PersonInfo {
  name: string;
  stamp?: string;
  url?: string;
}

export interface DatabaseLetter {
  id: number;
  to_person: string;
  from_person: PersonInfo;
  creation_timestamp: number;
  letter_content: LetterContent;
  interaction_data: LetterInteractionData;
  should_hide: boolean;
}

export type DatabaseLetterInsertInfo = Omit<
  DatabaseLetter,
  "id" | "creation_timestamp" | "should_hide"
>;
