import { CronJob } from 'cron'
import { Server } from 'socket.io'

import { updateDelayedPublish } from './funcs/updateDelayedPublish'

const CRON_TIMEZONE = 'Europe/Moscow'

export function initCron(io: Server) {
  const job = new CronJob(
    '*/2 * * * *',
    () => {
      console.log(`Cron triggered at ${new Date()}`)
      updateDelayedPublish(io)
    },
    null,
    false,
    CRON_TIMEZONE
  )

  job.start()
}
