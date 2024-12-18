import { SearchResult } from "./drive-panel";

export const SearchTable = ({ searchResults }: { searchResults: Array<SearchResult> }) => {
    console.log(searchResults);
    const rows = searchResults.map((res: SearchResult) => {
        return (
            <div className="flex space-x-4" id={res.fileName} key={res.fileName}>
                <div>{res.fileName}</div>
                <div>{res.link}</div>
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
