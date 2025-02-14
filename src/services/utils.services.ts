import axios from "axios";

export type slugPlan = "starter" | "pro";

export const createPricingSessionService = async (slug: slugPlan) => {
  try {
    const response = await axios.post("/api/payment", {
      paymentId: slug,
    });
    return response.data;
  } catch (error) {
    console.log(error);
    return null
  }
};
