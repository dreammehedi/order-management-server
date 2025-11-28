import express from "express";

import { zodValidate } from "../middlewares/zodValidate.middleware";
import { createOrder } from "../modules/controllers/order.controller";
import { orderSchema } from "../modules/validation/order.validation";

const OrderRouter = express.Router();

OrderRouter.post("/orders", zodValidate(orderSchema), createOrder);

export { OrderRouter };
