import { task, envvars, logger } from "@trigger.dev/sdk/v3";

export const syncSalesforceTask = task({
  id: "Salesforce-Sync-Task",
  // Set an optional maxDuration to prevent tasks from running indefinitely
  maxDuration: 1800,
  run: async (payload: any, { ctx }) => {
    const pgUser = await envvars.retrieve("proj_aiyirhllavhklpqransj", "dev", "PGUSER");
    const pgPassword = await envvars.retrieve("proj_aiyirhllavhklpqransj", "dev", "PGPASSWORD");
    const pgHost = await envvars.retrieve("proj_aiyirhllavhklpqransj", "dev", "PGHOST");
    const pgPort = await envvars.retrieve("proj_aiyirhllavhklpqransj", "dev", "PGPORT");
    const pgDatabase = await envvars.retrieve("proj_aiyirhllavhklpqransj", "dev", "PGDATABASE");

    const pool = initializePool(pgUser.value, pgPassword.value, pgHost.value, Number(pgPort.value), pgDatabase.value);

    let salesforceCreds = await getSalesforceCredentialByEmail(payload.email, pool);
    console.log(salesforceCreds);
    let contactResponse = await syncContacts(salesforceCreds[0], false, pool);

    return contactResponse ? "success" : "[SYNC TASK] Something went wrong with" + payload.instance_url;
  }
});
import crypto from "crypto";

//TODO: would like to make the env vars work better with trigger
export class Encrypter {
  private algorithm: string;
  private key: Buffer;

  //this return is a single point of failure as stands
  constructor() {
    this.algorithm = "aes-192-cbc";
    this.key = crypto.scryptSync(process.env.AUTH_SECRET ?? "parahackathon", "salt", 24);
  }

  encrypt(clearText: string) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
    const encrypted = cipher.update(clearText, "utf8", "hex");
    return [
      encrypted + cipher.final("hex"),
      Buffer.from(iv).toString("hex"),
    ].join("|");
  }

  decrypt(encryptedText: string) {
    const [encrypted, iv] = encryptedText.split("|");
    if (!iv) throw new Error("IV not found");
    const decipher = crypto.createDecipheriv(
      this.algorithm,
      this.key,
      Buffer.from(iv, "hex")
    );
    return decipher.update(encrypted, "hex", "utf8") + decipher.final("utf8");
  }
}


const encrypter = new Encrypter();

//@ts-ignore
import pg from 'pg';
const { Pool } = pg;

const initializePool = (pgUser: string, pgPassword: string, pgHost: string, pgPort: number, pgDatabase: string) => {
  const pool = new Pool({
    user: pgUser,
    password: pgPassword,
    host: pgHost,
    port: pgPort,
    database: pgDatabase
  });
  return pool;
}


