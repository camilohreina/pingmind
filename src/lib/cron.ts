
import { sendAlertReminder } from '@/controllers/reminder.controller'
import * as schedule from 'node-schedule'
export function setupCronJobs() {
  schedule.scheduleJob('* * * * *', async () => {
    console.log('This runs every 1 minute')
    sendAlertReminder()
  })
}