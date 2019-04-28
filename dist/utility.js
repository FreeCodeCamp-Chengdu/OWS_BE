"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.count = count;
exports.request = request;
exports.errorHandler = errorHandler;
exports.valueOf = valueOf;
exports.requireSession = requireSession;
exports.searchQuery = searchQuery;
exports.updateRecord = updateRecord;

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _leanengine = _interopRequireDefault(require("leanengine"));

var _nodeFetch = _interopRequireDefault(require("node-fetch"));

/**
 * @param {Array[]} list - Key-Value pairs
 *
 * @return {Object[]} List of `key`, `value`, `count` & `percent`
 */
function count(list) {
  const cache = {};
  list.forEach(([key, value]) => {
    const group = cache[key] = cache[key] || {},
          hash = typeof value === 'object' ? JSON.stringify(value) : value;
    group[hash] = group[hash] || {
      key,
      value,
      count: 0
    };
    group[hash].count++;
  });
  return Object.values(cache).map(group => {
    group = Object.values(group);
    const sum = group.reduce((sum, {
      count
    }) => sum + count, 0);
    return group.map(item => {
      item.percent = +(item.count / sum * 100).toFixed(2);
      return item;
    });
  }).flat();
}
/**
 * @param {String|URL}       URI
 * @param {Object}           [options={}]           - https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch#Parameters
 * @param {HTTPErrorHandler} [options.errorHandler]
 *
 * @return {Response} https://developer.mozilla.org/en-US/docs/Web/API/Response
 *
 * @throw {URIError} With a `response` property
 */


async function request(URI, _ref = {}) {
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
/**
 * @typedef {Function} HTTPErrorHandler
 *
 * @param {Response} response
 *
 * @return {Error}
 */


async function errorHandler(response) {
  const body = await response.json();
  const error = new URIError(body.error_description);
  error.code = response.status, error.body = body;
  return error;
}
/**
 * @param {HTMLElement} field
 *
 * @return {String|String[]}
 */


function valueOf(field) {
  var input = field.querySelector('input[name]:not([type="radio"], [type="checkbox"]), textarea[name]');
  if (input) return input.value;
  input = field.querySelector('select[name]');
  if (input) return Array.from(input.options, ({
    value
  }) => value).filter(Boolean);
  input = field.querySelectorAll('input[name][type="radio"], input[name][type="checkbox"]');
  if (input[0]) return Array.from(input, ({
    value
  }) => value).filter(Boolean);
}
/**
 * @param {Function} middleware
 *
 * @return {Function}
 */


function requireSession(middleware) {
  return function (...parameter) {
    if (parameter[0].currentUser) return middleware.apply(this, parameter);
    throw Object.assign(new Error('Signed session is required'), {
      code: 401
    });
  };
}
/**
 * @param {String}   table
 * @param {String[]} keys
 * @param {String}   words
 *
 * @return {AV.Query} https://leancloud.github.io/javascript-sdk/docs/AV.Query.html
 */


function searchQuery(table, keys, words) {
  return _leanengine.default.Query.or(...words.split(/\s+/).map(word => keys.map(key => new _leanengine.default.Query(table).contains(key, word))).flat());
}
/**
 * @param {String} table
 * @param {Object} data
 * @param {Object} [options] - https://leancloud.github.io/javascript-sdk/docs/global.html#AuthOptions
 *
 * @return {AV.Object} https://leancloud.github.io/javascript-sdk/docs/AV.Object.html
 */


async function updateRecord(table, data, options) {
  var record = await searchQuery(table, Object.keys(data), Object.values(data).join(' ')).first();
  record = record || new (_leanengine.default.Object.extend(table))();
  await record.save(data, options);
  return record;
}
//# sourceMappingURL=utility.js.map