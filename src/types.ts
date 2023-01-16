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

export interface BaseLetter {
  id: LetterID;
  type: LetterType;
  to: Person | string;
  from: Person;
  date: Date;
  ctaContent?: React.ReactNode;
  initialPersistenceData: LetterPersistenceData;
}

export interface LetterSubmitInfo extends Pick<BaseLetter, "date" | "type"> {
  toId: string;
  fromId: string;
  src: string;
}

export interface LetterPersistenceData {
  rotation: number;
  x: number;
  y: number;
}

export interface LetterSharedData {
  numOpens: number;
  numDrags: number;
}
interface IFrameLetter extends BaseLetter {
  type: LetterType.IFrame;
  src: string;
}
interface ContentLetter extends BaseLetter {
  type: LetterType.Content;
  srcContent: React.ReactNode;
}

export type LetterInterface = IFrameLetter | ContentLetter;
type LetterID = `${string}-${number}`;

export type ApiLetter = Omit<LetterInterface, "initialPersistenceData">;
