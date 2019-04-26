import { Query } from 'leanengine';

import fetch from 'node-fetch';

export async function request(URI, { errorHandler, ...options }) {
    const response = await fetch(URI, options);

    if (response.status < 300) return response;

    const error = errorHandler
        ? await errorHandler(response)
        : Object.assign(new URIError(response.statusText), {
            code: response.status
        });

    error.response = response;

    throw error;
}

export async function errorHandler(response) {
    const body = await response.json();

    const error = new URIError(body.error_description);

    (error.code = response.status), (error.body = body);

    return error;
}

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
