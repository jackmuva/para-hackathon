"use client";
import Image from "next/image";
import React from "react";

const Integrations = () => {
    const initiateDriveOauth = () => {
        const params = new URLSearchParams({
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "",
            redirect_uri: "http://localhost:3000/oauth/googledrive",
            response_type: 'token',
            scope: 'https://www.googleapis.com/auth/drive.metadata.readonly',
            include_granted_scopes: 'true',
            state: 'pass-through value'}).toString();

        const headers = new Headers();
        headers.append("Content-Type", "application/json");

        window.location.href = "https://accounts.google.com/o/oauth2/v2/auth?" + params;
    }

    return (
      <div className={"flex justify-center absolute top-36 left-1/2 transform -translate-x-1/2 -translate-y-1/2"}>
          <button className="p-2 px-4 text-center flex bg-gray-200 shadow-2xl rounded-2xl items-center space-x-2
                  font-['Helvetica']"
                onClick={initiateDriveOauth}>
              <Image
                  className="rounded-xl"
                  src="/google-drive-logo.png"
                  alt="Google Logo"
                  width={40}
                  height={40}
                  priority
              />
              <div>Integrate with Google Drive</div>
          </button>
      </div>
    );
}
export default Integrations;