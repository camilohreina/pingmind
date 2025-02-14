import { z } from "zod";

export const initialPaymentSchema = z.object({
    paymentId: z.string().min(1, "Payment ID is required"),
})