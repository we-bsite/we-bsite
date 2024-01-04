import * as Dialog from "@radix-ui/react-dialog";
import { useContext } from "react";
import { UserLetterContext } from "../context/UserLetterContext";
import { supabase } from "../lib/supabaseClient";
import { DatabaseLetterInsertInfo } from "../types";
import { SubmitLetterMetadata } from "../constants";
import { Letter } from "./Letter";

interface LetterFormProps {
  inline?: boolean;
  buttonContent?: React.ReactNode;
}

export function LetterFormButton({ inline, buttonContent }: LetterFormProps) {
  const child = (
    <Dialog.Trigger asChild>
      {buttonContent ? (
        buttonContent
      ) : (
        <button className="submit edit-letter">Write a letter</button>
      )}
    </Dialog.Trigger>
  );

  return inline ? <span>{child}</span> : <div>{child}</div>;
}

export function LetterFormDialogContent() {
  const { fromName, toName, fromStamp, content, type, onLetterSubmitted } =
    useContext(UserLetterContext);
  const submitDisabled = !fromName || !toName || !content || !type;

  const submitDream = async () => {
    if (submitDisabled) {
      return;
    }

    const toInsert: DatabaseLetterInsertInfo = {
      from_person: {
        name: fromName,
        stamp: fromStamp,
      },
      to_person: toName,
      letter_content: {
        content,
        type,
      },
      interaction_data: {},
      should_hide: false,
    };

    await supabase.from("letters").insert(toInsert);
    onLetterSubmitted();
  };

  return (
    <Dialog.Portal>
      <Dialog.Overlay className="DialogOverlay" />
      <Dialog.Content className="DialogContent">
        <Dialog.Title className="DialogTitle">
          tell your internet dream
        </Dialog.Title>
        <Dialog.Description className="DialogDescription">
          <p>
            tell us what about the internet you love, you hate, what you wish
            for, what you dream it could be, who you want it to be for, who you
            want to be with, what spaces you&apos;d like to spend time in,
            memories, feelings, hopes, and what it means to you.
          </p>
          {/* TODO: add a shimmer effect on this, like pluriverse */}
          <b>
            <p>what do you want from the internet?</p>
          </b>
        </Dialog.Description>
        <div className="mainDialogContent">
          <Letter
            letter={SubmitLetterMetadata}
            isEditable={true}
            disableDrag={true}
            idx={0}
          />
        </div>
        <p>{`you can submit a link to your written dream or write it here.`}</p>
        <p>{`please pay for postage by uploading a stamp (please keep it as small as possible, ideally square, 32x32). If you don't have the means, we can accommodate you.`}</p>
        <div
          style={{
            display: "flex",
            marginTop: 25,
            justifyContent: "flex-end",
          }}
        >
          <Dialog.Close asChild>
            <button
              className="submit"
              onClick={submitDream}
              disabled={submitDisabled}
            >
              Tell Dream
            </button>
          </Dialog.Close>
          <Dialog.Close asChild>
            <button className="dialogCloseButton" aria-label="Close">
              ⓧ
            </button>
          </Dialog.Close>
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  );
}
