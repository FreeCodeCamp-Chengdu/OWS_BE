import 'ts-polyfill/lib/es2019-object';
import { JSDOM } from 'jsdom';
import LC from 'leanengine';

const UserTemp = LC.Object.extend('UserTemp'),
    number_pattern = /[\d\.]+/,
    ID_pattern = /[\w\-]+/;

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

    static parseOrder(box: Element) {
        const [orderId, orderList] = Array.from(
            box.querySelector('tbody').children
        );

        const list = Array.from(
            orderList.querySelectorAll('tr'),
            ({ children }) => ({
                name: children[0].textContent.trim(),
                count: +number_pattern.exec(children[1].textContent)[0],
                price: +number_pattern.exec(children[2].textContent)[0]
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

        const body = Array.from(
            document.querySelectorAll('.mk_mailBody > td > table > tbody > tr')
        );

        const fields = body.slice(-4)[0].querySelectorAll('tbody tr');

        if (body.length > 6) var order = this.parseOrder(body[2]);

        return {
            ...this.parseMeta(body[1]),
            title: document
                .querySelector('.mk_mailTitle + p > span')
                .textContent.trim(),
            order,
            fields: Object.fromEntries(
                Array.from(fields, ({ children }) => {
                    const content = children[1].children[0]
                        ? Array.from(children[1].children, ({ textContent }) =>
                              textContent.trim()
                          ).filter(Boolean)
                        : children[1].textContent.trim();

                    return [
                        children[0].textContent.trim(),
                        content.length > 1 ? content : content[0]
                    ];
                })
            )
        };
    }

    saveUser(HTML: string) {
        const { title, fields, order, ...meta } = MikeCRM.parseMail(HTML);

        console.group(title);
        console.log(meta);
        console.log(fields);
        console.log(order);
        console.groupEnd();

        return new UserTemp().save({
            username: fields['姓名'],
            gender: fields['性别'],
            mobilePhoneNumber: fields['手机'],
            GitHub: fields['GitHub ID'],
            company: fields['公司/组织'],
            title: fields['职位'],
            workYear: parseInt(fields['工作经验'] as string)
        });
    }
}
