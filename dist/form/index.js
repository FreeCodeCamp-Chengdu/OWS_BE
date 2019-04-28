"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.queryReply = queryReply;
exports.queryForm = queryForm;
exports.searchForm = searchForm;
exports.queryStatistic = queryStatistic;
exports.JinShuJu = void 0;

var _leanengine = _interopRequireDefault(require("leanengine"));

var JSJ = _interopRequireWildcard(require("./JinShuJu"));

var _utility = require("../utility");

const JinShuJu = JSJ;
exports.JinShuJu = JinShuJu;

async function queryReply(Form, context, fid, id) {
  const {
    source
  } = context.query;
  const {
    query
  } = Form[source];
  var reply = await new _leanengine.default.Query('FormReply').equalTo('source', source).equalTo('form_id', fid).equalTo('id', +id).include('form').first();
  if (!reply) throw Object.assign(new URIError(`${fid}/${id} isn't found in ${source}`), {
    code: 404
  });
  context.body = query(reply.toJSON());
}

async function queryForm(vendor, context, id) {
  const {
    source
  } = context.query;
  const {
    query
  } = vendor[source];
  const form = (await new _leanengine.default.Query('Form').equalTo('id', id).first()).toJSON();
  const list = await new _leanengine.default.Query('FormReply').equalTo('source', source).equalTo('form_id', id).find();
  form.replies = list.map(item => {
    item = item.toJSON();
    item.form = form;
    item = query(item);
    delete item.form;
    delete item.user;
    return item;
  });
  context.body = form;
}

async function searchForm(context) {
  const {
    keywords,
    page = 1,
    rows = 10
  } = context.query;
  context.body = await (keywords ? (0, _utility.searchQuery)('Form', ['name', 'description', 'source'], keywords) : new _leanengine.default.Query('Form')).skip((page - 1) * rows).limit(rows).find();
}

const FormStatistic = _leanengine.default.Object.extend('FormStatistic');

_leanengine.default.Cloud.afterSave('FormReply', async ({
  object
}) => {
  const {
    source,
    form_id
  } = object.toJSON();
  const list = await new _leanengine.default.Query('FormReply').equalTo('source', source).equalTo('form_id', form_id).find();
  const statistic = await new _leanengine.default.Query('FormStatistic').equalTo('source', source).equalTo('form_id', form_id).first();
  await (statistic || new FormStatistic()).save({
    source,
    form_id,
    data: (0, _utility.count)(list.map(item => Object.entries(item.toJSON().data).filter(([key]) => key.startsWith('field_'))).flat())
  });
});

async function queryStatistic(context, id) {
  const {
    source
  } = context.query;
  context.body = await new _leanengine.default.Query('FormStatistic').equalTo('source', source).equalTo('form_id', id).first();
}
//# sourceMappingURL=index.js.map