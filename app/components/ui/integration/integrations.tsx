"use client";
import React, { useEffect, useState } from "react";
import { getBackendOrigin } from "@/app/utlities/util";
import { getSession } from "@/app/components/ui/integration/auth-action";
import DriveButton from "@/app/components/ui/integration/providers/googledrive/drive-button";
import SlackButton from "@/app/components/ui/integration/providers/slack/slack-button";
import SalesforceButton from "@/app/components/ui/integration/providers/salesforce/salesforce-button";
import { DrivePanel } from "./providers/googledrive/drive-panel";

const Integrations = () => {
    const [integrations, setIntegrations] = useState({
        hasCreds: {
            drive: false,
            slack: false,
            salesforce: false
        }
    })
    const [openPanel, setOpenPanel] = useState(false);

    useEffect(() => {
        const headers = new Headers();
        headers.append("Content-Type", "application/json");
        getSession().then((session) => {
            fetch(getBackendOrigin() + "/api/integrations", {
                method: "POST",
                body: JSON.stringify({ email: session?.user?.email }),
                headers: headers
            }).then((res) => {
                console.log(res);
                res.json().then((body) => {
                    console.log(body);
                    setIntegrations(body);
                })
            });
        });
    }, []);

    const openDrivePanel = () => {
        setOpenPanel(!openPanel);
    }

    return (
        <div className={"flex flex-col space-y-2 justify-center items-center absolute top-36 left-1/2 transform -translate-x-1/2 -translate-y-1/2"}>
            <div className={"text-2xl font-bold"}>
                Integrations:
            </div>
            <div className={"w-1/2 flex items-center justify-center space-x-4 items-stretch"}>
                <DriveButton enabled={integrations.hasCreds.drive} openPanel={openDrivePanel}></DriveButton>
                <SlackButton enabled={integrations.hasCreds.slack}></SlackButton>
                <SalesforceButton enabled={integrations.hasCreds.salesforce}></SalesforceButton>
            </div>
            {openPanel && <DrivePanel />}
        </div>
    );
}
export default Integrations;
