import { sendAlertReminder } from "@/controllers/reminder.controller";

export async function GET() {
  try {
    await sendAlertReminder();
    return Response.json({ ok: true, status: "success" }, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/init:", error);
    return Response.json(
      { ok: false, status: "error", error: "internal_server_error" },
      { status: 500 },
    );
  }
}

/* const reminders = [
  {
    id: 1,
    title: 'Meeting with the boss',
    date: '2021-09-01 10:00:00',
    description: 'Meeting with the boss to discuss the new project'
  },
  {
    id: 2,
    title: 'Dentist appointment',
    date: '2021-09-02 15:00:00',
    description: 'Dentist appointment to get the teeth checked'
  },
  {
    id: 3,
    title: 'Grocery shopping',
    date: '2021-09-03 08:00:00',
    description: 'Grocery shopping for the week'
  },
  {
    id: 4,
    title: 'Call mom',
    date: '2021-09-04 12:00:00',
    description: 'Call mom to check in'
  },
  {
    id: 5,
    title: 'Workout',
    date: '2021-09-05 06:00:00',
    description: 'Workout at the gym'
  }
] */
