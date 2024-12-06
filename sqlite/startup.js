import sqlite3 from "sqlite3";

const db = new sqlite3.Database("credentials.db");

db.exec(`
    CREATE TABLE IF NOT EXISTS drive_credentials (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL,
        access_token TEXT,
        refresh_token TEXT,
        access_token_expiration TEXT
    );
`);

db.exec(`
    CREATE TABLE IF NOT EXISTS slack_credentials (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL,
        access_token TEXT NOT NULL,
        incoming_webhook TEXT NOT NULL
    );
`);

db.close();