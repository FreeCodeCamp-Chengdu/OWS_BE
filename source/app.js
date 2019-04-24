'use strict';

require('core-js/es/object');

const Koa = require('koa'),
    mount = require('koa-mount'),
    { OAuth } = require('./GitHub'),
    { User } = require('leanengine');

const app = new Koa();

app.use(
    mount(
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
);

app.use(context => (context.body = 'Hello, FCC-CDC!'));

module.exports = app;
