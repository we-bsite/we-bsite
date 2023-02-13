import { WebrtcProvider } from "y-webrtc";
import Y from "yjs";
import { YJS_ROOM } from "../constants";

export const connectDoc = (doc: Y.Doc) => {
  console.log(`Connecting to the internet... ${doc.guid} initialized`);

  const provider = new WebrtcProvider(YJS_ROOM, doc);
  return () => {
    provider.disconnect();
    console.log("Disconnected from the internet...");
  };
};
