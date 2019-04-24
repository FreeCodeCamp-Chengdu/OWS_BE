"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.app = void 0;

require("core-js/es/object");

var _koa = _interopRequireDefault(require("koa"));

var _koaRoute = require("koa-route");

var _leanengine = require("leanengine");

var _GitHub = require("./GitHub");

var _activity = require("./activity");

const app = new _koa.default();
exports.app = app;
app.use((0, _koaRoute.get)('/GitHub/OAuth', (0, _GitHub.OAuth)(async (context, body) => {
  const user = await _leanengine.User.loginWithAuthData({
    access_token: body.access_token,
    expires_in: 7200,
    uid: body.user.id + '',
    scope: body.scope + ''
  }, 'github');
  await user.save({
    username: body.user.login,
    email: body.user.email,
    github: body.user
  }, {
    user
  });
  context.body = user.get('github');
}))).use((0, _koaRoute.post)('/activity/update', _activity.update)).use((0, _koaRoute.get)('/activity', async context => {
  const search = new _leanengine.SearchQuery('Activity');
  context.body = await search.queryString(context.query.keywords).find();
})).use(context => context.body = 'Hello, FCC-CDC!');
//# sourceMappingURL=app.js.map