import { getLatestDriveCredential } from "@/app/api/integrations/googledrive/oauth";
import { insertRecord } from "@/app/utlities/postgres-sql";

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

export const getFileContents = async (file: DriveFile, email: string): Promise<FileRecord | null> => {
    if (!acceptedFiles.includes(file.mimeType)) return null;

    const driveCreds = await getLatestDriveCredential(email);
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", "Bearer " + driveCreds[0].access_token);

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

export const iteratePages = async (googleResponse: GoogleResponse, email: string): Promise<boolean> => {
    let successfulResponse = true;

    for (const file of googleResponse.files) {
        let content = await getFileContents(file, email);
        if (content !== null) {
            let record = await insertRecord(content);
            if (!record) {
                console.log("[DRIVE FILE INGESTION] " + file.name + " unable to be processed");
            }
        }
    }
    if (googleResponse.nextPageToken) {
        const driveCreds = await getLatestDriveCredential(email);
        const headers = new Headers();
        headers.append("Content-Type", "application/json");
        headers.append("Authorization", "Bearer " + driveCreds[0].access_token);

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
            successfulResponse = successfulResponse && await iteratePages(body, email);
        }
    }
    return successfulResponse;
}

