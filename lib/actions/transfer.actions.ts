'use server'

import { createOrGetUser, getUserById } from "./user.actions";
import prisma from "../db";
import { stripe } from "../stripe";
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";

export async function addConnection(connectedUserId: string) {
  const user = await createOrGetUser();
  if (!user.id) throw new Error("Not authenticated");

  // Fetch the current user
  const currentUser = await prisma.user.findUnique({
    where: { clerkUserId: user.clerkUserId },
  });
  if (!currentUser) throw new Error("User not found");

  // Fetch the user to connect
  const userToConnect = await prisma.user.findUnique({
    where: { id: connectedUserId },
  });
  if (!userToConnect) throw new Error("User to connect not found");

  if (currentUser.id === userToConnect.id)
    throw new Error("Cannot connect to yourself");

  // Check if the connection already exists in either direction
  const existingConnection = await prisma.connection.findFirst({
    where: {
      OR: [
        { userId: currentUser.id, connectedUserId: userToConnect.id },
        { userId: userToConnect.id, connectedUserId: currentUser.id },
      ],
    },
  });

  if (existingConnection) throw new Error("Connection already exists");

  // Create the bidirectional connections using a transaction
  await prisma.$transaction([
    prisma.connection.create({
      data: {
        userId: currentUser.id,
        connectedUserId: userToConnect.id,
      },
    }),
    prisma.connection.create({
      data: {
        userId: userToConnect.id,
        connectedUserId: currentUser.id,
      },
    }),
  ]);
}


export async function createStripeSession({
  amount,
  paymentDescription,
  recipientEmail,
  ssn,
  recipientId
}: StripeSessionProps) {
  const user = await createOrGetUser();
  if (!user.id) throw new Error("Not authenticated");

  const currentUser = await prisma.user.findUnique({
    where: { clerkUserId: user.clerkUserId },
  });
  if (!currentUser) throw new Error("User not found");

  // Check if the recipient exists
  const recipientUser = await prisma.user.findUnique({
    where: { id: recipientId },
  });
  if (!recipientUser) {
    throw new Error(`Recipient with ID ${recipientId} does not exist.`);
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: paymentDescription,
            description: recipientEmail
          },
          unit_amount: Math.round((amount * 100)),
        },
        quantity: 1,
      },
    ],

    payment_intent_data: {
      // application_fee_amount: Math.round((amount * 100) * 0.05), // 5% fee
      transfer_data: {
        destination: recipientUser.connectedAccountId!,
      }
    },
    //  Pass the customer email
    customer_email: currentUser.email,
    //  Add the metadata here
    metadata: {
      //  Pass the original parameters
      paymentDescription,
      //  Include the user ID of the sender
      customerEmail: currentUser.email,

    },

    success_url: 'http://localhost:3000/dashboard/payment/success',
    cancel_url: 'http://localhost:3000/dashboard/payment/cancel',
  })


  // Save transaction details to the database
  await prisma.transfer.create({
    data: {
      id: session.id, // Use the Stripe session ID as the transfer ID
      amount,
      description: paymentDescription,
      senderId: currentUser.id,
      receiverId: recipientId,
      status: 'PENDING', // Set initial status
      ssn, // Store the user's SSN for verification
    },
  });

  return redirect(session.url!);
}

export async function createStripeAccountLink() {
  const user = await currentUser();

  if (!user) throw new Error("Not authenticated");

  const data = await prisma.user.findUnique({
    where: {
      clerkUserId: user.id,
    },
    select: {
      connectedAccountId: true,
    },
  });

  const accountLink = await stripe.accountLinks.create({
    account: data?.connectedAccountId!,
    refresh_url: 'http://localhost:3000/dashboard/pay-and-request',
    return_url: `http://localhost:3000/dashboard/return/${data?.connectedAccountId}`,
    type: 'account_onboarding',
  });

  return redirect(accountLink.url);
}

