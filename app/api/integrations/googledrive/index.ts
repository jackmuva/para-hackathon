import {Credential, getByEmail, insertCredential, updateCredential} from "@/app/utlities/sqlite-utils";
import {uuidv4} from "uuidv7";

type DriveCredential = {
    id: string,
    email: string,
    access_token: string,
    refresh_token: string,
    access_token_expiration: string
    expires_in?: number;
}


export const refreshDriveAccessToken = (cred: DriveCredential, email: string) => {
    const params = {
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        refresh_token: cred.refresh_token,
        grant_type: "refresh_token"
    }
    const headers = new Headers();
    headers.append("Content-Type", "application/json");

    fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        body: JSON.stringify(params),
        headers: headers
    }).then((res) => {
        res.json().then((body) => {
            cred.access_token = body.access_token;
            cred.expires_in = body.expires_in;
            cred.email = email;
            loadCredentials(cred);
        })
    })
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

export function loadCredentials(body: googleResponse) {
    if(!body.access_token){
        return;
    }

    let now = new Date();
    const credential: Credential = {
        id: uuidv4(),
        email: body.email,
        access_token: body.access_token,
        refresh_token: body.refresh_token,
        access_token_expiration: now.setSeconds(now.getSeconds() + (body.expires_in ?? 3600)).toString()
    };
    getByEmail(credential.email).then((rec) => {
        if(rec.length === 0){
            console.log("creating");
            insertCredential(credential).then(() => {
                console.log("Credential created for: " + credential.email);
            });
        } else{
            console.log("updating")
            updateCredential(credential).then(() => {
                console.log("Credential updated for: " + credential.email);
            })
        }
    });
}
