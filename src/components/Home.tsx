import { LetterFormButton, LetterFormDialogContent } from "./LetterForm";
import { Desk } from "./Desk";
import { useEffect } from "react";
import { UserLetterContextProvider } from "../context/UserLetterContext";
import { ColorPicker, Profile } from "./Profile";
import { OpenLetterDesk } from "./OpenLetterDesk";
import { AboutLink } from "../pages/about";
import { Footer } from "./Footer";

function Home() {
  return (
    <>
      <OpenLetterDesk />
      <AboutLink />
      <div className="App">
        {/* <Profile /> */}
        <h1>(we)bsite</h1>
        <p>
          <em>(we)bsite</em> is a living collection of internet dreams from
          people like you, inhabitants of the internet. It aims to create space
          to hold, show, and uplift everyday visions and hopes for the internet.
        </p>
        <h3>
          <em>What do you want from the internet?</em>
        </h3>
        <p>
          Please share your dreams, hopes, and invocations with us and{" "}
          <LetterFormButton inline={true} />. The only personal data we collect
          from you is where you leave your fingerprint as you interact with the
          letters <ColorPicker inline={true} /> (pick a color that you identify
          with). You&apos;ll find other visitors&apos; fingers scattered
          throughout the letters they&apos;ve touched.
        </p>
        <p>
          What does it mean to leave our presence on the websites we visit? Can
          we feel the presence of those who have been here before?
        </p>
      </div>
      <Desk />
      <Footer />
      <LetterFormDialogContent />
    </>
  );
}

export default Home;
