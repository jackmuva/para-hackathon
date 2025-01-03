import { getSession } from "@/app/components/ui/integration/auth-action";
import { toast } from "react-toastify";
import { getBackendOrigin } from "@/app/utlities/util";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ContactTable } from "./contacts-table";
import { ContactForm } from "./contact-form";

export const SalesforcePanel = () => {
    const [contacts, setContacts] = useState([]);
    const [openForm, setOpenForm] = useState(false);

    useEffect(() => {
        retrieveContacts();
    }, []);

    const listAccounts = async () => {
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

    const retrieveContacts = async () => {
        const headers = new Headers();
        headers.append("Content-Type", "application/json");

        const session = await getSession();
        const response = await fetch(getBackendOrigin() + "/api/integrations/salesforce/contacts", {
            method: "POST",
            body: JSON.stringify({ email: session?.user?.email }),
            headers: headers
        });

        if (response.status === 200) {
            const body = await response.json();
            setContacts(body.results);
        } else {
            toast.error("failed to retrieve contacts");
        }
    }

    const toggleContactForm = () => {
        setOpenForm(!openForm);
    }

    return (
        <div className="absolute top-40 left-0 z-10 w-[50rem] h-fit p-4 items-center bg-stone-200 border-2 border-stone-300 rounded-lg flex flex-col space-y-6 justify-start">
            <div className="flex space-x-2">
                <button className={"p-2 px-4 text-center flex bg-green-200 hover:bg-green-400 shadow-2xl rounded-2xl items-center justify-center font-['Helvetica'] w-fit border-2 border-gray-400 basis-1/2"}
                    onClick={listAccounts}>
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
                    Import Contacts
                </button>
                <button className={"p-2 px-4 text-center flex bg-green-200 hover:bg-green-400 shadow-2xl rounded-2xl items-center justify-center font-['Helvetica'] w-fit border-2 border-gray-400 basis-1/2"}
                    onClick={toggleContactForm}>
                    <Image
                        className="rounded-xl"
                        src="/contact.png"
                        alt="Google Logo"
                        width={40}
                        height={40}
                        priority
                    />
                    Create New Contact
                </button>

            </div>
            {!openForm && <ContactTable contacts={contacts} />}
            {openForm && <ContactForm toggle={toggleContactForm} />}
        </div>
    );
};

