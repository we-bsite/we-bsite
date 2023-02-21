import { createContext, PropsWithChildren, useMemo } from "react";
import {
  Color,
  DatabaseLetter,
  LetterInteractionData,
  LetterInterface,
  LetterType,
  WebsiteAwarenessData,
  Person,
  LiveLetterInteractionAwareness,
} from "../types";
import { useStickyState } from "../utils/localstorage";
import { useEffect, useState } from "react";
import { LetterFormButton } from "../components/LetterForm";
import { supabase } from "../lib/supabaseClient";
import { SubmitLetterMetadata } from "../constants";
import randomColor from "randomcolor";
import { useYAwareness, useYDoc } from "zustand-yjs";
import { YJS_ROOM } from "../constants";
import { connectDoc } from "../utils/yjs";

interface UserLetterContextType {
  loading: boolean;
  letters: LetterInterface[];
  fromName: string;
  toName: string;
  fromStamp: string;
  content: string;
  currentUser: Person;
  type: LetterType;
  sharedFingerprints: Array<LiveLetterInteractionAwareness>;
  setFingerprint: (fingerprint: WebsiteAwarenessData["fingerprint"]) => void;
  setFromName: (fromName: string) => void;
  setToName: (toName: string) => void;
  setFromStamp: (fromStamp: string) => void;
  setContent: (content: string) => void;
  setType: (setType: LetterType) => void;
  setColor: (color: Color) => void;
  onLetterSubmitted: () => void;
  highestZIndex: number;
  bumpHighestZIndex: () => void;
  updateLetterInteraction: (
    id: number,
    newInteractionData: LetterInteractionData
  ) => void;
  currentDraggedLetter: string | undefined;
  setCurrentDraggedLetter: (url: string | undefined) => void;
}

type PersistedUserLetterContextInfo = Pick<
  UserLetterContextType,
  "fromName" | "toName" | "fromStamp" | "content" | "type"
> &
  Pick<UserLetterContextType["currentUser"], "color">;

const DefaultUserLetterContext: UserLetterContextType = {
  loading: true,
  letters: [],
  fromName: "",
  toName: "the internet",
  fromStamp: "",
  content: "",
  type: LetterType.IFrame,
  currentUser: {
    name: "",
    color: randomColor(),
  },
  sharedFingerprints: [],
  setFingerprint: () => {},
  setFromName: () => {},
  setToName: () => {},
  setFromStamp: () => {},
  setContent: () => {},
  setType: () => {},
  setColor: () => {},
  onLetterSubmitted: () => {},
  highestZIndex: 0,
  bumpHighestZIndex: () => {},
  updateLetterInteraction: () => {},
  currentDraggedLetter: undefined,
  setCurrentDraggedLetter: (_: string | undefined) => {},
};

const DefaultPersistedUserLetterContext: PersistedUserLetterContextInfo = {
  ...DefaultUserLetterContext,
  color: DefaultUserLetterContext.currentUser.color,
};

export const UserLetterContext = createContext<UserLetterContextType>(
  DefaultUserLetterContext
);

const UserContextStorageId = "user-letter-context";

