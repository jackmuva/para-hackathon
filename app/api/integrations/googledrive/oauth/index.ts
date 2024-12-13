import {
    getDriveCredentialByEmail,
    insertDriveCredential,
    updateDriveCredential
} from "@/app/utlities/drive-sqlite-utils";
import {uuidv4} from "uuidv7";

type Credential = {
    id: string,
    email: string,
    access_token: string,
    refresh_token: string,
    access_token_expiration: string
    expires_in?: number;
}


export const refreshDriveAccessToken = async(cred: Credential, email: string): Promise<boolean> => {
    let refreshed = false;
    const params = {
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        refresh_token: cred.refresh_token,
        grant_type: "refresh_token"
    }
    const headers = new Headers();
    headers.append("Content-Type", "application/json");

    const res = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        body: JSON.stringify(params),
        headers: headers
    })
    const body = await res.json();
    cred.access_token = body.access_token;
    cred.expires_in = body.expires_in;
    cred.email = email;
    refreshed = await loadDriveCredentials(cred);
    return refreshed;
}

export type googleResponse = {
    access_token: string,
    email: string
    refresh_token: string,
    expires_in?: number | undefined,
    scope?: string,
    token_type?: string,
    id?: string,
    access_token_expiration?: string
}

export async function loadDriveCredentials(body: googleResponse): Promise<boolean> {
    let loaded = false;
    if(!body.access_token) return loaded;

    let now = new Date();
    const credential: Credential = {
        id: uuidv4(),
        email: body.email,
        access_token: body.access_token,
        refresh_token: body.refresh_token,
        access_token_expiration: now.setSeconds(now.getSeconds() + (body.expires_in ?? 3600)).toString()
    };
    const rec = await getDriveCredentialByEmail(credential.email);

    if(rec.length === 0){
        console.log("creating");
        const successful = await insertDriveCredential(credential);
        if(successful) loaded = true;
    } else{
        console.log("updating");
        const successful = await updateDriveCredential(credential);
        if(successful) loaded = true;
    }
    return loaded;
}
export const getLatestDriveCredential = async(email: string) => {
    let driveCreds = await getDriveCredentialByEmail(email);
    if (driveCreds[0] && new Date(Number(driveCreds[0].access_token_expiration)) < new Date()) {
        console.log("need refresh");
        let refreshed = await refreshDriveAccessToken(driveCreds[0], email);
        if (refreshed) driveCreds = await getDriveCredentialByEmail(email);
    }
    return driveCreds;
}