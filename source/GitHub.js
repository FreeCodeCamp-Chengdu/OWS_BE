import { URLSearchParams } from 'url';

import fetch from 'node-fetch';

async function handleError(context, body, onError) {
    const error = Object.assign(new URIError(body.error_description), {
        context,
        body
    });

    if (onError) await onError(context, error);
    else throw error;
}

export function OAuth(client_id, client_secret, onDone, onError) {
    onError = onError instanceof Function && onError;

    return async context => {
        var response = await fetch(
            'https://github.com/login/oauth/access_token',
            {
                method: 'POST',
                body: new URLSearchParams({
                    client_id,
                    client_secret,
                    code: context.query.code
                })
            }
        );

        const body = Object.fromEntries(
            new URLSearchParams(await response.text()).entries()
        );

        if (response.status > 299)
            return await handleError(context, body, onError);

        if (body.scope) body.scope = body.scope.split(',');

        response = await fetch('https://api.github.com/user', {
            headers: {
                Authorization: `token ${body.access_token}`,
                Accept: 'application/json'
            }
        });

        body.user = await response.json();

        if (response.status > 299) await handleError(context, body, onError);
        else await onDone(context, body);
    };
}
