import { useGetAuthorsListQuery } from 'generated/graphql';
import { DateTime } from 'luxon';

interface Author {
    id: string;
    name: string;
    dateOfBirth?: DateTime;
    dateOfDeath?: DateTime;
}

export default function useAuthors(pageLimit: number, page: number) {
    const { data } = useGetAuthorsListQuery({
        variables: { first: pageLimit, page },
    });

    let authors: Author[] = [];

    if (data?.listAuthors) {
        authors = data.listAuthors.edges.map(({ node: author }) => ({
            id: author.id,
            name: `${author.firstName} ${author.lastName}`,
            dateOfBirth: author.dateOfBirth ? DateTime.fromISO(author.dateOfBirth) : undefined,
            dateOfDeath: author.dateOfDeath ? DateTime.fromISO(author.dateOfDeath) : undefined,
        }));
    }

    const pageInfo = {
        totalPages: Math.ceil((data?.listAuthors.pageInfo.totalEdges || 0) / pageLimit),
        hasNextPage: data?.listAuthors.pageInfo.hasNextPage || false,
        hasPreviousPage: data?.listAuthors.pageInfo.hasPreviousPage || false,
    };

    return { authors, pageInfo };
}
