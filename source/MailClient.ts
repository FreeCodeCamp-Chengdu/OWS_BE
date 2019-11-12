import notifier, { Email } from 'mail-notifier';
import MikeCRM from './controller/MikeCRM';

const { ADMIN_EMAIL, ADMIN_EMAIL_PW, IMAP_HOST, NOTIFIER_EMAIL } = process.env;

notifier({
    user: ADMIN_EMAIL,
    password: ADMIN_EMAIL_PW,
    host: IMAP_HOST,
    port: 993,
    tls: true,
    tlsOptions: { rejectUnauthorized: false }
})
    .on('mail', ({ from, html }: Email) => {
        if (!from.find(({ address }) => address === NOTIFIER_EMAIL)) return;

        const controller = new MikeCRM();

        return controller.createUser(html);
    })
    .start();
