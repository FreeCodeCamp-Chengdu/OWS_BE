import './WebServer';
import './TaskScheduler';
import './MailClient';

process.on('unhandledRejection', (reason: string | Error) =>
    console.error(reason)
);
