import { PLANS } from "@/config/pricing";
import { createTrial, getUserById } from "@/db/queries/users";
import { getUserServerSession } from "@/lib/auth";
import { ValidationDataError } from "@/lib/error";
import {
  createCheckoutSession,
  getUserSubscriptionPlan,
} from "@/lib/lemonsqueezy";
import { absoluteUrl, getTrialEndDate } from "@/lib/utils";
import { initialPaymentSchema } from "@/schemas/utils.schema";
import { en } from "chrono-node";
import { NextRequest, NextResponse } from "next/server";

// API handler for POST requests
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated_data = initialPaymentSchema.safeParse(body);

    if (!validated_data.success) {
      throw new ValidationDataError(validated_data.error);
    }

    const { paymentId } = validated_data.data;

    const user = await getUserServerSession();

    const pricingUrl = absoluteUrl("/pricing");

    if (!user?.id) {
      return NextResponse.json(
        { ok: false, message: "UNAUTHORIZED" },
        { status: 401 },
      );
    }

    const user_info = await getUserById(user.id);

    const subscription_plan = await getUserSubscriptionPlan();

    if (subscription_plan?.isSubscribed && user_info?.stripe_customer_id) {
      return NextResponse.json(
        { ok: true, url: subscription_plan?.portalUrl },
        { status: 200 },
      );
    }

    const subscription_info = PLANS.find(
      (subscription) => subscription.slug === paymentId,
    );
    let variant_id = subscription_info?.mode?.live?.variantId!;

    if (process.env.NODE_ENV === "development") {
      variant_id = subscription_info?.mode?.test?.variantId!;
    }

    const skipTrial = user_info?.has_used_trial || false;

    const pricing_session = await createCheckoutSession({
      variantId: variant_id,
      userId: user.id,
      skipTrial,
    });

    if (!user_info?.has_used_trial) {
      const trial_end = getTrialEndDate();
      await createTrial({
        user_id: user.id,
        end_trial: trial_end,
        plan_id: variant_id,
      });
      return NextResponse.json(
        {
          ok: true,
          trial: true,
          end_trial: trial_end,
          url: pricing_session?.data?.attributes?.url,
        },
        { status: 200 },
      );
    }

    return NextResponse.json(
      { ok: true, url: pricing_session?.data?.attributes?.url },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error handling request:", error);

    if (error instanceof ValidationDataError) {
      return NextResponse.json(
        { ok: false, message: error.message },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
