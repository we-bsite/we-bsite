import { motion } from "framer-motion";
import { useContext } from "react";
import { UserLetterContext } from "../context/UserLetterContext";

const deskHeight = 600
export function OpenLetterDesk() {
  const { currentDraggedLetter, highestZIndex } = useContext(UserLetterContext);

  return <motion.div className="draggable-desk"
    initial={{ top: `-${deskHeight}px` }}
    animate={{ top: currentDraggedLetter === undefined ? `-${deskHeight}px` : `-${deskHeight - 300}px`, zIndex: highestZIndex }}>
    <img src="/desk.png" alt="Desk to open letters on" />
  </motion.div>
}
