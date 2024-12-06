import {NextRequest, NextResponse} from "next/server";
import {getAllSlackCredentials, getSlackCredentialByEmail} from "@/app/utlities/slack-sqlite-utils";

export async function POST(request: NextRequest) {
    const response = await request.json();
    try {
        const headers = new Headers();
        headers.append("Content-Type", "application/json");

        const slackCreds = await getAllSlackCredentials();

        const params = {
            text: response.text
        }

        const res = await fetch(slackCreds[0].incoming_webhook, {
            method: "POST",
            body: JSON.stringify(params),
            headers: headers
        });

        return NextResponse.json(
            {message: res},
            {status: 200}
        );
    } catch (error) {
        console.error("[Google Drive Oauth API]", error);
        return NextResponse.json(
            {error: (error as Error).message},
            {status: 500},
        );
    }
}