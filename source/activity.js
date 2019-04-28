import LC from 'leanengine';

import updateEvents from '@fcc-cdc/it-events';

import { searchQuery } from './utility';

const Activity = LC.Object.extend('Activity');

var fetching;

export async function update(context) {
    if (fetching)
        throw Object.assign(new Error('Crawler is running'), { code: 400 });

    fetching = 1;

    const list = (await new LC.Query('Activity')
        .greaterThanOrEqualTo('start', new Date())
        .limit(1000)
        .find()).map(item => item.toJSON());

    try {
        for await (let item of updateEvents(list, context.query.interval)) {
            const data = item.objectId
                ? LC.Object.createWithoutData('Activity', item.objectId)
                : new Activity();

            item.link = item.link + '';
            delete item.objectId;
            delete item.createdAt;
            delete item.updatedAt;

            await data.save(item, { user: context.currentUser });
        }
    } catch (error) {
        fetching = 0;

        throw error;
    }

    fetching = 0;
}

export async function search(context) {
    var { keywords, page = 1, rows = 10, from, to } = context.query;

    (from = new Date(from)), (to = new Date(to));

    const query = keywords
        ? searchQuery('Activity', ['title', 'address'], keywords)
        : new LC.Query('Activity');

    if (!isNaN(+from)) query.greaterThanOrEqualTo('start', from);

    if (!isNaN(+to)) query.lessThanOrEqualTo('start', to);

    context.body = await query
        .addDescending('start')
        .addDescending('end')
        .limit(rows)
        .skip((page - 1) * rows)
        .find();
}
