import { NextRequest, NextResponse } from "next/server";
import {refreshDriveAccessToken} from "@/app/api/integrations/googledrive/oauth";
import {getDriveCredentialByEmail} from "@/app/utlities/drive-sqlite-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
    const response = await request.json();
    let files = {};
    getDriveCredentialByEmail(response.email).then((driveCreds) => {
        if (driveCreds[0] && new Date(Number(driveCreds[0].access_token_expiration)) < new Date()) {
            console.log("need refresh");
            refreshDriveAccessToken(driveCreds[0], response.email);
        }

        const headers = new Headers();
        headers.append("Content-Type", "application/json");
        headers.append("Authorization", "Bearer " + driveCreds[0].access_token);

        fetch("https://www.googleapis.com/drive/v3/files", {
            method: "GET",
            headers: headers
        }).then((response) => {
            response.json().then((body) => {
                console.log(body);
                files = body;
                return NextResponse.json(
                    {files: files},
                    {status: 200},
                );
            }).catch((error) => {
                console.error("[Google Drive list files API]", error);
                return NextResponse.json(
                    {error: (error as Error).message},
                    {status: 500},
                );
            });
        }).catch((error) => {
            console.error("[Google Drive list files API]", error);
            return NextResponse.json(
                {error: (error as Error).message},
                {status: 500},
            );
        });
    }).catch((error) => {
        console.error("[Google Drive list files API]", error);
        return NextResponse.json(
            {error: (error as Error).message},
            {status: 500},
        );
    });
    return NextResponse.json(
        {files: files},
        {status: 200},
    );
}
