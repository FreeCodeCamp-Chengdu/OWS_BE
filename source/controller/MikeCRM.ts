import 'ts-polyfill/lib/es2019-object';
import { JSDOM } from 'jsdom';
import LC from 'leanengine';

const UserTemp = LC.Object.extend('UserTemp');

export default class MikeCRM {
    static parseMail(HTML: string) {
        const {
            window: { document }
        } = new JSDOM(HTML);

        const title = document.querySelector('.mk_mailTitle + p > span'),
            body = Array.from(
                document.querySelectorAll(
                    '.mk_mailBody > td > table > tbody > tr'
                )
            );

        const meta = Array.from(body[1].querySelectorAll('tbody'))
                .slice(-1)[0]
                .querySelectorAll('td'),
            data = body.slice(-4)[0].querySelectorAll('tbody tr');

        return {
            title: title && title.textContent.trim(),
            meta: Object.fromEntries(
                Array.from(meta, ({ firstChild, firstElementChild }) => [
                    firstChild.nodeValue.trim().slice(0, -1),
                    firstElementChild.textContent.trim()
                ])
            ),
            data: Object.fromEntries(
                Array.from(data, ({ children }) => {
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
        const { title, meta, data } = MikeCRM.parseMail(HTML);

        console.group(title);
        console.log(meta);
        console.log(data);
        console.groupEnd();

        return new UserTemp().save({
            username: data['姓名'],
            gender: data['性别'],
            mobilePhoneNumber: data['手机'],
            GitHub: data['GitHub ID'],
            company: data['公司/组织'],
            title: data['职位'],
            workYear: parseInt(data['工作经验'] as string)
        });
    }
}
