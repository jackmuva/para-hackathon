import { NextRequest, NextResponse } from "next/server";
import {getAll} from "@/app/utlities/sqlite-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        console.log(await getAll());
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
