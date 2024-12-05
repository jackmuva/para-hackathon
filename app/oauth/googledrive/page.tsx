"use client";

import {getBackendOrigin} from "@/app/utlities/util";
import {toast} from "react-toastify";
import {useSearchParams} from "next/navigation";
import {getSession} from "@/app/components/ui/integration/auth-action";

export default function DriveAuth(){
    const searchParams = useSearchParams();
    let params = {}
    searchParams.keys().forEach((key: string) => {
        // @ts-ignore
        params[key] = searchParams.get(key)
    });
    getSession().then((session) => {
        console.log(session);
        // @ts-ignore
        params["email"] = session.user.email
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
    });
};