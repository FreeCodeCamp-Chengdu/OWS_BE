"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.app = void 0;

var _koa = _interopRequireDefault(require("koa"));

var _koaRoute = require("koa-route");

var _leanengine = require("leanengine");

var _GitHub = require("./GitHub");

var _activity = require("./activity");

var _nodeSchedule = require("node-schedule");

const app = new _koa.default();
exports.app = app;
const {
  GITHUB_APP_ID,
  GITHUB_APP_SECRET
} = process.env;
app.use((0, _koaRoute.get)('/GitHub/OAuth', (0, _GitHub.OAuth)(GITHUB_APP_ID, GITHUB_APP_SECRET, async (context, body) => {
  const user = await _leanengine.User.loginWithAuthData({
    access_token: body.access_token,
    expires_in: 7200,
    uid: body.user.id + '',
    scope: body.scope + ''
  }, 'github');
  context.saveCurrentUser(user);
  await user.save({
    username: body.user.login,
    email: body.user.email,
    github: body.user
  }, {
    user
  });
  context.redirect('/?token=' + body.access_token);
}))).use((0, _koaRoute.post)('/activity/update', _activity.update)).use((0, _koaRoute.get)('/activity', _activity.search)).use(context => context.body = `
<h1>Hello, ${context.currentUser ? context.currentUser.get('username') : 'FCC-CDC'}!</h1>
<a href="https://github.com/login/oauth/authorize?client_id=${GITHUB_APP_ID}&scope=user,repo">
    Sign in
</a>`);
const rule = new _nodeSchedule.RecurrenceRule();
rule.hour = 1;
(0, _nodeSchedule.scheduleJob)(rule, () => (0, _activity.update)({
  query: {}
}));
//# sourceMappingURL=app.js.map