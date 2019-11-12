import 'ts-polyfill/lib/es2019-object';
import { JSDOM } from 'jsdom';
import { User } from 'leanengine';

export default class MikeCRM {
    static parseMail(HTML: string) {
        const {
            window: { document }
        } = new JSDOM(HTML);

        const title = document.querySelector('.mk_mailTitle + p > span'),
            meta = document.querySelectorAll(
                '.mk_mailBody tbody > tr:nth-child(2) tbody tbody > tr > td'
            ),
            data = document.querySelectorAll(
                '.mk_mailBody tbody > tr:nth-child(3) tbody tr'
            );

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

    createUser(HTML: string) {
        const { title, meta, data } = MikeCRM.parseMail(HTML);

        console.group(title);
        console.log(meta);
        console.log(data);
        console.groupEnd();

        return new User()
            .set({
                username: data['姓名'],
                gender: data['性别'],
                mobilePhoneNumber: data['手机'],
                mobilePhoneVerified: true,
                password: Date.now(),
                GitHub: data['GitHub ID'],
                company: data['公司/组织'],
                title: data['职位'],
                workYear: data['工作经验']
            })
            .signUp();
    }
}
