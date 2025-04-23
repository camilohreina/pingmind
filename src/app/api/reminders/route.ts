import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { createReminder, getPendingRemindersByUser } from "@/db/queries/reminders";
import { v4 as uuidv4 } from "uuid";

const reminderSchema = z.object({
  title: z.string().optional(),
  text: z.string().min(3),
  scheduledAt: z.string().optional().transform(str => str ? new Date(str) : undefined),
});

// GET /api/reminders - Obtener recordatorios por usuario y opcionalmente filtrar por estado
export async function GET(request: NextRequest) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  
  const userId = session.user.id;
  const status = request.nextUrl.searchParams.get("status");
  
  try {
    // Por ahora solo implementamos la obtención de recordatorios pendientes
    // En un sistema completo, deberíamos tener consultas para diferentes estados
    const reminders = await getPendingRemindersByUser(userId);
    
    // Si hay un filtro de estado, aplicarlo
    const filteredReminders = status 
      ? reminders.filter(reminder => reminder.status === status)
      : reminders;
    
    return NextResponse.json(filteredReminders);
  } catch (error) {
    console.error("Error al obtener recordatorios:", error);
    return NextResponse.json(
      { error: "Error al obtener recordatorios" },
      { status: 500 }
    );
  }
}

// POST /api/reminders - Crear un nuevo recordatorio
export async function POST(request: NextRequest) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  
  try {
    const body = await request.json();
    const validatedData = reminderSchema.parse(body);
    
    const reminder = {
      id: uuidv4(),
      userId: session.user.id,
      title: validatedData.title,
      text: validatedData.text,
      scheduledAt: validatedData.scheduledAt,
      createdAt: new Date(),
      status: "PENDING" as const,
    };
    
    await createReminder(reminder);
    
    return NextResponse.json({ success: true, id: reminder.id }, { status: 201 });
  } catch (error) {
    console.error("Error al crear recordatorio:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos de recordatorio inválidos", details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Error al crear recordatorio" },
      { status: 500 }
    );
  }
} 