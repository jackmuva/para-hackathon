"use client";
import Image from "next/image";
import React from "react";
import {getBackendOrigin} from "@/app/utlities/util";

function SlackButton({enabled}: {enabled: boolean}){

    const initiateSlackOauth = () => {
        const params = new URLSearchParams({
            scope: "incoming-webhook",
            client_id: process.env.NEXT_PUBLIC_SLACK_CLIENT_ID ?? "",
            redirect_uri: getBackendOrigin() + "/oauth/slack"
        }).toString();

        const headers = new Headers();
        headers.append("Content-Type", "application/json");

        window.location.href = "https://slack.com/oauth/v2/authorize?" + params;
    }

    const triggerSlack = async() => {
        const headers = new Headers();
        headers.append("Content-Type", "application/json");

        const response = await fetch(getBackendOrigin() + "/api/integrations/slack/post-message",{
            method: "POST",
            headers: headers,
            body: JSON.stringify({text: "hey"})
        });
        console.log(response);
    }

    return (
        <button className={!enabled ? "p-2 px-4 text-center flex bg-gray-200 shadow-2xl rounded-2xl items-center space-x-2 font-['Helvetica'] min-w-full" :
            "p-2 px-4 text-center flex bg-green-200 shadow-2xl rounded-2xl items-center space-x-2 font-['Helvetica'] min-w-full"}
                onClick={!enabled ? initiateSlackOauth : triggerSlack}>
            <Image
                className="rounded-xl"
                src="/slack-logo.png"
                alt="Google Logo"
                width={40}
                height={40}
                priority
            />
            { !enabled && <div>Integrate with Slack</div> }
            { enabled &&
                <div className={"flex flex-col"}>
                    <div>Slack is Integrated!</div>
                    <div className={"text-xs"}>(Click to trigger a backend API)</div>
                </div> }
        </button>
    );
}
export default SlackButton;