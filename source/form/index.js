import LC from 'leanengine';

import * as JSJ from './JinShuJu';

import { searchQuery, count } from '../utility';

export const JinShuJu = JSJ;

export async function queryReply(Form, context, fid, id) {
    const { source } = context.query;

    const { query } = Form[source];

    var reply = await new LC.Query('FormReply')
        .equalTo('source', source)
        .equalTo('form_id', fid)
        .equalTo('id', +id)
        .include('form')
        .first();

    if (!reply)
        throw Object.assign(
            new URIError(`${fid}/${id} isn't found in ${source}`),
            { code: 404 }
        );

    context.body = query(reply.toJSON());
}

export async function queryForm(vendor, context, id) {
    const { source } = context.query;

    const { query } = vendor[source];

    const form = (await new LC.Query('Form')
        .equalTo('id', id)
        .first()).toJSON();

    const list = await new LC.Query('FormReply')
        .equalTo('source', source)
        .equalTo('form_id', id)
        .find();

    form.replies = list.map(item => {
        item = item.toJSON();
        item.form = form;

        item = query(item);
        delete item.form;
        delete item.user;

        return item;
    });

    context.body = form;
}

export async function searchForm(context) {
    const { keywords, page = 1, rows = 10 } = context.query;

    context.body = await (keywords
        ? searchQuery('Form', ['name', 'description', 'source'], keywords)
        : new LC.Query('Form')
    )
        .skip((page - 1) * rows)
        .limit(rows)
        .find();
}

const FormStatistic = LC.Object.extend('FormStatistic');

LC.Cloud.afterSave('FormReply', async ({ object }) => {
    const { source, form_id } = object.toJSON();

    const list = await new LC.Query('FormReply')
        .equalTo('source', source)
        .equalTo('form_id', form_id)
        .find();

    const statistic = await new LC.Query('FormStatistic')
        .equalTo('source', source)
        .equalTo('form_id', form_id)
        .first();

    await (statistic || new FormStatistic()).save({
        source,
        form_id,
        data: count(
            list
                .map(item =>
                    Object.entries(item.toJSON().data).filter(([key]) =>
                        key.startsWith('field_')
                    )
                )
                .flat()
        )
    });
});

export async function queryStatistic(context, id) {
    const { source } = context.query;

    context.body = await new LC.Query('FormStatistic')
        .equalTo('source', source)
        .equalTo('form_id', id)
        .first();
}
