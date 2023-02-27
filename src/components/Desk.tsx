import { Letter } from "./Letter";
import { ShuffleIcon, ResetIcon, ViewGridIcon } from "@radix-ui/react-icons";
import { useContext } from "react";
import { UserLetterContext } from "../context/UserLetterContext";

export function Desk() {
  const { letters, clearLetterLocations } = useContext(UserLetterContext);

  const renderToolbar = () => {
    return (
      <div className="toolbar">
        <button>
          <ResetIcon onClick={() => clearLetterLocations()} />
        </button>
        {/* shuffle letters */}
        {/* <button>
          <ShuffleIcon />
        </button> */}
        {/* toggle between StackIcon */}
        {/* <button>
          <ViewGridIcon />
        </button> */}
      </div>
    );
  };

  return (
    <>
      {renderToolbar()}
      <div id="desk">
        {/* If loading add loading indicator */}
        {letters?.map((letter, idx) => (
          <Letter letter={letter} key={letter.id} idx={idx} />
        ))}
      </div>
    </>
  );
}
