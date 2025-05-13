import { BILLING_WEBHOOK_EVENTS } from "@/config/pricing";
import { createSubscription, updateSubscription } from "@/db/queries/users";
import { verifySignature } from "@/lib/lemonsqueezy";

export async function POST(request: Request) {
  const eventType = request.headers.get("X-Event-Name");
  try {
    const clonedReq = request.clone();
    const body = await request?.json();
    const requestBody = (await clonedReq.text()) || "";
    const isValidSignature = verifySignature(
      requestBody,
      request.headers.get("X-Signature") ?? "",
    );
    if (!isValidSignature) {
      return Response.json({ ok: false }, { status: 400 });
    }

    if (!body?.meta?.custom_data?.user_id) {
      return Response.json(
        { ok: false, message: "Invalid user id" },
        { status: 200 },
      );
    }

    const userId: string = body.meta.custom_data.user_id;

    console.log(eventType);

    if (eventType === BILLING_WEBHOOK_EVENTS.subscription_created) {
      const subscription = body.data.attributes;
      await createSubscription({
        stripeSubscriptionId:
          subscription.first_subscription_item.subscription_id.toString(),
        stripeCustomerId: subscription.customer_id.toString(),
        stripePriceId: subscription.first_subscription_item.price_id.toString(),
        stripeCurrentPeriodEnd: new Date(subscription.renews_at),
        stripePlanId: subscription.variant_id.toString(),
        userId,
      });
    }

    if (eventType === BILLING_WEBHOOK_EVENTS.subscription_updated) {
      const subscription = body.data.attributes;
      console.log(body);
      await updateSubscription({
        stripePriceId: subscription.first_subscription_item.price_id.toString(),
        stripeCurrentPeriodEnd: new Date(subscription.renews_at),
        stripePlanId: subscription.variant_id.toString(),
        userId,
      });
    }

    console.log(userId);

    return Response.json({ ok: true });
  } catch (error) {
    console.log(error);
    return Response.json({ ok: false }, { status: 500 });
  }

  /*   const signature = headers().get('Stripe-Signature') ?? ''

  let event: Stripe.Event 
  const session = event.data
    .object as Stripe.Checkout.Session

  if (!session?.metadata?.userId) {
    return new Response(null, {
      status: 200,
    })
  }

  if (event.type === 'checkout.session.completed') {
    const subscription =
      await stripe.subscriptions.retrieve(
        session.subscription as string
      )
  }

  if (event.type === 'invoice.payment_succeeded') {
    // Retrieve the subscription details from Stripe.
    const subscription =
      await stripe.subscriptions.retrieve(
        session.subscription as string
      )
  }

  return new Response(null, { status: 200 }) */
}
