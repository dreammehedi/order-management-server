import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { createOrderService, getOrderService } from "../services/order.service";
import { orderSchema } from "../validation/order.validation";

export const createOrder = async (req: Request, res: Response) => {
  try {
    const userId = req.user_id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user = await prisma.users.findFirst({
      where: { id: userId },
      select: { email: true },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found!",
      });
    }

    const validated = orderSchema.parse(req.body);
    const order = await createOrderService(userId, user?.email, validated);

    return res.status(201).json({
      success: true,
      message: "Order created successfully.",
      data: order,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const getOrder = async (req: Request, res: Response) => {
  try {
    const userId = req.user_id;
    console.log(userId);
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const orders = await getOrderService(userId);

    return res.status(200).json({
      success: true,
      message: "Orders fetched successfully.",
      data: orders,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
