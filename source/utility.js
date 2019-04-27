import LC from 'leanengine';

import fetch from 'node-fetch';

/**
 * @param {String|URL}       URI
 * @param {Object}           [options={}]           - https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch#Parameters
 * @param {HTTPErrorHandler} [options.errorHandler]
 *
 * @return {Response} https://developer.mozilla.org/en-US/docs/Web/API/Response
 *
 * @throw {URIError} With a `response` property
 */
export async function request(URI, { errorHandler, ...options } = {}) {
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

/**
 * @typedef {Function} HTTPErrorHandler
 *
 * @param {Response} response
 *
 * @return {Error}
 */
export async function errorHandler(response) {
    const body = await response.json();

    const error = new URIError(body.error_description);

    (error.code = response.status), (error.body = body);

    return error;
}

/**
 * @param {HTMLElement} field
 *
 * @return {String|String[]}
 */
export function valueOf(field) {
    var input = field.querySelector(
        'input[name]:not([type="radio"], [type="checkbox"]), textarea[name]'
    );

    if (input) return input.value;

    input = field.querySelector('select[name]');

    if (input)
        return Array.from(input.options, ({ value }) => value).filter(Boolean);

    input = field.querySelectorAll(
        'input[name][type="radio"], input[name][type="checkbox"]'
    );

    if (input[0])
        return Array.from(input, ({ value }) => value).filter(Boolean);
}

/**
 * @param {String}   table
 * @param {String[]} keys
 * @param {String}   words
 *
 * @return {AV.Query} https://leancloud.github.io/javascript-sdk/docs/AV.Query.html
 */
export function searchQuery(table, keys, words) {
    return LC.Query.or(
        ...words
            .split(/\s+/)
            .map(word =>
                keys.map(key => new LC.Query(table).contains(key, word))
            )
            .flat()
    );
}

/**
 * @param {String} table
 * @param {Object} data
 * @param {Object} [options] - https://leancloud.github.io/javascript-sdk/docs/global.html#AuthOptions
 *
 * @return {AV.Object} https://leancloud.github.io/javascript-sdk/docs/AV.Object.html
 */
export async function updateRecord(table, data, options) {
    var record = await searchQuery(
        table,
        Object.keys(data),
        Object.values(data).join(' ')
    ).first();

    record = record || new (LC.Object.extend(table))();

    await record.save(data, options);

    return record;
}
