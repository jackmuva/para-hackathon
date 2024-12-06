import { NextRequest, NextResponse } from "next/server";
import { getByEmail } from "@/app/utlities/sqlite-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
    const response = await request.json();
    try {
        let creds = {
            drive: false,
            slack: false,
            salesforce: false
        }
        const driveCreds = await getByEmail(response.email);

        if(driveCreds.length !== 0){
            creds.drive = true;
        }
        console.log(driveCreds);
        return NextResponse.json(
            { hasCreds: creds },
            { status: 200 },
        );
    } catch (error) {
        console.error("[Google Drive Oauth API]", error);
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 500 },
        );
    }
}
