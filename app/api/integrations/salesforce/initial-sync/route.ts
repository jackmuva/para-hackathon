import { NextRequest, NextResponse } from "next/server";
import { getSalesforceCredentialByEmail } from "@/app/utlities/postgres-sql";
import { refreshSalesforceToken, SalesforceCredential } from "@/app/api/integrations/salesforce/oauth";
import { insertSalesforceRecord } from "@/app/utlities/postgres-sql";

export async function POST(request: NextRequest) {
	const response = await request.json();
	try {
		let salesforceCreds = await getSalesforceCredentialByEmail(response.email);
		let contactResponse = await syncContacts(salesforceCreds[0], false);

		return NextResponse.json(
			{ successful: contactResponse },
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

const syncContacts = async (salesforceCreds: SalesforceCredential, refresh: boolean, nextPage?: string): Promise<boolean> => {
	let successful = true;
	const headers = new Headers();
	headers.append("Content-Type", "application/json");
	headers.append("Authorization", "Bearer " + salesforceCreds.access_token);

	const params = new URLSearchParams({
		q: "SELECT FIELDS(STANDARD) from Contact"
	}).toString();

	let res = await fetch(nextPage ? salesforceCreds.instance_url + nextPage : salesforceCreds.instance_url + "/services/data/v62.0/query?" + params, {
		headers: headers
	});

	//401 is not always generalizable
	//the standard error is "invalid_grant"
	if (res.status === 401 && !refresh) {
		console.log("refreshing");
		const refreshed = await refreshSalesforceToken(salesforceCreds);
		if (refreshed) {
			salesforceCreds = await getSalesforceCredentialByEmail(salesforceCreds.email);
			successful = await syncContacts(salesforceCreds, true);
		}
	} else if (res.status === 401 && refresh) {
		successful = false;
	} else if (res.status === 200) {
		const body = await res.json();

		body.records.forEach((contact: any) => {
			insertSalesforceRecord({ id: contact.Id, full_name: contact.Name, title: contact.Title, contact_email: contact.Email, user_email: salesforceCreds.email });
		});

		console.log(body);
		if (body.done === false) {
			syncContacts(salesforceCreds, false, nextPage);
		}
	}
	return successful;
}
