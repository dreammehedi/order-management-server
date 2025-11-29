import axios from "axios";
import Stripe from "stripe";
import { prisma } from "../../lib/prisma";
import { PAYPAL_CLIENT, PAYPAL_SECRET } from "../../secrets";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export const createOrderService = async (
  userId: string,
  userEmail: string,
  body: any
) => {
  const { items, paymentMethod } = body;

  const totalAmount = items.reduce(
    (acc: number, item: any) => acc + item.price * item.quantity,
    0
  );

  const order = await prisma.orders.create({
    data: {
      userId,
      items,
      paymentMethod,
      totalAmount,
      paymentStatus: "pending",
      orderStatus: "pending",
    },
  });

  let paymentInfo = null;

  // Stripe Payment
  if (paymentMethod === "stripe") {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100),
      currency: "usd",
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: "never", // redirect বন্ধ
      },
      metadata: { orderId: order.id },
      receipt_email: userEmail,
    });

    paymentInfo = { clientSecret: paymentIntent.client_secret };
  }

  // PayPal Payment
  if (paymentMethod === "paypal") {
    const accessToken = await generatePayPalAccessToken();

    const paypalOrder = await axios.post(
      "https://api-m.sandbox.paypal.com/v2/checkout/orders",
      {
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: totalAmount.toString(),
            },
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    paymentInfo = {
      approvalUrl: paypalOrder.data.links.find((l: any) => l.rel === "approve")
        .href,
    };
  }

  return {
    success: true,
    status: 201,
    message: "Order created successfully",
    data: {
      orderId: order.id,
      paymentInfo,
    },
  };
};

// Generate PayPal Token
async function generatePayPalAccessToken() {
  const response = await axios.post(
    "https://api-m.sandbox.paypal.com/v1/oauth2/token",
    "grant_type=client_credentials",
    {
      auth: {
        username: PAYPAL_CLIENT!,
        password: PAYPAL_SECRET!,
      },
    }
  );
  console.log(response.data.access_token, "access token");
  return response.data.access_token;
}
