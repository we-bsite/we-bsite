import { useYDoc, useYMap } from "zustand-yjs";
import { LetterView } from "./Letter";
import people from "./people.json";
import Y from 'yjs'
import { IndexeddbPersistence } from "y-indexeddb";

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
  type: LetterType;
  to: Person | React.ReactNode;
  from: Person;
  date: Date;
  src: string;
  ctaText?: string;
  initialPersistenceData: LetterPersistenceData
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
}
interface ContentLetter extends BaseLetter {
  type: LetterType.Content;
  srcContent: React.ReactNode;
}

export type Letter = IFrameLetter | ContentLetter;

type LetterID = `${string}-${number}`
export const letters: Record<LetterID, Letter> = {
  "spencer-0": {
    to: "reboot & internet",
    from: people.spencer,
    src: "https://spencerchang.me/posts/everyday-magic",
    initialPersistenceData: {
      rotation: 3,
      x: 50,
      y: 13,
    },
    date: new Date("12-02-2021"),
    type: LetterType.IFrame,
  },
  "jacky-0": {
    to: "reboot & internet",
    from: people.jacky,
    src: "https://jzhao.xyz/posts/towards-data-neutrality/",
    initialPersistenceData: {
      rotation: -2,
      x: 0,
      y: 0,
    },
    date: new Date("07-14-2022"),
    type: LetterType.IFrame,
  },
  "spencer-1": {
    to: people.jacky,
    from: people.spencer,
    src: "https://spencerchang.me/posts/our-internet",
    initialPersistenceData: {
      rotation: 5,
      x: 0,
      y: -55,
    },
    date: new Date("12-11-2022"),
    type: LetterType.IFrame,
  },
  "jacky-1": {
    to: people.spencer,
    from: people.jacky,
    src: "https://jzhao.xyz/posts/communal-computing/",
    initialPersistenceData: {
      rotation: 1,
      x: -10,
      y: 40,
    },
    date: new Date("12-26-2022"),
    type: LetterType.IFrame,
  },
  "katherine-0": {
    to: "the internet",
    from: people.katherine,
    src: "https://whykatherine.github.io/assets/manifesto/manifesto.pdf",
    date: new Date("2021-09-01"),
    type: LetterType.IFrame,
  },
  "chia-0": {
    to: "the internet",
    from: people.chia,
    src: "https://chias.blog/2022/there-is-an-internet-that-is-mine/",
    date: new Date("2022-12-12"),
    type: LetterType.IFrame,
  },
  "open-0": {
    to: people.someone,
    from: people.you,
    initialPersistenceData: {
      rotation: 1,
      x: -5,
      y: -5,
    },
    srcContent: "your letter of internet dreams & hopes",
    //TODO: replace with form at launch
    src: "mailto:spencerc99@gmail.com,j.zhao2k19@gmail.com?subject=(we)bsite dreams",
    date: new Date(),
    type: LetterType.Content,
    ctaText: "Submit yours →",
  },
}

const connectDoc = (doc: Y.Doc) => {
  console.log(`connected to ${doc.guid}`)
  const index = new IndexeddbPersistence('(we)bsite-persistence', doc)
  return () => {
    index.destroy()
    console.log('disconnected')
  }
}

function App() {
  const yDoc = useYDoc('(we)bsite-persistence', connectDoc)
  const sharedMap = yDoc.getMap<LetterSharedData>('shared')
  return (
    <>
      <div className="App">
        <h1>(we)bsite</h1>
        <p>
          <em>(we)bsite</em> is a living collection of internet dreams from
          people like you, inhabitants of the internet. It aims to create space
          to hold, show, and uplift everyday visions and hopes for the internet.
        </p>
        <p>
          Despite all the time we spend on the internet, most of us are passive
          consumers of content and interfaces. Our standard digital environments
          do not offer let alone encourage us to imagine and create alternative
          futures for the internet. What if everyone who used the internet was
          encouraged to dream about it? What would it look like if we
          collectively imagine and build a better internet together?
        </p>
        <p>
          If you have an internet dream you would like to contribute and/or want
          to help us cultivate this space, please{" "}
          <a href="mailto:spencerc99@gmail.com,j.zhao2k19@gmail.com?subject=(we)bsite dreams">
            reach out to us
          </a>
          .
        </p>
      </div>
      <div id="desk">
        {Object.entries(letters).map(([id, letter]) => (
          <LetterView letter={letter} key={id} id={id} shared={sharedMap} />
        ))}
      </div>
      <footer>
        (we)bsite is a project by{" "}
        <a href={people.spencer.url}>{people.spencer.fullName}</a> and{" "}
        <a href={people.jacky.url}>{people.jacky.fullName}</a>. Poke around{" "}
        <a href="https://github.com/we-bsite/we-bsite">the source code</a>!
      </footer>
    </>
  );
}

export default App;
