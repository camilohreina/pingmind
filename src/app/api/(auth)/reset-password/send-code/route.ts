import { sendOTPCode } from "@/controllers/auth.controller";
import { ValidationDataError } from "@/lib/error";
import { phoneSchema } from "@/schemas/auth.schema";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validar el formato del número de teléfono
    const validated_data = phoneSchema.safeParse(body);
    console.log(validated_data);
    if (!validated_data.success) {
      throw new ValidationDataError(validated_data.error);
    }
    const response = await sendOTPCode(validated_data.data);
    return NextResponse.json(response, {status: response.status})
  } catch (error) {
    console.error("Error in reset password route:", error);
    if (error instanceof ValidationDataError) {
      return NextResponse.json(
        { ok: false, message: error.message },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
