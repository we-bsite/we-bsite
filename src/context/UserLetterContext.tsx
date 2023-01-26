import { createContext, PropsWithChildren, useState } from "react";
import { LetterType } from "../types";
import { useStickyState } from "../utils/localstorage";

interface UserLetterContextType {
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
}

type PersistedUserLetterContextInfo = Pick<
  UserLetterContextType,
  "fromName" | "toName" | "fromStamp" | "content" | "type"
>;

export const UserLetterContext = createContext<UserLetterContextType>({
  fromName: "",
  toName: "",
  fromStamp: "",
  content: "",
  type: LetterType.IFrame,
  setFromName: () => {},
  setToName: () => {},
  setFromStamp: () => {},
  setContent: () => {},
  setType: () => {},
});

const UserContextStorageId = "user-letter-context";

export function UserLetterContextProvider({ children }: PropsWithChildren) {
  const [fromName, setFromName] = useStickyState(
    UserContextStorageId + "-fromName",
    ""
  );
  const [toName, setToName] = useStickyState(
    UserContextStorageId + "-toName",
    "the internet"
  );
  const [fromStamp, setFromStamp] = useStickyState(
    UserContextStorageId + "-fromStamp",
    ""
  );
  const [content, setContent] = useStickyState(
    UserContextStorageId + "-content",
    ""
  );
  const [type, setType] = useStickyState<LetterType>(
    UserContextStorageId + "-type",
    LetterType.IFrame
  );

  return (
    <UserLetterContext.Provider
      value={{
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
      }}
    >
      {children}
    </UserLetterContext.Provider>
  );
}
