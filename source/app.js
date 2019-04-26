import Koa from 'koa';
import { get, post } from 'koa-route';

import { User } from 'leanengine';

import { OAuth } from './GitHub';
import { update, search } from './activity';

import { scheduleJob, RecurrenceRule } from 'node-schedule';

export const app = new Koa();

const { GITHUB_APP_ID, GITHUB_APP_SECRET } = process.env;

app.use(
    get(
        '/GitHub/OAuth',
        OAuth(GITHUB_APP_ID, GITHUB_APP_SECRET, async (context, body) => {
            const user = await User.loginWithAuthData(
                {
                    access_token: body.access_token,
                    expires_in: 7200,
                    uid: body.user.id + '',
                    scope: body.scope + ''
                },
                'github'
            );

            context.saveCurrentUser(user);

            await user.save(
                {
                    username: body.user.login,
                    email: body.user.email,
                    github: body.user
                },
                { user }
            );

            context.redirect('/?token=' + body.access_token);
        })
    )
)
    .use(post('/activity/update', update))
    .use(get('/activity', search))
    .use(
        context =>
            (context.body = `
<h1>Hello, ${
                context.currentUser
                    ? context.currentUser.get('username')
                    : 'FCC-CDC'
                }!</h1>
<a href="https://github.com/login/oauth/authorize?client_id=${GITHUB_APP_ID}&scope=user,repo">
    Sign in
</a>`)
    );

const rule = new RecurrenceRule();

rule.hour = 1;

scheduleJob(rule, () => update({ query: {} }));
