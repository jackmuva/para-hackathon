import pg from 'pg';
const { Pool } = pg;
import 'dotenv/config';
import { Encrypter } from "@/app/utlities/util";

const encrypter = new Encrypter();

const pool = new Pool({
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    database: process.env.PGDATABASE
});


export const insertDriveRecord = async (record) => {
    let result = {}
    try {
        const text = 'INSERT INTO DRIVE_FILES(id, mimeType, fileName, content, link, email) VALUES($1, $2, $3, $4, $5, $6) RETURNING *'
        const values = [record.id, record.mimeType, record.fileName, record.content, record.link, record.email]

        const res = await pool.query(text, values);
        result = res.rows[0];
    } catch (err) {
        console.log("[POSTGRES] " + err);
    }
    return result;
}

export const queryDriveContent = async (searchTerm, email) => {
    let result = [];
    try {
        const text = `SELECT fileName, link FROM DRIVE_FILES WHERE UPPER(CONTENT) LIKE '%` + searchTerm.toUpperCase() + `%' AND 
            EMAIL='` + email + `' LIMIT 10`

        const res = await pool.query({ text: text, rowMode: 'array' });
        result = res.rows;
    } catch (err) {
        console.log("[POSTGRES] " + err);
    }
    return result;
}

export async function insertDriveCredential(credential) {
    let written = false;
    const sql = 'INSERT INTO drive_credentials (id, email, access_token, refresh_token, access_token_expiration) VALUES ($1, $2, $3, $4, $5) RETURNING *';
    try {
        const res = await pool.query(sql, [credential.id, credential.email, encrypter.encrypt(credential.access_token), encrypter.encrypt(credential.refresh_token), credential.access_token_expiration]);
        if (res.rows.length > 0) {
            written = true;
        }
    } catch (err) {
        console.log(err);
    }
    return written;
}

export async function getDriveCredentialByEmail(email) {
    const sql = `SELECT * FROM drive_credentials WHERE email = '${email}'`;
    let result = [];
    try {
        const records = await pool.query({ text: sql, rowMode: 'array' });
        records.rows.forEach((record) => {
            const rec = {};
            rec.id = record[0];
            rec.email = record[1];
            rec.access_token = encrypter.decrypt(record[2]);
            rec.refresh_token = encrypter.decrypt(record[3]);
            rec.access_token_expiration = record[4];
            result.push(rec);
        });
    } catch (err) {
        console.log(err);
    }
    return result;
}

export async function getAllDriveCredentials() {
    const sql = `SELECT * FROM drive_credentials`;
    let result = [];
    try {
        const records = await pool.query({ text: sql, rowMode: 'array' });
        records.rows.forEach((record) => {
            const rec = {};
            rec.id = record[0];
            rec.email = record[1];
            rec.access_token = encrypter.decrypt(record[2]);
            rec.refresh_token = encrypter.decrypt(record[3]);
            rec.access_token_expiration = record[4];
            result.push(rec);
        });
    } catch (err) {
        console.log(err);
    }
    return result;

}

export const updateDriveCredential = async (credential) => {
    let updated = false;
    const sql = 'UPDATE slack_credentials SET id = $1, email = $2, access_token = $3, refresh_token = $4, access_token_expiration = $5 WHERE email = $6'
    try {

        const res = await pool.query(sql, [credential.id, credential.email, encrypter.encrypt(credential.access_token), encrypter.encrypt(credential.refresh_token), credential.access_token_expiration, credential.email]);
        updated = true;
    } catch (err) {
        console.log(err);
    }
    return updated;
};

export const insertSalesforceRecord = async (record) => {
    let result = {}
    try {
        const text = 'INSERT INTO SALESFORCE_CONTACTS(id, full_name, title, contact_email, user_email) VALUES($1, $2, $3, $4, $5) RETURNING *'
        const values = [record.id, record.full_name, record.title, record.contact_email, record.user_email]

        const res = await pool.query(text, values);
        result = res.rows[0];
    } catch (err) {
        console.log("[POSTGRES] " + err);
    }
    return result;
}

export const querySalesforceContent = async (email) => {
    let result = [];
    try {
        const text = `SELECT full_name, title, contact_email FROM SALESFORCE_CONTACTS WHERE 
            USER_EMAIL='` + email + `'`

        const res = await pool.query({ text: text, rowMode: 'array' });
        result = res.rows;
    } catch (err) {
        console.log("[POSTGRES] " + err);
    }
    return result;
}


