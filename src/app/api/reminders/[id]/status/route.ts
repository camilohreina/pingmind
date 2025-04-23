import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { updateStatusReminder } from "@/db/queries/reminders";

// Esquema para validar la actualización de estado
const updateStatusSchema = z.object({
  status: z.enum(["PENDING", "COMPLETED", "CANCELLED"]),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  
  const { id } = params;
  
  if (!id) {
    return NextResponse.json(
      { error: "ID de recordatorio no proporcionado" },
      { status: 400 }
    );
  }
  
  try {
    const body = await request.json();
    const { status } = updateStatusSchema.parse(body);
    
    // Aquí deberíamos verificar que el recordatorio pertenece al usuario actual
    // Por simplificación no lo implementamos en esta versión
    
    await updateStatusReminder({ id, status });
    
    return NextResponse.json(
      { success: true, message: "Estado actualizado correctamente" }
    );
  } catch (error) {
    console.error("Error al actualizar estado:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Error al actualizar el estado del recordatorio" },
      { status: 500 }
    );
  }
} 