"use client";
import Image from "next/image";
import React from "react";
import { getBackendOrigin } from "@/app/utlities/util";

function DriveButton({ enabled, openPanel }: { enabled: boolean, openPanel: () => void }) {


    const initiateDriveOauth = () => {
        const params = new URLSearchParams({
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "",
            redirect_uri: getBackendOrigin() + "/oauth/googledrive",
            response_type: 'code',
            scope: 'https://www.googleapis.com/auth/drive.readonly',
            include_granted_scopes: 'true',
            state: 'pass-through value',
            access_type: "offline",
            prompt: "consent"
        }).toString();

        window.location.href = "https://accounts.google.com/o/oauth2/v2/auth?" + params;
    };


    return (
        <button className={!enabled ? "p-2 px-4 text-center flex bg-gray-200 hover:bg-gray-400 shadow-2xl rounded-2xl items-center justify-center space-x-2 font-['Helvetica'] min-w-full" :
            "p-2 px-4 text-center flex bg-green-200 hover:bg-green-400 shadow-2xl rounded-2xl items-center justify-center space-x-2 font-['Helvetica'] min-w-full"}
            onClick={!enabled ? initiateDriveOauth : openPanel}>
            <Image
                className="rounded-xl"
                src="/google-drive-logo.png"
                alt="Google Logo"
                width={40}
                height={40}
                priority
            />
            {!enabled && <div>Integrate with Google Drive</div>}
            {enabled &&
                <div className={"flex flex-col"}>
                    <div>Google Drive is Integrated!</div>
                    <div className={"text-xs"}>(Click to see actions)</div>
                </div>}
        </button>
    );
}
export default DriveButton;
