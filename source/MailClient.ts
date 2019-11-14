import notifier, { Email } from 'mail-notifier';
import { listen } from './utiltiy';
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

client.on('end', () => client.start()).start();

(async () => {
    for await (const { from, html } of listen<Email>(client, 'mail'))
        if (from.find(({ address }) => address === NOTIFIER_EMAIL))
            await new MikeCRM(html).saveUser();
})();
