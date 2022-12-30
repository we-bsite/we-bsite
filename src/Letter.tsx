import { Letter, LetterType } from "./App";
import { motion } from "framer-motion";
import { useState } from "react";
import Draggable from "react-draggable";
import dayjs from "dayjs";

interface Props {
  letter: Letter;
}

export function LetterView({ letter }: Props) {
  const [dragging, setDragging] = useState(false);
  const { to, from, position, date, type, src, ctaText } = letter;
  // TODO: clicking on letter should open in new page
  // TODO: some way to track which letters have been opened, and the ones that have been opened by more people are more worn?

  const renderContent = () => {
    let mainContent;
    switch (type) {
      case LetterType.IFrame:
        const { src } = letter;
        mainContent = (
          <div className="letter-content-wrapper">
            <iframe src={src}></iframe>
          </div>
        );
        break;
      case LetterType.Content:
        const { srcContent } = letter;
        mainContent = (
          <div className="letter-content-wrapper direct">{srcContent}</div>
        );
        break;
    }

    const cta = ctaText || "Read letter →";
    return (
      <>
        {mainContent}
        <div className="link-to-letter">
          <a href={src} target="_blank">
            {cta}
          </a>
        </div>
      </>
    );
  };

  return (
    <Draggable
      handle=".letterHead"
      defaultClassName="letter-container"
      defaultPosition={position}
      onStart={() => setDragging(true)}
      onStop={() => setDragging(false)}
    >
      <div>
        <motion.div
          className="letter"
          transition={{
            type: "spring",
            stiffness: 150,
            duration: 0.3,
            bounce: 0.8,
          }}
          animate={{
            transform: `rotate(${dragging ? 0 : position.rotation}deg)`,
            boxShadow: dragging
              ? "0 0 35px rgba(51, 75, 97, 0.35)"
              : "0 0 5px rgba(51, 75, 97, 0.2)",
          }}
          initial={false}
        >
          <div className={`letterHead ${dragging ? "dragging" : ""}`}>
            <div>
              <div>
                <span className="header">From: </span> {from.name}
              </div>
              <div>
                <span className="header">To: </span> {to.name}
              </div>
            </div>
            <div className="spacer">
              <div className="dateStamp">
                {dayjs(date).format("MM.DD")}
                <br />
                {dayjs(date).format("YYYY")}
              </div>
            </div>
            <div className="stamps">
              {from.stamp && (
                <div className="stamp">
                  <img src={from.stamp} />
                </div>
              )}
              {to.stamp && (
                <div className="stamp">
                  <img src={to.stamp} />
                </div>
              )}
            </div>
          </div>
          {renderContent()}
        </motion.div>
      </div>
    </Draggable>
  );
}
