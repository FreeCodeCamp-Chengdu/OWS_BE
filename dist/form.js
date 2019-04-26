"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.JinShuJu = void 0;

var _leanengine = _interopRequireDefault(require("leanengine"));

var _utility = require("./utility");

const Form = _leanengine.default.Object.extend('Form'),
      Reply = _leanengine.default.Object.extend('Reply');

const JinShuJu = {
  async create(context) {
    const {
      id,
      user,
      key
    } = context.request.body;
    const data = await (await (0, _utility.request)(`https://${user}:${key}@jinshuju.net/api/v1/forms/${id}`, {
      errorHandler: _utility.errorHandler
    })).json();
    data.source = 'JinShuJu', data.form = id;
    await new Form().save(data);
    context.status = 201, context.body = '';
  },

  async reply(context) {
    const {
      form
    } = context.request.body;
    const meta = await new _leanengine.default.Query('Form').equalTo('source', 'JinShuJu').equalTo('form', form).find();
    if (!meta[0]) throw Object.assign(new URIError(form + ' not found'), {
      code: 400
    });
    await new Reply().save(Object.assign({
      source: 'JinShuJu',
      form: meta[0]
    }, context.request.body));
    context.status = 201, context.body = '';
  }

};
exports.JinShuJu = JinShuJu;
//# sourceMappingURL=form.js.map