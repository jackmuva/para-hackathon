import {NextRequest, NextResponse} from "next/server";
import {getSalesforceCredentialByEmail} from "@/app/utlities/salesforce-sqlite-utils";
import {getBackendOrigin} from "@/app/utlities/util";
import {refreshSalesforceToken} from "@/app/api/integrations/salesforce/oauth";

export async function POST(request: NextRequest) {
    const response = await request.json();
    try {
        const salesforceCreds = await getSalesforceCredentialByEmail(response.email);

        const headers = new Headers();
        headers.append("Content-Type", "application/json");
        headers.append("Authorization", "Bearer " + salesforceCreds[0].access_token);

        const params = new URLSearchParams({
            q: "SELECT name from Account"
        }).toString();

        console.log(salesforceCreds[0].instance_url + "/services/data/v62.0/query?" + params);
        const res = await fetch(salesforceCreds[0].instance_url + "/services/data/v62.0/query?" + params, {
            headers: headers
        });
        console.log(res);
        if(res.status === 401){
            console.log("refreshing");
            await refreshSalesforceToken(salesforceCreds[0]);
        } else {
            const body = await res.json();
            console.log(body);
            return NextResponse.json(
                {accounts: body},
                {status: 200}
            );
        }

        return NextResponse.json(
            {message: "need to refresh Salesforce credentials"},
            {status: 400}
        );
    } catch (error) {
        console.error("[Salesforce SOQL]", error);
        return NextResponse.json(
            {error: (error as Error).message},
            {status: 500},
        );
    }
}