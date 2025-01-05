import { NextRequest, NextResponse } from "next/server";
import { getSalesforceCredentialByEmail } from "@/app/utlities/postgres-sql";
import { refreshSalesforceToken, SalesforceCredential } from "@/app/api/integrations/salesforce/oauth";

export async function POST(request: NextRequest) {
    const response = await request.json();
    try {
        let salesforceCreds = await getSalesforceCredentialByEmail(response.email);
        let accountResponse = await getAccounts(salesforceCreds[0]);

        //401 is not always generalizable
        //the standard error is "invalid_grant"
        if (accountResponse.status === 401) {
            console.log("refreshing");
            const refreshed = await refreshSalesforceToken(salesforceCreds[0]);
            if (refreshed) {
                salesforceCreds = await getSalesforceCredentialByEmail(response.email);
                accountResponse = await getAccounts(salesforceCreds[0]);
            }
        }

        const body = await accountResponse.json();
        console.log(body);
        return NextResponse.json(
            { accounts: body },
            { status: 200 }
        );
    } catch (error) {
        console.error("[Salesforce SOQL]", error);
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 500 },
        );
    }
}

const getAccounts = async (salesforceCreds: SalesforceCredential) => {

    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", "Bearer " + salesforceCreds.access_token);

    const params = new URLSearchParams({
        q: "SELECT FIELDS(STANDARD) from Account WHERE isDeleted = false"
    }).toString();

    const res = await fetch(salesforceCreds.instance_url + "/services/data/v62.0/query?" + params, {
        headers: headers
    });
    return res;
}
