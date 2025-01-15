import { createUser } from "@/controllers/user.controller";
import { ValidationDataError, ValidationError } from "@/lib/error";
import { signUpSchema } from "@/schemas/auth.schema";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated_data = signUpSchema.safeParse(body);

    if (!validated_data.success) {
      throw new ValidationDataError(validated_data.error);
    }

    await createUser(validated_data.data);

    return NextResponse.json({
      ok: true,
      message: "create user successfully!",
    });
  } catch (error) {
    if (error instanceof ValidationDataError) {
      return NextResponse.json(
        { ok: false, message: error.message },
        { status: 400 },
      );
    }
    
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { ok: false, message: error.message },
        { status: 409 },
      );
    }
    return NextResponse.json({ ok: false, message: "Internal server error" }, { status: 500 });
  }
}
