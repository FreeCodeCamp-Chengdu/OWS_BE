"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.searchQuery = searchQuery;

var _leanengine = require("leanengine");

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