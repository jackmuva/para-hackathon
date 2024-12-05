import sqlite3 from "sqlite3";
import {fetchAll, fetchFirst, insertUpdate} from "@/app/utlities/sql";

export type Credential = {
    id: string,
    email: string,
    access_token: string,
    refresh_token: string,
    access_token_expiration: string
}

export async function insertCredential(credential: Credential){
    const db = new sqlite3.Database("./credentials_db.db", sqlite3.OPEN_READWRITE);
    const sql = 'INSERT INTO credentials (id, email, access_token, refresh_token, access_token_expiration) VALUES (?,?,?,?,?)';
    try {
        await insertUpdate(db, sql, [credential.id, credential.email, credential.access_token, credential.refresh_token, credential.access_token_expiration]);
    } catch (err) {
        console.log(err);
    } finally {
        db.close();
    }
}

export async function getByEmail(email: string){
    const db = new sqlite3.Database("./credentials_db.db", sqlite3.OPEN_READWRITE);
    const sql = `SELECT * FROM credentials WHERE email = '${email}'`;
    let records = [];
    try {
        records = await fetchAll(db, sql);
    } catch (err) {
        console.log(err);
    } finally {
        db.close();
        return records;
    }
}

export async function getAll(){
    const db = new sqlite3.Database("./credentials_db.db", sqlite3.OPEN_READWRITE);
    const sql = `SELECT * FROM credentials`;
    let records = [];
    try {
        records = await fetchAll(db, sql);
    } catch (err) {
        console.log(err);
    } finally {
        db.close();
        return records;
    }
}

export const updateCredential = async (credential: Credential) => {
    const db = new sqlite3.Database("./credentials_db.db");
    const sql = 'UPDATE credentials SET id = ?, email = ?, access_token = ?, refresh_token = ?, access_token_expiration = ? WHERE email = ?'
    try {
        await insertUpdate(db, sql, [credential.id, credential.email, credential.access_token, credential.refresh_token, credential.access_token_expiration, credential.email]);
    } catch (err) {
        console.log(err);
    } finally {
        db.close();
    }
};