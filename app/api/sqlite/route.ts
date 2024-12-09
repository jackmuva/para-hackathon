import { NextRequest, NextResponse } from "next/server";
import {getAllDriveCredentials} from "@/app/utlities/drive-sqlite-utils";
import {getAllSlackCredentials} from "@/app/utlities/slack-sqlite-utils";
import {getAllSalesforceCredentials} from "@/app/utlities/salesforce-sqlite-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        console.log(await getAllSalesforceCredentials());
        return NextResponse.json(
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
