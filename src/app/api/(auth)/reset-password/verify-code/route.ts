import { verifyCodeResetPassword } from "@/controllers/auth.controller";
import { ValidationDataError } from "@/lib/error";
import { verificationCodeSchema } from "@/schemas/auth.schema";
import { NextResponse } from "next/server";
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const validated_data = verificationCodeSchema.safeParse(body);

    if (!validated_data.success) {
      throw new ValidationDataError(validated_data.error);
    }

    const { phone, code } = validated_data.data;
    const response = await verifyCodeResetPassword({
      phone,
      code,
    });

    return NextResponse.json(response, { status: response.status });
  } catch (error) {
    console.error("Error en verificación de código:", error);

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
