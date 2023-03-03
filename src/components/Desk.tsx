import { Letter } from "./Letter";
import { ShuffleIcon, ResetIcon, ViewGridIcon } from "@radix-ui/react-icons";
import { useContext } from "react";
import { UserLetterContext } from "../context/UserLetterContext";
import { Signature } from "./Signature";

export function Desk() {
  const { letters, clearLetterLocations, loading, shuffleLetterLocations } =
    useContext(UserLetterContext);

  const onShuffleLetters = () => {
    shuffleLetterLocations();
  };

  const renderToolbar = () => {
    return (
      <fieldset className="toolbar">
        <legend>
          <b>tools</b>
        </legend>
        <button>
          <ResetIcon onClick={() => clearLetterLocations()} />
        </button>
        <button>
          <ShuffleIcon onClick={onShuffleLetters} />
        </button>
        {/* toggle between StackIcon */}
        {/* <button disabled={true}>
          <ViewGridIcon />
        </button> */}
      </fieldset>
    );
  };

  return (
    <>
      {renderToolbar()}
      <div className="topSignature">
        <Signature repeat={6} />
      </div>
      <div id="desk">
        {letters?.map((letter, idx) => (
          <Letter letter={letter} key={letter.id} idx={idx} />
        ))}
      </div>
    </>
  );
}
