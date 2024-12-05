import sqlite3 from "sqlite3";

const db = new sqlite3.Database("../../sqlite/credentials_db.db");

type Credential = {
    id: string,
    email: string,
    access_token: string,
    refresh_token: string,
    access_token_expiration: string
}

export function insertCredential(credential: Credential){
    const insert = db.prepare('INSERT INTO credentials (id, email, access_token, refresh_token, access_token_expiration) VALUES (?,?,?,?,?)');

    insert.run(credential.id, credential.email, credential.access_token, credential.refresh_token, credential.access_token_expiration);
}