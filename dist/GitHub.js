"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.OAuth = OAuth;

var _url = require("url");

var _utility = require("./utility");

function OAuth(client_id, client_secret, onDone) {
  return async context => {
    var response = await (0, _utility.request)('https://github.com/login/oauth/access_token', {
      method: 'POST',
      body: new _url.URLSearchParams({
        client_id,
        client_secret,
        code: context.query.code
      }),
      errorHandler: _utility.errorHandler
    });
    const body = Object.fromEntries(new _url.URLSearchParams((await response.text())).entries());
    if (body.scope) body.scope = body.scope.split(',');
    response = await (0, _utility.request)('https://api.github.com/user', {
      headers: {
        Authorization: `token ${body.access_token}`,
        Accept: 'application/json'
      },
      errorHandler: _utility.errorHandler
    });
    body.user = await response.json();
    await onDone(context, body);
  };
}
//# sourceMappingURL=GitHub.js.map