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
    <div className="App">
      <h1>(we)bsite</h1>
      {/* TODO: add texture to desk background, make it grainy */}
      <div id="desk">
        {letters.map((letter) => (
          <LetterView letter={letter} />
        ))}
      </div>
    </div>
  );
}

export default App;
