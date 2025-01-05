import { NextRequest, NextResponse } from "next/server";
import { getSlackCredentialByEmail } from "@/app/utlities/postgres-sql";

export async function POST(request: NextRequest) {
    const response = await request.json();
    try {
        const headers = new Headers();
        headers.append("Content-Type", "application/json");

        const slackCreds = await getSlackCredentialByEmail(response.email);

        const params = {
            text: response.text
        }

        const res = await fetch(slackCreds[0].incoming_webhook, {
            method: "POST",
            body: JSON.stringify(params),
            headers: headers
        });

        return NextResponse.json(
            { message: res },
            { status: 200 }
        );
    } catch (error) {
        console.error("[Google Drive Oauth API]", error);
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 500 },
        );
    }
}
