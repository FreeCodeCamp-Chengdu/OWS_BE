"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.queryReply = queryReply;
exports.queryReplies = queryReplies;
exports.JinShuJu = void 0;

var _leanengine = require("leanengine");

var JSJ = _interopRequireWildcard(require("./JinShuJu"));

const JinShuJu = JSJ;
exports.JinShuJu = JinShuJu;

async function queryReply(Form, context, fid, id) {
  const {
    source
  } = context.query;
  const {
    query
  } = Form[source];
  var reply = await new _leanengine.Query('Reply').equalTo('source', source).equalTo('form_id', fid).equalTo('id', +id).include('form', 'user').first();
  if (!reply) throw Object.assign(new URIError(`${fid}/${id} isn't found in ${source}`), {
    code: 404
  });
  context.body = query(reply.toJSON());
}

async function queryReplies(Form, context, id) {
  const {
    source
  } = context.query;
  const {
    query
  } = Form[source];
  const list = await new _leanengine.Query('Reply').equalTo('source', source).equalTo('form_id', id).include('form', 'user').find();
  context.body = list.map(item => query(item.toJSON()));
}
//# sourceMappingURL=index.js.map