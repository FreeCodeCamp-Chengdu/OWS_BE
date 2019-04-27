"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.create = create;
exports.reply = reply;
exports.query = query;

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _leanengine = _interopRequireDefault(require("leanengine"));

var _jsdom = require("jsdom");

var _utility = require("../utility");

const Form = _leanengine.default.Object.extend('Form'),
      Reply = _leanengine.default.Object.extend('Reply');

async function parseForm(id) {
  const {
    window: {
      document
    }
  } = await _jsdom.JSDOM.fromURL('https://jinshuju.net/f/' + id);
  return {
    source: 'JinShuJu',
    id,
    name: document.querySelector('h1.form-title').textContent.trim(),
    description: document.querySelector('.form-description').innerHTML.trim(),
    fields: Array.from(document.querySelectorAll('.field'), item => {
      const {
        fieldType,
        apiCode,
        label
      } = item.dataset;
      const description = item.querySelector('.field-description');
      if (fieldType !== 'page-break') for (let key in item.dataset) return {
        type: fieldType.replace(/-field$/, ''),
        key: apiCode,
        label,
        description: description && description.innerHTML.trim(),
        defaultValue: (0, _utility.valueOf)(item)
      };
    }).filter(Boolean)
  };
}

async function create(context) {
  const {
    id
  } = context.request.body;
  const form = await new _leanengine.default.Query('Form').equalTo('id', id).first();
  await (form || new Form()).save((await parseForm(id)));
  context.status = 201, context.body = '';
}

async function reply(context) {
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
  const meta = await new _leanengine.default.Query('Form').equalTo('source', 'JinShuJu').equalTo('id', form).first();
  if (!meta) throw Object.assign(new URIError(form + ' not found'), {
    code: 404
  });
  var fields = meta.get('fields'),
      data = {},
      user;

  for (let key in extra) {
    const field = fields.find(item => item.key === key);
    if (field) switch (field.type) {
      case 'email':
        user = user || {}, user.email = extra[key];
        break;

      case 'mobile':
        user = user || {}, user.mobilePhoneNumber = extra[key];
    }
    data[key] = extra[key];
  }

  if (user) user = await (0, _utility.updateRecord)('_User', user, {
    user: context.currentUser,
    useMasterKey: true
  });
  await new Reply().save({
    form: meta,
    id: serial_number,
    system: info_os,
    browser: info_browser,
    IPA: info_remote_ip,
    user,
    data
  });
  context.status = 201, context.body = '';
}

function query(reply) {
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
  return Object.entries(Object.assign(data, {
    email,
    mobile: mobilePhoneNumber
  })).map(([key, value]) => Object.assign({
    key,
    value
  }, fields.find(item => item.key === key || item.type === key)));
}
//# sourceMappingURL=JinShuJu.js.map