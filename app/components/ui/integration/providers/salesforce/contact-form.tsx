import { getBackendOrigin } from "@/app/utlities/util";
import { useState } from "react";
import { toast } from "react-toastify";
import { getSession } from "../../auth-action";

export const ContactForm = () => {
    const [contact, setContact] = useState({ name: "", title: "", email: "" });

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
        console.log(contact);

        const session = await getSession();
        const response = await fetch(getBackendOrigin() + "/api/integrations/salesforce/new-contact", {
            method: "POST",
            headers: headers,
            body: JSON.stringify({ email: session?.user?.email, contact: contact })
        });
        if (response.status === 200) {
            toast.success("Contact Created");
        } else {
            toast.error("Could not create contact")
        }
    }

    return (
        <div>
            <form className="flex flex-col space-y-2 items-center">
                <div>
                    <label className="mr-2">Full Name: </label>
                    <input onChange={handleChange} name="name" value={contact.name} type="text" className="rounded px-2" />
                </div>
                <div>
                    <label className="mr-2">Title: </label>
                    <input onChange={handleChange} name="title" value={contact.title} type="text" className="rounded px-2" />
                </div>
                <div>
                    <label className="mr-2">Email: </label>
                    <input onChange={handleChange} name="email" value={contact.email} type="email" className="rounded px-2" />
                </div>
                <button onClick={handleSubmit}>Create</button>
            </form>
        </div>
    );
};
