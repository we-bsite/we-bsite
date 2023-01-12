import { useYDoc } from "zustand-yjs";
import { DraggableLetter } from "./components/Letter";
import people from "./data/people.json";
import { IndexeddbPersistence } from "y-indexeddb";
import * as Dialog from "@radix-ui/react-dialog";
import { YJS_ROOM } from "./constants";
import { LetterType, LetterSharedData, LetterInterface } from "./types";
import { Letters } from "./data/letters";
import { useEffect, useState } from "react";
import {
  LetterFormButton,
  LetterFormDialogContent,
} from "./components/LetterForm";
import { ShuffleIcon, ResetIcon, ViewGridIcon } from "@radix-ui/react-icons";

const connectDoc = (doc: Y.Doc) => {
  console.log(`connected to ${doc.guid}`);
  const index = new IndexeddbPersistence("(we)bsite-persistence", doc);
  return () => {
    index.destroy();
    console.log("disconnected");
  };
};

export const SubmitLetterMetadata: LetterInterface = {
  id: "submit-0",
  to: people.someone,
  from: people.you,
  initialPersistenceData: {
    rotation: 1,
    x: -5,
    y: -5,
  },
  srcContent: "your letter of internet dreams & hopes",
  date: new Date(),
  type: LetterType.Content,
};

function App() {
  const yDoc = useYDoc(YJS_ROOM, connectDoc);
  const sharedMap = yDoc.getMap<LetterSharedData>("shared");
  const [letters, setLetters] = useState<LetterInterface[] | undefined>();

  useEffect(() => {
    setLetters([
      ...Letters,
      {
        ...SubmitLetterMetadata,
        ctaContent: <LetterFormButton letter={Letters[0]}></LetterFormButton>,
      },
    ]);
  }, []);

  return (
    <>
      <Dialog.Root>
        <div className="App">
          <h1>(we)bsite</h1>
          <p>
            <em>(we)bsite</em> is a living collection of internet dreams from
            people like you, inhabitants of the internet. It aims to create
            space to hold, show, and uplift everyday visions and hopes for the
            internet.
          </p>
          <p>
            Despite all the time we spend on the internet, most of us are
            passive consumers of content and interfaces. Our standard digital
            environments do not offer let alone encourage us to imagine and
            create alternative futures for the internet.
          </p>
          <p>
            What if everyone who used the internet was encouraged to dream about
            it? What would it look like if we collectively imagine and build a
            better internet together?
          </p>
          <p>
            Change starts with possibility. We hope <em>(we)bsite</em> can be a
            catalyst for change by showing all the love, care, memories, and
            dreams that people have for the internet.
          </p>
          <p>
            <em>What do you want from the internet?</em>
          </p>
        </div>
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
        <div id="desk">
          {letters?.map((letter) => (
            <DraggableLetter
              letter={letter}
              key={letter.id}
              shared={sharedMap}
            />
          ))}
        </div>
        <footer>
          (we)bsite is a project by{" "}
          <a href={people.spencer.url}>{people.spencer.fullName}</a> and{" "}
          <a href={people.jacky.url}>{people.jacky.fullName}</a>. Poke around{" "}
          <a href="https://github.com/we-bsite/we-bsite">the source code</a>!{" "}
          <p>
            if your ears are perked, please{" "}
            <a href="mailto:spencerc99@gmail.com,j.zhao2k19@gmail.com?subject=(we)bsite dreams">
              reach out to us
            </a>
            .
          </p>
        </footer>
        <LetterFormDialogContent />
      </Dialog.Root>
    </>
  );
}

export default App;
