import { task, envvars } from "@trigger.dev/sdk/v3";

export const digestFiles = task({
  id: "Drive-File-Ingestion",
  // Set an optional maxDuration to prevent tasks from running indefinitely
  maxDuration: 1800,
  run: async (payload: any, { ctx }) => {

    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", "Bearer " + payload.token);

    const params = new URLSearchParams({
      pageSize: "20",
    }).toString();
    const googleResponse = await fetch("https://www.googleapis.com/drive/v3/files?" + params, {
      method: "GET",
      headers: headers
    });
    const body = await googleResponse.json()
    console.log(body);

    const pgUser = await envvars.retrieve("proj_aiyirhllavhklpqransj", "dev", "PGUSER");
    const pgPassword = await envvars.retrieve("proj_aiyirhllavhklpqransj", "dev", "PGPASSWORD");
    const pgHost = await envvars.retrieve("proj_aiyirhllavhklpqransj", "dev", "PGHOST");
    const pgPort = await envvars.retrieve("proj_aiyirhllavhklpqransj", "dev", "PGPORT");
    const pgDatabase = await envvars.retrieve("proj_aiyirhllavhklpqransj", "dev", "PGDATABASE");

    const pool = initializePool(pgUser.value, pgPassword.value, pgHost.value, Number(pgPort.value), pgDatabase.value);

    const successful = await iteratePages(body, payload.email, payload.token, pool);

    return {
      success: successful
    }
  }
});


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

export const insertRecord = async (record: any, pool: any) => {
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



type DriveFile = {
  kind: string,
  mimeType: string,
  id: string,
  name: string
}

export type FileRecord = {
  fileName: string,
  id: string,
  mimeType: string,
  content: string,
  link: string,
  email: string
}

type GoogleResponse = {
  kind: string,
  incompleteSearch: boolean,
  files: Array<DriveFile>,
  nextPageToken?: string
}

const acceptedFiles = [
  "application/vnd.google-apps.spreadsheet",
  "application/vnd.google-apps.document",
  "application/vnd.google-apps.presentation",
]

export const getFileContents = async (file: DriveFile, email: string, driveCreds: string): Promise<FileRecord | null> => {
  if (!acceptedFiles.includes(file.mimeType)) return null;

  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  headers.append("Authorization", "Bearer " + driveCreds);

  const contentParams = new URLSearchParams({
    mimeType: file.mimeType === "application/vnd.google-apps.spreadsheet" ? "text/csv" : "text/plain"
  }).toString();
  const metadataParams = new URLSearchParams({
    fields: "*"
  }).toString();

  const fileContent = await fetch(`https://www.googleapis.com/drive/v3/files/${file.id}/export?` + contentParams, {
    method: "GET",
    headers: headers
  });
  const fileMetadata = await fetch(`https://www.googleapis.com/drive/v3/files/${file.id}?` + metadataParams, {
    method: "GET",
    headers: headers
  });

  const record: FileRecord = { content: "", fileName: file.name, id: file.id, link: "", mimeType: file.mimeType, email: email };
  record.content = await new Response(fileContent.body).text();

  const metadata = await new Response(fileMetadata.body).json();
  record.link = metadata.webViewLink;

  return record;
}

export const iteratePages = async (googleResponse: GoogleResponse, email: string, driveCreds: string, pool: any): Promise<boolean> => {
  let successfulResponse = true;

  for (const file of googleResponse.files) {
    let content = await getFileContents(file, email, driveCreds);
    if (content !== null) {
      let record = await insertRecord(content, pool);
      if (!record) {
        console.log("[DRIVE FILE INGESTION] " + file.name + " unable to be processed");
      }
    }
  }
  if (googleResponse.nextPageToken) {
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", "Bearer " + driveCreds);

    const params = new URLSearchParams({
      pageSize: "20",
      pageToken: googleResponse.nextPageToken
    }).toString();
    const newGoogleResponse = await fetch("https://www.googleapis.com/drive/v3/files?" + params, {
      method: "GET",
      headers: headers
    });

    if (newGoogleResponse.status !== 200) {
      successfulResponse = false;
    } else {
      const body = await newGoogleResponse.json()
      console.log(body);
      successfulResponse = successfulResponse && await iteratePages(body, email, driveCreds, pool);
    }
  }
  return successfulResponse;
}
