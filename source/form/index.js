import { Query } from 'leanengine';

import * as JSJ from './JinShuJu';

export const JinShuJu = JSJ;

export async function queryReply(Form, context, fid, id) {
    const { source } = context.query;

    const { query } = Form[source];

    var reply = await new Query('Reply')
        .equalTo('source', source)
        .equalTo('form_id', fid)
        .equalTo('id', +id)
        .include('form', 'user')
        .first();

    if (!reply)
        throw Object.assign(
            new URIError(`${fid}/${id} isn't found in ${source}`),
            { code: 404 }
        );

    context.body = query(reply.toJSON());
}

export async function queryReplies(Form, context, id) {
    const { source } = context.query;

    const { query } = Form[source];

    const list = await new Query('Reply')
        .equalTo('source', source)
        .equalTo('form_id', id)
        .include('form', 'user')
        .find();

    context.body = list.map(item => query(item.toJSON()));
}
