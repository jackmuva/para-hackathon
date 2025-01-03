import { NextRequest, NextResponse } from "next/server";
import { getSalesforceCredentialByEmail } from "@/app/utlities/salesforce-sqlite-utils";
import { refreshSalesforceToken, SalesforceCredential } from "@/app/api/integrations/salesforce/oauth";
import { insertSalesforceRecord } from "@/app/utlities/postgres-sql";

export async function POST(request: NextRequest) {
	const response = await request.json();
	try {
		let salesforceCreds = await getSalesforceCredentialByEmail(response.email);
		let contactResponse = await createContact(response.contact, salesforceCreds[0], false);

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

const createContact = async (contact: any, salesforceCreds: SalesforceCredential, refresh: boolean): Promise<boolean> => {
	let successful = true;
	const headers = new Headers();
	headers.append("Content-Type", "application/json");
	headers.append("Authorization", "Bearer " + salesforceCreds.access_token);

	let res = await fetch(salesforceCreds.instance_url + "/services/data/v62.0/sobjects/Contact/", {
		method: "POST",
		headers: headers,
		body: JSON.stringify(contact)
	});
	//401 is not always generalizable
	//the standard error is "invalid_grant"
	if (res.status === 401 && !refresh) {
		console.log("refreshing");
		const refreshed = await refreshSalesforceToken(salesforceCreds);
		if (refreshed) {
			salesforceCreds = await getSalesforceCredentialByEmail(salesforceCreds.email);
			successful = await createContact(contact, salesforceCreds, true);
		}
	} else if (res.status === 401 && refresh) {
		successful = false;
	} else if (res.status === 201) {
		const body = await res.json();
		await insertSalesforceRecord({
			id: body.id, full_name: contact.FirstName + " " + contact.LastName,
			title: contact.Title, contact_email: contact.Email, user_email: salesforceCreds.email
		});
	}
	return successful;

}
