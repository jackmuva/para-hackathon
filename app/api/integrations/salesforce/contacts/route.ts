import { querySalesforceContent } from "@/app/utlities/postgres-sql";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function POST(request: NextRequest) {
	const response = await request.json();
	try {
		const results = await querySalesforceContent(response.email);
		return NextResponse.json(
			{ results: results },
			{ status: 200 },
		);
	} catch (error) {
		console.error("[Google Drive Search]", error);
		return NextResponse.json(
			{ error: (error as Error).message },
			{ status: 500 },
		);
	}
}
