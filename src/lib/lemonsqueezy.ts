import { PLANS } from "@/config/pricing";
import {
  createCheckout,
  getSubscription,
  lemonSqueezySetup,
  listProducts,
} from "@lemonsqueezy/lemonsqueezy.js";
import crypto from "node:crypto";
import { getUserServerSession } from "./auth";
import { getUserById } from "@/db/queries/users";
import { LEMON_PATH_OBJ } from "@/config/constants";

export const setupLemonConfig = () => {
  return lemonSqueezySetup({
    apiKey: process.env.LEMON_SQUEEZY_API_KEY ?? "",
    onError: (error) => console.log("[Lemon Squeezy] Error", error),
  });
};

export async function getUserSubscriptionPlan() {
  try {
    setupLemonConfig();
    const user = await getUserServerSession();

    if (!user?.id) {
      return {
        ...PLANS[0],
        isSubscribed: false,
        isCanceled: false,
        portalUrl: null,
        stripe_current_period_end: null,
        hasUsedTrial: false,
      };
    }

    const dbUser = await getUserById(user.id);

    if (!dbUser) {
      return {
        ...PLANS[0],
        isSubscribed: false,
        isCanceled: false,
        portalUrl: null,
        stripe_current_period_end: null,
        hasUsedTrial: false
      };
    }

    const isSubscribed = Boolean(
      dbUser.stripe_price_id &&
        dbUser.stripe_current_period_end && // 86400000 = 1 day
        dbUser.stripe_current_period_end.getTime() + 86_400_000 > Date.now(),
    );

    const plan = isSubscribed
      ? PLANS.find(
          (plan) =>
            plan.mode[LEMON_PATH_OBJ].variantId === dbUser.stripe_plan_id,
        )
      : null;

    let isCanceled = false;
    let portalUrl: string | null = null;
    if (isSubscribed && dbUser.stripe_subscription_id) {
      const { data } = await getSubscription(dbUser.stripe_subscription_id);
      if (data) {
        isCanceled = data?.data?.attributes?.cancelled || false;
        portalUrl = data?.data?.attributes?.urls?.customer_portal ?? "";
      }
    }

    return {
      ...plan,
      stripe_subscription_id: dbUser.stripe_subscription_id,
      stripe_current_period_end: dbUser.stripe_current_period_end,
      stripeCustomerId: dbUser.stripe_customer_id,
      hasUsedTrial: dbUser.has_used_trial,
      portalUrl,
      isSubscribed,
      isCanceled,
    };
  } catch (error) {
    throw new Error(`Error fetching user subscription plan: ${error}`);
  }
}

type CreateCheckoutSessionParams = {
  variantId: string;
  userId: string;
  skipTrial?: boolean;
};

export async function createCheckoutSession({
  variantId,
  userId,
  skipTrial = false,
}: CreateCheckoutSessionParams) {
  try {
    setupLemonConfig();
    const { data } = await createCheckout(
      process.env.LEMON_SQUEEZY_STORE_ID ?? "",
      variantId,
      {
        checkoutOptions: {
          skipTrial,
        },
        checkoutData: {
          custom: {
            userId,
          },
        },
      },
    );

    return data;
  } catch (error) {
    console.error("Error creating checkout session:", error);
    throw error;
  }
}

export const verifySignature = (
  rawBody: string,
  headerSignature: string,
): boolean => {
  const secret = process.env.LEMON_SQUEEZY_WEBHOOKS_KEY!;
  const hmac = crypto.createHmac("sha256", secret);
  const digest = Buffer.from(hmac.update(rawBody).digest("hex"), "utf8");
  const signature = Buffer.from(headerSignature, "utf8");

  if (digest.length !== signature.length) {
    return false;
  }
  //@ts-ignore
  if (!crypto.timingSafeEqual(digest, signature)) {
    return false;
  }

  return true;
};

export async function listLemonProducts() {
  setupLemonConfig();
  const { data } = await listProducts({
    filter: {
      storeId: process.env.LEMON_SQUEEZY_STORE_ID,
    },
  });
  return data;
}
