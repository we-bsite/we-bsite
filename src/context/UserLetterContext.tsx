import { createContext, PropsWithChildren } from "react";
import { DatabaseLetter, LetterInterface, LetterType } from "../types";
import { useStickyState } from "../utils/localstorage";
import { Letters } from "../data/letters";
import { useEffect, useState } from "react";
import { LetterFormButton } from "../components/LetterForm";
import { supabase } from "../lib/supabaseClient";
import { SubmitLetterMetadata } from "../components/Home";

interface UserLetterContextType {
  letters: LetterInterface[];
  fromName: string;
  toName: string;
  fromStamp: string;
  content: string;
  type: LetterType;
  setFromName: (fromName: string) => void;
  setToName: (toName: string) => void;
  setFromStamp: (fromStamp: string) => void;
  setContent: (content: string) => void;
  setType: (setType: LetterType) => void;
  onLetterSubmitted: () => void;
}

type PersistedUserLetterContextInfo = Pick<
  UserLetterContextType,
  "fromName" | "toName" | "fromStamp" | "content" | "type"
>;

const DefaultUserLetterContext = {
  letters: [],
  fromName: "",
  toName: "the internet",
  fromStamp: "",
  content: "",
  type: LetterType.IFrame,
  setFromName: () => {},
  setToName: () => {},
  setFromStamp: () => {},
  setContent: () => {},
  setType: () => {},
  onLetterSubmitted: () => {},
};
export const UserLetterContext = createContext<UserLetterContextType>(
  DefaultUserLetterContext
);

const UserContextStorageId = "user-letter-context";

export function UserLetterContextProvider({ children }: PropsWithChildren) {
  const [userContext, setUserContext] =
    useStickyState<PersistedUserLetterContextInfo>(
      UserContextStorageId,
      DefaultUserLetterContext
    );

  const { fromName, toName, fromStamp, content, type } = userContext;
  const setFromName = (fromName: string) =>
    setUserContext({ ...userContext, fromName });
  const setToName = (toName: string) =>
    setUserContext({ ...userContext, toName });
  const setFromStamp = (fromStamp: string) =>
    setUserContext({ ...userContext, fromStamp });
  const setContent = (content: string) =>
    setUserContext({ ...userContext, content });
  const setType = (type: LetterType) =>
    setUserContext({ ...userContext, type });

  const [letters, setLetters] = useState<LetterInterface[]>([]);
  const [loading, setLoading] = useState(false);

  async function fetchLetters() {
    try {
      setLoading(true);
      const { data, error, status } = await supabase
        .from("letters")
        .select("*")
        // TODO: add pagination
        .limit(500);

      if (error && status !== 406) {
        throw error;
      }

      let fetchedLetters: LetterInterface[] = [];
      if (data) {
        fetchedLetters = (data as DatabaseLetter[]).map<LetterInterface>(
          (dbLetter) => {
            const { letter_content } = dbLetter;

            return {
              id: dbLetter.id,
              from: dbLetter.from_person,
              to: dbLetter.to_person,
              date: new Date(dbLetter.creation_timestamp),
              type: letter_content.type,
              content: letter_content.content,
              initialPersistenceData: {},
            };
          }
        );
      }

      setLetters([
        ...fetchedLetters,
        ...Letters,
        {
          ...SubmitLetterMetadata,
          ctaContent: <LetterFormButton />,
        },
      ]);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void fetchLetters();
  }, []);

  const onLetterSubmitted = () => {
    // Resets values that shouldn't be persisted.
    setUserContext({ ...userContext, content: "", toName: "the internet" });
    fetchLetters();
  };

  return (
    <UserLetterContext.Provider
      value={{
        letters,
        fromName,
        toName,
        fromStamp,
        content,
        type,
        setFromName,
        setToName,
        setFromStamp,
        setContent,
        setType,
        onLetterSubmitted,
      }}
    >
      {children}
    </UserLetterContext.Provider>
  );
}
