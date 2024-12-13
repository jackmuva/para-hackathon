import sqlite3 from "sqlite3";
import {fetchAll, fetchFirst, insertUpdate} from "@/app/utlities/sql";
import {Encrypter} from "@/app/utlities/util";

const encrypter = new Encrypter();

export type DriveCredential = {
    id: string,
    email: string,
    access_token: string,
    refresh_token: string,
    access_token_expiration: string
}

export async function insertDriveCredential(credential: DriveCredential){
    let written = false;
    const db = new sqlite3.Database("./credentials.db", sqlite3.OPEN_READWRITE);
    const sql = 'INSERT INTO drive_credentials (id, email, access_token, refresh_token, access_token_expiration) VALUES (?,?,?,?,?)';
    try {
        await insertUpdate(db, sql, [credential.id, credential.email, encrypter.encrypt(credential.access_token), encrypter.encrypt(credential.refresh_token), credential.access_token_expiration]);
        written = true;
    } catch (err) {
        console.log(err);
    } finally {
        db.close();
        return written;
    }
}

export async function getDriveCredentialByEmail(email: string): Promise<Array<DriveCredential>>{
    const db = new sqlite3.Database("./credentials.db", sqlite3.OPEN_READWRITE);
    const sql = `SELECT * FROM drive_credentials WHERE email = '${email}'`;
    let records = [];
    try {
        records = await fetchAll(db, sql);
        records.forEach((record: any) => {
            record.access_token = encrypter.decrypt(record.access_token);
            record.refresh_token = encrypter.decrypt(record.refresh_token);
        });
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
        records.forEach((record: any) => {
            record.access_token = encrypter.decrypt(record.access_token);
            record.refresh_token = encrypter.decrypt(record.refresh_token);
        });
    } catch (err) {
        console.log(err);
    } finally {
        db.close();
        return records;
    }
}

export const updateDriveCredential = async (credential: DriveCredential) => {
    let updated = false;
    const db = new sqlite3.Database("./credentials.db");
    const sql = 'UPDATE drive_credentials SET id = ?, email = ?, access_token = ?, refresh_token = ?, access_token_expiration = ? WHERE email = ?'
    try {
        const res = await insertUpdate(db, sql, [credential.id, credential.email, encrypter.encrypt(credential.access_token), encrypter.encrypt(credential.refresh_token), credential.access_token_expiration, credential.email]);
        updated = true || res;
    } catch (err) {
        console.log(err);
    } finally {
        db.close();
        return updated;
    }
};