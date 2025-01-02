export const ContactTable = ({ contacts }: { contacts: Array<any> }) => {

    const contact_table = contacts.map((contact: Array<string>) => {
        return (
            <tr className="border-2 hover:bg-stone-300">
                <td className="p-4">{contact[0]}</td>
                <td>{contact[1]}</td>
                <td>{contact[2]}</td>
            </tr>
        );
    });

    return (
        <table className="border border-indigo-700 bg-stone-100">
            <thead className="border-2 bg-indigo-100">
                <tr>
                    <th>Full Name</th>
                    <th>Title</th>
                    <th>Email</th>
                </tr>
            </thead>
            <tbody>
                {contact_table}
            </tbody>
        </table>
    );
}
