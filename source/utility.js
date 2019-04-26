import { Query } from 'leanengine';

/**
 * @param {String}   table
 * @param {String[]} keys
 * @param {String}   words
 *
 * @return {Query}
 */
export function searchQuery(table, keys, words) {
    return Query.or(
        ...words
            .split(/\s+/)
            .map(word => keys.map(key => new Query(table).contains(key, word)))
            .flat()
    );
}
