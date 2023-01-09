/* These are used to initialize the neon.tech serverless database. */
CREATE TABLE IF NOT EXISTS letters(
    id SERIAL PRIMARY KEY,
    letter_content VARCHAR(4096),
    src VARCHAR(255),
    to_person VARCHAR(255),
    from_person VARCHAR(255),
    creation_timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
