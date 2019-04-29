"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.OAuth = OAuth;
exports.proxy = proxy;

var _url = require("url");

var _ = require(".");

function OAuth(client_id, client_secret, onDone) {
  return async context => {
    const {
      code,
      state
    } = context.query;
    var response = await (0, _.request)('https://github.com/login/oauth/access_token', {
      method: 'POST',
      body: new _url.URLSearchParams({
        client_id,
        client_secret,
        code,
        state
      }),
      errorHandler: _.errorHandler
    });
    const body = Object.fromEntries(new _url.URLSearchParams((await response.text())).entries());
    if (body.scope) body.scope = body.scope.split(',');
    response = await (0, _.request)('https://api.github.com/user', {
      headers: {
        Authorization: `token ${body.access_token}`,
        Accept: 'application/json'
      },
      errorHandler: _.errorHandler
    });
    body.user = await response.json();
    await onDone(context, body, state);
  };
}

function proxy(tokenGetter) {
  return async context => {
    const {
      url,
      method,
      headers,
      body
    } = context.request;
    delete headers.host;
    headers.Authorization = 'token ' + (await tokenGetter(context));
    const response = await (0, _.request)('https://api.github.com' + url, {
      method,
      headers,
      body: Object.keys(body)[0] ? body : null
    });
    context.status = response.status, context.body = await response.json();
  };
}
//# sourceMappingURL=GitHub.js.map