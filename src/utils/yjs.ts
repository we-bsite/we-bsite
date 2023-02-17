import { initCursorChat } from "cursor-chat";
import { WebrtcProvider } from "y-webrtc";
import Y from "yjs";
import { StartAwarenessFunction } from "zustand-yjs";
import { YJS_ROOM } from "../constants";

export const connectDoc = (
  doc: Y.Doc,
  startAwareness: StartAwarenessFunction
) => {
  console.log(`Connecting to the internet... ${doc.guid} initialized`);

  // Hack to get around server-side rendering build
  if (typeof window === "undefined") {
    return () => {};
  }

  const stopCursorChatCallback = initCursorChat("(we)bsite", { yDoc: doc })
  const provider = new WebrtcProvider(YJS_ROOM, doc);
  const stopAwarenessCallback = startAwareness(provider);
  return () => {
    provider.disconnect();
    stopAwarenessCallback();
    stopCursorChatCallback();
    console.log("Disconnected from the internet...");
  };
};