export async function insertSalesforceCredential(credential: any, pool: any) {
  let written = false;
  const sql = 'INSERT INTO salesforce_credentials (id, email, access_token, refresh_token, instance_url, sync) VALUES ($1, $2, $3, $4, $5, false) RETURNING *';
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

export async function getSalesforceCredentialByEmail(email: string, pool: any) {
  const sql = `SELECT * FROM salesforce_credentials WHERE email = '${email}'`;
  let result: Array<any> = [];
  try {
    const records = await pool.query({ text: sql, rowMode: 'array' });
    records.rows.forEach((record: Array<any>) => {
      const rec: { id: string, email: string, access_token: string, refresh_token: string, instance_url: string, sync: boolean } = { id: "", email: "", access_token: "", refresh_token: "", instance_url: "", sync: true }
      rec.id = record[0];
      rec.email = record[1];
      rec.access_token = encrypter.decrypt(record[2]);
      rec.refresh_token = encrypter.decrypt(record[3]);
      rec.instance_url = record[4];
      rec.sync = record[5];
      result.push(rec);
    });
  } catch (err) {
    console.log(err);
  }
  return result;
}


export const updateSalesforceCredential = async (credential: any, pool: any) => {
  let updated = false;
  const sql = 'UPDATE salesforce_credentials SET id = $1, email = $2, access_token = $3, refresh_token = $4, instance_url = $5, sync = $6 WHERE email = $7'
  try {
    const res = await pool.query(sql, [credential.id, credential.email, encrypter.encrypt(credential.access_token), encrypter.encrypt(credential.refresh_token),
    credential.instance_url, credential.sync, credential.email]);
    updated = true;
  } catch (err) {
    console.log(err);
  }
  return updated;
};


export const insertSalesforceRecord = async (record: any, pool: any) => {
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

export const refreshSalesforceToken = async (credential: SalesforceCredential, pool: any): Promise<boolean> => {
  const headers = new Headers();
  headers.append("Content-Type", "application/x-www-form-urlencoded");

  const params = {
    refresh_token: credential.refresh_token,
    client_id: process.env.NEXT_PUBLIC_SALESFORCE_CLIENT_ID ?? "",
    client_secret: process.env.SALESFORCE_CLIENT_SECRET ?? "",
    grant_type: "refresh_token"
  }

  const response = await fetch("https://login.salesforce.com/services/oauth2/token", {
    method: "POST",
    body: new URLSearchParams(params),
    headers: headers
  });
  let body = await response.json();

  if (response.status === 200) {
    body = { ...body, email: credential.email, refresh_token: credential.refresh_token };
    const res: any = await loadSalesforceCredentials(body, pool);
    if (res) return true;
  } else {
    console.log("[Salesforce Token Refresh]" + body);
  }
  return false;
}

export const loadSalesforceCredentials = async (credentials: SalesforceCredential, pool: any) => {
  if (!credentials.access_token) return;
  const record = await getSalesforceCredentialByEmail(credentials.email, pool);
  let res;
  if (record.length === 0) {
    console.log("creating salesforce credential");
    res = await insertSalesforceCredential(credentials, pool);
  } else {
    console.log("updating salesforce credential");
    res = await updateSalesforceCredential(credentials, pool);
  }
  return res;
}

export type SalesforceCredential = {
  access_token: string,
  refresh_token: string,
  email: string,
  issued_at?: string,
  signature?: string,
  scope?: string,
  instance_url: string,
  id: string,
  sync?: boolean,
  token_type?: string
}

const syncContacts = async (salesforceCreds: any, refresh: boolean, pool: any, nextPage?: string): Promise<boolean> => {
  let successful = true;
  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  headers.append("Authorization", "Bearer " + salesforceCreds.access_token);

  const params = new URLSearchParams({
    q: "SELECT FIELDS(STANDARD) from Contact"
  }).toString();

  let res = await fetch(nextPage ? salesforceCreds.instance_url + nextPage : salesforceCreds.instance_url + "/services/data/v62.0/query?" + params, {
    headers: headers
  });

  //401 is not always generalizable
  //the standard error is "invalid_grant"
  if (res.status === 401 && !refresh) {
    console.log("refreshing");
    const refreshed = await refreshSalesforceToken(salesforceCreds, pool);
    if (refreshed) {
      salesforceCreds = await getSalesforceCredentialByEmail(salesforceCreds.email, pool);
      successful = await syncContacts(salesforceCreds, true, pool);
    }
  } else if (res.status === 401 && refresh) {
    successful = false;
  } else if (res.status === 200) {

    const body = await res.json();
    body.records.forEach((contact: any) => {
      try {
        insertSalesforceRecord({ id: contact.Id, full_name: contact.Name, title: contact.Title, contact_email: contact.Email, user_email: salesforceCreds.email }, pool);
      } catch (err) {
        console.log("[SALESFORCE SYNC] " + err);
      }
    });
    if (body.done === false) {
      syncContacts(salesforceCreds, false, pool, nextPage);
    }
  }
  return successful;
}


