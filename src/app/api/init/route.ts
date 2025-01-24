import { setupCronJobs } from "@/lib/cron"

export async function POST() {
    setupCronJobs()
    return Response.json({ status: 'initialized' })
  }