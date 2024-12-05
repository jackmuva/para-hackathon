import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
    const response = await request.json();

    try {
        console.log(response);
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
                console.log(body);
                return NextResponse.json(
                    { status: 200 }
                );
            });
        }).catch((error) => {
            return NextResponse.json(
                { error: (error as Error).message },
                { status: 500 }
            );
        });
    } catch (error) {
        console.log(response);
        console.error("[Google Drive Oauth API]", error);
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 500 },
        );
    }
}

