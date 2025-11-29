import express from "express";

import { zodValidate } from "../middlewares/zodValidate.middleware";
import { createOrder, getOrder } from "../modules/controllers/order.controller";
import { orderSchema } from "../modules/validation/order.validation";

const OrderRouter = express.Router();

OrderRouter.get("/orders", getOrder);
OrderRouter.post("/orders", zodValidate(orderSchema), createOrder);

export { OrderRouter };
