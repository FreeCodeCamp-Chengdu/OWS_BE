import '@babel/polyfill';
import 'core-js/es';

import Koa from 'koa';
import Logger from 'koa-logger';
import mount from 'koa-mount';
import CORS from '@koa/cors';
import bodyParser from 'koa-bodyparser';
//import CSRF from 'koa-csrf';

import LC from 'leanengine';

import { app } from './app';

const server = new Koa(),
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

server
    .use(Logger())
    .use(async (context, next) => {
        try {
            await next();
        } catch (error) {
            console.error(error);

            (context.status = (error.context || '').status || 500),
            (context.body = error.message);
        }
    })
    .use(LC.koa2())
    //    .use(new CSRF())
    .use(
        LC.Cloud.CookieSession({
            framework: 'koa2',
            secret: LEANCLOUD_APP_KEY,
            maxAge: 3600000,
            fetchUser: true
        })
    )
    .use(CORS())
    .use(bodyParser())
    .use(mount(app))
    .listen(LEANCLOUD_APP_PORT);
