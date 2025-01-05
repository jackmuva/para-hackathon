import { NextRequest, NextResponse } from "next/server";
import { getDriveCredentialByEmail } from "@/app/utlities/postgres-sql";
import { getSlackCredentialByEmail } from "@/app/utlities/postgres-sql";
import { getSalesforceCredentialByEmail } from "@/app/utlities/postgres-sql";

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
        const driveCreds = await getDriveCredentialByEmail(response.email);
        const slackCreds = await getSlackCredentialByEmail(response.email);
        const salesforceCreds = await getSalesforceCredentialByEmail(response.email);

        if (driveCreds.length !== 0) {
            creds.drive = true;
        }
        if (slackCreds.length !== 0) creds.slack = true;
        if (salesforceCreds.length !== 0) creds.salesforce = true;

        return NextResponse.json(
            { hasCreds: creds },
            { status: 200 },
        );
    } catch (error) {
        console.error("[Integrations API]", error);
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 500 },
        );
    }
}
