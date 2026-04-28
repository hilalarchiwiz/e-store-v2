type Props = {
    search: string | undefined,
    totalCount: number | undefined,
}

const SearchMessage = ({ search, totalCount }: Props) => {
    return (
        <>
            {search && (
                <p className="text-sm text-gray-700 mb-4">
                    Showing {totalCount} results for: <span className="font-semibold">"{search}"</span>
                </p>
            )}
        </>
    )
}

export default SearchMessage