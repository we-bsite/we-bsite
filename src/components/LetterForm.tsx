import * as Dialog from "@radix-ui/react-dialog";
import { Letter } from "../Letter";

interface Props {
  letter: Letter;
}

export function LetterForm({ letter }: Props) {
  const submitDream = async () => {
    // TODO: submit dream api
  };

  /**
   * things to submit
   * - who are you?
   * - to
   * - date (if different from date submitted)
   * - src OR srcContent
   */

  return (
    <>
      <Dialog.Trigger asChild>
        <button className="submit">Submit yours →</button>
      </Dialog.Trigger>
      {/* TODO: onclick enter edit mode */}
      <button className="submit">Edit letter</button>
      <Dialog.Portal>
        <Dialog.Overlay className="DialogOverlay" />
        <Dialog.Content className="DialogContent">
          <Dialog.Title className="DialogTitle">
            tell your internet dream
          </Dialog.Title>
          <Dialog.Description className="DialogDescription">
            tell us what about the internet you love, you hate, what you wish
            for, what you dream it could be, who you want it to be for, who you
            want to be with, what spaces you'd like to spend time in, memories,
            feelings, hopes, and what it means to you.
            <br />
            you can submit a link to your written dream or write it here.
          </Dialog.Description>
          {letter.id}
          <fieldset className="dialogField">
            <label className="dialogLabel" htmlFor="name">
              Name
            </label>
            <input className="dialogInput" id="name" placeholder="spencer" />
          </fieldset>
          <fieldset className="dialogField">
            <label className="dialogLabel" htmlFor="to">
              To
            </label>
            <input
              className="dialogInput"
              id="to"
              defaultValue="the internet"
            />
          </fieldset>
          <fieldset className="dialogField">
            <label className="dialogLabel" htmlFor="dream">
              Dream
            </label>
            <input
              className="dialogInput"
              id="dream"
              placeholder="https://spencerchang.me/posts/our-internet"
            />
          </fieldset>
          <div
            style={{
              display: "flex",
              marginTop: 25,
              justifyContent: "flex-end",
            }}
          >
            <Dialog.Close asChild>
              <button className="submit" onClick={submitDream}>
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
    </>
  );
}