process.on('SIGINT', async () => {
    console.log('SIGINT signal received.');
    const res = await pool.end();
    if (res || true) {
        process.exit(0);
    }
});

process.on('SIGTERM', async () => {
    console.log('SIGTERM signal received.');
    const res = await pool.end();
    if (res || true) {
        process.exit(0);
    }
});


export async function insertSalesforceCredential(credential) {
    let written = false;
    const sql = 'INSERT INTO salesforce_credentials (id, email, access_token, refresh_token, instance_url) VALUES ($1, $2, $3, $4, $5) RETURNING *';
    try {
        const res = await pool.query(sql, [credential.id, credential.email, encrypter.encrypt(credential.access_token), encrypter.encrypt(credential.refresh_token), credential.instance_url]);
        if (res.rows.length > 0) {
            written = true;
        }
    } catch (err) {
        console.log(err);
    }
    return written;
}

export async function getSalesforceCredentialByEmail(email) {
    const sql = `SELECT * FROM salesforce_credentials WHERE email = '${email}'`;
    let result = [];
    try {
        const records = await pool.query({ text: sql, rowMode: 'array' });
        records.rows.forEach((record) => {
            const rec = {}
            rec.id = record[0];
            rec.email = record[1];
            rec.access_token = encrypter.decrypt(record[2]);
            rec.refresh_token = encrypter.decrypt(record[3]);
            rec.instance_url = record[4];
            result.push(rec);
        });
    } catch (err) {
        console.log(err);
    }
    return result;
}

export async function getAllSalesforceCredentials() {
    const sql = `SELECT * FROM salesforce_credentials`;
    let result = [];
    try {
        const records = await pool.query({ text: sql, rowMode: 'array' });
        records.rows.forEach((record) => {
            const rec = {}
            rec.id = record[0];
            rec.email = record[1];
            rec.access_token = encrypter.decrypt(record[2]);
            rec.refresh_token = encrypter.decrypt(record[3]);
            rec.instance_url = record[4];
            result.push(rec);
        });
    } catch (err) {
        console.log(err);
    }
    return result;
}

export const updateSalesforceCredential = async (credential) => {
    let updated = false;
    const sql = 'UPDATE salesforce_credentials SET id = $1, email = $2, access_token = $3, refresh_token = $4, instance_url = $5 WHERE email = $6'
    try {
        const res = await pool.query(sql, [credential.id, credential.email, encrypter.encrypt(credential.access_token), encrypter.encrypt(credential.refresh_token), credential.instance_url, credential.email]);
        updated = true;
    } catch (err) {
        console.log(err);
    }
    return updated;
};

export async function insertSlackCredential(credential) {
    let written = false;
    const sql = 'INSERT INTO slack_credentials (id, email, access_token, incoming_webhook) VALUES ($1, $2, $3, $4) RETURNING *';
    try {
        const res = await pool.query(sql, [credential.id, credential.email, encrypter.encrypt(credential.access_token), credential.incoming_webhook]);
        if (res.rows.length > 0) {
            written = true;
        }
    } catch (err) {
        console.log(err);
    }
    return written;
}

export async function getSlackCredentialByEmail(email) {
    const sql = `SELECT * FROM slack_credentials WHERE email = '${email}'`;
    let result = [];
    try {
        const records = await pool.query({ text: sql, rowMode: 'array' });
        records.rows.forEach((record) => {
            const rec = {};
            rec.id = record[0];
            rec.email = record[1]
            rec.access_token = encrypter.decrypt(record[2]);
            rec.incoming_webhook = record[3];
            result.push(rec);
        });
    } catch (err) {
        console.log(err);
    }
    return result;
}

export async function getAllSlackCredentials() {
    const sql = `SELECT * FROM slack_credentials`;
    let result = [];
    try {
        const records = await pool.query({ text: sql, rowMode: 'array' });
        records.rows.forEach((record) => {
            const rec = {};
            rec.id = record[0];
            rec.email = record[1]
            rec.access_token = encrypter.decrypt(record[2]);
            rec.incoming_webhook = record[3];
            result.push(rec);
        });
    } catch (err) {
        console.log(err);
    }
    return result;
}

export const updateSlackCredential = async (credential) => {
    let updated = false;
    const sql = 'UPDATE slack_credentials SET id = $1, email = $2, access_token = $3, incoming_webhook= $4 WHERE email = $5'
    try {

        const res = await pool.query(sql, [credential.id, credential.email, encrypter.encrypt(credential.access_token), credential.incoming_webhook, credential.email]);
        updated = true;
    } catch (err) {
        console.log(err);
    }
    return updated;
};


