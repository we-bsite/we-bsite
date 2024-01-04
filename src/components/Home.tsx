import { LetterFormButton, LetterFormDialogContent } from "./LetterForm";
import { Desk } from "./Desk";
import { useContext, useEffect } from "react";
import { ColorPicker, Profile } from "./Profile";
import { OpenLetterDesk } from "./OpenLetterDesk";
import { AboutLink } from "../pages/about";
import { Footer } from "./Footer";
import { UserLetterContext } from "../context/UserLetterContext";

function Home() {
  const { letters } = useContext(UserLetterContext);
  const areLettersLoading = letters.length === 11;

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
          with). You&apos;ll find other visitors&apos; fingerprints scattered
          throughout the letters they&apos;ve touched.
        </p>
        <p style={{ marginBottom: "6px" }}>
          What does it mean to leave our presence on the websites we visit? Can
          we feel the presence of those who have been here before?
        </p>
        <span className="small">
          <i>
            <span className={areLettersLoading ? "loading" : ""}>
              {areLettersLoading ? "???" : letters.length}
            </span>{" "}
            letters written since December, 11, 2022.
          </i>
        </span>
      </div>
      <Desk />
      <Footer />
      <LetterFormDialogContent />
    </>
  );
}

export default Home;
