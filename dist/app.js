"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.app = void 0;

var _koa = _interopRequireDefault(require("koa"));

var _koaRoute = require("koa-route");

var Session = _interopRequireWildcard(require("./session"));

var _activity = require("./activity");

var Form = _interopRequireWildcard(require("./form"));

var _nodeSchedule = require("node-schedule");

const app = new _koa.default().use((0, _koaRoute.get)('/', Session.entry)).use((0, _koaRoute.get)('/OAuth', context => Session[context.query.source](context))).use((0, _koaRoute.post)('/activity/update', _activity.update)).use((0, _koaRoute.get)('/activity', _activity.search)).use((0, _koaRoute.post)('/form', context => Form[context.query.source].create(context))).use((0, _koaRoute.post)('/form/reply', context => Form[context.query.source].reply(context))).use((0, _koaRoute.get)('/form/:fid/reply/:id', Form.queryReply.bind(null, Form))).use((0, _koaRoute.get)('/form/:id', Form.queryForm.bind(null, Form))).use((0, _koaRoute.get)('/form/:id/statistic', Form.queryStatistic));
exports.app = app;
const rule = new _nodeSchedule.RecurrenceRule();
rule.hour = 1;
(0, _nodeSchedule.scheduleJob)(rule, () => (0, _activity.update)({
  query: {}
}));
//# sourceMappingURL=app.js.map