import {
  LetterInterface,
  LetterPersistenceData,
  LetterSharedData,
  LetterType,
} from "../types";
import { motion } from "framer-motion";
import { useContext, useRef, useState } from "react";
import Draggable from "react-draggable";
import dayjs from "dayjs";
import Y from "yjs";
import { withQueryParams } from "../utils/url";
import { OpenInNewWindowIcon } from "@radix-ui/react-icons";
import { UserLetterContext } from "../context/UserLetterContext";

interface Props {
  letter: LetterInterface;
  shared?: Y.Map<LetterSharedData>;
  isEditable?: boolean;
  disableDrag?: boolean;
}

export function Letter({ letter, shared, isEditable, disableDrag }: Props) {
  const [isDragging, setDragging] = useState(disableDrag ? true : false);
  const { id, initialPersistenceData } = letter;
  const saved = disableDrag ? undefined : localStorage.getItem(id);
  const savedPersistenceData = useRef<LetterPersistenceData>(
    saved ? JSON.parse(saved) : {}
  );
  const position = {
    ...initialPersistenceData,
    ...savedPersistenceData.current,
  };
  // TODO: annotate this with the total number persisted in server.
  const currentSharedData = shared?.get(id) || {
    numOpens: 0,
    numDrags: 0,
  };

  const letterContent = (
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
            ? `rotate(${isDragging ? 0 : position.rotation}deg)`
            : "",
          boxShadow: isDragging
            ? "0 0 35px rgba(51, 75, 97, 0.35)"
            : "0 0 5px rgba(51, 75, 97, 0.2)",
        }}
        initial={false}
      >
        <LetterView
          letter={letter}
          shared={shared}
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
      onStart={() => {
        setDragging(true);
        // TODO: update z-index to be the highest.
      }}
      onStop={(_, dragData) => {
        // TODO: persist z-index
        localStorage.setItem(
          id,
          JSON.stringify({
            x: dragData.x,
            y: dragData.y,
          })
        );
        shared?.set(id, {
          ...currentSharedData,
          numDrags: currentSharedData.numDrags + 1,
        });

        setDragging(false);
      }}
    >
      {letterContent}
    </Draggable>
  );
}

interface LetterViewProps {
  letter: LetterInterface;
  shared?: Y.Map<LetterSharedData>;
  isDragging?: boolean;
  isEditable?: boolean;
}

export function LetterView({
  letter,
  shared,
  isDragging,
  isEditable,
}: LetterViewProps) {
  const { id, to, from, date, type } = letter;

  const currentSharedData = shared?.get(id) || {
    // This is the first time that the panel has opened
    numOpens: 0,
    // This is the first time that the panel has been dragged
    numDrags: 0,
  };

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

  const renderContent = () => {
    let mainContent;
    let cta;
    switch (type) {
      case LetterType.IFrame:
        if (!shared) {
          throw new Error(
            'LetterView: "shared" is required for iframe letters'
          );
        }
        const { src } = letter;
        // TODO: only load iframe if it's in the top-layer of z-index, otherwise render placeholder.
        // on drag, render the iframe
        mainContent = (
          <div className="letter-content-wrapper">
            <iframe
              loading="lazy"
              src={withQueryParams(src, { device: "mobile" })}
            ></iframe>
          </div>
        );
        // TODO: remove shared and move cta back to DraggableLetter
        cta = (
          <div className="link-to-letter">
            <a
              href={src}
              target="_blank"
              onClick={() =>
                shared.set(id, {
                  ...currentSharedData,
                  numOpens: currentSharedData.numOpens + 1,
                })
              }
            >
              Read letter{" "}
              <OpenInNewWindowIcon
                style={{ verticalAlign: "middle", marginBottom: "3px" }}
              />
            </a>
          </div>
        );
        break;
      case LetterType.Content:
        const { srcContent, ctaContent } = letter;
        // TODO: render editable version of content
        mainContent = (
          <div className="letter-content-wrapper direct">
            {srcContent}
            {isEditable ? (
              <p>drop a link and see it come to life or simply add your text</p>
            ) : null}
          </div>
        );
        cta = ctaContent || null;
        break;
    }

    return (
      <>
        {/* {isEditable ? } renderSelect */}
        {mainContent}
        {cta}
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
                  <img src={fromStamp} />
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6 text-gray-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                )}
                <input
                  accept="image/*"
                  type="file"
                  className="stampInput"
                  onChange={onUploadStamp}
                />
              </label>
            </div>
          ) : fromStamp ? (
            <div className="stamp">
              <img src={fromStamp} />
            </div>
          ) : null}
          {typeof to !== "string" && to.stamp ? (
            <div className="stamp">
              <img src={to.stamp} />
            </div>
          ) : null}
        </div>
      </div>
      {renderContent()}
    </>
  );
}
