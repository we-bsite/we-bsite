// ABOUTME: Synchronizes cursor positions and chat text through the shared Yjs document.
// ABOUTME: Renders remote cursors and removes browser listeners when collaboration stops.

import { PerfectCursor } from "perfect-cursors";
import * as Y from "yjs";
import { getSvgForCursor } from ".";

interface CursorState {
  id: string;
  x: number;
  y: number;
  chat: string;
  color: string;
}

function renderCursor(cursor: CursorState): HTMLElement {
  const template = document.createElement("template");
  template.innerHTML = `<div id="cursor_${cursor.id}" class="cursor">
    ${getSvgForCursor(cursor.color)}
    <p id="chat_${cursor.id}" class="chat" style="background-color: ${cursor.color}">${cursor.chat}</p>
  </div>`;
  return template.content.firstChild as HTMLElement;
}

export function connectCursorChat(doc: Y.Doc, color: string): () => void {
  const cursorLayer = document.getElementById("cursor-chat-layer");
  const chatInput = document.getElementById(
    "cursor-chat-box"
  ) as HTMLInputElement | null;

  if (!cursorLayer || !chatInput) {
    throw new Error("Cursor chat elements are missing from the document.");
  }

  const currentCursor: CursorState = {
    id: crypto.randomUUID(),
    x: 0,
    y: 0,
    chat: "",
    color,
  };
  const cursors = doc.getMap<CursorState>("state");
  const interpolators = new Map<string, PerfectCursor>();
  let shouldSendUpdate = false;

  const sendInterval = window.setInterval(() => {
    if (shouldSendUpdate) {
      cursors.set(currentCursor.id, currentCursor);
      shouldSendUpdate = false;
    }
  }, 50);

  const handleMouseMove = (event: MouseEvent) => {
    if (currentCursor.x !== event.pageX || currentCursor.y !== event.pageY) {
      shouldSendUpdate = true;
      currentCursor.x = event.pageX;
      currentCursor.y = event.pageY;
      chatInput.style.setProperty(
        "transform",
        `translate(${currentCursor.x}px, ${currentCursor.y}px)`
      );
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "/") {
      event.preventDefault();
      if (
        chatInput.style.getPropertyValue("display") === "block" &&
        chatInput.value === ""
      ) {
        chatInput.style.setProperty("display", "none");
      } else {
        chatInput.style.setProperty("display", "block");
        chatInput.focus();
      }
    } else if (event.key === "Escape") {
      event.preventDefault();
      chatInput.value = "";
      chatInput.style.setProperty("display", "none");
    } else if (event.key === "Enter") {
      event.preventDefault();
    }
  };

  const handleKeyUp = () => {
    currentCursor.chat = chatInput.value;
    shouldSendUpdate = true;
  };

  const handleCursorChanges = (event: Y.YMapEvent<CursorState>) => {
    event.changes.keys.forEach((change, cursorId) => {
      if (cursorId === currentCursor.id) {
        return;
      }

      if (change.action === "add") {
        const cursor = cursors.get(cursorId);
        if (!cursor) {
          return;
        }
        const cursorElement = renderCursor(cursor);
        cursorElement.classList.add("new");
        cursorLayer.appendChild(cursorElement);
        const interpolator = new PerfectCursor(([x, y]) => {
          cursorElement.style.setProperty(
            "transform",
            `translate(${x}px, ${y}px)`
          );
        });
        interpolator.addPoint([cursor.x, cursor.y]);
        interpolators.set(cursorId, interpolator);
      } else if (change.action === "update") {
        const cursor = cursors.get(cursorId);
        const cursorElement = document.getElementById(`cursor_${cursorId}`);
        const chatElement = document.getElementById(`chat_${cursorId}`);
        const interpolator = interpolators.get(cursorId);
        if (!cursor || !cursorElement || !chatElement || !interpolator) {
          return;
        }
        chatElement.classList.toggle("show", cursor.chat !== "");
        chatElement.innerText = cursor.chat;
        cursorElement.classList.remove("new");
        interpolator.addPoint([cursor.x, cursor.y]);
      } else {
        const cursorElement = document.getElementById(`cursor_${cursorId}`);
        const interpolator = interpolators.get(cursorId);
        cursorElement?.classList.add("expiring");
        window.setTimeout(() => cursorElement?.remove(), 1_000);
        interpolator?.dispose();
        interpolators.delete(cursorId);
      }
    });
  };

  const removeCurrentCursor = () => cursors.delete(currentCursor.id);

  window.addEventListener("beforeunload", removeCurrentCursor);
  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("keydown", handleKeyDown);
  document.addEventListener("keyup", handleKeyUp);
  cursors.observe(handleCursorChanges);

  return () => {
    removeCurrentCursor();
    window.clearInterval(sendInterval);
    window.removeEventListener("beforeunload", removeCurrentCursor);
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("keydown", handleKeyDown);
    document.removeEventListener("keyup", handleKeyUp);
    cursors.unobserve(handleCursorChanges);
    interpolators.forEach((interpolator, cursorId) => {
      interpolator.dispose();
      document.getElementById(`cursor_${cursorId}`)?.remove();
    });
  };
}
