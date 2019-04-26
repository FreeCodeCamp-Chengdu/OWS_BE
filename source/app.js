import Koa from 'koa';
import { get, post } from 'koa-route';

import * as Session from './session';
import { update, search } from './activity';
import * as Form from './form';

import { scheduleJob, RecurrenceRule } from 'node-schedule';

export const app = new Koa()
    .use(get('/', Session.entry))
    .use(get('/OAuth', context => Session[context.query.source](context)))
    .use(post('/activity/update', update))
    .use(get('/activity', search))
    .use(post('/form', context => Form[context.query.source].create(context)))
    .use(
        post('/form/reply', context =>
            Form[context.query.source].reply(context)
        )
    );

const rule = new RecurrenceRule();

rule.hour = 1;

scheduleJob(rule, () => update({ query: {} }));
