'use strict';

const Koa = require('koa'),
    mount = require('koa-mount'),
    CSRF = require('koa-csrf'),
    bodyParser = require('koa-bodyparser'),
    LC = require('leanengine');

const app = require('./app'),
    server = new Koa(),
    {
        LEANCLOUD_APP_ID,
        LEANCLOUD_APP_KEY,
        LEANCLOUD_APP_MASTER_KEY,
        LEANCLOUD_APP_PORT
    } = process.env;

LC.init({
    appId: LEANCLOUD_APP_ID,
    appKey: LEANCLOUD_APP_KEY,
    masterKey: LEANCLOUD_APP_MASTER_KEY
});

server.use(async (context, next) => {
    try {
        await next();
    } catch (error) {
        console.error(error);

        context.body = error.message;
    }
});

server.use(LC.koa2());

server.use(new CSRF());

server.use(
    LC.Cloud.CookieSession({
        framework: 'koa2',
        secret: LEANCLOUD_APP_KEY,
        maxAge: 3600000,
        fetchUser: true
    })
);

server.use(bodyParser());

server.use(mount(app));

server.listen(LEANCLOUD_APP_PORT);
