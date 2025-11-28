import z from "zod";

export const orderSchema = z.object({
  items: z.array(
    z.object({
      title: z.string(),
      price: z.coerce.number(),
      quantity: z.coerce.number(),
    })
  ),
  paymentMethod: z.enum(["stripe", "paypal"]),
});
