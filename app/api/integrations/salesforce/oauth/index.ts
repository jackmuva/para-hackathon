import {
    getSalesforceCredentialByEmail,
    insertSalesforceCredential,
    updateSalesforceCredential
} from "@/app/utlities/salesforce-sqlite-utils";
import {getBackendOrigin} from "@/app/utlities/util";

export const refreshSalesforceToken = async(credential: SalesforceCredential) => {
    const headers = new Headers();
    headers.append("Content-Type", "application/json");

    const params = {
        refresh_token: credential.refresh_token,
        client_id: process.env.NEXT_PUBLIC_SALESFORCE_CLIENT_ID ?? "",
        client_secret: process.env.SALESFORCE_CLIENT_SECRET ?? "",
        grant_type: "refresh_token"
    }

    console.log(params);
    const response = await fetch("https://login.salesforce.com/services/oauth2/token",{
        method: "POST",
        body: JSON.stringify(params),
        headers: headers
    });

    console.log(response);
}

export const loadSalesforceCredentials = async(credentials: SalesforceCredential) => {
    if(!credentials.access_token) return;
    const record = await getSalesforceCredentialByEmail(credentials.email);
    let res;
    if(record.length === 0){
        console.log("creating salesforce credential");
        res = await insertSalesforceCredential(credentials);
    } else{
        console.log("updating salesforce credential");
        res = await updateSalesforceCredential(credentials);
    }
    console.log(res);
    return;
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
    token_type?: string
}