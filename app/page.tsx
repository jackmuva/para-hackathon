import {getSession} from "@/app/components/ui/integration/auth-action";
import Login from "@/app/components/ui/integration/login";

export default async function Home() {
    let session = await getSession();

    return (
        <main className="pt-10 flex justify-center items-center background-gradient">
            {!session && <Login></Login>}
            {session && <div>You're logged in!</div>}
        </main>
    );
}
