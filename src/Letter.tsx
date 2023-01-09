import { Letter, LetterPersistenceData, LetterSharedData, LetterType } from "./App";
import { motion } from "framer-motion";
import { useRef, useState } from "react";
import Draggable from "react-draggable";
import dayjs from "dayjs";
import Y from 'yjs'

interface Props {
  id: string;
  letter: Letter;
  shared: Y.Map<LetterSharedData>;
}

export function LetterView({ id, letter, shared }: Props) {
  const [dragging, setDragging] = useState(false);
  const { to, from, initialPersistenceData, date, type, src, ctaText } = letter;
  const saved = localStorage.getItem(id)
  const savedPersistenceData = useRef<LetterPersistenceData>(saved ? JSON.parse(saved) : {})
  const position = {
    ...initialPersistenceData,
    ...savedPersistenceData.current
  }
  const old = shared.get(id) || {
    numOpens: 0,
    numDrags: 0
  }

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
          <a href={src} target="_blank" onClick={() => shared.set(id, {
            ...old,
            numOpens: old.numOpens + 1
          })}>
            {cta}
          </a>
        </div>
      </>
    );
  };

  const toName = typeof to === "string" ? to : to.name;

  return (
    <Draggable
      handle=".letterHead"
      defaultClassName="letter-container"
      defaultPosition={position}
      onStart={() => setDragging(true)}
      onStop={(_, dragData) => {
        localStorage.setItem(id, JSON.stringify({
          x: dragData.x,
          y: dragData.y
        }))
        shared.set(id, {
          ...old,
          numDrags: old.numDrags + 1
        })
        setDragging(false)
      }}
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
          // TODO: move rotation to css random generation
          animate={{
            transform: position
              ? `rotate(${dragging ? 0 : position.rotation}deg)`
              : "",
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
                <span className="header">To: </span> {toName}
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
              {typeof to !== 'string' && (
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
