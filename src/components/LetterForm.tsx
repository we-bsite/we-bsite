import * as Dialog from "@radix-ui/react-dialog";
import { supabase } from "../lib/supabaseClient";
import { SubmitLetterMetadata } from "./Home";
import { Letter } from "./Letter";

export function LetterFormButton() {
  return (
    <Dialog.Trigger asChild>
      <button className="submit">Edit your letter</button>
    </Dialog.Trigger>
  );
}

export function LetterFormDialogContent() {
  const submitDream = async () => {
    // grab content from localstorage

    // persist in supabase
    await supabase.from("letters").insert({});

    // clear the info about the letter, leave stuff about the person
  };

  return (
    <Dialog.Portal>
      <Dialog.Overlay className="DialogOverlay" />
      <Dialog.Content className="DialogContent">
        <Dialog.Title className="DialogTitle">
          tell your internet dream (coming soon)
        </Dialog.Title>
        <Dialog.Description className="DialogDescription">
          <p>
            tell us what about the internet you love, you hate, what you wish
            for, what you dream it could be, who you want it to be for, who you
            want to be with, what spaces you'd like to spend time in, memories,
            feelings, hopes, and what it means to you.
          </p>
          <p>what do you want from the internet?</p>
        </Dialog.Description>
        <div className="mainDialogContent">
          <Letter
            letter={SubmitLetterMetadata}
            isEditable={true}
            disableDrag={true}
          />
        </div>
        <p>you can submit a link to your written dream or write it here.</p>
        <div
          style={{
            display: "flex",
            marginTop: 25,
            justifyContent: "flex-end",
          }}
        >
          {/* TODO: disable until all filled in */}
          <Dialog.Close asChild>
            <button className="submit" onClick={submitDream} disabled={true}>
              Tell Dream
            </button>
          </Dialog.Close>
        </div>
        <Dialog.Close asChild>
          <button className="dialogCloseButton" aria-label="Close">
            x
          </button>
        </Dialog.Close>
      </Dialog.Content>
    </Dialog.Portal>
  );
}

export function LetterForm() {}
