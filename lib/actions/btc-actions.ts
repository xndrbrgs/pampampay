"use server";

import axios from "axios";
import { createOrGetUser } from "./user.actions";
import prisma from "../db";
import { TransferStatus } from "@prisma/client";

const RECEIVER_ID = process.env.RECEIVER_ID!; // Default receiver ID for BTCPay
// const RECEIVER_ID = 'cmd9bhhgu0000iqs8pap2ou4p'; // Default receiver ID for BTCPay
const BTCPAY_API_KEY = process.env.NEXT_PUBLIC_BTCPAY_API_KEY!;
const BTCPAY_HOST = process.env.NEXT_PUBLIC_BTCPAY_HOST!;
const BTCPAY_STORE_ID = process.env.NEXT_PUBLIC_BTCPAY_STORE_ID!;

import { CoinGeckoClient } from "coingecko-api-v3";
const client = new CoinGeckoClient({ timeout: 10000, autoRetry: true });

export async function saveBTCPayment(invoiceData: any) {
  const user = await createOrGetUser();
  if (!user.id) throw new Error("Not authenticated");

  const currentUser = await prisma.user.findUnique({
    where: { clerkUserId: user.clerkUserId },
  });
  if (!currentUser) throw new Error("User not found");

  const paymentData = {
    id: invoiceData.id,
    amount: invoiceData.amount,
    description: invoiceData.metadata?.itemDesc,
    senderId: currentUser.id,
    receiverId: RECEIVER_ID,
    status: "PENDING" as TransferStatus,
  };

  await prisma.bTCTransfer.create({
    data: paymentData,
  });

  console.log("Saving BTCPayment data:", invoiceData);
  return invoiceData;
}

