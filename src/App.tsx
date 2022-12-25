import { useState } from "react";
import { LetterView } from "./Letter";

export interface Letter {
  to: string;
  from: string;
  date: Date;
  src: string;
}

function App() {
  // TODO: color the background of letters depending on from, or to/from combo?
  const [letters, setLetters] = useState<Letter[]>([
    {
      to: "Jacky",
      from: "Spencer",
      src: "https://spencerchang.me/posts/everyday-magic",
      date: new Date("2022-10-28"),
    },
    {
      to: "Spencer",
      from: "Jacky",
      src: "https://jzhao.xyz/posts/the-fools-who-dream/",
      date: new Date("2022-08-21"),
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
          <a href="mailto:spencerc99@gmail.com,j.zhao2k19@gmail.com&subject=(we)bsite dreams">
            reach out to us
          </a>
          .
        </p>
        {/* TODO: add texture to desk background, make it grainy */}
        {/* <div id="desk">
        {letters.map((letter) => (
          <LetterView letter={letter} />
        ))}
      </div> */}
      </div>
      <footer>
        (we)bsite is a project by{" "}
        <a href="https://spencerchang.me">Spencer Chang</a> and{" "}
        <a href="https://jzhao.xyz">Jacky Zhao</a>.
      </footer>
    </>
  );
}

export default App;
