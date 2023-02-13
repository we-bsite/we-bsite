// NOTE: next image is not supportive of any network domain host
/* eslint-disable @next/next/no-img-element */
import {
  LetterInterface,
  LetterPersistenceData,
  LetterType,
  LetterTypeToDisplay,
} from "../types";
import { motion } from "framer-motion";
import { useContext, useRef, useState } from "react";
import Draggable from "react-draggable";
import dayjs from "dayjs";
import * as Y from "yjs";
import { withQueryParams } from "../utils/url";
import { UserLetterContext } from "../context/UserLetterContext";
import { Fingerprint } from "./Fingerprint";

interface Props {
  letter: LetterInterface;
  isEditable?: boolean;
  disableDrag?: boolean;
}
const FingerprintSize = 50;

export function Letter({ letter, isEditable, disableDrag }: Props) {
  const [isDragging, setDragging] = useState(disableDrag ? true : false);
  const { id, initialPersistenceData, letterInteractionData } = letter;
  const saved = disableDrag ? undefined : localStorage.getItem(id);
  const savedPersistenceData = useRef<LetterPersistenceData>(
    saved ? JSON.parse(saved) : {}
  );
  // TODO: share the active fingerprints
  // TODO: show the past fingerprints

  const {
    updateLetterInteraction,
    currentUser,
    highestZIndex,
    bumpHighestZIndex,
    sharedFingerprints,
  } = useContext(UserLetterContext);
  const { color } = currentUser;

  console.log(
    "SHARED FINGERPRINTS",
    JSON.stringify(sharedFingerprints.get(id), null, 2)
  );

  const position = {
    x: 0,
    y: 0,
    z: 0,
    ...initialPersistenceData,
    ...savedPersistenceData.current,
  };

  const [z, setZ] = useState<number>(position.z);
  const ref = useRef<HTMLDivElement>(null);
  // const [fingerprintPosition, setFingerprintPosition] = useState<{
  //   top: number;
  //   left: number;
  // }>({ top: 0, left: 0 });

  function renderFingerprints() {
    const letterFingerprints = sharedFingerprints.get(id);

    if (!letterFingerprints) {
      return null;
    }

    console.log(
      "rendering fingerprints, ",
      JSON.stringify(letterFingerprints, null, 2)
    );

    return [...(letterFingerprints?.entries() || [])]?.map(
      ([fingerprintColor, { top, left }]) => {
        console.log(fingerprintColor);
        return (
          <Fingerprint
            key={fingerprintColor}
            top={top}
            left={left}
            color={fingerprintColor}
            width={FingerprintSize}
            height={FingerprintSize}
          />
        );
      }
    );
  }

  const letterContent = (
    <div style={{ zIndex: z }} ref={ref} className="letterContent">
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
            ? `rotate(${isDragging ? 0 : position.rotation || 0}deg)`
            : "",
          boxShadow: isDragging
            ? "0 0 35px rgba(51, 75, 97, 0.35)"
            : "0 0 5px rgba(51, 75, 97, 0.2)",
        }}
        initial={false}
      >
        {renderFingerprints()}
        <LetterView
          letter={letter}
          isDragging={isDragging}
          isEditable={isEditable}
        />
      </motion.div>
    </div>
  );

  return disableDrag ? (
    <div className="letter-container disabled">{letterContent}</div>
  ) : (
    <Draggable
      handle=".letterHead"
      defaultClassName="letter-container"
      defaultPosition={position}
      onStart={(e: any, draggableData) => {
        setDragging(true);
        if (ref.current) {
          const { top, left } = ref.current.getBoundingClientRect();
          const newTop = e.clientY - top;
          const newLeft = e.clientX - left;
          // setFingerprintPosition({
          //   top: newTop,
          //   left: newLeft,
          // });

          const existingFingerprints =
            sharedFingerprints.get(id) || new Y.Map();
          existingFingerprints.set(color, {
            top: newTop,
            left: newLeft,
          });
          if (!sharedFingerprints.get(id)) {
            sharedFingerprints?.set(id, existingFingerprints);
          }
        }
        setDragging(true);
        setZ(highestZIndex + 1);
        bumpHighestZIndex();
      }}
      onStop={(_, dragData) => {
        console.log("stopping drag");
        sharedFingerprints?.get(id)?.delete(color);

        localStorage.setItem(
          id,
          JSON.stringify({
            x: dragData.x,
            y: dragData.y,
            z,
          })
        );
        const newLetterInteractionData = { ...letterInteractionData };
        if (!newLetterInteractionData[color]) {
          newLetterInteractionData[color] = {
            numDrags: 0,
            numOpens: 0,
          };
        }
        newLetterInteractionData[color].numDrags++;
        void updateLetterInteraction(id, newLetterInteractionData);
        setDragging(false);
      }}
    >
      {letterContent}
    </Draggable>
  );
}

