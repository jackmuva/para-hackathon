import { NextRequest, NextResponse } from "next/server";
import {loadSlackCredentials} from "@/app/api/integrations/slack/oauth/index";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
    const response = await request.json();
    try {
        const headers = new Headers();
        headers.append("Content-Type", "application/x-www-form-urlencoded");

        const params = {
            code: response.code,
            client_id: process.env.NEXT_PUBLIC_SLACK_CLIENT_ID ?? "",
            client_secret: process.env.SLACK_CLIENT_SECRET ?? "",
            grant_type: "authorization_code",
        }

        fetch("https://slack.com/api/oauth.v2.access", {
            method: "POST",
            body: new URLSearchParams(params),
            headers: headers
        }).then((res) => {
            res.json().then((body) => {
                body.email = response.email;
                body.incoming_webhook_url = body.incoming_webhook.url;
                console.log(body);
                loadSlackCredentials(body);
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
}