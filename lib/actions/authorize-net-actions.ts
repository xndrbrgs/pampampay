import { AuthNetTransfer } from './../../node_modules/.prisma/client/index.d';
'use server';

import prisma from "../db";
import { TransferStatus } from './../../node_modules/.prisma/client/index.d';

export async function saveAuthorizeNetTransaction(transactionDetails: {
  transactionId: string;
  amount: number;
  status: TransferStatus;
  senderId: string;
  receiverId: string;
  createdAt: Date;
  id: string;
  description: string;
}) {
  try {
    const savedTransaction = await prisma.authNetTransfer.create({
      data: {
        id: transactionDetails.id,
        amount: transactionDetails.amount,
        description: transactionDetails.description,
        status: transactionDetails.status as TransferStatus,
        senderId: transactionDetails.senderId,
        receiverId: transactionDetails.receiverId,
        createdAt: transactionDetails.createdAt,
      },
    });
    return savedTransaction;
  } catch (error) {
    console.error("Error saving Authorize.Net transaction:", error);
    throw new Error("Failed to save transaction");
  }
}