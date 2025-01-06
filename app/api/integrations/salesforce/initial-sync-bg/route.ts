import { NextRequest, NextResponse } from "next/server";
import { configure, tasks } from "@trigger.dev/sdk/v3";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

configure({
	secretKey: process.env.TRIGGER_SECRET_KEY // starts with tr_dev_ or tr_prod_
});

export async function POST(request: NextRequest) {
	const response = await request.json();
	try {
		const handle = await tasks.trigger("Salesforce-Initial-Sync", {
			email: response.email
		});

		console.log(handle);

		return NextResponse.json(
			{ status: 200 },
		);

	} catch (error) {
		console.error("[Salesforce Initial Trigger.dev]", error);
		return NextResponse.json(
			{ error: (error as Error).message },
			{ status: 500 },
		);
	}
}
