import notifier, { Email } from 'mail-notifier';
import { Observable } from 'iterable-observer';

import MikeCRM from './controller/MikeCRM';

const {
    ADMIN_EMAIL: user,
    ADMIN_EMAIL_PW: password,
    IMAP_HOST: host,
    NOTIFIER_EMAIL
} = process.env;

const client = notifier({
    user,
    password,
    host,
    port: 993,
    tls: true,
    tlsOptions: { rejectUnauthorized: false }
});

const newMail = Observable.fromEvent<Email>(client, 'mail');

client.on('end', () => client.start()).start();

(async () => {
    for await (const { from, html } of newMail)
        if (from.find(({ address }) => address === NOTIFIER_EMAIL))
            await new MikeCRM(html).saveUser();
})();
