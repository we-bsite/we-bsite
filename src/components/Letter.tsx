// NOTE: next image is not supportive of any network domain host
/* eslint-disable @next/next/no-img-element */
import {
  LetterInterface,
  LetterPersistenceData,
  LetterType,
  LetterTypeToDisplay,
} from "../types";
import { AnimatePresence, motion } from "framer-motion";
import { useContext, useRef, useState } from "react";
import Draggable from "react-draggable";
import dayjs from "dayjs";
import { withQueryParams } from "../utils/url";
import { UserLetterContext } from "../context/UserLetterContext";
import { Fingerprint } from "./Fingerprint";
import { randomWithSeed } from "../utils";

interface Props {
  letter: LetterInterface;
  isEditable?: boolean;
  disableDrag?: boolean;
  idx: number;
}
const FingerprintSize = 50;

export function Letter({ letter, isEditable, disableDrag, idx }: Props) {
  const [isDragging, setDragging] = useState(disableDrag ? true : false);
  const { id, letterInteractionData } = letter;
  const saved = disableDrag ? undefined : localStorage.getItem(id);
  const savedPersistenceData = useRef<LetterPersistenceData>(
    saved ? JSON.parse(saved) : {}
  );
  // TODO: show the past fingerprints based on the letterInteractionData

  const {
    updateLetterInteraction,
    currentUser,
    highestZIndex,
    bumpHighestZIndex,
    sharedFingerprints,
    setFingerprint,
  } = useContext(UserLetterContext);
  const { color } = currentUser;

  const randomRotation = 10 * randomWithSeed(idx) - 5;
  const initialRandomX = 40 * randomWithSeed(idx) - 20;
  const initialRandomY = 40 * randomWithSeed(idx) - 20;

  const position = {
    x: initialRandomX,
    y: initialRandomY,
    z: 0,
    ...savedPersistenceData.current,
  };

  const [z, setZ] = useState<number>(position.z);
  const ref = useRef<HTMLDivElement>(null);

  function renderFingerprints() {
    const letterFingerprints = sharedFingerprints.filter(
      ({ fingerprint }) => fingerprint.letterId === id
    );

    return (
      <AnimatePresence>
        {letterFingerprints.map(({ user, fingerprint }) => {
          const fingerprintColor = user.color;
          const { top, left } = fingerprint;

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
        })}
      </AnimatePresence>
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
        animate={{
          transform: position
            ? `rotate(${isDragging ? 0 : randomRotation || 0}deg)`
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
      onStart={(e, draggableData) => {
        setDragging(true);
        if (ref.current) {
          const { top, left } = ref.current.getBoundingClientRect();
          const { clientX, clientY } =
            "touches" in e
              ? {
                  clientX: e.touches[0].clientX,
                  clientY: e.touches[0].clientY,
                }
              : { clientX: e.clientX, clientY: e.clientY };
          const newTop = clientY - top;
          const newLeft = clientX - left;

          setFingerprint({
            top: newTop,
            left: newLeft,
            letterId: id,
          });
        }
        setDragging(true);
        setZ(highestZIndex + 1);
        bumpHighestZIndex();
      }}
      onStop={(_, dragData) => {
        setFingerprint(undefined);

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
