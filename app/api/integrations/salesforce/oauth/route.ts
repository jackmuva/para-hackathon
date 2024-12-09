import { NextRequest, NextResponse } from "next/server";
import {loadSlackCredentials} from "@/app/api/integrations/slack/oauth/index";
import {getBackendOrigin} from "@/app/utlities/util";
import {loadSalesforceCredentials} from "@/app/api/integrations/salesforce/oauth/index";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
    const response = await request.json();
    try {
        const headers = new Headers();
        headers.append("Content-Type", "application/x-www-form-urlencoded");

        const params = {
            code: response.code,
            client_id: process.env.NEXT_PUBLIC_SALESFORCE_CLIENT_ID ?? "",
            client_secret: process.env.SALESFORCE_CLIENT_SECRET ?? "",
            grant_type: "authorization_code",
            redirect_uri: getBackendOrigin() + "/oauth/salesforce"
        }

        fetch("https://useparagon2-dev-ed.develop.my.salesforce.com/services/oauth2/token", {
            method: "POST",
            body: new URLSearchParams(params),
            headers: headers
        }).then((res) => {
            res.json().then((body) => {
                body.email = response.email;
                console.log(body);
                loadSalesforceCredentials(body);
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
        console.error("[Salesforce OAuth API]", error);
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 500 },
        );
    }
}