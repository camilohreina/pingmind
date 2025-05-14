import { getUserSubscriptionPlan } from "@/lib/lemonsqueezy";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const subscription = await getUserSubscriptionPlan();
    return NextResponse.json({
      slug: subscription.slug,
      is_subscribed: subscription.isSubscribed,
      is_cancelled: subscription.isCanceled,
      portal_url: subscription.portalUrl,
      stripe_current_period_end: subscription.stripe_current_period_end,
    });
  } catch (error) {
    console.error("[SUBSCRIPTION_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
