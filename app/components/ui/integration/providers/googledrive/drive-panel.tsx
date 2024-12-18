import { getSession } from "@/app/components/ui/integration/auth-action";
import { toast } from "react-toastify";
import { getBackendOrigin } from "@/app/utlities/util";
import Image from "next/image";
import { useState } from "react";

export const DrivePanel = () => {
    const [search, setSearch] = useState("");

    const listFiles = async () => {
        const headers = new Headers();
        headers.append("Content-Type", "application/json");

        const session = await getSession();
        const response = await fetch(getBackendOrigin() + "/api/integrations/googledrive/list-files", {
            method: "POST",
            body: JSON.stringify({ email: session?.user?.email }),
            headers: headers
        });

        if (response.status === 200) {
            const body = await response.json();
            console.log(body);
            let result = "";
            body.files.files.forEach((file: any) => {
                result += file.name + ", "
            });
            toast.success(result);
        } else {
            toast.error("failed to get file names")
        }
    }
    const ingestFiles = async () => {
        const headers = new Headers();
        headers.append("Content-Type", "application/json");

        const session = await getSession();
        const response = await fetch(getBackendOrigin() + "/api/integrations/googledrive/ingest-files", {
            method: "POST",
            body: JSON.stringify({ email: session?.user?.email }),
            headers: headers
        });

        if (response.status === 200) {
            toast.success("ingestion triggered");
        } else {
            toast.error("failed to get file names")
        }
    }

    const handleSearch = async () => {
        const headers = new Headers();
        headers.append("Content-Type", "application/json");

        const session = await getSession();
        const response = await fetch(getBackendOrigin() + "/api/integrations/googledrive/search", {
            method: "POST",
            body: JSON.stringify({ email: session?.user?.email, search: search }),
            headers: headers
        });

        if (response.status === 200) {
            const body = await response.json();
            console.log(body);
        } else {
            toast.error("failed to search");
        }
    }

    return (
        <div className="absolute top-40 left-0 z-10 w-[50rem] h-96 p-4 items-center bg-stone-200 border-2 border-stone-300 rounded-lg flex flex-col space-y-6 justify-start">
            <div className="flex space-x-2">
                <button className={"p-2 px-4 text-center flex bg-green-200 hover:bg-green-400 shadow-2xl rounded-2xl items-center justify-center font-['Helvetica'] w-fit border-2 border-gray-400 basis-1/2"}
                    onClick={listFiles}>
                    <Image
                        className="rounded-xl"
                        src="/santa-list.png"
                        alt="Google Logo"
                        width={40}
                        height={40}
                        priority
                    />
                    List files
                </button>
                <button className={"p-2 px-4 text-center flex bg-green-200 hover:bg-green-400 shadow-2xl rounded-2xl items-center justify-center font-['Helvetica'] w-fit border-2 border-gray-400 basis-1/2"}
                    onClick={ingestFiles}>
                    <Image
                        className="rounded-xl"
                        src="/kirby-digest.png"
                        alt="Google Logo"
                        width={40}
                        height={40}
                        priority
                    />
                    Ingest files
                </button>
            </div>
            <form>
                <label>Search Drive files:
                    <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                        className="mx-2 px-2 rounded-lg" />
                </label>
            </form>
            <button className={"p-2 px-4 text-center flex bg-blue-200 hover:bg-green-400 shadow-2xl rounded-2xl items-center justify-center font-['Helvetica'] w-fit border-2 border-gray-400 "}
                onClick={handleSearch}>
                <Image
                    className="rounded-xl"
                    src="/dog-search.webp"
                    alt="Google Logo"
                    width={40}
                    height={40}
                    priority
                />
                Search!
            </button>
        </div>
    );
};
