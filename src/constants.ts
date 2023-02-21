import { LetterInterface, LetterType } from "./types";

export const YJS_ROOM = "(we)bsite-persistence";
export const FORM_STORAGE_KEY = "letter-form";
export const SubmitLetterId = -1;
export const SubmitLetterMetadata: LetterInterface = {
  id: SubmitLetterId,
  to: "the internet",
  from: { name: "you" },
  content: "your letter of internet dreams & hopes",
  date: new Date(),
  type: LetterType.Content,
  letterInteractionData: {},
};
