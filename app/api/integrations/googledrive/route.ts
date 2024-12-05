import { NextRequest, NextResponse } from "next/server";
import {Credential, getByEmail, insertCredential, updateCredential} from "@/app/utlities/sqlite-utils";
import {uuidv4} from "uuidv7";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
    const response = await request.json();
    try {
        const headers = new Headers();
        headers.append("Content-Type", "application/json");

        const params = {
            code: response.code,
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            redirect_uri: "http://localhost:3000/oauth/googledrive",
            grant_type: "authorization_code"
        }

        fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            body: JSON.stringify(params),
            headers: headers
        }).then((res) => {
            res.json().then((body) => {
                body.email = response.email;
                console.log(body);
                loadCredentials(body);
                return NextResponse.json(
                    { status: 200 }
                );
            }).catch((error) => {
                return NextResponse.json(
                    { error: (error as Error).message },
                    { status: 500 }
                );
            });
        }).catch((error) => {
            return NextResponse.json(
                { error: (error as Error).message },
                { status: 500 }
            );
        });
    } catch (error) {
        console.error("[Google Drive Oauth API]", error);
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 500 },
        );
    }
    return NextResponse.json(
        { error: "something went wrong" },
        { status: 500 },
    );
}

type googleResponse = {
    access_token: string,
    expires_in: number,
    refresh_token: string,
    scope: string,
    token_type: string,
    email: string
}

function loadCredentials(body: googleResponse) {
    if(!body.access_token){
        return;
    }

    let now = new Date();
    const credential: Credential = {
        id: uuidv4(),
        email: body.email,
        access_token: body.access_token,
        refresh_token: body.refresh_token,
        access_token_expiration: now.setSeconds(now.getSeconds() + body.expires_in).toString()
    };
    getByEmail(credential.email).then((rec) => {
        console.log(credential);
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
