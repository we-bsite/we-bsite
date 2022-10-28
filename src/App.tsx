import { useState } from "react";
import { LetterView } from "./Letter";

export interface Letter {
  to: string;
  from: string;
  date: Date;
  src: string;
}

function App() {
  const [letters, setLetters] = useState<Letter[]>([
    {
      to: "Jacky",
      from: "Spencer",
      src: "https://spencerchang.me/posts/everyday-magic",
      date: new Date("2022-10-28"),
    },
  ]);
  return (
    <div className="App">
      <h1>(we)bsite</h1>
      <div id="desk">
        {letters.map((letter) => (
          <LetterView letter={letter} />
        ))}
      </div>
    </div>
  );
}

export default App;
