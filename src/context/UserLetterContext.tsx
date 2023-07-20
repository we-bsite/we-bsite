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
  LetterPersistenceData,
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
import { encodeSVG, getSvgForCursor, shuffleArray } from "../utils";

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
  letterLocationPersistence: Record<number, LetterPersistenceData>;
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
  updateLetterLocation: (id: number, data: LetterPersistenceData) => void;
  clearLetterLocations: () => void;
  shuffleLetterLocations: () => void;
}

export type PersistedUserLetterContextInfo = Pick<
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
  letterLocationPersistence: {},
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
  updateLetterLocation: () => {},
  clearLetterLocations: () => {},
  shuffleLetterLocations: () => {},
};

export const DefaultPersistedUserLetterContext: PersistedUserLetterContextInfo =
  {
    ...DefaultUserLetterContext,
    color: DefaultUserLetterContext.currentUser.color,
  };

export const UserLetterContext = createContext<UserLetterContextType>(
  DefaultUserLetterContext
);

export const UserContextStorageId = "user-letter-context";
export const LetterLocationPersistenceStorageId = "letter-location-persistence";

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

export async function fetchLetters(): Promise<DatabaseLetter[]> {
  const { data, error, status } = await supabase
    .from("letters")
    .select("*")
    .filter("should_hide", "eq", false)
    .order("id", { ascending: true })
    .limit(500);

  if (error && status !== 406) {
    throw error;
  }

  if (!data) {
    return [];
  }

  return data;
}

export function UserLetterContextProvider({
  children,
  savedLetters,
}: PropsWithChildren<{ savedLetters: DatabaseLetter[] }>) {
  const [userContext, setUserContext] =
    useStickyState<PersistedUserLetterContextInfo>(
      UserContextStorageId,
      DefaultPersistedUserLetterContext
    );

  const [letterLocationPersistence, setLetterLocationPersistence] =
    useStickyState(LetterLocationPersistenceStorageId, {});

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

  useEffect(() => {
    const userCursorSvgEncoded = encodeSVG(getSvgForCursor(color));
    document.documentElement.style.cursor = `url("data:image/svg+xml,${userCursorSvgEncoded}"), auto`;
  }, [color]);

  function getLettersToDisplayFromSavedLetters(
    dbLetters: DatabaseLetter[]
  ): LetterInterface[] {
    const allFetchedLetters: LetterInterface[] = dbLetters.map<LetterInterface>(
      mapDbLetterToLetterInterface
    );

    const [submitLetter, ...fetchedLetters] = allFetchedLetters;

    const idxToInsertSubmitLetter = Math.min(fetchedLetters.length - 1, 5);
    fetchedLetters.splice(idxToInsertSubmitLetter, 0, {
      ...SubmitLetterMetadata,
      letterInteractionData: submitLetter.letterInteractionData,
      ctaContent: <LetterFormButton />,
    });
    return fetchedLetters;
  }

  const [letters, setLetters] = useState<LetterInterface[]>(
    getLettersToDisplayFromSavedLetters(savedLetters)
  );
  const [loading, setLoading] = useState(true);

  const [highestZIndex, setHighestZIndex] = useState<number>(0);
  const bumpHighestZIndex = () => setHighestZIndex((highest) => highest + 1);

  async function loadLetters() {
    try {
      setLoading(true);
      // TODO: stream this and can avoid the re-fetch when submit below
      const data = await fetchLetters();
      const fetchedLetters = getLettersToDisplayFromSavedLetters(data);

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

  async function updateLetterLocation(
    letterId: number,
    location: LetterPersistenceData
  ) {
    setLetterLocationPersistence({
      ...letterLocationPersistence,
      [letterId]: location,
    });
  }

  async function clearLetterLocations() {
    setLetterLocationPersistence({});
  }

  async function shuffleLetterLocations() {
    clearLetterLocations();
    const shuffledLetters = shuffleArray(letters);
    setLetters(shuffledLetters);
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
    loadLetters();
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
        letterLocationPersistence,
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
        updateLetterLocation,
        clearLetterLocations,
        shuffleLetterLocations,
      }}
    >
      {children}
    </UserLetterContext.Provider>
  );
}
