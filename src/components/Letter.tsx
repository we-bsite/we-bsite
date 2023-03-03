// NOTE: next image is not supportive of any network domain host
/* eslint-disable @next/next/no-img-element */
import {
  LetterInterface,
  LetterPersistenceData,
  LetterType,
  LetterTypeToDisplay,
} from "../types";
import { AnimatePresence, motion } from "framer-motion";
import { useContext, useMemo, useRef, useState } from "react";
import Draggable from "react-draggable";
import dayjs from "dayjs";
import { withQueryParams } from "../utils/url";
import { UserLetterContext } from "../context/UserLetterContext";
import { Fingerprint } from "./Fingerprint";
import seedrandom from "seedrandom";
import { currentDeskShowingHeight } from "./OpenLetterDesk";
import { SubmitLetterId } from "../constants";
import { PastFingerprint } from "./PastFingerprint";
import { useStickyState } from "../utils/localstorage";

interface Props {
  letter: LetterInterface;
  isEditable?: boolean;
  disableDrag?: boolean;
  idx: number;
}
const FingerprintSize = 50;
const MinDragTimeMs = 1000;

export function Letter({ letter, isEditable, disableDrag, idx }: Props) {
  const [dragStart, setDragStart] = useState<null | number>(null);
  const isDragging = useMemo(
    () => (disableDrag || dragStart ? true : false),
    [disableDrag, dragStart]
  );

  const {
    updateLetterInteraction,
    currentUser,
    highestZIndex,
    bumpHighestZIndex,
    sharedFingerprints,
    setFingerprint,
    setCurrentDraggedLetter,
    letterLocationPersistence,
    updateLetterLocation,
  } = useContext(UserLetterContext);

  const { id, letterInteractionData } = letter;
  const savedPersistenceData = useMemo(
    () => (disableDrag ? undefined : letterLocationPersistence[id]),
    [disableDrag, letterLocationPersistence, id]
  );

  const { color } = currentUser;

  const randomGenerator = useMemo(() => seedrandom(String(idx)), [idx]);
  const randomRotation = useMemo(
    () => 10 * randomGenerator() - 5,
    [randomGenerator]
  );
  const initialRandomX = useMemo(
    () => 30 * randomGenerator() - 15,
    [randomGenerator]
  );
  const initialRandomY = useMemo(
    () => 30 * randomGenerator() - 15,
    [randomGenerator]
  );

  // TODO: these should probably be percentages of screen size
  const position = useMemo(
    () => ({
      x: savedPersistenceData?.x ?? initialRandomX,
      y: savedPersistenceData?.y ?? initialRandomY,
      z: savedPersistenceData?.z ?? 0,
    }),
    [initialRandomX, initialRandomY, savedPersistenceData]
  );

  const [z, setZ] = useState<number>(0);
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

          // TODO: fix color on mobile
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

  // console.log(
  //   `letter: ${letter.id}: ${Object.entries(letterInteractionData).length}`
  // );

  const pastFingerprints = Object.entries(letterInteractionData).map(
    ([color, data]) => <PastFingerprint key={color} color={color} data={data} />
  );

  const draggingValues = {
    boxShadow: "0 0 35px rgba(51, 75, 97, 0.35)",
    transform: "rotate(0deg)",
  };
  const stillValues = {
    boxShadow: "0 0 5px rgba(51, 75, 97, 0.2)",
    transform: `rotate(${randomRotation}deg)`,
  };
  const focusValues = {
    boxShadow: draggingValues.boxShadow,
  };

  const letterContent = (
    <div
      style={{
        zIndex: z,
      }}
      ref={ref}
      className={`letterContent`}
    >
      <motion.div
        id={id === SubmitLetterId ? "submitLetter" : undefined}
        className={`letter ${isDragging ? "dragging" : ""} ${
          isEditable ? "disabled" : ""
        } ${id === SubmitLetterId ? "submitLetter" : ""}`}
        tabIndex={0}
        onKeyUp={(e) => {
          if (e.key === "Enter" && letter.type === LetterType.IFrame) {
            window.open(letter.content, "_blank");
          }
        }}
        transition={{
          type: "spring",
          stiffness: 150,
          duration: 0.3,
          bounce: 0.8,
        }}
        animate={isDragging ? draggingValues : stillValues}
        whileFocus={focusValues}
        initial={false}
      >
        <div className="pastFingerprints">{pastFingerprints}</div>
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
      handle=".letter"
      defaultClassName="letter-container"
      cancel=".letter-content-wrapper"
      position={position}
      onStart={(e, _draggableData) => {
        setDragStart(Date.now());
        if (letter.type === LetterType.IFrame) {
          setCurrentDraggedLetter(letter.content);
        }
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
        setZ(highestZIndex + 1);
        bumpHighestZIndex();
      }}
      onStop={(e, dragData) => {
        setFingerprint(undefined);
        updateLetterLocation(id, {
          x: dragData.x,
          y: dragData.y,
          z,
        });

        // if top of screen, letter dropped on desk
        const clientY =
          "touches" in e
            ? (e.touches?.[0] || e.changedTouches?.[0]).clientY
            : e.clientY;
        if (
          clientY <= currentDeskShowingHeight() &&
          letter.type === LetterType.IFrame
        ) {
          window.open(letter.content, "_blank");
        }

        const newLetterInteractionData = { ...letterInteractionData };
        if (!newLetterInteractionData[color]) {
          newLetterInteractionData[color] = {
            numDrags: 0,
            numOpens: 0,
          };
        }
        newLetterInteractionData[color].numDrags++;
        // Only do this if you were dragging for at least 1 second
        if (dragStart && Date.now() - dragStart > MinDragTimeMs) {
          console.log("updating drag");
          void updateLetterInteraction(id, newLetterInteractionData);
        }
        setDragStart(null);
        setCurrentDraggedLetter(undefined);
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

function cleanSubmittedUrl(url: string): string {
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  } else {
    return `https://${url}`;
  }
}

export function LetterView({ letter, isEditable }: LetterViewProps) {
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

  const src = isEditable ? content : letter.content;
  const renderContent = () => {
    switch (type) {
      case LetterType.IFrame:
        // TODO: only load iframe if it's in the top-layer of z-index, otherwise render placeholder.
        // on drag, render the iframe
        return (
          <div className="letter-content-wrapper">
            {isEditable ? (
              <input
                className="letterIframeInput"
                placeholder="https://yourwebsite.com/letter"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onBlur={(e) => {
                  const cleanedUrl = cleanSubmittedUrl(e.target.value);
                  if (cleanedUrl !== content) {
                    setContent(cleanedUrl);
                  }
                }}
              />
            ) : null}
            <div className="effect-layer">
              <div className="sheen"></div>
            </div>
            {isEditable && !content ? null : (
              <iframe
                tabIndex={-1}
                loading="lazy"
                src={withQueryParams(src, { device: "mobile" })}
                {...(src.endsWith(".pdf")
                  ? {}
                  : {
                      sandbox:
                        "allow-popups-to-escape-sandbox allow-popups allow-forms allow-top-navigation",
                    })}
              ></iframe>
            )}
          </div>
        );
      case LetterType.Content:
        const { ctaContent } = letter;
        const srcContent = isEditable ? content : letter.content;
        return (
          <div
            className={`letter-content-wrapper  ${
              id === SubmitLetterId && !isEditable ? "submitting" : ""
            }`}
          >
            {isEditable ? (
              // TODO: add gradient picker / cycler too
              // - styles, ala jackie liu
              // - fonts (all serif: 'cursive', 'Garamond', 'Playfair Display', 'Georgia')
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
    }
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
    <div
      className={`${type === LetterType.IFrame ? "type-letter" : "type-note"} ${
        isEditable ? "editable" : ""
      }`}
    >
      <div className="letterHead">
        <div className="names">
          <div>
            <span className="header">From: </span>{" "}
            {isEditable ? (
              <input
                className="dialogInput"
                value={fromName}
                placeholder={"your name"}
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
          {isEditable && (
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
          )}
          {isEditable ? (
            <div className="stamp cursor-pointer">
              <label
                className={`flex justify-center w-full h-32 px-4 appearance-none cursor-pointer hover:background-gray-400 focus:outline-none ${
                  !fromStamp ? "empty" : ""
                }`}
              >
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
    </div>
  );
}
