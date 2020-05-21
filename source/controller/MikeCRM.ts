import 'ts-polyfill/lib/es2019-object';
import { Object as LCObject, Query } from 'leanengine';
import { JSDOM } from 'jsdom';

class UserTemp extends LCObject {}

const number_pattern = /[\d\.]+/,
    ID_pattern = /[\w\-]+/;

interface OrderItem {
    name?: string;
    count: number;
    price: number;
}

interface Order {
    id: string;
    paymentId: string;
    list: OrderItem[];
    sum: OrderItem;
}

export default class MikeCRM {
    static parseMeta(box: Element) {
        const [id, creator, location, date] = Array.from(
            box.querySelectorAll('td > span'),
            ({ textContent }) => textContent.trim()
        );

        return {
            id: +number_pattern.exec(id)[0],
            creator,
            location,
            date: new Date(date)
        };
    }

    static parseOrder(box: Element): Order {
        const [orderId, orderList] = Array.from(
            box.querySelector('tbody').children
        );

        const list = Array.from(
            orderList.querySelectorAll('tr'),
            ({
                children: [
                    { textContent: A },
                    { textContent: B },
                    { textContent: C }
                ]
            }) => ({
                name: A.trim(),
                count: +number_pattern.exec(B)[0],
                price: +number_pattern.exec(C)[0]
            })
        );

        return {
            id: ID_pattern.exec(orderId.querySelector('p').textContent)[0],
            paymentId: ID_pattern.exec(
                orderId.querySelector('p:last-child').textContent
            )[0],
            list,
            sum: list.reduce(
                (sum, { count, price }) => {
                    (sum.count += count), (sum.price += price);

                    return sum;
                },
                { count: 0, price: 0 }
            )
        };
    }

    static parseMail(HTML: string) {
        const {
            window: { document }
        } = new JSDOM(HTML);

        const body = [
            ...document.querySelectorAll(
                '.mk_mailBody > td > table > tbody > tr'
            )
        ];
        const fields = body.slice(-4)[0].querySelectorAll('tbody tr');

        if (body.length > 6) var order = this.parseOrder(body[2]);

        return {
            ...this.parseMeta(body[1]),
            title: document
                .querySelector('.mk_mailTitle + p > span')
                .textContent.trim(),
            order,
            fields: Object.fromEntries(
                Array.from(fields, ({ children: [A, B] }) => {
                    const content = B.children[0]
                        ? Array.from(B.children, ({ textContent }) =>
                              textContent.trim()
                          ).filter(Boolean)
                        : B.textContent.trim();

                    return [
                        A.textContent.trim(),
                        content.length > 1 ? content : content[0]
                    ];
                })
            )
        };
    }

    id: number;
    date: Date;
    location: string;
    creator: string;
    title: string;
    fields: any;
    order: Order;

    constructor(HTML: string) {
        Object.assign(this, MikeCRM.parseMail(HTML));
    }

    async saveUser() {
        const { title, fields, order, ...meta } = this;

        console.group(title);
        console.log(meta);
        console.log(fields);
        console.log(order);
        console.groupEnd();

        const data = {
            username: fields['姓名'],
            gender: fields['性别'],
            mobilePhoneNumber: fields['手机'],
            GitHub: fields['GitHub ID'],
            company: fields['公司/组织'],
            title: fields['职位'],
            workYear: parseInt(fields['工作经验'] as string)
        };

        const user = await new Query('UserTemp')
            .equalTo('mobilePhoneNumber', data.mobilePhoneNumber)
            .first();

        return !user ? new UserTemp().save(data) : user.set(data).save();
    }
}
