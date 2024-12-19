//import { logger, task, wait } from "@trigger.dev/sdk/v3";
//import { uuidv4 } from "uuidv7";
//import sqlite3 from "sqlite3";
//
//export const digestFiles = task({
//  id: "Drive-File-Ingestion",
//  // Set an optional maxDuration to prevent tasks from running indefinitely
//  maxDuration: 300, // Stop executing after 300 secs (5 mins) of compute
//  run: async (payload: any, { ctx }) => {
//    const driveCreds = await getLatestDriveCredential(payload.email);
//    const headers = new Headers();
//    headers.append("Content-Type", "application/json");
//    headers.append("Authorization", "Bearer " + driveCreds[0].access_token);
//
//    const params = new URLSearchParams({
//      pageSize: "20",
//    }).toString();
//    const googleResponse = await fetch("https://www.googleapis.com/drive/v3/files?" + params, {
//      method: "GET",
//      headers: headers
//    });
//    const body = await googleResponse.json()
//
//    const successful = await iteratePages(body, payload.email);
//
//    if (successful) {
//      return { status: 200 };
//    } else {
//      console.error("[Google Drive Trigger]", body);
//      return { status: 400, error: body }
//    }
//  },
//});
//
//type Credential = {
//  id: string,
//  email: string,
//  access_token: string,
//  refresh_token: string,
//  access_token_expiration: string
//  expires_in?: number;
//}
//
//
//export const refreshDriveAccessToken = async (cred: Credential, email: string): Promise<boolean> => {
//  let refreshed = false;
//  const params = {
//    client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
//    client_secret: process.env.GOOGLE_CLIENT_SECRET,
//    refresh_token: cred.refresh_token,
//    grant_type: "refresh_token"
//  }
//  const headers = new Headers();
//  headers.append("Content-Type", "application/json");
//
//  const res = await fetch("https://oauth2.googleapis.com/token", {
//    method: "POST",
//    body: JSON.stringify(params),
//    headers: headers
//  })
//  const body = await res.json();
//  cred.access_token = body.access_token;
//  cred.expires_in = body.expires_in;
//  cred.email = email;
//  refreshed = await loadDriveCredentials(cred);
//  return refreshed;
//}
//
//export type googleResponse = {
//  access_token: string,
//  email: string
//  refresh_token: string,
//  expires_in?: number | undefined,
//  scope?: string,
//  token_type?: string,
//  id?: string,
//  access_token_expiration?: string
//}
//
//export async function loadDriveCredentials(body: googleResponse): Promise<boolean> {
//  let loaded = false;
//  if (!body.access_token) return loaded;
//
//  let now = new Date();
//  const credential: Credential = {
//    id: uuidv4(),
//    email: body.email,
//    access_token: body.access_token,
//    refresh_token: body.refresh_token,
//    access_token_expiration: now.setSeconds(now.getSeconds() + (body.expires_in ?? 3600)).toString()
//  };
//  const rec = await getDriveCredentialByEmail(credential.email);
//
//  if (rec.length === 0) {
//    console.log("creating");
//    const successful = await insertDriveCredential(credential);
//    if (successful) loaded = true;
//  } else {
//    console.log("updating");
//    const successful = await updateDriveCredential(credential);
//    if (successful) loaded = true;
//  }
// // return loaded;
//}
//export const getLatestDriveCredential = async (email: string) => {
//  let driveCreds = await getDriveCredentialByEmail(email);
//  if (driveCreds[0] && new Date(Number(driveCreds[0].access_token_expiration)) < new Date()) {
//    console.log("need refresh");
//    let refreshed = await refreshDriveAccessToken(driveCreds[0], email);
//    if (refreshed) driveCreds = await getDriveCredentialByEmail(email);
//  }
//  return driveCreds;
//}
//
//
//type DriveFile = {
//  kind: string,
//  mimeType: string,
//  id: string,
//  name: string
//}
//
//export type FileRecord = {
//  fileName: string,
//  id: string,
//  mimeType: string,
//  content: string,
//  link: string,
//  email: string
//}
//
//type GoogleResponse = {
//  kind: string,
//  incompleteSearch: boolean,
//  files: Array<DriveFile>,
//  nextPageToken?: string
//}
//
//const acceptedFiles = [
//  "application/vnd.google-apps.spreadsheet",
//  "application/vnd.google-apps.document",
//  "application/vnd.google-apps.presentation",
//]
//
//export const getFileContents = async (file: DriveFile, email: string): Promise<FileRecord | null> => {
//  if (!acceptedFiles.includes(file.mimeType)) return null;
//
//  const driveCreds = await getLatestDriveCredential(email);
//  const headers = new Headers();
//  headers.append("Content-Type", "application/json");
//  headers.append("Authorization", "Bearer " + driveCreds[0].access_token);
//
//  const contentParams = new URLSearchParams({
//    mimeType: file.mimeType === "application/vnd.google-apps.spreadsheet" ? "text/csv" : "text/plain"
//  }).toString();
//  const metadataParams = new URLSearchParams({
//    fields: "*"
//  }).toString();
//
//  const fileContent = await fetch(`https://www.googleapis.com/drive/v3/files/${file.id}/export?` + contentParams, {
//    method: "GET",
//    headers: headers
//  });
//  const fileMetadata = await fetch(`https://www.googleapis.com/drive/v3/files/${file.id}?` + metadataParams, {
//    method: "GET",
//    headers: headers
//  });
//
//  const record: FileRecord = { content: "", fileName: file.name, id: file.id, link: "", mimeType: file.mimeType, email: email };
//  record.content = await new Response(fileContent.body).text();
//
//  const metadata = await new Response(fileMetadata.body).json();
//  record.link = metadata.webViewLink;
//
//  return record;
//}
//
//export const iteratePages = async (googleResponse: GoogleResponse, email: string): Promise<boolean> => {
//  let successfulResponse = true;
//
//  for (const file of googleResponse.files) {
//    let content = await getFileContents(file, email);
//    if (content !== null) {
//      let record = await insertRecord(content);
//      if (!record) {
//        console.log("[DRIVE FILE INGESTION] " + file.name + " unable to be processed");
//      }
//    }
//  }
//  if (googleResponse.nextPageToken) {
//    const driveCreds = await getLatestDriveCredential(email);
//    const headers = new Headers();
//    headers.append("Content-Type", "application/json");
//    headers.append("Authorization", "Bearer " + driveCreds[0].access_token);
//
//    const params = new URLSearchParams({
//      pageSize: "20",
//      pageToken: googleResponse.nextPageToken
//    }).toString();
//    const newGoogleResponse = await fetch("https://www.googleapis.com/drive/v3/files?" + params, {
//      method: "GET",
//      headers: headers
//    });
//
//    if (newGoogleResponse.status !== 200) {
//      successfulResponse = false;
//    } else {
//      const body = await newGoogleResponse.json()
//      console.log(body);
//      successfulResponse = successfulResponse && await iteratePages(body, email);
//    }
//  }
//  return successfulResponse;
//}
//
//export type DriveCredential = {
//  id: string,
//  email: string,
//  access_token: string,
//  refresh_token: string,
//  access_token_expiration: string
//}
//
//export async function insertDriveCredential(credential: DriveCredential) {
//  let written = false;
//  const db = new sqlite3.Database("./credentials.db", sqlite3.OPEN_READWRITE);
//  const sql = 'INSERT INTO drive_credentials (id, email, access_token, refresh_token, access_token_expiration) VALUES (?,?,?,?,?)';
//  try {
//    await insertUpdate(db, sql, [credential.id, credential.email, encrypter.encrypt(credential.access_token), encrypter.encrypt(credential.refresh_token), credential.access_token_expiration]);
//    written = true;
//  } catch (err) {
//    console.log(err);
//  } finally {
//    db.close();
//    return written;
//  }
//}
//export async function getDriveCredentialByEmail(email: string): Promise<Array<DriveCredential>> {
//
//  const encrypter = new Encrypter();
//  const db = new sqlite3.Database("./credentials.db", sqlite3.OPEN_READWRITE);
//  const sql = `SELECT * FROM drive_credentials WHERE email = '${email}'`;
//  let records = [];
//  try {
//    records = await fetchAll(db, sql);
//    records.forEach((record: any) => {
//      record.access_token = encrypter.decrypt(record.access_token);
//      record.refresh_token = encrypter.decrypt(record.refresh_token);
//    });
//  } catch (err) {
//    console.log(err);
//  } finally {
//    db.close();
//    return records;
//  }
//}
//
//export async function getAllDriveCredentials(): Promise<Array<DriveCredential>> {
//  const encrypter = new Encrypter();
//
//  const db = new sqlite3.Database("./credentials.db", sqlite3.OPEN_READWRITE);
//  const sql = `SELECT * FROM drive_credentials`;
//  let records = [];
//  try {
//    records = await fetchAll(db, sql);
//    records.forEach((record: any) => {
//      record.access_token = encrypter.decrypt(record.access_token);
//      record.refresh_token = encrypter.decrypt(record.refresh_token);
//    });
//  } catch (err) {
//    console.log(err);
//  } finally {
//    db.close();
//    return records;
//  }
//}
//
//export const updateDriveCredential = async (credential: DriveCredential) => {
//  const encrypter = new Encrypter();
//
//  let updated = false;
//  const db = new sqlite3.Database("./credentials.db");
//  const sql = 'UPDATE drive_credentials SET id = ?, email = ?, access_token = ?, refresh_token = ?, access_token_expiration = ? WHERE email = ?'
//  try {
//    const res = await insertUpdate(db, sql, [credential.id, credential.email, encrypter.encrypt(credential.access_token), encrypter.encrypt(credential.refresh_token), credential.access_token_expiration, credential.email]);
//    updated = true || res;
//  } catch (err) {
//    console.log(err);
//  } finally {
//    db.close();
//    return updated;
//  }
//};
//
//import pg from 'pg';
//const { Pool } = pg;
//import 'dotenv/config';
//
//const pool = new Pool({
//  user: process.env.PGUSER,
//  password: process.env.PGPASSWORD,
//  host: process.env.PGHOST,
//  port: process.env.PGPORT,
//  database: process.env.PGDATABASE
//});
//
//export const insertRecord = async (record) => {
//  let result = {}
//  try {
//    const text = 'INSERT INTO DRIVE_FILES(id, mimeType, fileName, content, link, email) VALUES($1, $2, $3, $4, $5, $6) RETURNING *'
//    const values = [record.id, record.mimeType, record.fileName, record.content, record.link, record.email]
//
//    const res = await pool.query(text, values);
//    result = res.rows[0];
//  } catch (err) {
//    console.log("[POSTGRES] " + err);
//  }
//  return result;
//}
//
//import crypto from "crypto";
//
//export function getBackendOrigin(): string {
//  if (process.env.BACKEND_URL) return process.env.BACKEND_URL;
//  if (typeof window !== "undefined") {
//    return window.location.origin;
//  }
//  return "";
//}
//
//export class Encrypter {
//  private algorithm: string;
//  private key: Buffer;
//
//  //this is a single point of failure as stands
//  constructor() {
//    this.algorithm = "aes-192-cbc";
//    this.key = crypto.scryptSync(process.env.AUTH_SECRET ?? "secret", "salt", 24);
//  }
//
//  encrypt(clearText: string) {
//    const iv = crypto.randomBytes(16);
//    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
//    const encrypted = cipher.update(clearText, "utf8", "hex");
//    return [
//      encrypted + cipher.final("hex"),
//      Buffer.from(iv).toString("hex"),
//    ].join("|");
//  }
//
//  decrypt(encryptedText: string) {
//    const [encrypted, iv] = encryptedText.split("|");
//    if (!iv) throw new Error("IV not found");
//    const decipher = crypto.createDecipheriv(
//      this.algorithm,
//      this.key,
//      Buffer.from(iv, "hex")
//    );
//    return decipher.update(encrypted, "hex", "utf8") + decipher.final("utf8");
//  }
//}
//
//export const insertUpdate = async (db, sql, params = []) => {
//  if (params && params.length > 0) {
//    return new Promise((resolve, reject) => {
//      db.run(sql, params, (err) => {
//        if (err) reject(err);
//        resolve();
//      });
//    });
//  }
//  return new Promise((resolve, reject) => {
//    db.exec(sql, (err) => {
//      if (err) reject(err);
//      resolve();
//    });
//  });
//};
//
//export const fetchAll = async (db, sql, params) => {
//  return new Promise((resolve, reject) => {
//    db.all(sql, params, (err, rows) => {
//      if (err) reject(err);
//      resolve(rows);
//    });
//  });
//};
//
//export const fetchFirst = async (db, sql, params) => {
//  return new Promise((resolve, reject) => {
//    db.get(sql, params, (err, row) => {
//      if (err) reject(err);
//      resolve(row);
//    });
//  });
////};
