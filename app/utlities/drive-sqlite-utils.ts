import sqlite3 from "sqlite3";
import {fetchAll, fetchFirst, insertUpdate} from "@/app/utlities/sql";

export type DriveCredential = {
    id: string,
    email: string,
    access_token: string,
    refresh_token: string,
    access_token_expiration: string
}

export async function insertDriveCredential(credential: DriveCredential){
    const db = new sqlite3.Database("./credentials.db", sqlite3.OPEN_READWRITE);
    const sql = 'INSERT INTO drive_credentials (id, email, access_token, refresh_token, access_token_expiration) VALUES (?,?,?,?,?)';
    try {
        await insertUpdate(db, sql, [credential.id, credential.email, credential.access_token, credential.refresh_token, credential.access_token_expiration]);
    } catch (err) {
        console.log(err);
    } finally {
        db.close();
    }
}

export async function getDriveCredentialByEmail(email: string): Promise<Array<DriveCredential>>{
    const db = new sqlite3.Database("./credentials.db", sqlite3.OPEN_READWRITE);
    const sql = `SELECT * FROM drive_credentials WHERE email = '${email}'`;
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

export async function getAllDriveCredentials(): Promise<Array<DriveCredential>>{
    const db = new sqlite3.Database("./credentials.db", sqlite3.OPEN_READWRITE);
    const sql = `SELECT * FROM drive_credentials`;
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

export const updateDriveCredential = async (credential: DriveCredential) => {
    const db = new sqlite3.Database("./credentials.db");
    const sql = 'UPDATE drive_credentials SET id = ?, email = ?, access_token = ?, refresh_token = ?, access_token_expiration = ? WHERE email = ?'
    try {
        await insertUpdate(db, sql, [credential.id, credential.email, credential.access_token, credential.refresh_token, credential.access_token_expiration, credential.email]);
    } catch (err) {
        console.log(err);
    } finally {
        db.close();
    }
};