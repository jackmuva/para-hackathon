
export const SearchTable = ({ searchResults }: { searchResults: Array<[]> }) => {
    console.log(searchResults);
    const rows = searchResults.map((res: any) => {
        return (
            <div className="flex text-blue-800 font-semibold hover:text-blue-500 hover:-translate-y-0.5" id={res[0]} key={res[0]}>
                <a href={res[1]} target="_blank">{res[0]}</a>
            </div>
        );
    });
    console.log(rows);
    return (
        <div>
            {rows.length > 0 ? rows : <div>No results found</div>}
        </div>
    );
};
