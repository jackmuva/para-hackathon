import { NextRequest, NextResponse } from "next/server";
import { getByEmail } from "@/app/utlities/sqlite-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
    const response = await request.json();
    let files = {};

    try {
        const driveCreds = await getByEmail(response.email);

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
                    { files: files },
                    { status: 500 },
                );
            })
        })
    } catch (error) {
        console.error("[Google Drive list files API]", error);
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 500 },
        );
    }
}
