"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initCron = initCron;
const cron_1 = require("cron");
const updateDelayedPublish_1 = require("./funcs/updateDelayedPublish");
const CRON_TIMEZONE = 'Europe/Moscow';
/**
 * Init cron jobs
 * @param io
 */
function initCron(io) {
    const job = new cron_1.CronJob('*/2 * * * *', () => {
        console.log(`Cron triggered at ${new Date()}`);
        (0, updateDelayedPublish_1.updateDelayedPublish)(io);
    }, null, false, CRON_TIMEZONE);
    job.start();
}
//# sourceMappingURL=index.js.map