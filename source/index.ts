import 'reflect-metadata';
import { createKoaServer } from 'routing-controllers';

import MainController from './Main';

const app = createKoaServer({
        cors: true,
        controllers: [MainController]
    }),
    port = parseInt(
        process.env.LEANCLOUD_APP_PORT || process.env.PORT || '8080'
    );

app.listen(port, () =>
    console.log('HTTP Server runs at http://localhost:' + port)
);
