import { getUserById } from "@/db/queries/users";
import { getUserServerSession } from "@/lib/auth";
import { getUserSubscriptionPlan } from "@/lib/lemonsqueezy";
import { absoluteUrl } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

// API handler for POST requests
export async function POST(req: NextRequest) {
  try {
    const user = await getUserServerSession();
    const pricingUrl = absoluteUrl("/pricing");

    if (!user?.id) {
      return NextResponse.json(
        { ok: false, message: "UNAUTHORIZED" },
        { status: 401 },
      );
    }

    const user_info = await getUserById(user.id);
    
    const subscription_plan  = await getUserSubscriptionPlan()
    if (subscription_plan?.isSubscribed && user_info?.stripe_customer_id) {
      return NextResponse.json({ ok: true, url: subscription_plan?.portalUrl }, { status: 200 });
    }


    return NextResponse.json({ result: "payment" }, { status: 200 });
  } catch (error) {
    console.error("Error handling request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
