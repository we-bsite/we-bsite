import { IndexeddbPersistence } from "y-indexeddb";
import Y from "yjs";

export const connectDoc = (doc: Y.Doc) => {
  console.log(`connected to ${doc.guid}`);
  const index = new IndexeddbPersistence("(we)bsite-persistence", doc);
  return () => {
    index.destroy();
    console.log("disconnected");
  };
};
