import LC from 'leanengine';

import { JSDOM } from 'jsdom';

import { valueOf, updateRecord } from '../utility';

const Form = LC.Object.extend('Form'),
    Reply = LC.Object.extend('Reply');

async function parseForm(id) {
    const {
        window: { document }
    } = await JSDOM.fromURL('https://jinshuju.net/f/' + id);

    return {
        source: 'JinShuJu',
        id,
        name: document.querySelector('h1.form-title').textContent.trim(),
        description: document
            .querySelector('.form-description')
            .innerHTML.trim(),
        fields: Array.from(document.querySelectorAll('.field'), item => {
            const { fieldType, apiCode, label } = item.dataset;

            const description = item.querySelector('.field-description');

            if (fieldType !== 'page-break')
                for (let key in item.dataset)
                    return {
                        type: fieldType.replace(/-field$/, ''),
                        key: apiCode,
                        label,
                        description:
                            description && description.innerHTML.trim(),
                        defaultValue: valueOf(item)
                    };
        }).filter(Boolean)
    };
}

export async function create(context) {
    const { id } = context.request.body;

    const form = await new LC.Query('Form').equalTo('id', id).first();

    await (form || new Form()).save(await parseForm(id));

    (context.status = 201), (context.body = '');
}

export async function reply(context) {
    const {
        form,
        entry: {
            info_browser,
            info_os,
            info_remote_ip,
            serial_number,
            ...extra
        }
    } = context.request.body;

    const meta = await new LC.Query('Form')
        .equalTo('source', 'JinShuJu')
        .equalTo('id', form)
        .first();

    if (!meta)
        throw Object.assign(new URIError(form + ' not found'), {
            code: 404
        });

    var fields = meta.get('fields'),
        data = {},
        user;

    for (let key in extra) {
        const field = fields.find(item => item.key === key);

        if (field)
            switch (field.type) {
                case 'email':
                    (user = user || {}), (user.email = extra[key]);
                    break;
                case 'mobile':
                    (user = user || {}), (user.mobilePhoneNumber = extra[key]);
            }
        data[key] = extra[key];
    }

    if (user)
        user = await updateRecord('_User', user, {
            user: context.currentUser,
            useMasterKey: true
        });

    await new Reply().save({
        source: 'JinShuJu',
        form: meta,
        form_id: form,
        id: serial_number,
        system: info_os,
        browser: info_browser,
        IPA: info_remote_ip,
        user,
        data
    });

    (context.status = 201), (context.body = '');
}

export function query(reply) {
    var {
        data,
        form: { fields },
        user: { username, email, mobilePhoneNumber }
    } = reply;

    const user = {
        username,
        email,
        mobile: mobilePhoneNumber
    };

    return {
        ...reply,
        user,
        data: Object.entries(Object.assign(data, user)).map(([key, value]) => ({
            key,
            value,
            ...fields.find(item => item.key === key || item.type === key)
        }))
    };
}
