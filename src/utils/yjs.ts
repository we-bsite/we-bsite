import { initCursorChat } from "cursor-chat";
import { WebrtcProvider } from "y-webrtc";
import Y from "yjs";
import { StartAwarenessFunction } from "zustand-yjs";
import { YJS_ROOM } from "../constants";
import {
  DefaultPersistedUserLetterContext,
  PersistedUserLetterContextInfo,
  UserContextStorageId,
} from "../context/UserLetterContext";
import { getLocalStorageItem } from "./localstorage";

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

  const stopCursorChatCallback = initCursorChat("(we)bsite", {
    yDoc: doc,
    // @ts-ignore
    color,
  });
  // @ts-ignore
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
