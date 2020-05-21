import { Object as LCObject, Query } from 'leanengine';
import updateEvents, { Event } from '@fcc-cdc/it-events';
import { JsonController, QueryParam, Get } from 'routing-controllers';

class Activity extends LCObject {}

interface EventData extends Event {
    objectId: string;
    createdAt: string;
    updatedAt: string;
}

export async function update(interval?: number) {
    const list = (
        await new Query(Activity)
            .greaterThanOrEqualTo('start', new Date())
            .limit(1000)
            .find()
    ).map(item => item.toJSON() as EventData);

    for await (const {
        objectId,
        createdAt,
        updatedAt,
        link,
        banner,
        ...rest
    } of updateEvents(list, interval)) {
        const data = objectId
            ? LCObject.createWithoutData('Activity', objectId)
            : new Activity();

        await data.save({ link: link + '', banner: banner + '', ...rest });
    }
}

@JsonController('/activity')
export class ActivityController {
    @Get()
    search(
        @QueryParam('keywords') keywords: string,
        @QueryParam('page') page = 1,
        @QueryParam('rows') rows = 10,
        @QueryParam('from') from: string,
        @QueryParam('to') to: string
    ) {
        const query = keywords
            ? Query.or(
                  new Query(Activity).contains('title', keywords),
                  new Query(Activity).contains('address', keywords)
              )
            : new Query(Activity);

        if (from) query.greaterThanOrEqualTo('start', new Date(from));

        if (to) query.lessThanOrEqualTo('start', new Date(to));

        return query
            .addDescending('start')
            .addDescending('end')
            .limit(rows)
            .skip((page - 1) * rows)
            .find();
    }
}
