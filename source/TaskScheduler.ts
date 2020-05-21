import { scheduleJob, RecurrenceRule } from 'node-schedule';
import { update } from './controller/Activity';

const activity = new RecurrenceRule();

activity.hour = 12;

scheduleJob(activity, () => update());
