import { URLSearchParams } from 'url';

import { request, errorHandler } from '.';

export function OAuth(client_id, client_secret, onDone) {
    return async context => {
        const { code, state } = context.query;

        var response = await request(
            'https://github.com/login/oauth/access_token',
            {
                method: 'POST',
                body: new URLSearchParams({
                    client_id,
                    client_secret,
                    code,
                    state
                }),
                errorHandler
            }
        );

        const body = Object.fromEntries(
            new URLSearchParams(await response.text()).entries()
        );

        if (body.scope) body.scope = body.scope.split(',');

        response = await request('https://api.github.com/user', {
            headers: {
                Authorization: `token ${body.access_token}`,
                Accept: 'application/json'
            },
            errorHandler
        });

        body.user = await response.json();

        await onDone(context, body, state);
    };
}

export function proxy(tokenGetter) {
    return async context => {
        const { url, method, headers, body } = context.request;

        delete headers.host;
        headers.Authorization = 'token ' + (await tokenGetter(context));

        const response = await request('https://api.github.com' + url, {
            method,
            headers,
            body: Object.keys(body)[0] ? body : null
        });

        (context.status = response.status),
        (context.body = await response.json());
    };
}
