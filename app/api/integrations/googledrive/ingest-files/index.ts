import {getLatestDriveCredential} from "@/app/api/integrations/googledrive/oauth";

type DriveFile = {
    kind: string,
    mimeType: string,
    id: string,
    name: string
}

type FileRecord = {
    fileName: string,
    id: string,
    mimeType: string,
    contents: string,
    link: string
}

const acceptedFiles = [
    "application/vnd.google-apps.spreadsheet",
    "application/vnd.google-apps.document",
    "application/vnd.google-apps.presentation",
]

export const getFileContents = async(file: DriveFile, email: string): Promise<FileRecord | null> => {
    if(!acceptedFiles.includes(file.mimeType)) return null;

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

    const record: FileRecord = {contents: "", fileName: file.name, id: file.id, link: "", mimeType: file.mimeType};
    record.contents = await new Response(fileContent.body).text();

    const metadata = await new Response(fileMetadata.body).json();
    record.link = metadata.webViewLink;

    return record;
}