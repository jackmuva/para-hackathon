export const ContactForm = () => {

    return (
        <div>
            <form className="flex flex-col space-y-2 items-center">
                <div>
                    <label className="mr-2">Full Name: </label>
                    <input type="text" className="rounded px-2" />
                </div>
                <div>
                    <label className="mr-2">Title: </label>
                    <input type="text" className="rounded px-2" />
                </div>
                <div>
                    <label className="mr-2">Email: </label>
                    <input type="email" className="rounded px-2" />
                </div>
            </form>
        </div>
    );
};
