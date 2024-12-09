"use client";
import Image from "next/image";
import React from "react";
import {getBackendOrigin} from "@/app/utlities/util";
import {getSession} from "@/app/components/ui/integration/auth-action";
import {toast} from "react-toastify";

function DriveButton({enabled}: {enabled: boolean}){

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

        window.location.href = "https://accounts.google.com/o/oauth2/v2/auth?" + params;
    };

    const openDrivePanel = async() => {
        const headers = new Headers();
        headers.append("Content-Type", "application/json");

        const session = await getSession();
        const response = await fetch(getBackendOrigin() + "/api/integrations/googledrive/list-files", {
            method: "POST",
            body: JSON.stringify({email: session?.user?.email}),
            headers: headers
        });

        if(response.status === 200){
            const body = await response.json();
            console.log(body);
            let result = "";
            body.files.files.forEach((file: any) => {
                result += file.name + ", "
            });
            toast.success(result);
        } else{
            toast.error("failed to get file names")
        }
    }

    return (
        <button className={!enabled ? "p-2 px-4 text-center flex bg-gray-200 hover:bg-gray-400 shadow-2xl rounded-2xl items-center space-x-2 font-['Helvetica'] min-w-full" :
            "p-2 px-4 text-center flex bg-green-200 hover:bg-green-400 shadow-2xl rounded-2xl items-center space-x-2 font-['Helvetica'] min-w-full"}
                onClick={!enabled ? initiateDriveOauth : openDrivePanel}>
            <Image
                className="rounded-xl"
                src="/google-drive-logo.png"
                alt="Google Logo"
                width={40}
                height={40}
                priority
            />
            { !enabled && <div>Integrate with Google Drive</div> }
            { enabled &&
                <div className={"flex flex-col"}>
                    <div>Google Drive is Integrated!</div>
                    <div className={"text-xs"}>(Click to get file names)</div>
                </div> }
        </button>
    );
}
export default DriveButton;