"use client";
import Image from "next/image";
import React, {useEffect, useState} from "react";
import {getBackendOrigin} from "@/app/utlities/util";
import {getSession} from "@/app/components/ui/integration/auth-action";

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
          <div className={"flex flex-col items-center justify-center"}>
              <button className={!integrations.hasCreds.drive ? "p-2 px-4 text-center flex bg-gray-200 shadow-2xl rounded-2xl items-center space-x-2 font-['Helvetica']" :
                  "p-2 px-4 text-center flex bg-green-200 shadow-2xl rounded-2xl items-center space-x-2 font-['Helvetica']"}
                    onClick={!integrations.hasCreds.drive ? initiateDriveOauth : openDrivePanel}>
                  <Image
                      className="rounded-xl"
                      src="/google-drive-logo.png"
                      alt="Google Logo"
                      width={40}
                      height={40}
                      priority
                  />
                  { !integrations.hasCreds.drive && <div>Integrate with Google Drive</div> }
                  { integrations.hasCreds.drive && <div>Google Drive is Integrated!</div> }
              </button>
          </div>
      </div>
    );
}
export default Integrations;