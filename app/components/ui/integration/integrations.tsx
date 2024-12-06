"use client";
import Image from "next/image";
import React, {useEffect, useState} from "react";
import {getBackendOrigin} from "@/app/utlities/util";
import {getSession} from "@/app/components/ui/integration/auth-action";
import DriveButton from "@/app/components/ui/integration/providers/googledrive/drive-button";
import SlackButton from "@/app/components/ui/integration/providers/slack/slack-button";

const Integrations = () => {
    const [integrations, setIntegrations] = useState({
        hasCreds: {
            drive: false,
            slack: false,
            salesforce: false
        }
    })

    useEffect(() => {
        const headers = new Headers();
        headers.append("Content-Type", "application/json");
        getSession().then((session) => {
            fetch(getBackendOrigin() + "/api/integrations", {
                method: "POST",
                body: JSON.stringify({email: session?.user?.email}),
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

    const initiateDriveOauth = () => {
        const params = new URLSearchParams({
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "",
            redirect_uri: getBackendOrigin() + "/oauth/googledrive",
            response_type: 'code',
            scope: 'https://www.googleapis.com/auth/drive.file',
            include_granted_scopes: 'true',
            state: 'pass-through value',
            access_type: "offline",
            prompt: "consent"
        }).toString();

        const headers = new Headers();
        headers.append("Content-Type", "application/json");

        window.location.href = "https://accounts.google.com/o/oauth2/v2/auth?" + params;
    };

    const openDrivePanel = () => {
        const headers = new Headers();
        headers.append("Content-Type", "application/json");

        getSession().then((session) => {
            console.log(session?.user?.email);
            fetch(getBackendOrigin() + "/api/integrations/googledrive/list-files", {
                method: "POST",
                body: JSON.stringify({email: session?.user?.email}),
                headers: headers
            }).then((res) => {
                console.log(res);
                res.json().then((body) => {
                    console.log(body);
                })
            })
        })
    }

    return (
      <div className={"flex flex-col space-y-2 justify-center items-center absolute top-36 left-1/2 transform -translate-x-1/2 -translate-y-1/2"}>
          <div className={"text-2xl font-bold"}>
              Integrations:
          </div>
          <div className={"flex flex-col items-center justify-center space-y-4 grow-0"}>
              <DriveButton enabled={integrations.hasCreds.drive}></DriveButton>
              <SlackButton enabled={integrations.hasCreds.slack}></SlackButton>
          </div>
      </div>
    );
}
export default Integrations;