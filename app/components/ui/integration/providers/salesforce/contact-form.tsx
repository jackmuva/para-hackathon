import { getBackendOrigin } from "@/app/utlities/util";
import { useState } from "react";
import { toast } from "react-toastify";
import { getSession } from "../../auth-action";

export const ContactForm = ({ toggle }: { toggle: () => void }) => {
    const [contact, setContact] = useState({ FirstName: "", LastName: "", Title: "", Email: "" });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setContact({
            ...contact,
            [name]: value,
        });
    }

    const handleSubmit = async () => {
        const headers = new Headers();
        headers.append("Content-Type", "application/json");

        const session = await getSession();
        const response = await fetch(getBackendOrigin() + "/api/integrations/salesforce/new-contact", {
            method: "POST",
            headers: headers,
            body: JSON.stringify({ email: session?.user?.email, contact: contact })
        });
        if (response.status === 200) {
            toast.success("Contact Created");
            toggle();
        } else {
            toast.error("Could not create contact")
        }
    }

    return (
        <div>
            <div className="flex flex-col space-y-2 items-center">
                <div>
                    <label className="mr-2">First Name: </label>
                    <input onChange={handleChange} name="FirstName" value={contact.FirstName} type="text" className="rounded px-2" />
                </div>
                <div>
                    <label className="mr-2">Last Name: </label>
                    <input onChange={handleChange} name="LastName" value={contact.LastName} type="text" className="rounded px-2" />
                </div>

                <div>
                    <label className="mr-2">Title: </label>
                    <input onChange={handleChange} name="Title" value={contact.Title} type="text" className="rounded px-2" />
                </div>
                <div>
                    <label className="mr-2">Email: </label>
                    <input onChange={handleChange} name="Email" value={contact.Email} type="email" className="rounded px-2" />
                </div>
                <button className="shadow-xl rounded-lg bg-blue-200 hover:-translate-y-0.5 py-2 px-4" onClick={handleSubmit}>Create</button>
            </div>
        </div>
    );
};