export async function getStripeDashboard() {
  const user = await currentUser();

  if (!user) throw new Error("Not authenticated");

  const data = await prisma.user.findUnique({
    where: {
      clerkUserId: user.id,
    },
    select: {
      connectedAccountId: true,
    },
  });

  const loginLink = await stripe.accounts.createLoginLink(data?.connectedAccountId!);

  return redirect(loginLink.url!);
}

export async function getUserTransactions() {
  const user = await createOrGetUser();
  if (!user.id) throw new Error("Not authenticated");

  const currentUser = await prisma.user.findUnique({
    where: { clerkUserId: user.clerkUserId },
  });
  if (!currentUser) throw new Error("User not found");

  const transferItems = await prisma.transfer.findMany({
    where: {
      OR: [
        { senderId: currentUser.id, status: 'COMPLETED' }, // Fetch completed transfers sent by the current user
        { receiverId: currentUser.id, status: 'COMPLETED' }, // Fetch completed transfers received by the current user
      ],
    },
    include: {
      sender: true, // Include sender details if needed
      receiver: true, // Include receiver details if needed
    },
  });

  // Separate the transfers into sent and received
  const sentTransfers = transferItems.filter(
    (transfer) => transfer.senderId === currentUser.id
  );
  const receivedTransfers = transferItems.filter(
    (transfer) => transfer.receiverId === currentUser.id
  );

  return { sentTransfers, receivedTransfers };
}

// export async function getUserStripeTransactions() {
//   const user = await createOrGetUser();
//   if (!user.id) throw new Error("Not authenticated");

//   const currentUser = await prisma.user.findUnique({
//     where: { clerkUserId: user.clerkUserId },
//     select: {
//       stripeConnectedLinked: true,
//       connectedAccountId: true
//     },
//   });
//   if (!currentUser) throw new Error("User not found");

//   if (!currentUser.stripeConnectedLinked) {
//     throw new Error("User does not have a connected Stripe account");
//   }

//   const stripeTransactions = await stripe.balanceTransactions.list(
//     {},
//     {
//       stripeAccount: currentUser.connectedAccountId,
//     }
//   );

//   return stripeTransactions;
// }

export async function getUserStripeTransactions() {
  const user = process.env.ALEX_CONNECTED_ACCOUNT;

  const currentUser = await prisma.user.findUnique({
    where: { connectedAccountId: user },
  });
  if (!currentUser) throw new Error("User not found");

  // Check if the user is connected to Stripe
  if (currentUser.stripeConnectedLinked) {
    // User is authenticated via Stripe Connect, fetch transactions from Stripe
    const transactions = await stripe.balanceTransactions.list({
      expand: ['data.source'],
    });

    // Filter transactions to match the currentUser
    const userTransactions = transactions.data.filter((transaction) => {
      const transactionEmail = transaction.source?.destination;
      return transactionEmail === currentUser.connectedAccountId; // Match email or any other unique identifier
    });

    const positiveTransactions = userTransactions.filter(transaction => transaction.amount > 0);

    const receiptEmails = positiveTransactions.map(transaction => transaction.source?.receipt_email);

    const users = await prisma.user.findMany({
      where: {
        email: {
          in: receiptEmails,
        },
      },
    });

    const userIds = users.map(user => user.id);

    const matchingTransfers = await prisma.transfer.findMany({
      where: {
        senderId: {
          in: userIds,
        },
      },
    });

    // Update the status of matching transfers to 'COMPLETED' only when the amount matches
    await Promise.all(matchingTransfers.map(async (transfer) => {
      const matchingTransaction = positiveTransactions.find(transaction => transaction.amount === transfer.amount * 100);
      if (matchingTransaction) {
        await prisma.transfer.update({
          where: { id: transfer.id },
          data: { status: 'COMPLETED' },
        });
      }
    }));

    const completedTransfers = matchingTransfers.filter(transfer => transfer.status === 'COMPLETED');

    return completedTransfers.map(transfer => {
      const matchingTransaction = positiveTransactions.find(transaction => transaction.amount === transfer.amount * 100);
      return {
        ...transfer,
        transaction: matchingTransaction,
      };
    });
  }
}