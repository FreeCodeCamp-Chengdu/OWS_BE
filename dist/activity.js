"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.update = update;
exports.search = search;

var _asyncIterator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncIterator"));

var _leanengine = _interopRequireDefault(require("leanengine"));

var _itEvents = _interopRequireDefault(require("@fcc-cdc/it-events"));

const query = new _leanengine.default.Query('Activity'),
      Activity = _leanengine.default.Object.extend('Activity');

var fetching;

async function update(context) {
  if (fetching) throw new RangeError('Crawler is running');
  fetching = 1;
  const list = (await query.find()).map(item => item.toJSON());

  try {
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;

    var _iteratorError;

    try {
      for (var _iterator = (0, _asyncIterator2.default)((0, _itEvents.default)(list, context.query.interval)), _step, _value; _step = await _iterator.next(), _iteratorNormalCompletion = _step.done, _value = await _step.value, !_iteratorNormalCompletion; _iteratorNormalCompletion = true) {
        let item = _value;
        const data = item.objectId ? _leanengine.default.Object.createWithoutData('Activity', item.objectId) : new Activity();
        item.link = item.link + '';
        await data.save(item);
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return != null) {
          await _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  } catch (error) {
    fetching = 0;
    throw error;
  }

  fetching = 0;
}

async function search(context) {
  const {
    keywords
  } = context.query,
        query = new _leanengine.default.Query('Activity');
  if (keywords) query.contains('title', keywords).contains('address', keywords);
  context.body = await query.addDescending('start').addDescending('end').limit(20).find();
}
//# sourceMappingURL=activity.js.map