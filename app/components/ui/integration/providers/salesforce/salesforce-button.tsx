"use client";
import Image from "next/image";
import React from "react";
import { getBackendOrigin } from "@/app/utlities/util";

function SalesforceButton({ enabled, openPanel }: { enabled: boolean, openPanel: () => void }) {

    const initiateSalesforceOauth = () => {
        const params = new URLSearchParams({
            client_id: process.env.NEXT_PUBLIC_SALESFORCE_CLIENT_ID ?? "",
            redirect_uri: getBackendOrigin() + "/oauth/salesforce",
            response_type: "code"
        }).toString();

        window.location.href = "https://login.salesforce.com/services/oauth2/authorize?" + params;
    }


    return (
        <button className={!enabled ? "p-2 px-4 text-center flex bg-gray-200 hover:bg-gray-400 shadow-2xl rounded-2xl justify-center items-center space-x-2 font-['Helvetica'] min-w-full" :
            "p-2 px-4 text-center flex bg-green-200 hover:bg-green-400 shadow-2xl rounded-2xl justify-center items-center space-x-2 font-['Helvetica'] min-w-full"}
            onClick={!enabled ? initiateSalesforceOauth : openPanel}>
            <Image
                className="rounded-xl"
                src="/salesforce-logo.png"
                alt="Salesforce Logo"
                width={40}
                height={40}
                priority
            />
            {!enabled && <div>Integrate with Salesforce</div>}
            {enabled &&
                <div className={"flex flex-col"}>
                    <div>Salesforce is Integrated!</div>
                    <div className={"text-xs"}>(Click to get accounts)</div>
                </div>}
        </button>
    );
}
export default SalesforceButton;
