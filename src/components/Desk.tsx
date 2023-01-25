import { useYDoc } from "zustand-yjs";
import { YJS_ROOM } from "../constants";
import { LetterSharedData, LetterInterface } from "../types";
import { Letters } from "../data/letters";
import { useEffect, useState } from "react";
import { LetterFormButton } from "./LetterForm";
import { Letter } from "./Letter";
import { ShuffleIcon, ResetIcon, ViewGridIcon } from "@radix-ui/react-icons";
import { connectDoc } from "../utils/yjs";
import { SubmitLetterMetadata } from "./Home";
import { supabase } from "../lib/supabaseClient";

export function Desk() {
  const yDoc = useYDoc(YJS_ROOM, connectDoc);
  const sharedMap = yDoc.getMap<LetterSharedData>("shared");
  const [letters, setLetters] = useState<LetterInterface[] | undefined>();
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

      setLetters([
        ...((data ? data : []) as LetterInterface[]),
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

  const renderToolbar = () => {
    return (
      <div className="toolbar">
        {/* reset letters */}
        <button>
          <ResetIcon />
        </button>
        {/* shuffle letters */}
        <button>
          <ShuffleIcon />
        </button>
        {/* toggle between StackIcon */}
        <button>
          <ViewGridIcon />
        </button>
      </div>
    );
  };

  return (
    <>
      {/* {renderToolbar()} */}
      <div id="desk">
        {/* If loading add loading indicator */}
        {letters?.map((letter) => (
          <Letter letter={letter} key={letter.id} shared={sharedMap} />
        ))}
      </div>
    </>
  );
}
