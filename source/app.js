import 'core-js/es/object';

import Koa from 'koa';

import { get, post } from 'koa-route';

import { User, SearchQuery } from 'leanengine';

import { OAuth } from './GitHub';

import { update } from './activity';

export const app = new Koa();

app.use(
    get(
        '/GitHub/OAuth',
        OAuth(async (context, body) => {
            const user = await User.loginWithAuthData(
                {
                    access_token: body.access_token,
                    expires_in: 7200,
                    uid: body.user.id + '',
                    scope: body.scope + ''
                },
                'github'
            );

            await user.save(
                {
                    username: body.user.login,
                    email: body.user.email,
                    github: body.user
                },
                { user }
            );

            context.body = user.get('github');
        })
    )
)
    .use(post('/activity/update', update))
    .use(
        get('/activity', async context => {
            const search = new SearchQuery('Activity');

            context.body = await search
                .queryString(context.query.keywords)
                .find();
        })
    )
    .use(context => (context.body = 'Hello, FCC-CDC!'));
