import dotenv from "dotenv";
dotenv.config({ path: ".env" });
const NODE_ENV = process.env.NODE_ENV;
const PORT = process.env.PORT || 8800;
const JWT_SECRET = process.env.JWT_SECRET;
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const ENCRYPTION_IV = process.env.ENCRYPTION_IV;
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS;
const EMAIL_ADDRESS = process.env.EMAIL_ADDRESS;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;
const PAYPAL_CLIENT = process.env.PAYPAL_CLIENT;
const PAYPAL_SECRET = process.env.PAYPAL_SECRET;
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

export {
  ALLOWED_ORIGINS,
  EMAIL_ADDRESS,
  EMAIL_PASSWORD,
  ENCRYPTION_IV,
  ENCRYPTION_KEY,
  JWT_SECRET,
  NODE_ENV,
  PAYPAL_CLIENT,
  PAYPAL_SECRET,
  PORT,
  STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET,
};
