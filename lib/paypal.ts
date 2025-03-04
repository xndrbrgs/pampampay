import { Client, Environment, ApiError, OrdersController } from "@paypal/paypal-server-sdk"
import prisma from "./db"
import { createOrGetUser } from "./actions/user.actions"
import { unstable_cache } from "next/cache"

const client = new Client({
  clientCredentialsAuthCredentials: {
    oAuthClientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
    oAuthClientSecret: process.env.PAYPAL_CLIENT_SECRET!,
  },
  environment: Environment.Production, // Change to Environment.Production for production, Environment.Sandbox for sandbox
})

const ordersController = new OrdersController(client)

export async function createPayPalOrder(amount: number, recipientId: string) {
  const payload = {
    body: {
      intent: "CAPTURE",
      purchaseUnits: [
        {
          amount: {
            currencyCode: "USD",
            value: amount.toFixed(2),
          },
          description: `Transfer to user ${recipientId}`,
          custom_id: `${Date.now()}`,
        },
      ],
    },
    prefer: "return=minimal",
  }

  try {
    const { body, ...httpResponse } = await ordersController.ordersCreate(payload)
    return {
      jsonResponse: JSON.parse(body),
      httpStatusCode: httpResponse.statusCode,
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw new Error(error.message)
    }
    throw error
  }
}

export async function capturePayPalOrder(orderId: string) {
  const collect = {
    id: orderId,
    prefer: "return=minimal",
  }

  try {
    const { body, ...httpResponse } = await ordersController.ordersCapture(collect)
    return {
      jsonResponse: JSON.parse(body),
      httpStatusCode: httpResponse.statusCode,
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw new Error(error.message)
    }
    throw error
  }
}

export async function createPayPalTransfer(amount: number, recipientId: string, senderId: string, paymentDescription?: string) {
  const user = await createOrGetUser();
  if (!user.id) throw new Error("Not authenticated");

  const currentUser = await prisma.user.findUnique({
    where: { clerkUserId: user.clerkUserId },
  });
  if (!currentUser) throw new Error("User not found");

  const payload = {
    body: {
      intent: "CAPTURE",
      purchaseUnits: [
        {
          amount: {
            currencyCode: "USD",
            value: amount.toFixed(2),
          },
          description: `Transfer from ${senderId} to ${recipientId}`,
          custom_id: `${senderId}_${recipientId}_${Date.now()}`,
        },
      ],
    },
    prefer: "return=minimal",
  }

  try {
    const { body, ...httpResponse } = await ordersController.ordersCreate(payload)
    const jsonResponse = JSON.parse(body)


    // Save transaction details to the database
    await prisma.paypalTransfer.create({
      data: {
        id: jsonResponse.id, // Use the PayPal order ID as the transfer ID
        amount,
        description: paymentDescription, // Use the description from the PayPal response
        senderId: currentUser.id,
        receiverId: recipientId,
        status: 'PENDING', // Set initial status
      },
    });
    return {
      jsonResponse: JSON.parse(body),
      httpStatusCode: httpResponse.statusCode,
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw new Error(error.message)
    }
    throw error
  }
}

export async function capturePayPalTransfer(transferId: string) {
  const collect = {
    id: transferId,
    prefer: "return=minimal",
  }

  try {
    const { body, ...httpResponse } = await ordersController.ordersCapture(collect)
    return {
      jsonResponse: JSON.parse(body),
      httpStatusCode: httpResponse.statusCode,
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw new Error(error.message)
    }
    throw error
  }
}

export const getPayPalTransactions = unstable_cache(async () => {
  const transactions = await prisma.paypalTransfer.findMany({
    where: { status: 'COMPLETED' },
  });
  const transactionsWithUserEmails = await Promise.all(
    transactions.map(async (transaction) => {
      const user = await prisma.user.findUnique({
        where: { id: transaction.senderId },
        select: { email: true },
      });
      return {
        ...transaction,
        senderEmail: user?.email || null,
      };
    })
  );
  return transactionsWithUserEmails;
}, [`paypal-transactions`],
  { revalidate: 600, tags: ["paypal-transactions"] });
