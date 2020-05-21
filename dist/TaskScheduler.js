"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_schedule_1 = require("node-schedule");
const Activity_1 = require("./controller/Activity");
const activity = new node_schedule_1.RecurrenceRule();
activity.hour = 12;
node_schedule_1.scheduleJob(activity, () => Activity_1.update());
//# sourceMappingURL=TaskScheduler.js.map