interface LetterViewProps {
  letter: LetterInterface;
  isDragging?: boolean;
  isEditable?: boolean;
}

export function LetterView({
  letter,
  isDragging,
  isEditable,
}: LetterViewProps) {
  const { id, to, from, date } = letter;

  const userLetterContext = useContext(UserLetterContext);
  const {
    setFromName,
    setToName,
    setFromStamp,
    setContent,
    setType,
    content,
    type: letterType,
  } = userLetterContext;

  const type = isEditable ? letterType : letter.type;

  const renderContent = () => {
    let mainContent;
    switch (type) {
      case LetterType.IFrame:
        const src = isEditable ? content : letter.content;
        // TODO: only load iframe if it's in the top-layer of z-index, otherwise render placeholder.
        // on drag, render the iframe
        mainContent = (
          <div className="letter-content-wrapper">
            {isEditable ? (
              // TODO: clean this to always add http/https (or validate?)
              <input
                className="letterIframeInput"
                placeholder="https://yourwebsite.com/letter"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            ) : null}
            <div className="link-to-letter">
              <a
                href={src}
                target="_blank"
                onClick={
                  // TODO: if needed persist num opens too here
                  () => {}
                }
                rel="noreferrer"
              >
                <img
                  src="/wax-seal.png"
                  alt="Wax seal that brings you to the letter"
                />
              </a>
            </div>
            <iframe
              loading="lazy"
              scrolling="no"
              src={withQueryParams(src, { device: "mobile" })}
            ></iframe>
          </div>
        );
        break;
      case LetterType.Content:
        const { ctaContent } = letter;
        const srcContent = isEditable ? content : letter.content;
        mainContent = (
          <div className="letter-content-wrapper direct">
            {isEditable ? (
              // TODO: add gradient picker / cycler too
              <textarea
                className="letterTextInput"
                placeholder="your letter of internet dreams & hopes"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            ) : (
              srcContent
            )}
            {ctaContent}
          </div>
        );
        break;
    }

    return (
      <>
        {isEditable ? (
          <select
            className="letterTypeSelect"
            value={letterType}
            onChange={(e) => setType(e.target.value as LetterType)}
          >
            {Object.values(LetterType).map((type) => (
              <option key={type} value={type}>
                {LetterTypeToDisplay[type]}
              </option>
            ))}
          </select>
        ) : null}
        {mainContent}
      </>
    );
  };

  const fromName = isEditable ? userLetterContext.fromName : from.name;
  const toName = isEditable
    ? userLetterContext.toName
    : typeof to === "string"
    ? to
    : to.name;
  const fromStamp = isEditable ? userLetterContext.fromStamp : from.stamp;

  async function onUploadStamp(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      console.error("Invalid file");
      return;
    }
    // serialize to base 64 image
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);

    fileReader.onload = () => {
      setFromStamp(fileReader.result as string);
    };
  }

  return (
    <>
      <div
        className={`letterHead ${isDragging ? "dragging" : ""} ${
          isEditable ? "disabled" : ""
        }`}
      >
        <div>
          <div>
            <span className="header">From: </span>{" "}
            {isEditable ? (
              <input
                className="dialogInput"
                value={fromName}
                placeholder={"you"}
                onChange={(e) => setFromName(e.target.value)}
              />
            ) : (
              fromName
            )}
          </div>
          <div>
            <span className="header">To: </span>{" "}
            {isEditable ? (
              <input
                className="dialogInput"
                placeholder="the internet"
                value={toName}
                onChange={(e) => {
                  const name = e.target.value;
                  setToName(name);
                }}
              />
            ) : (
              toName
            )}
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
          {isEditable ? (
            <div className="stamp cursor-pointer">
              <label className="flex justify-center w-full h-32 px-4 appearance-none cursor-pointer hover:background-gray-400 focus:outline-none">
                {fromStamp ? (
                  <img alt="stamp" src={fromStamp} />
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6 text-gray-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                )}
                <input
                  accept="image/png, image/jpeg"
                  type="file"
                  className="stampInput"
                  onChange={onUploadStamp}
                />
              </label>
            </div>
          ) : fromStamp ? (
            <div className="stamp">
              <img alt="stamp" src={fromStamp} />
            </div>
          ) : null}
          {typeof to !== "string" && to.stamp ? (
            <div className="stamp">
              <img alt="stamp" src={to.stamp} />
            </div>
          ) : null}
        </div>
      </div>
      {renderContent()}
    </>
  );
}
