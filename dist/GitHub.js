"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.OAuth = OAuth;

var _url = require("url");

var _nodeFetch = _interopRequireDefault(require("node-fetch"));

// https://github.com/login/oauth/authorize?client_id=97d7a746d8d76c34e5d8&scope=user,repo
function OAuth(onDone, onError) {
  onError = onError instanceof Function && onError;

  async function handleError(context, body) {
    const error = Object.assign(new URIError(body.error_description), {
      context,
      body
    });
    if (onError) await onError(context, error);else throw error;
  }

  return async context => {
    var response = await (0, _nodeFetch.default)('https://github.com/login/oauth/access_token', {
      method: 'POST',
      body: new _url.URLSearchParams({
        client_id: process.env.GITHUB_APP_ID,
        client_secret: process.env.GITHUB_APP_SECRET,
        code: context.query.code
      })
    });
    const body = Object.fromEntries(new _url.URLSearchParams((await response.text())).entries());
    if (response.status > 299) return await handleError(context, body);
    if (body.scope) body.scope = body.scope.split(',');
    response = await (0, _nodeFetch.default)('https://api.github.com/user', {
      headers: {
        Authorization: `token ${body.access_token}`,
        Accept: 'application/json'
      }
    });
    body.user = await response.json();
    if (response.status > 299) await handleError(context, body);else await onDone(context, body);
  };
}
//# sourceMappingURL=GitHub.js.map