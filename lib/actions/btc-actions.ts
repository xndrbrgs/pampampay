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
