"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.JinShuJu = void 0;

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

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
    data.source = 'JinShuJu', data.id = id;
    data.fields = Object.fromEntries(data.fields.map(data => {
      for (let key in data) return [key, data[key]];
    }));
    const form = await new _leanengine.default.Query('Form').equalTo('id', id).find();
    await (form[0] || new Form()).save(data);
    context.status = 201, context.body = '';
  },

  async reply(context) {
    const _context$request$body = context.request.body,
          {
      form,
      entry: {
        info_browser,
        info_os,
        info_remote_ip,
        serial_number
      }
    } = _context$request$body,
          extra = (0, _objectWithoutProperties2.default)(_context$request$body.entry, ["info_browser", "info_os", "info_remote_ip", "serial_number"]);
    const meta = await new _leanengine.default.Query('Form').equalTo('source', 'JinShuJu').equalTo('id', form).find();
    if (!meta[0]) throw Object.assign(new URIError(form + ' not found'), {
      code: 400
    });
    var fields = meta[0].get('fields'),
        data = {},
        user;

    for (let key in extra) {
      if (fields[key]) switch (fields[key].type) {
        case 'email':
          user = user || {}, user.email = extra[key];
          continue;

        case 'mobile':
          user = user || {}, user.mobilePhoneNumber = extra[key];
          continue;
      }
      data[key] = extra[key];
    }

    if (user) user = await (0, _utility.updateRecord)('_User', user, {
      user: context.currentUser,
      useMasterKey: true
    });
    await new Reply().save({
      form: meta[0],
      id: serial_number,
      system: info_os,
      browser: info_browser,
      IPA: info_remote_ip,
      user,
      data
    });
    context.status = 201, context.body = '';
  },

  query(reply) {
    var {
      data,
      form: {
        fields
      },
      user: {
        email,
        mobilePhoneNumber
      }
    } = reply;
    fields = Object.entries(fields);
    return Object.entries(Object.assign(data, {
      email,
      mobile: mobilePhoneNumber
    })).map(([key, value]) => Object.assign({
      key,
      value
    }, (fields.find(([name, {
      type
    }]) => name === key || type === key) || '')[1]));
  }

};
exports.JinShuJu = JinShuJu;
//# sourceMappingURL=form.js.map