import LC from 'leanengine';

import updateEvents from '@fcc-cdc/it-events';

const query = new LC.Query('Activity'),
    Activity = LC.Object.extend('Activity');

var fetching;

export async function update(context) {
    if (fetching) throw new RangeError('Crawler is running');

    fetching = 1;

    const list = (await query.find()).map(item => item.toJSON());

    try {
        for await (let item of updateEvents(list, context.query.interval)) {
            const data = item.objectId
                ? LC.Object.createWithoutData('Activity', item.objectId)
                : new Activity();

            item.link = item.link + '';

            await data.save(item);
        }
    } catch (error) {
        fetching = 0;

        throw error;
    }

    fetching = 0;
}

export async function search(context) {
    const { keywords } = context.query,
        query = new LC.Query('Activity');

    if (keywords)
        query.contains('title', keywords).contains('address', keywords);

    context.body = await query
        .addDescending('start')
        .addDescending('end')
        .limit(20)
        .find();
}
