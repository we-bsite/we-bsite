// ABOUTME: Connects the shared Yjs document to cursor chat and WebRTC transport.
// ABOUTME: Restores persisted user color before starting collaborative awareness.

import { WebrtcProvider } from "y-webrtc";
import * as Y from "yjs";
import type { StartAwarenessFunction } from "zustand-yjs/index.js";
import { YJS_ROOM } from "../constants";
import {
  DefaultPersistedUserLetterContext,
  PersistedUserLetterContextInfo,
  UserContextStorageId,
} from "../context/UserLetterContext";
import { getLocalStorageItem } from "./localstorage";
import { connectCursorChat } from "./cursorChat";

export const connectDoc = (
  doc: Y.Doc,
  startAwareness: StartAwarenessFunction
) => {
  // Hack to get around server-side rendering build
  if (typeof window === "undefined") {
    return () => {};
  }

  const ctx =
    getLocalStorageItem<PersistedUserLetterContextInfo>(UserContextStorageId) ??
    DefaultPersistedUserLetterContext;
  const color = ctx.color;
  console.log(
    `Connecting to the internet as ${color}... ${doc.guid} initialized`
  );

  const stopCursorChatCallback = connectCursorChat(doc, color);
  const provider = new WebrtcProvider(YJS_ROOM, doc, {
    signaling: ["wss://signalling.communities.digital"],
  });
  console.log("Connected!");
  const stopAwarenessCallback = startAwareness(provider);
  return () => {
    provider.disconnect();
    stopAwarenessCallback();
    stopCursorChatCallback();
    console.log("Disconnected from the internet...");
  };
};
