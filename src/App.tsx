import { useState } from "react";
import { LetterView } from "./Letter";
import people from './people.json'

export interface Person {
  url: string;
  fullName: string,
  name: string,
  stamp: string,

  /// use https://maxbittker.github.io/broider/
  stampBorder: string,
}

export interface Letter {
  to: Person;
  from: Person;
  src: string;
  position: {
    rotation: number,
    x: number,
    y: number,
  }
}

function App() {
  // TODO: color the background of letters depending on from, or to/from combo?
  const [letters, setLetters] = useState<Letter[]>([
    {
      to: people.jacky,
      from: people.spencer,
      src: "https://spencerchang.me/posts/everyday-magic",
      position: {
        rotation: 5,
        x: 0,
        y: -5,
      }
    },
    {
      to: people.spencer,
      from: people.jacky,
      src: "https://jzhao.xyz/posts/the-fools-who-dream/",
      position: {
        rotation: -3,
        x: -65,
        y: -80
      }
    },
  ]);

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
        {letters.map((letter) => (
          <LetterView letter={letter} />
        ))}
      </div>
      <footer>
        (we)bsite is a project by{" "}
        <a href={people.spencer.url}>{people.spencer.fullName}</a> and{" "}
        <a href={people.jacky.url}>{people.jacky.fullName}</a>.
      </footer>
    </>
  );
}

export default App;
