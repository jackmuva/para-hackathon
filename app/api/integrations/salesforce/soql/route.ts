import {NextRequest, NextResponse} from "next/server";
import {getSalesforceCredentialByEmail} from "@/app/utlities/salesforce-sqlite-utils";
import {getBackendOrigin} from "@/app/utlities/util";
import {refreshSalesforceToken, SalesforceCredential} from "@/app/api/integrations/salesforce/oauth";

export async function POST(request: NextRequest) {
    const response = await request.json();
    try {
        let salesforceCreds = await getSalesforceCredentialByEmail(response.email);
        let accountResponse = await getAccounts(salesforceCreds[0]);

        if(accountResponse.status === 401){
            console.log("refreshing");
            const refreshed = await refreshSalesforceToken(salesforceCreds[0]);
            if(refreshed){
                salesforceCreds = await getSalesforceCredentialByEmail(response.email);
                accountResponse = await getAccounts(salesforceCreds);
            }
        }

        const body = await accountResponse.json();
        console.log(body);
        return NextResponse.json(
            {accounts: body},
            {status: 200}
        );
    } catch (error) {
        console.error("[Salesforce SOQL]", error);
        return NextResponse.json(
            {error: (error as Error).message},
            {status: 500},
        );
    }
}

const getAccounts = async(salesforceCreds: SalesforceCredential) => {

    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", "Bearer " + salesforceCreds.access_token);

    const params = new URLSearchParams({
        q: "SELECT name from Account"
    }).toString();

    const res = await fetch(salesforceCreds.instance_url + "/services/data/v62.0/query?" + params, {
        headers: headers
    });
    return res;
}