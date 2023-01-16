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

export function Desk() {
  const yDoc = useYDoc(YJS_ROOM, connectDoc);
  const sharedMap = yDoc.getMap<LetterSharedData>("shared");
  const [letters, setLetters] = useState<LetterInterface[] | undefined>();

  useEffect(() => {
    setLetters([
      ...Letters,
      {
        ...SubmitLetterMetadata,
        ctaContent: <LetterFormButton />,
      },
    ]);
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
        {letters?.map((letter) => (
          <Letter letter={letter} key={letter.id} shared={sharedMap} />
        ))}
      </div>
    </>
  );
}
