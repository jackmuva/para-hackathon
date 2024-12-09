import sqlite3 from "sqlite3";
import {fetchAll, fetchFirst, insertUpdate} from "@/app/utlities/sql";
import {SalesforceCredential} from "@/app/api/integrations/salesforce/oauth";

export async function insertSalesforceCredential(credential: SalesforceCredential){
    const db = new sqlite3.Database("./credentials.db", sqlite3.OPEN_READWRITE);
    const sql = 'INSERT INTO salesforce_credentials (id, email, access_token, refresh_token, instance_url) VALUES (?,?,?,?,?)';
    try {
        await insertUpdate(db, sql, [credential.id, credential.email, credential.access_token, credential.refresh_token, credential.instance_url]);
    } catch (err) {
        console.log(err);
    } finally {
        db.close();
    }
}

export async function getSalesforceCredentialByEmail(email: string){
    const db = new sqlite3.Database("./credentials.db", sqlite3.OPEN_READWRITE);
    const sql = `SELECT * FROM salesforce_credentials WHERE email = '${email}'`;
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

export async function getAllSalesforceCredentials(){
    const db = new sqlite3.Database("./credentials.db", sqlite3.OPEN_READWRITE);
    const sql = `SELECT * FROM salesforce_credentials`;
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

export const updateSalesforceCredential = async (credential: SalesforceCredential) => {
    const db = new sqlite3.Database("./credentials.db");
    const sql = 'UPDATE salesforce_credentials SET id = ?, email = ?, access_token = ?, refresh_token = ?, instance_url = ? WHERE email = ?'
    try {
        await insertUpdate(db, sql, [credential.id, credential.email, credential.access_token, credential.refresh_token, credential.instance_url, credential.email]);
    } catch (err) {
        console.log(err);
    } finally {
        db.close();
    }
};