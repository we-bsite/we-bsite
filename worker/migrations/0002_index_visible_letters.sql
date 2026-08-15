-- ABOUTME: Indexes the public visibility filter and stable letter ordering.
-- ABOUTME: Reduces D1 rows scanned by the list endpoint on the shared free quota.

CREATE INDEX letters_visibility_id_index ON letters (should_hide, id);
