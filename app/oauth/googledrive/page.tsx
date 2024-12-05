"use client";

import {getBackendOrigin} from "@/app/utlities/util";
import {toast} from "react-toastify";
import {useSearchParams} from "next/navigation";

export default function DriveAuth(){
    const searchParams = useSearchParams();
    let params = {}
    searchParams.keys().forEach((key: string) => {
        // @ts-ignore
        params[key] = searchParams.get(key)
    });

    console.log(params);
    const headers = new Headers();
    headers.append("Content-Type", "application/json");

    fetch(getBackendOrigin() + "/api/integrations/googledrive", {
        method: "POST",
        body: JSON.stringify(params),
        headers: headers
    }).then((res) => {
        toast.success("Successfully authenticated");
    }).catch((error) => {
        toast.error(error);
    });

    window.location.href = "http://localhost:3000";
};