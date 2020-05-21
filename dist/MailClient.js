"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mail_notifier_1 = __importDefault(require("mail-notifier"));
const iterable_observer_1 = require("iterable-observer");
const MikeCRM_1 = __importDefault(require("./controller/MikeCRM"));
const { ADMIN_EMAIL: user, ADMIN_EMAIL_PW: password, IMAP_HOST: host, NOTIFIER_EMAIL } = process.env;
const client = mail_notifier_1.default({
    user,
    password,
    host,
    port: 993,
    tls: true,
    tlsOptions: { rejectUnauthorized: false }
});
const newMail = iterable_observer_1.Observable.fromEvent(client, 'mail');
client.on('end', () => client.start()).start();
(async () => {
    for await (const { from, html } of newMail)
        if (from.find(({ address }) => address === NOTIFIER_EMAIL))
            await new MikeCRM_1.default(html).saveUser();
})();
//# sourceMappingURL=MailClient.js.map