"use client";
import Image from "next/image";
import React from "react";
import {getBackendOrigin} from "@/app/utlities/util";
import {getSession} from "@/app/components/ui/integration/auth-action";
import {toast} from "react-toastify";

function SalesforceButton({enabled}: {enabled: boolean}){

    const initiateSalesforceOauth = () => {
        const params = new URLSearchParams({
            client_id: process.env.NEXT_PUBLIC_SALESFORCE_CLIENT_ID ?? "",
            redirect_uri: getBackendOrigin() + "/oauth/salesforce",
            response_type: "code"
        }).toString();

        window.location.href = "https://login.salesforce.com/services/oauth2/authorize?" + params;
    }

    const triggerSalesforce = async() => {
        const headers = new Headers();
        headers.append("Content-Type", "application/json");

        const session = await getSession();
        const response = await fetch(getBackendOrigin() + "/api/integrations/salesforce/soql",{
            method: "POST",
            headers: headers,
            body: JSON.stringify({email: session?.user?.email})
        });
        console.log(response);
        if(response.status === 200){
            const body = await response.json();
            console.log(body);
            let result = "";
            body.accounts.records.forEach((account: any) => {
                result += account.Name + ", ";
            })
            toast.success(result);
        } else{
            toast.error("unable to successfully get accounts")
        }
    }

    return (
        <button className={!enabled ? "p-2 px-4 text-center flex bg-gray-200 hover:bg-gray-400 shadow-2xl rounded-2xl items-center space-x-2 font-['Helvetica'] min-w-full" :
            "p-2 px-4 text-center flex bg-green-200 hover:bg-green-400 shadow-2xl rounded-2xl items-center space-x-2 font-['Helvetica'] min-w-full"}
                onClick={!enabled ? initiateSalesforceOauth : triggerSalesforce}>
            <Image
                className="rounded-xl"
                src="/salesforce-logo.png"
                alt="Salesforce Logo"
                width={40}
                height={40}
                priority
            />
            { !enabled && <div>Integrate with Salesforce</div> }
            { enabled &&
                <div className={"flex flex-col"}>
                    <div>Salesforce is Integrated!</div>
                    <div className={"text-xs"}>(Click to get accounts)</div>
                </div> }
        </button>
    );
}
export default SalesforceButton;