"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./WebServer");
require("./TaskScheduler");
require("./MailClient");
process.on('unhandledRejection', (reason) => console.error(reason));
//# sourceMappingURL=index.js.map