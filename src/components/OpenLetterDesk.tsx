import { motion } from "framer-motion";
import { useContext } from "react";
import { UserLetterContext } from "../context/UserLetterContext";

const InitialDeskWidth = 1920;
const InitialDeskHeight = 690;
const WidthToHeightRatio = InitialDeskWidth / InitialDeskHeight;

export function currentDeskShowingHeight() {
  const currentDeskHeight = window.innerWidth / WidthToHeightRatio;
  return currentDeskHeight + calculateDeskTop();
}

export function calculateDeskTop() {
  if (typeof window === "undefined") {
    return 0;
  }
  const minToShow = 200;
  const currentDeskHeight = (window?.innerWidth || 1000) / WidthToHeightRatio;

  // Try showing half of the desk
  if (currentDeskHeight / 2 > minToShow) {
    console.log("1");
    return -currentDeskHeight / 2;
  }
  // Show as much as we can of the desk up to 200px;
  if (currentDeskHeight > minToShow) {
    console.log("2");
    return minToShow - currentDeskHeight;
  }
  // Show all the desk
  console.log("none");
  return 0;
}

export function OpenLetterDesk() {
  const { currentDraggedLetter, highestZIndex } = useContext(UserLetterContext);

  return (
    <motion.div
      className="draggable-desk"
      initial={{ top: `-${InitialDeskHeight}px` }}
      animate={{
        top:
          currentDraggedLetter === undefined
            ? `-${InitialDeskHeight}px`
            : `${calculateDeskTop()}px`,
        zIndex: highestZIndex,
      }}
    >
      <img src="/desk.png" alt="Desk to open letters on" />
      <div className="instructions">place letter to open</div>
    </motion.div>
  );
}
