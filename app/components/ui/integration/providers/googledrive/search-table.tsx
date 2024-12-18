
export const SearchTable = ({ searchResults }: { searchResults: Array<[]> }) => {
    console.log(searchResults);
    const rows = searchResults.map((res: any) => {
        return (
            <div className="flex space-x-4" id={res[0]} key={res[0]}>
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
