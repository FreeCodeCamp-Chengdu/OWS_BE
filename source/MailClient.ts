import notifier, { Email } from 'mail-notifier';
import MikeCRM from './controller/MikeCRM';

const { ADMIN_EMAIL, ADMIN_EMAIL_PW, IMAP_HOST, NOTIFIER_EMAIL } = process.env;

const client = notifier({
    user: ADMIN_EMAIL,
    password: ADMIN_EMAIL_PW,
    host: IMAP_HOST,
    port: 993,
    tls: true,
    tlsOptions: { rejectUnauthorized: false }
});

client
    .on('mail', ({ from, html }: Email) => {
        if (from.find(({ address }) => address === NOTIFIER_EMAIL))
            return new MikeCRM(html).saveUser();
    })
    .on('end', () => client.start())
    .start();