export async function getBTCPayments() {
  const endpoint = `${process.env.BASE_URL!}/api/btcpay/transactions`;
  try {
    const response = await axios.get(endpoint, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (Array.isArray(response.data.invoices)) {
      for (const invoice of response.data.invoices) {
        if (invoice?.id) {
          const existingPayment = await prisma.bTCTransfer.findUnique({
            where: { id: invoice.id },
          });
          if (existingPayment) {
            await prisma.bTCTransfer.update({
              where: { id: invoice.id },
              data: { status: invoice.status },
            });
          }
        }
      }
    } else if (response.data?.id) {
      const existingPayment = await prisma.bTCTransfer.findUnique({
        where: { id: response.data.id },
      });
      if (existingPayment) {
        await prisma.bTCTransfer.update({
          where: { id: response.data.id },
          data: { status: response.data.status },
        });
      }
    }
    const btcTransfers = await prisma.bTCTransfer.findMany({
      where: { status: "Settled" },
    });

    for (const transfer of btcTransfers) {
      const user = await prisma.user.findUnique({
        where: { id: transfer.senderId },
        select: { email: true },
      });
      transfer.senderEmail = user?.email || null;
    }

    return btcTransfers;
  } catch (error) {
    throw new Error(`Failed to fetch transactions: ${error}`);
  }
}

// lib/btcpay.ts
export async function getBTCPayBalances() {
  const headers = {
    Authorization: `token ${BTCPAY_API_KEY}`,
    "Content-Type": "application/json",
  };

  // On-chain wallet (BTC)
  const onchainRes = await fetch(
    `${BTCPAY_HOST}/api/v1/stores/${BTCPAY_STORE_ID}/payment-methods/BTC-CHAIN/wallet`,
    { method: "GET", headers }
  );
  if (!onchainRes.ok) {
    throw new Error(`Onchain fetch failed: ${onchainRes.statusText}`);
  }
  const onchainData = await onchainRes.json();

  const allMethods = await fetch(
    `${BTCPAY_HOST}/api/v1/stores/${BTCPAY_STORE_ID}/payment-methods/BTC-CHAIN/wallet/address`,
    { method: "GET", headers }
  );
  if (!onchainRes.ok) {
    throw new Error(`Onchain fetch failed: ${onchainRes.statusText}`);
  }
  const allMethodsRes = await allMethods.json();

  return { onchainData, allMethodsRes };
}

export async function getBTCBalanceInUSD() {
  try {
    // Get BTC balance from BTCPay
    const { onchainData } = await getBTCPayBalances();
    // Extract the BTC balance (adjust if your API uses a different field)
    const btcBalance = parseFloat(onchainData.balance);
    // Get live BTC price in USD
    const priceData = await client.simplePrice({
      ids: "bitcoin",
      vs_currencies: "usd",
    });
    const btcPriceUSD = priceData.bitcoin.usd;
    // Calculate value in USD
    const balanceUSD = btcBalance * btcPriceUSD;

    return { btcBalance, btcPriceUSD, balanceUSD };
  } catch (error) {
    console.error("Error fetching BTC balance or price:", error);
    throw error;
  }
}

export async function getConfiguredOnchainProcessor() {
  const headers = {
    Authorization: `token ${BTCPAY_API_KEY}`,
    "Content-Type": "application/json",
  };

  const res = await fetch(
    `${BTCPAY_HOST}/api/v1/stores/${BTCPAY_STORE_ID}/payout-processors/OnChainAutomatedPayoutSenderFactory/BTC-CHAIN`,

    { method: "GET", headers }
  );
  if (!res.ok) {
    throw new Error(`Onchain fetch failed: ${res.statusText}`);
  }
  const data = await res.json();
  return data;
}

export async function getStorePayouts() {
  const headers = {
    Authorization: `token ${BTCPAY_API_KEY}`,
    "Content-Type": "application/json",
  };

  // Step 1: Get all pull payments
  const payoutsList = await fetch(
    `${BTCPAY_HOST}/api/v1/stores/${BTCPAY_STORE_ID}/payouts`,
    { method: "GET", headers }
  );

  if (!payoutsList.ok) {
    throw new Error(`Pull payments fetch failed: ${payoutsList.statusText}`);
  }

  const payouts = await payoutsList.json();

  // Step 2: For each pull payment, fetch its payouts
  const pullPaymentsWithPayouts = await Promise.all(
    payouts.map(async (payment: any) => {
      const payoutRes = await fetch(
        `${BTCPAY_HOST}/api/v1/pull-payments/${payment.pullPaymentId}`,
        { method: "GET", headers }
      );

      if (!payoutRes.ok) {
        throw new Error(
          `Failed to fetch payouts for ${payment.id}: ${payoutRes.statusText}`
        );
      }

      const payouts = await payoutRes.json();
      return { ...payment, payouts }; // Attach payouts to pull payment
    })
  );

  return pullPaymentsWithPayouts;
}

export async function approvePayout(
  payoutId: string,
  name: string,
  approvedBy: string,
  amount: string,
  description: string,
  destination: string
) {
  const headers = {
    Authorization: `token ${BTCPAY_API_KEY}`,
    "Content-Type": "application/json",
  };

  const res = await fetch(
    `${BTCPAY_HOST}/api/v1/stores/${BTCPAY_STORE_ID}/payouts/${payoutId}`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({ revision: 0 }), // required by BTCPay
    }
  );
  if (!res.ok) {
    throw new Error(`Payout failed to approve: ${res.statusText}`);
  }

  const payout = await res.json();
  console.log(
    "Payout approved:",
    payout,
    description,
    name,
    approvedBy,
    destination
  );

  let savedPayout = await prisma.payouts.create({
    data: {
      payoutId: payout.id,
      amount: payout.originalAmount,
      description: description,
      name: name,
      approvedBy,
      address: destination,
      status: "PENDING", // from your enum
    },
  });

  console.log("Payout saved to database:", savedPayout);
}

export async function getCompletedPayouts() {
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  const payouts = await prisma.payouts.findMany({
    where: {
      updatedAt: {
        gte: twoDaysAgo,
      },
      status: {
        in: ["COMPLETED", "PENDING"], // Assuming these are the correct status values
      },
    },
  });
  return payouts;
}