import { Request, Response } from "express";
import Stripe from "stripe";
import { prisma } from "../lib/prisma";
import { STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET } from "../secrets";
import { io } from "../socket/socket";

const stripe = new Stripe(STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-11-17.clover",
});

export const stripeWebhookHandler = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string | undefined;
  const rawBody = req.body as Buffer;

  try {
    if (!sig) return res.status(400).send("Missing signature");

    const event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      STRIPE_WEBHOOK_SECRET!
    );

    if (event.type === "payment_intent.succeeded") {
      const pi = event.data.object as Stripe.PaymentIntent;

      const orderId = pi.metadata?.orderId;

      if (orderId) {
        const order = await prisma.orders.update({
          where: { id: orderId },
          data: { paymentStatus: "paid", orderStatus: "processing" },
        });

        io.to(order.userId).emit("orderUpdate", {
          orderId,
          status: "processing",
        });
      }
    }

    return res.json({ received: true });
  } catch (err: any) {
    console.error("Webhook error:", err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
};
