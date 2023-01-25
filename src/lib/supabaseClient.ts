import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://aexeukglvemeibikbgtj.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFleGV1a2dsdmVtZWliaWtiZ3RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzM5MTY1ODYsImV4cCI6MTk4OTQ5MjU4Nn0.iriy9kALFIitA5hFLcfJGyBcjGUsG03R7alVHKv9p9s"
);
