import sqlite3 from "sqlite3";

const db = new sqlite3.Database("./sqllite/credentials_db.db");

db.exec(`
    CREATE TABLE IF NOT EXISTS credentials (
        id INTEGER PRIMARY KEY,
        email TEXT NOT NULL,
        access_token TEXT,
        refresh_token TEXT,
        access_token_expiration TEXT
    );
`);

db.close();