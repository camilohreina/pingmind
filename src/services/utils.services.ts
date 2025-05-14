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

export const getSubscriptionUser = async () => {
  try {
    const response = await axios.get("/api/subscription");
    return response.data;
  } catch (error) {
    console.log(error);
    return null
  }
};

export const detectUserCountry = async () => {
  try {
    // Usamos un servicio de geolocalización por IP
    const response = await axios.get('https://ipapi.co/json/');
    const { country_code } = response.data;
    return country_code; // Devuelve el código del país (ej. 'US', 'ES', etc.)
  } catch (error) {
    console.error('Error al detectar el país:', error);
    return 'US'; // Valor por defecto si ocurre un error
  }
};

