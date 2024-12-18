"use client";
import Image from "next/image";
import React from "react";
import {getBackendOrigin} from "@/app/utlities/util";
import {getSession} from "@/app/components/ui/integration/auth-action";
import {toast} from "react-toastify";

function SlackButton({enabled}: {enabled: boolean}){

    const initiateSlackOauth = () => {
        const params = new URLSearchParams({
            scope: "incoming-webhook",
            client_id: process.env.NEXT_PUBLIC_SLACK_CLIENT_ID ?? "",
            redirect_uri: getBackendOrigin() + "/oauth/slack"
        }).toString();

        window.location.href = "https://slack.com/oauth/v2/authorize?" + params;
    }

    const triggerSlack = async() => {
        const headers = new Headers();
        headers.append("Content-Type", "application/json");

        const session = await getSession();
        const response = await fetch(getBackendOrigin() + "/api/integrations/slack/post-message",{
            method: "POST",
            headers: headers,
            body: JSON.stringify({text: "yello", email: session?.user?.email})
        });
        if(response.status === 200){
            toast.success("message sent in channel");
        } else{
            toast.error("Something went wrong with Slack integration")
        }

    }

    return (
        <button className={!enabled ? "p-2 px-4 text-center flex bg-gray-200 hover:bg-gray-400 shadow-2xl rounded-2xl justify-center items-center space-x-2 font-['Helvetica'] min-w-full" :
            "p-2 px-4 text-center flex bg-green-200 hover:bg-green-400 shadow-2xl rounded-2xl justify-center items-center space-x-2 font-['Helvetica'] min-w-full"}
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
                    <div className={"text-xs"}>(Click to send a "yello" message)</div>
                </div> }
        </button>
    );
}
export default SlackButton;