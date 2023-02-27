import { useContext, useMemo } from "react";
import seedrandom from "seedrandom";
import { UserLetterContext } from "../context/UserLetterContext";
import { LetterInteraction } from "../types";

interface Props {
  color: string;
  data: LetterInteraction;
}

const MinNumDrags = 2;

export function PastFingerprint({ color, data }: Props) {
  const { numDrags } = data;
  // evenly distribute it among the width/height of the handle, 300 x 100px

  const { currentUser } = useContext(UserLetterContext);
  const { color: userColor } = currentUser;

  const randomGenerator = useMemo(() => seedrandom(color), [color]);
  const top = useMemo(() => 100 * randomGenerator(), [randomGenerator]);
  const left = useMemo(() => 300 * randomGenerator(), [randomGenerator]);
  // scale opacity based on numDrags, logarithmic distribution between .1 and up to .6
  const opacity = useMemo(
    () => Math.min(0.8, 0.1 + Math.log(numDrags) / 10),
    [numDrags]
  );

  if (userColor !== color && numDrags < MinNumDrags) {
    return null;
  }

  return (
    // <Fingerprint
    //   key={color}
    //   width={12}
    //   height={12}
    //   opacity={opacity}
    //   color={color}
    //   top={top}
    //   left={left}
    //   type={FingerprintType.Passive}
    //   style={{ filter: "blur(1.2px)" }}
    // />
    <div
      key={color}
      className="pastFingerprintContainer"
      style={{ top, left, background: color, opacity }}
    ></div>
  );
}
