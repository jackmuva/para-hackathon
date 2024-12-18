import { getSession } from "@/app/components/ui/integration/auth-action";
import { toast } from "react-toastify";
import { getBackendOrigin } from "@/app/utlities/util";

export const DrivePanel = () => {
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

    return (
        <div className="absolute top-40 left-0 z-10 w-[50rem] h-64 p-4 items-center bg-stone-200 border-2 border-stone-300 rounded-lg flex flex-col justify-start">
            <div className="flex space-x-2">
                <button className={"p-2 px-4 text-center flex bg-green-200 hover:bg-green-400 shadow-2xl rounded-2xl items-center justify-center font-['Helvetica'] w-fit border-2 border-gray-400 basis-1/2"}
                    onClick={listFiles}>
                    List files
                </button>
                <button className={"p-2 px-4 text-center flex bg-green-200 hover:bg-green-400 shadow-2xl rounded-2xl items-center justify-center font-['Helvetica'] w-fit border-2 border-gray-400 basis-1/2"}
                    onClick={ingestFiles}>
                    Ingest files
                </button>
            </div>
        </div>
    );
}

