import sqlite3 from "sqlite3";

const db = new sqlite3.Database("credentials.db");

db.exec(`
    CREATE TABLE IF NOT EXISTS drive_credentials (
        id TEXT,
        email TEXT PRIMARY KEY,
        access_token TEXT,
        refresh_token TEXT,
        access_token_expiration TEXT
    );
`);

db.exec(`
    CREATE TABLE IF NOT EXISTS slack_credentials (
        id TEXT,
        email TEXT PRIMARY KEY,
        access_token TEXT NOT NULL,
        incoming_webhook TEXT NOT NULL
    );
`);

db.exec(`
    CREATE TABLE IF NOT EXISTS salesforce_credentials (
        id TEXT,
        email TEXT PRIMARY KEY,
        access_token TEXT,
        refresh_token TEXT,
        instance_url TEXT
    );
`);

db.close();
