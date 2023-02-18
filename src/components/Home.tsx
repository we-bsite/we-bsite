import * as Dialog from "@radix-ui/react-dialog";
import { LetterType, LetterInterface } from "../types";
import { LetterFormDialogContent } from "./LetterForm";
import { Desk } from "./Desk";
import { useEffect } from "react";
import { UserLetterContextProvider } from "../context/UserLetterContext";
import { Profile } from "./Profile";
import { OpenLetterDesk } from "./OpenLetterDesk";

export const SubmitLetterMetadata: LetterInterface = {
  id: "submit-0",
  to: "the internet",
  from: { name: "you" },
  content: "write your letter of internet dreams & hopes",
  date: new Date(),
  type: LetterType.Content,
  letterInteractionData: {},
};

function Home() {
  useEffect(() => {
    console.log(
      "Hi there friend. If you'd like, poke around the source code! https://github.com/we-bsite/we-bsite"
    );
  }, []);

  return (
    <>
      <UserLetterContextProvider>
        <Dialog.Root>
          <OpenLetterDesk />
          <div className="App">
            <Profile />
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
              What if everyone who used the internet was encouraged to dream
              about it? What would it look like if we collectively imagine and
              build a better internet together?
            </p>
            <p>
              Change starts with possibility. We hope <em>(we)bsite</em> can be
              a catalyst for change by showing all the love, care, memories, and
              dreams that people have for the internet.
            </p>
            <p>
              <em>What do you want from the internet?</em>
            </p>
          </div>
          <Desk />
          <footer>
            (we)bsite is a project by{" "}
            <a href="https://www.spencerchang.me/">Spencer Chang</a> and{" "}
            <a href="https://jzhao.xyz">Jacky Zhao</a>. if your ears are perked,
            please{" "}
            <a href="mailto:spencerc99@gmail.com,j.zhao2k19@gmail.com?subject=(we)bsite dreams">
              reach out to us
            </a>
            .
          </footer>
          <LetterFormDialogContent />
        </Dialog.Root>
      </UserLetterContextProvider>
    </>
  );
}

export default Home;
