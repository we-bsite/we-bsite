import { createContext, PropsWithChildren } from "react";
import { DatabaseLetter, LetterInterface, LetterType } from "../types";
import { useStickyState } from "../utils/localstorage";
import { Letters } from "../data/letters";
import { useEffect, useState } from "react";
import { LetterFormButton } from "../components/LetterForm";
import { supabase } from "../lib/supabaseClient";
import { SubmitLetterMetadata } from "../components/Home";

interface UserLetterContextType {
  loading: boolean,
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
  highestZIndex: number,
  bumpHighestZIndex: () => void;
}

type PersistedUserLetterContextInfo = Pick<
  UserLetterContextType,
  "fromName" | "toName" | "fromStamp" | "content" | "type"
>;

const DefaultUserLetterContext: UserLetterContextType = {
  loading: true,
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
  highestZIndex: 0,
  bumpHighestZIndex: () => {},
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
  const [loading, setLoading] = useState(true);
  
  const [highestZIndex, setHighestZIndex] = useState<number>(0);
  const bumpHighestZIndex = () => setHighestZIndex(highest => highest + 1)

  async function fetchLetters() {
    try {
      setLoading(true);
      // TODO: stream this and can avoid the re-fetch when submit below
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
              id: String(dbLetter.id),
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
        loading,
        highestZIndex,
        bumpHighestZIndex
      }}
    >
      {children}
    </UserLetterContext.Provider>
  );
}
