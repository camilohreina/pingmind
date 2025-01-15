import { ValidationDataError } from "@/lib/error";
import { signUpSchema } from "@/schemas/auth.schema";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  console.log("llega aqui");
  try {
    const body = await request.json();
    const validated_data = signUpSchema.safeParse(body);

    if (!validated_data.success) {
      throw new ValidationDataError(validated_data.error);
    }

    // Si la validación es exitosa, puedes proceder con la lógica del negocio
    console.log("Datos validados:", validated_data);

    /* 
    // Valida y guarda al usuario en tu base de datos
    // Aquí podrías usar Prisma, Mongoose, etc.
    const newUser = await db.insert */

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof ValidationDataError) {
      return NextResponse.json(
        { ok: false, message: error.message },
        { status: 400 },
      );
    }

    console.log(error);
    return NextResponse.json({ ok: false, message: "error" }, { status: 500 });
  }
}
