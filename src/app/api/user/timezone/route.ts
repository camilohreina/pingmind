import { NextRequest, NextResponse } from "next/server";
import { getUserServerSession } from "@/lib/auth";
import { updateUserTimezone } from "@/db/queries/users";
import { z } from "zod";

const updateTimezoneSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  timezone: z.string().min(1, "Timezone is required"),
});

export async function PATCH(request: NextRequest) {
  try {
    // Check authentication
    const session = await getUserServerSession();
    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = updateTimezoneSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { message: "Invalid request data", errors: validation.error.errors },
        { status: 400 }
      );
    }

    const { userId, timezone } = validation.data;

    // Verify the user is updating their own timezone
    if (session.id !== userId) {
      return NextResponse.json(
        { message: "Forbidden: You can only update your own timezone" },
        { status: 403 }
      );
    }

    // Update the timezone in the database
    await updateUserTimezone(userId, timezone);

    return NextResponse.json(
      { message: "Timezone updated successfully", timezone },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error updating timezone:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
