import Koa from 'koa';
import { get, post } from 'koa-route';
import mount from 'koa-mount';

import { requireSession } from './utility';
import { proxy } from './utility/GitHub';

import * as Session from './session';
import { update, search } from './activity';
import * as Form from './form';

import { scheduleJob, RecurrenceRule } from 'node-schedule';

export const app = new Koa()
    .use(get('/', Session.entry))
    .use(get('/OAuth', context => Session[context.query.source](context)))
    .use(
        mount(
            '/github',
            new Koa().use(
                requireSession(
                    proxy(async ({ currentUser }) => {
                        await currentUser.fetch();

                        return currentUser.get('authData').github.access_token;
                    })
                )
            )
        )
    )
    .use(post('/activity/update', requireSession(update)))
    .use(get('/activity', search))
    .use(
        post(
            '/form',
            requireSession(context =>
                Form[context.query.source].create(context)
            )
        )
    )
    .use(get('/form', Form.searchForm))
    .use(post('/form/:OID/reply', Form.createReply.bind(null, Form)))
    .use(get('/form/:fid/reply/:id', Form.queryReply.bind(null, Form)))
    .use(get('/form/:id', Form.queryForm.bind(null, Form)))
    .use(get('/form/:id/statistic', Form.queryStatistic));

const rule = new RecurrenceRule();

rule.hour = 1;

scheduleJob(rule, () => update({ query: {} }));
