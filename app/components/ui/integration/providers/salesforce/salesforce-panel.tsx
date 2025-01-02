import { getSession } from "@/app/components/ui/integration/auth-action";
import { toast } from "react-toastify";
import { getBackendOrigin } from "@/app/utlities/util";
import Image from "next/image";
import { useState } from "react";

export const SalesforcePanel = () => {
    const [search, setSearch] = useState<string>("");

    const listContacts = async () => {
        const headers = new Headers();
        headers.append("Content-Type", "application/json");

        const session = await getSession();
        const response = await fetch(getBackendOrigin() + "/api/integrations/salesforce/soql", {
            method: "POST",
            headers: headers,
            body: JSON.stringify({ email: session?.user?.email })
        });
        console.log(response);
        if (response.status === 200) {
            const body = await response.json();
            console.log(body);
            let result = "";
            body.accounts.records.forEach((account: any) => {
                result += account.Name + ", ";
            })
            toast.success(result);
        } else {
            toast.error("unable to successfully get accounts")
        }
    }

    const syncContacts = async () => {
        const headers = new Headers();
        headers.append("Content-Type", "application/json");

        const session = await getSession();
        const response = await fetch(getBackendOrigin() + "/api/integrations/salesforce/initial-sync", {
            method: "POST",
            headers: headers,
            body: JSON.stringify({ email: session?.user?.email })
        });
        console.log(response);
        if (response.status === 200) {
            toast.success("Importing SF Contacts");
        } else {
            toast.error("unable to successfully get accounts")
        }

    }

    const handleSearch = async () => {

    };


    return (
        <div className="absolute top-40 left-0 z-10 w-[50rem] h-fit p-4 items-center bg-stone-200 border-2 border-stone-300 rounded-lg flex flex-col space-y-6 justify-start">
            <div className="flex space-x-2">
                <button className={"p-2 px-4 text-center flex bg-green-200 hover:bg-green-400 shadow-2xl rounded-2xl items-center justify-center font-['Helvetica'] w-fit border-2 border-gray-400 basis-1/2"}
                    onClick={listContacts}>
                    <Image
                        className="rounded-xl"
                        src="/santa-list.png"
                        alt="Google Logo"
                        width={40}
                        height={40}
                        priority
                    />
                    List Accounts
                </button>
                <button className={"p-2 px-4 text-center flex bg-green-200 hover:bg-green-400 shadow-2xl rounded-2xl items-center justify-center font-['Helvetica'] w-fit border-2 border-gray-400 basis-1/2"}
                    onClick={syncContacts}>
                    <Image
                        className="rounded-xl"
                        src="/cargo-ship.png"
                        alt="Google Logo"
                        width={40}
                        height={40}
                        priority
                    />
                    Import Salesforce Contacts
                </button>
            </div>
            <form>
                <label>Search For Contacts By Name:
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

