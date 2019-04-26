"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.request = request;
exports.errorHandler = errorHandler;
exports.searchQuery = searchQuery;

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _leanengine = require("leanengine");

var _nodeFetch = _interopRequireDefault(require("node-fetch"));

async function request(URI, _ref) {
  let {
    errorHandler
  } = _ref,
      options = (0, _objectWithoutProperties2.default)(_ref, ["errorHandler"]);
  const response = await (0, _nodeFetch.default)(URI, options);
  if (response.status < 300) return response;
  const error = errorHandler ? await errorHandler(response) : Object.assign(new URIError(response.statusText), {
    code: response.status
  });
  error.response = response;
  throw error;
}

async function errorHandler(response) {
  const body = await response.json();
  const error = new URIError(body.error_description);
  error.code = response.status, error.body = body;
  return error;
}
/**
 * @param {String}   table
 * @param {String[]} keys
 * @param {String}   words
 *
 * @return {Query}
 */


function searchQuery(table, keys, words) {
  return _leanengine.Query.or(...words.split(/\s+/).map(word => keys.map(key => new _leanengine.Query(table).contains(key, word))).flat());
}
//# sourceMappingURL=utility.js.map