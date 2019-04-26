"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.entry = entry;
exports.GitHub = void 0;

var _leanengine = require("leanengine");

var _GitHub = require("./GitHub");

const {
  GITHUB_APP_ID,
  GITHUB_APP_SECRET
} = process.env;

function entry(context) {
  context.body = `
<h1>Hello, ${context.currentUser ? context.currentUser.get('username') : 'FCC-CDC'}!</h1>
<a href="https://github.com/login/oauth/authorize?client_id=${GITHUB_APP_ID}&scope=user,repo">
Sign in
</a>`;
}

const GitHub = (0, _GitHub.OAuth)(GITHUB_APP_ID, GITHUB_APP_SECRET, async (context, body) => {
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
});
exports.GitHub = GitHub;
//# sourceMappingURL=session.js.map