export function UserLetterContextProvider({ children }: PropsWithChildren) {
  const [userContext, setUserContext] =
    useStickyState<PersistedUserLetterContextInfo>(
      UserContextStorageId,
      DefaultPersistedUserLetterContext
    );

  // TODO: if you want to get ip of user
  // <script src="https://cdn.jsdelivr.net/gh/joeymalvinni/webrtc-ip/dist/bundle.dev.js"></script>
  // getIPs().then(res => document.write(res.join('\n')))

  const { fromName, toName, fromStamp, content, type, color } = userContext;
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
  const setColor = (color: Color) => setUserContext({ ...userContext, color });
  const [currentDraggedLetter, setCurrentDraggedLetter] = useState<
    undefined | string
  >(undefined);

  const currentUser = useMemo(
    () => ({
      name: fromName,
      stamp: fromStamp,
      color,
      // TODO: add url
    }),
    [color, fromName, fromStamp]
  );
  const yDoc = useYDoc(YJS_ROOM, connectDoc);

  const [awarenessData, setAwarenessData] =
    useYAwareness<WebsiteAwarenessData>(yDoc);

  // TODO: jank conversion but it should be true
  const sharedFingerprints: Array<LiveLetterInteractionAwareness> =
    awarenessData
      .filter((s) => Boolean(s.fingerprint))
      .map((s) => s as LiveLetterInteractionAwareness);
  function setFingerprint(fingerprint?: WebsiteAwarenessData["fingerprint"]) {
    setAwarenessData({ fingerprint });
  }

  // Handle local awareness data for user
  useEffect(() => {
    setAwarenessData({ user: currentUser });
  }, [currentUser, setAwarenessData]);

  const [letters, setLetters] = useState<LetterInterface[]>([]);
  const [loading, setLoading] = useState(true);

  const [highestZIndex, setHighestZIndex] = useState<number>(0);
  const bumpHighestZIndex = () => setHighestZIndex((highest) => highest + 1);

  async function fetchLetters() {
    try {
      setLoading(true);
      // TODO: stream this and can avoid the re-fetch when submit below
      const { data, error, status } = await supabase
        .from("letters")
        .select("*")
        .filter("should_hide", "eq", false)
        .order("id", { ascending: true })
        // TODO: add pagination
        .limit(500);

      if (error && status !== 406) {
        throw error;
      }

      let fetchedLetters: LetterInterface[] = [];
      if (data) {
        fetchedLetters = (data as DatabaseLetter[]).map<LetterInterface>(
          mapDbLetterToLetterInterface
        );
      }

      const idxToInsertSubmitLetter = Math.min(fetchedLetters.length - 1, 5);
      fetchedLetters.splice(idxToInsertSubmitLetter, 0, {
        ...SubmitLetterMetadata,
        ctaContent: <LetterFormButton />,
      });

      setLetters(fetchedLetters);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateLetterInteraction(
    id: number,
    newInteractionData: LetterInteractionData
  ) {
    await supabase
      .from("letters")
      .update({ interaction_data: newInteractionData })
      .eq("id", id);
  }

  useEffect(() => {
    void fetchLetters();
  }, []);

  function mapDbLetterToLetterInterface(
    dbLetter: DatabaseLetter
  ): LetterInterface {
    const { letter_content, interaction_data } = dbLetter;

    return {
      id: dbLetter.id,
      from: dbLetter.from_person,
      to: dbLetter.to_person,
      date: new Date(letter_content.date || dbLetter.creation_timestamp),
      type: letter_content.type,
      content: letter_content.content,
      letterInteractionData: interaction_data,
    } as LetterInterface;
  }

  // useEffect(() => {
  //   console.log("set up channel");

  //   const channel = supabase
  //     .channel("any")
  //     .on(
  //       REALTIME_LISTEN_TYPES.POSTGRES_CHANGES,
  //       { event: "INSERT", schema: "public", table: "letters" },
  //       (payload) => {
  //         console.log("loaded payload: ", payload);
  //         try {
  //           setLoading(true);
  //           const newLetter: DatabaseLetter = payload.new as DatabaseLetter;
  //           setLetters((letters: any) => [
  //             ...letters.slice(0, letters.length - 1),
  //             mapDbLetterToLetterInterface(newLetter),
  //             {
  //               ...SubmitLetterMetadata,
  //               ctaContent: <LetterFormButton />,
  //             },
  //           ]);
  //         } catch (err: any) {
  //           alert(err.message);
  //         } finally {
  //           setLoading(false);
  //         }
  //       }
  //     )
  //     .subscribe();

  //   return () => {
  //     supabase.removeChannel(channel);
  //   };
  // }, [letters]);

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
        sharedFingerprints,
        currentUser: currentUser,
        setFingerprint,
        setFromName,
        setToName,
        setFromStamp,
        setContent,
        setType,
        setColor,
        onLetterSubmitted,
        loading,
        highestZIndex,
        bumpHighestZIndex,
        updateLetterInteraction,
        currentDraggedLetter,
        setCurrentDraggedLetter,
      }}
    >
      {children}
    </UserLetterContext.Provider>
  );
}
