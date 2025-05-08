"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/db";

// Environment variables for Authorize.net
const API_LOGIN_ID = process.env.AUTHORIZE_NET_API_LOGIN_ID!;
const TRANSACTION_KEY = process.env.AUTHORIZE_NET_TRANSACTION_KEY!;
const ENVIRONMENT =
  process.env.NODE_ENV === "production" ? "PRODUCTION" : "SANDBOX";

// Schema for payment request validation
const paymentRequestSchema = z.object({
  amount: z.string().min(1),
  description: z.string().optional(),
  invoiceNumber: z.string().optional(),
  customerId: z.string().optional(),
});

// Type for the payment request
type PaymentRequest = z.infer<typeof paymentRequestSchema>;

/**
 * Server action to get a form token from Authorize.net
 */
export async function getFormToken(data: PaymentRequest) {
  // Validate the payment request
  const validatedData = paymentRequestSchema.parse(data);

  // API endpoint based on environment
  const apiEndpoint =
    ENVIRONMENT === "PRODUCTION"
      ? "https://api.authorize.net/xml/v1/request.api"
      : "https://apitest.authorize.net/xml/v1/request.api";

  // Current domain for the communicator URL
  const domain = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

  // Create the request payload for Authorize.net
  const payload = {
    getHostedPaymentPageRequest: {
      merchantAuthentication: {
        name: API_LOGIN_ID,
        transactionKey: TRANSACTION_KEY,
      },
      transactionRequest: {
        transactionType: "authCaptureTransaction",
        amount: validatedData.amount,
        order: {
          invoiceNumber: validatedData.invoiceNumber || `INV-${Date.now()}`,
          description: validatedData.description || "Product purchase",
        },
        customer: validatedData.customerId
          ? {
              id: validatedData.customerId,
            }
          : undefined,
      },
      hostedPaymentSettings: {
        setting: [
          {
            settingName: "hostedPaymentReturnOptions",
            settingValue: `{"showReceipt": false, "url": "${domain}/api/payment-callback", "cancelUrl": "${domain}/payment", "cancelUrlText": "Cancel Payment"}`,
          },
          {
            settingName: "hostedPaymentButtonOptions",
            settingValue: `{"text": "Pay Now"}`,
          },
          {
            settingName: "hostedPaymentStyleOptions",
            settingValue: `{"bgColor": "#ffffff"}`,
          },
          {
            settingName: "hostedPaymentIFrameCommunicatorUrl",
            settingValue: `${domain}/authorize-communicator.html`,
          },
        ],
      },
    },
  };

  try {
    // Make the API request to Authorize.net
    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const result = await response.json();

    // Check if the request was successful
    if (result.messages?.resultCode !== "Ok") {
      const errorMessage =
        result.messages?.message?.[0]?.text || "Failed to get payment token";
      throw new Error(errorMessage);
    }

    // Return the token
    return result.token;
  } catch (error) {
    console.error("Error getting form token:", error);
    throw new Error("Failed to initialize payment form");
  }
}

/**
 * Server action to process the payment response from Authorize.net
 */
export async function processPaymentResponse(response: any) {
  try {
    // Validate the response
    if (!response || !response.transId) {
      return { success: false, message: "Invalid payment response" };
    }

    // // Store the transaction in your database
    // const transaction = await prisma.transaction.create({
    //   data: {
    //     transactionId: response.transId,
    //     amount: response.amount || "0.00",
    //     status: response.responseCode === "1" ? "approved" : "declined",
    //     responseCode: response.responseCode,
    //     responseText: response.responseText || "",
    //     authCode: response.authCode || "",
    //     avsResponse: response.avsResultCode || "",
    //     cardType: response.accountType || "",
    //     lastFour: response.accountNumber || "",
    //     rawResponse: JSON.stringify(response),
    //   },
    // });

    // Update user subscription status in Supabase if needed
    // if (response.responseCode === "1" && response.customerId) {
    //   await supabase
    //     .from("subscriptions")
    //     .update({
    //       status: "active",
    //       last_payment_date: new Date().toISOString(),
    //       transaction_id: response.transId,
    //     })
    //     .eq("user_id", response.customerId);
    // }

    // Revalidate any paths that might display payment information
    revalidatePath("/dashboard");
    revalidatePath("/account");

    return {
      success: response.responseCode === "1",
      transactionId: response.transId,
      message:
        response.responseText ||
        (response.responseCode === "1"
          ? "Payment successful"
          : "Payment failed"),
    };
  } catch (error) {
    console.error("Error processing payment response:", error);
    return { success: false, message: "Error processing payment" };
  }
}
