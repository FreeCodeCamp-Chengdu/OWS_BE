"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

require("@babel/polyfill");

require("core-js/es");

var _koa = _interopRequireDefault(require("koa"));

var _koaLogger = _interopRequireDefault(require("koa-logger"));

var _koaMount = _interopRequireDefault(require("koa-mount"));

var _cors = _interopRequireDefault(require("@koa/cors"));

var _koaBodyparser = _interopRequireDefault(require("koa-bodyparser"));

var _leanengine = _interopRequireDefault(require("leanengine"));

var _app = require("./app");

//import CSRF from 'koa-csrf';
const server = new _koa.default(),
      {
  LEANCLOUD_APP_ID,
  LEANCLOUD_APP_KEY,
  LEANCLOUD_APP_MASTER_KEY,
  LEANCLOUD_APP_PORT
} = process.env;

_leanengine.default.init({
  appId: LEANCLOUD_APP_ID,
  appKey: LEANCLOUD_APP_KEY,
  masterKey: LEANCLOUD_APP_MASTER_KEY
});

server.use((0, _koaLogger.default)()).use(async (context, next) => {
  try {
    await next();
  } catch (error) {
    console.error(error);
    context.status = error.code || 500, context.body = error.message;
  }
}).use(_leanengine.default.koa2()) //    .use(new CSRF())
.use(_leanengine.default.Cloud.CookieSession({
  framework: 'koa2',
  secret: LEANCLOUD_APP_KEY,
  maxAge: 3600000
})).use((0, _cors.default)()).use((0, _koaBodyparser.default)()).use((0, _koaMount.default)(_app.app)).listen(LEANCLOUD_APP_PORT);
//# sourceMappingURL=index.js.map