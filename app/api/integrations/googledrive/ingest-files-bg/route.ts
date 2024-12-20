import { NextRequest, NextResponse } from "next/server";
import { getLatestDriveCredential } from "@/app/api/integrations/googledrive/oauth";
import { configure, tasks } from "@trigger.dev/sdk/v3";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

configure({
	secretKey: process.env.TRIGGER_SECRET_KEY // starts with tr_dev_ or tr_prod_
});

export async function POST(request: NextRequest) {
	const response = await request.json();
	try {
		const driveCreds = await getLatestDriveCredential(response.email);
		const handle = await tasks.trigger("Drive-File-Ingestion", {
			email: response.email,
			token: driveCreds[0].access_token
		});

		console.log(handle);

		return NextResponse.json(
			{ status: 200 },
		);

	} catch (error) {
		console.error("[Google Drive Trigger.dev]", error);
		return NextResponse.json(
			{ error: (error as Error).message },
			{ status: 500 },
		);
	}
}
