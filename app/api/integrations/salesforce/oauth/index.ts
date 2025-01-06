import {
    getSalesforceCredentialByEmail,
    insertSalesforceCredential,
    updateSalesforceCredential
} from "@/app/utlities/postgres-sql";

export const refreshSalesforceToken = async (credential: SalesforceCredential): Promise<boolean> => {
    const headers = new Headers();
    headers.append("Content-Type", "application/x-www-form-urlencoded");

    const params = {
        refresh_token: credential.refresh_token,
        client_id: process.env.NEXT_PUBLIC_SALESFORCE_CLIENT_ID ?? "",
        client_secret: process.env.SALESFORCE_CLIENT_SECRET ?? "",
        grant_type: "refresh_token"
    }

    const response = await fetch("https://login.salesforce.com/services/oauth2/token", {
        method: "POST",
        body: new URLSearchParams(params),
        headers: headers
    });
    let body = await response.json();

    console.log(response);
    if (response.status === 200) {
        body = { ...body, email: credential.email, refresh_token: credential.refresh_token };
        const res: any = await loadSalesforceCredentials(body);
        if (res) return true;
    } else {
        console.log("[Salesforce Token Refresh]" + body);
    }
    return false;
}

export const loadSalesforceCredentials = async (credentials: SalesforceCredential) => {
    if (!credentials.access_token) return;
    const record = await getSalesforceCredentialByEmail(credentials.email);
    let res;
    if (record.length === 0) {
        console.log("creating salesforce credential");
        res = await insertSalesforceCredential(credentials);
    } else {
        console.log("updating salesforce credential");
        res = await updateSalesforceCredential(credentials);
    }
    return res;
}

export type SalesforceCredential = {
    access_token: string,
    refresh_token: string,
    email: string,
    issued_at?: string,
    signature?: string,
    scope?: string,
    instance_url: string,
    id: string,
    sync?: boolean,
    token_type?: string
}
