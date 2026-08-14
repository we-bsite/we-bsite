-- ABOUTME: Creates the D1 tables that preserve the active and archived letter data.
-- ABOUTME: Stores structured fields as JSON text for compatibility with the existing application.

CREATE TABLE letters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  to_person TEXT CHECK (json_valid(to_person)),
  from_person TEXT CHECK (json_valid(from_person)),
  creation_timestamp TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  letter_content TEXT NOT NULL CHECK (json_valid(letter_content)),
  interaction_data TEXT DEFAULT '{}' CHECK (json_valid(interaction_data)),
  should_hide INTEGER NOT NULL DEFAULT 0 CHECK (should_hide IN (0, 1))
);

CREATE TABLE letters_archive (
  id INTEGER PRIMARY KEY,
  to_person TEXT CHECK (json_valid(to_person)),
  from_person TEXT CHECK (json_valid(from_person)),
  creation_timestamp TEXT NOT NULL,
  letter_content TEXT NOT NULL CHECK (json_valid(letter_content)),
  interaction_data TEXT DEFAULT '{}' CHECK (json_valid(interaction_data)),
  should_hide INTEGER NOT NULL DEFAULT 0 CHECK (should_hide IN (0, 1)),
  is_restoring INTEGER CHECK (is_restoring IN (0, 1))
);
