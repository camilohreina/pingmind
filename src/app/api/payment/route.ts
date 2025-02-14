import { PLANS } from "@/config/pricing";
import { getUserById } from "@/db/queries/users";
import { getUserServerSession } from "@/lib/auth";
import { ValidationDataError } from "@/lib/error";
import {
  createCheckoutSession,
  getUserSubscriptionPlan,
} from "@/lib/lemonsqueezy";
import { absoluteUrl } from "@/lib/utils";
import { initialPaymentSchema } from "@/schemas/utils.schema";
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
    //TODO: no esta llegando el user id en la session
    console.log(user);
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

    const pricing_session = await createCheckoutSession(variant_id, user?.id);
    console.log(pricing_session);

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
