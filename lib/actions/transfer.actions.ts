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

    success_url: 'https://www.pampampay.com/dashboard/payment/success',
    cancel_url: 'https://www.pampampay.com/dashboard/payment/cancel',
  })

  // Save transaction details to the database
  const transfer = await prisma.transfer.create({
    data: {
      id: session.id, // Use the Stripe session ID as the transfer ID
      amount,
      description: paymentDescription,
      senderId: currentUser.id,
      receiverId: recipientId,
      status: 'PENDING', // Set initial status
      transactionReference: session.id, // Store the Stripe session ID
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
    refresh_url: 'https://www.pampampay.com/dashboard/pay-and-request',
    return_url: `https://www.pampampay.com/dashboard/return/${data?.connectedAccountId}`,
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

// export async function getUserTransactions() {
//   const user = await createOrGetUser();
//   if (!user.id) throw new Error("Not authenticated");

//   const currentUser = await prisma.user.findUnique({
//     where: { clerkUserId: user.clerkUserId },
//   });
//   if (!currentUser) throw new Error("User not found");

//   // Check if the user is connected to Stripe
//   if (currentUser.stripeConnectedLinked) {
//     // User is authenticated via Stripe Connect, fetch transactions from Stripe
//     const transactions = await stripe.balanceTransactions.list({
//       limit: 10,
//       expand: ['data.source'],
//     });

//     console.log(transactions);

//     // Filter transactions to match the currentUser
//     const userTransactions = transactions.data.filter((transaction) => {
//       const transactionEmail = transaction.source?.billing_details?.email;
//       return transactionEmail === currentUser.email; // Match email or any other unique identifier
//     });

//     // Fetch user details for each transaction's receiverId
//     const enrichedTransactions = await Promise.all(userTransactions.map(async (transaction) => {
//       const transfer = await prisma.transfer.findFirst({
//         where: {
//           transactionReference: transaction.id, // Assuming you store the Stripe transaction ID in your database
//         },
//       });

//       // Fetch user details for the receiverId
//       if (!transfer?.receiverId) throw new Error("Receiver ID not found");
//       const userToConnect = await getUserById({ receiverId: transfer.receiverId });

//       return {
//         ...transaction,
//         transfer, // Add the transfer data to the transaction
//         receiver: userToConnect, // Add the user details for the receiver
//       };
//     }));

//     return enrichedTransactions;
//   } else {
//     // User is not authenticated via Stripe Connect, fetch transfer items from the database
//     const transferItems = await prisma.transfer.findMany({
//       where: {
//         senderId: currentUser.id, // Fetch transfers sent by the current user
//       },
//       include: {
//         receiver: true, // Include receiver details if needed
//       },
//     });

//     return transferItems;
//   }
// }

// export async function getUserTransactions() {
//   const user = await createOrGetUser();
//   if (!user.id) throw new Error("Not authenticated");

//   const currentUser = await prisma.user.findUnique({
//     where: { clerkUserId: user.clerkUserId },
//   });
//   if (!currentUser) throw new Error("User not found");


//   const transferItems = await prisma.transfer.findMany({
//     where: {
//       senderId: currentUser.id, // Fetch transfers sent by the current user
//     },
//     include: {
//       receiver: true, // Include receiver details if needed
//     },
//   });

//   return transferItems;
// }

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
        { senderId: currentUser.id }, // Fetch transfers sent by the current user
        { receiverId: currentUser.id }, // Fetch transfers received by the current user
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


