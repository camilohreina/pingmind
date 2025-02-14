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
        variantId: "",
      },
    },
    price: {
      amount: 1.99,
      priceIds: {
        test: "",
        production: "",
      },
    },
  },
  {
    name: "Pro",
    slug: "pro",
    quota: 9999,
    earlyFeatures: true,
    voiceRecognition: true,
    imageRecognition: true,
    mode: {
      test: {
        variantId: "683622",
      },
      live: {
        variantId: "",
      },
    },
    price: {
      amount: 5.99,
      priceIds: {
        test: "",
        production: "",
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
