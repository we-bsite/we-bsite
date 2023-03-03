import { motion } from "framer-motion";
import { SignaturePaths } from "../utils/signature";

interface Props {
  repeat?: number;
  timePerLetter?: number;
}

export function Signature({ repeat = 1, timePerLetter = 0.03 }: Props) {
  const TimePerLetter = timePerLetter;
  const TotalLetters = SignaturePaths.length;
  // NOTE: this needs more math to handle the repeating below if you make it non-zero.
  const StartDelay = 0;
  const TotalAnimationDuration = StartDelay + TotalLetters * TimePerLetter;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      className="signatureContainer"
    >
      {[...Array(repeat)].flatMap((_, j) => {
        return (
          <motion.svg
            width="285.32"
            height="20"
            viewBox="0 0 285.32 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            {SignaturePaths.map((path, i) => {
              const formerRepeatedSignatureDurations =
                j == 0 ? StartDelay : j * TotalAnimationDuration;
              //   const delay = i * TimePerLetter;
              const delay =
                formerRepeatedSignatureDurations + i * TimePerLetter;

              return (
                <motion.path
                  key={`${i}${j}`}
                  vector-effect="non-scaling-stroke"
                  strokeLinecap="round"
                  fillRule="evenodd"
                  fontSize="9pt"
                  stroke="#faf9f5"
                  stroke-width="0.05mm"
                  variants={{
                    hidden: { pathLength: 0, opacity: 0 },
                    visible: () => {
                      return {
                        pathLength: 1,
                        opacity: 1,
                        transition: {
                          pathLength: {
                            delay,
                            duration: TimePerLetter,
                            type: "spring",
                            bounce: 0,
                            // Try to make it infinitely repeat
                            // repeat: Infinity,
                            // repeatDelay:
                            //   TotalAnimationDuration -
                            //   (TotalLetters - i - 1) * TimePerLetter,
                          },
                          opacity: {
                            delay,
                            duration: 0.01,
                            // Try to make it infinitely repeat
                            // repeat: Infinity,
                            // repeatDelay:
                            //   TotalAnimationDuration - (TotalLetters - i) * TimePerLetter,
                          },
                        },
                      };
                    },
                  }}
                  d={path}
                />
              );
            })}
          </motion.svg>
        );
      })}
    </motion.div>
  );
}
