import sqlite3 from "sqlite3";
import {fetchAll, fetchFirst, insertUpdate} from "@/app/utlities/sql";
import {Encrypter} from "@/app/utlities/util";

const encrypter = new Encrypter();

export type SlackCredential = {
    id: string,
    email: string,
    access_token: string,
    incoming_webhook: string,
    refresh_token?: string,
    access_token_expiration?: string
}

export async function insertSlackCredential(credential: SlackCredential){
    const db = new sqlite3.Database("./credentials.db", sqlite3.OPEN_READWRITE);
    const sql = 'INSERT INTO slack_credentials (id, email, access_token, incoming_webhook) VALUES (?,?,?,?)';
    try {
        await insertUpdate(db, sql, [credential.id, credential.email, encrypter.encrypt(credential.access_token), credential.incoming_webhook]);
    } catch (err) {
        console.log(err);
    } finally {
        db.close();
    }
}

export async function getSlackCredentialByEmail(email: string){
    const db = new sqlite3.Database("./credentials.db", sqlite3.OPEN_READWRITE);
    const sql = `SELECT * FROM slack_credentials WHERE email = '${email}'`;
    let records = [];
    try {
        records = await fetchAll(db, sql);
        records.forEach((record: any) => {
            record.access_token = encrypter.decrypt(record.access_token);
        });
    } catch (err) {
        console.log(err);
    } finally {
        db.close();
        return records;
    }
}

export async function getAllSlackCredentials(){
    const db = new sqlite3.Database("./credentials.db", sqlite3.OPEN_READWRITE);
    const sql = `SELECT * FROM slack_credentials`;
    let records = [];
    try {
        records = await fetchAll(db, sql);
        records.forEach((record: any) => {
            record.access_token = encrypter.decrypt(record.access_token);
        });
    } catch (err) {
        console.log(err);
    } finally {
        db.close();
        return records;
    }
}

export const updateSlackCredential = async (credential: SlackCredential) => {
    const db = new sqlite3.Database("./credentials.db");
    const sql = 'UPDATE slack_credentials SET id = ?, email = ?, access_token = ?, incoming_webhook = ? WHERE email = ?'
    try {
        await insertUpdate(db, sql, [credential.id, credential.email, encrypter.encrypt(credential.access_token), credential.incoming_webhook]);
    } catch (err) {
        console.log(err);
    } finally {
        db.close();
    }
};