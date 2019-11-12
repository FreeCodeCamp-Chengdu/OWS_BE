declare module 'mail-notifier' {
    interface NotifierOption {
        user: string;
        password: string;
        host: string;
        port: number;
        tls: boolean;
        tlsOptions: { rejectUnauthorized: boolean };
    }

    export default function notifier(options: NotifierOption): any;

    interface Account {
        address: string;
        name: string;
    }

    export interface Email {
        date: Date;
        from: Account[];
        to: Account[];
        subject: string;
        html: string;
        text: string;
    }
}
