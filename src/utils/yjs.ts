import { IndexeddbPersistence } from "y-indexeddb";
import Y from "yjs";
import { YJS_ROOM } from "../constants";

export const connectDoc = (doc: Y.Doc) => {
  console.log(`Connecting to the internet... ${doc.guid} initialized`);
  // const index = new IndexeddbPersistence(YJS_ROOM, doc);
  return () => {
    // index.destroy();
    console.log("Disconnected from the internet...");
  };
};
