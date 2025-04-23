import { reminders } from "@/db";
import {
  createReminder,
  getReminderLastMinute,
  updateReminder,
  updateStatusReminder,
} from "@/db/queries/reminders";
import { sendReplyReminder } from "@/lib/infobip";

type ReminderUser = {
  date: string;
  timezone: string;
  title: string;
  localDate: string;
  reminderDate: string;
  response: string;
  alert: string;
  message: string;
  action: "CREATE" | "UPDATE" | "DELETE" | "NO ACTION";
};

export const sendAlertReminder = async () => {
  try {
    const currentReminders = await getReminderLastMinute();

    if (currentReminders.length === 0) {
      return { status: "success", ok: true };
    }

    for (const reminder of currentReminders) {
      await sendReplyReminder({
        phone: reminder.phone,
        message: reminder.reminder.alert || "Recordatorio",
      });
      await updateStatusReminder({
        id: reminder.reminder.id,
        status: "COMPLETED",
      });
    }
  } catch (error) {
    return { status: "error", error: "internal_server_error", ok: false };
  }
};

export const addNewReminder = async ({
  phone,
  userId,
  reminder_user,
}: {
  phone: string;
  userId: string;
  reminder_user: ReminderUser;
}) => {
  try {
    const reminder = await createReminder({
      id: crypto.randomUUID(),
      userId,
      text: reminder_user.message,
      scheduledAt: new Date(reminder_user.reminderDate),
      status: "PENDING",
      response: reminder_user.response,
      alert: reminder_user.alert,
      localDate: new Date(reminder_user.localDate),
    });
    if (reminder) {
        await sendReplyReminder({
        phone,
        message: reminder_user.response,
      });
      return { status: "success", ok: true };
    }
  } catch (error) {}
};

export const updatePendingReminder = async ({
  reminderId,
  phone,
  reminder_user,
}: {
  reminderId: string;
  phone: string;
  reminder_user: ReminderUser;
}) => {
  try {
    // Validar que tenemos un ID válido
    if (!reminderId) {
      console.log("ERROR: Se intentó actualizar sin ID de recordatorio");
      return { status: "error", ok: false, message: "Falta ID de recordatorio" };
    }

    console.log("Intentando actualizar recordatorio:", {
      reminderId,
      message: reminder_user.message,
      reminderDate: reminder_user.reminderDate,
      action: reminder_user.action
    });
    
    // Validar que tenemos una fecha válida
    const scheduledDate = new Date(reminder_user.reminderDate);
    if (isNaN(scheduledDate.getTime())) {
      console.log("ERROR: Fecha de recordatorio inválida:", reminder_user.reminderDate);
      return { status: "error", ok: false, message: "Fecha de recordatorio inválida" };
    }
    
    const response = await updateReminder({
      id: reminderId,
      text: reminder_user.message,
      scheduledAt: scheduledDate,
      status: "PENDING",
    });
    
    console.log("Resultado de actualización:", {
      success: !!response,
      response,
      reminderId
    });
    
    if (response) {
      await sendReplyReminder({
        phone,
        message: reminder_user.response,
      });
      return { status: "success", ok: true };
    }
    
    // Si llegamos aquí, es porque no se encontró el recordatorio para actualizar
    return { 
      status: "error", 
      ok: false, 
      message: "No se pudo actualizar el recordatorio. Es posible que ya no exista o haya sido completado/cancelado." 
    };
  } catch (error) {
    console.error("Error al actualizar recordatorio:", error);
    return { 
      status: "error", 
      ok: false, 
      message: "Error interno al actualizar el recordatorio" 
    };
  }
};

export const cancelReminder = async ({
  reminderId,
  phone,
  reminder_user,
}: {
  reminderId: string;
  phone: string;
  reminder_user: ReminderUser;
}) => {
  const response = await updateStatusReminder({
    id: reminderId,
    status: "CANCELLED",
  });
  if (response) {
    await sendReplyReminder({
      phone,
      message: reminder_user.response,
    });
    return { status: "success", ok: true };
  }
};

export const formatRemindersToAi = ({
  reminders_list,
}: {
  reminders_list: (typeof reminders.$inferSelect)[];
}) => {
  if (reminders_list.length === 0) return [];

  return reminders_list.map((reminder) => {
    const scheduledDate = reminder?.scheduledAt ? new Date(reminder.scheduledAt) : null;
    // Crear cadenas legibles con horas en diferentes formatos para facilitar coincidencias
    const readableTime = scheduledDate ? 
      `${scheduledDate.getHours()}:${scheduledDate.getMinutes().toString().padStart(2, '0')}` : null;
    const hour12Format = scheduledDate ? 
      `${scheduledDate.getHours() > 12 ? scheduledDate.getHours() - 12 : scheduledDate.getHours()}${scheduledDate.getHours() === 0 ? 12 : ''}:${scheduledDate.getMinutes().toString().padStart(2, '0')} ${scheduledDate.getHours() >= 12 ? 'PM' : 'AM'}` : null;
    
    return {
      id: reminder.id,
      title: reminder.text,
      message: reminder.text,
      date: reminder?.scheduledAt?.toISOString() || null,
      readableTime,
      hour12Format,
      status: reminder.status,
    };
  });
};
