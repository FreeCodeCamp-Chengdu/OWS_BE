import 'reflect-metadata';
import { createKoaServer } from 'routing-controllers';
import { init, koa2 } from 'leanengine';

import MainController from './Main';
import SessionController from './Session';

const {
    LEANCLOUD_APP_ID: appId,
    LEANCLOUD_APP_KEY: appKey,
    LEANCLOUD_APP_MASTER_KEY: masterKey,
    PORT,
    LEANCLOUD_APP_PORT: appPort
} = process.env;

init({ appId, appKey, masterKey });

const app = createKoaServer({
        cors: true,
        middlewares: [koa2()],
        controllers: [MainController, SessionController]
    }),
    port = parseInt(appPort || PORT || '8080');

app.listen(port, () =>
    console.log('HTTP Server runs at http://localhost:' + port)
);
