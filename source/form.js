import LC from 'leanengine';

import { request, errorHandler } from './utility';

const Form = LC.Object.extend('Form'),
    Reply = LC.Object.extend('Reply');

export const JinShuJu = {
    async create(context) {
        const { id, user, key } = context.request.body;

        const data = await (await request(
            `https://${user}:${key}@jinshuju.net/api/v1/forms/${id}`,
            { errorHandler }
        )).json();

        (data.source = 'JinShuJu'), (data.form = id);

        await new Form().save(data);

        (context.status = 201), (context.body = '');
    },
    async reply(context) {
        const { form } = context.request.body;

        const meta = await new LC.Query('Form')
            .equalTo('source', 'JinShuJu')
            .equalTo('form', form)
            .find();

        if (!meta[0])
            throw Object.assign(new URIError(form + ' not found'), {
                code: 400
            });

        await new Reply().save(
            Object.assign(
                { source: 'JinShuJu', form: meta[0] },
                context.request.body
            )
        );

        (context.status = 201), (context.body = '');
    }
};
