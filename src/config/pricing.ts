export const PLANS = [
  {
    name: "Starter",
    slug: "starter",
    quota: 50,
    earlyFeatures: false,
    voiceRecognition: true,
    imageRecognition: false,
    mode: {
      test: {
        variantId: "683605",
      },
      live: {
        variantId: "683605",
      },
    },
    price: {
      amount: 2.99,
      priceIds: {
        test: "",
        live: "",
      },
    },
  },
  {
    name: "Pro",
    slug: "pro",
    quota: 200,
    earlyFeatures: true,
    voiceRecognition: true,
    imageRecognition: true,
    mode: {
      test: {
        variantId: "683605",
      },
      live: {
        variantId: "683605",
      },
    },
    price: {
      amount: 4.99,
      priceIds: {
        test: "",
        live: "",
      },
    },
  },
];

export const BILLING_WEBHOOK_EVENTS = {
  subscription_created: "subscription_created",
  subscription_updated: "subscription_updated",
  subscription_cancelled: "subscription_cancelled",
  subscription_payment_failed: "subscription_payment_failed",
  subscription_payment_success: "subscription_payment_success",
};
