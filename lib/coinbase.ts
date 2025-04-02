import axios from "axios";
import prisma from "./db";
import { unstable_cache } from "next/cache";

// Define the base URL for Coinbase Commerce API
const COINBASE_API_URL = "https://api.commerce.coinbase.com";

type CreateChargeParams = {
  name: string;
  description: string;
  local_price: {
    amount: string;
    currency: string;
  };
  pricing_type: "fixed_price";
  metadata: Record<string, string>;
  redirect_url?: string;
  cancel_url?: string;
};

export async function createCharge(params: CreateChargeParams) {
  try {
    console.log(
      "Creating Coinbase charge with params:",
      JSON.stringify(params, null, 2)
    );

    // Prepare the request data
    const chargeData = {
      name: params.name,
      description: params.description,
      pricing_type: params.pricing_type,
      local_price: params.local_price,
      metadata: params.metadata,
      redirect_url:
        params.redirect_url ||
        `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
      cancel_url:
        params.cancel_url ||
        `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancel`,
    };

    // Make a direct API call to Coinbase Commerce
    const response = await axios.post(
      `${COINBASE_API_URL}/charges`,
      chargeData,
      {
        headers: {
          "X-CC-Api-Key": process.env.COINBASE_API_KEY!,
          "X-CC-Version": "2018-03-22",
          "Content-Type": "application/json",
        },
      }
    );

    // Check if the response contains data
    if (!response.data || !response.data.data) {
      throw new Error("Coinbase API returned an invalid response");
    }

    const charge = response.data.data;
    console.log("Coinbase charge created successfully:", charge.id);

    return charge;
  } catch (error: any) {
    console.error("Error creating Coinbase charge:", error.message);

    // Log detailed error information
    if (error.response) {
      console.error("Coinbase API response status:", error.response.status);
      console.error(
        "Coinbase API response data:",
        JSON.stringify(error.response.data, null, 2)
      );
    }

    throw error;
  }
}

export async function getCharge(chargeId: string) {
  try {
    console.log("Retrieving Coinbase charge:", chargeId);

    // Make a direct API call to Coinbase Commerce
    const response = await axios.get(
      `${COINBASE_API_URL}/charges/${chargeId}`,
      {
        headers: {
          "X-CC-Api-Key": process.env.COINBASE_API_KEY!,
          "X-CC-Version": "2018-03-22",
        },
      }
    );

    // Check if the response contains data
    if (!response.data || !response.data.data) {
      throw new Error("Coinbase API returned an invalid response");
    }

    const charge = response.data.data;
    return charge;
  } catch (error: any) {
    console.error("Error retrieving Coinbase charge:", error.message);

    // Log detailed error information
    if (error.response) {
      console.error("Coinbase API response status:", error.response.status);
      console.error(
        "Coinbase API response data:",
        JSON.stringify(error.response.data, null, 2)
      );
    }

    throw error;
  }
}

// Add new function to list charges with filtering and pagination
export async function listCharges({
  limit = 25,
  starting_after = undefined,
  ending_before = undefined,
  order = "desc",
  status = undefined,
}: {
  limit?: number;
  starting_after?: string;
  ending_before?: string;
  order?: "desc" | "asc";
  status?:
    | "NEW"
    | "PENDING"
    | "COMPLETED"
    | "EXPIRED"
    | "UNRESOLVED"
    | "RESOLVED"
    | "CANCELED";
} = {}) {
  try {
    console.log("Listing Coinbase charges with params:", {
      limit,
      starting_after,
      ending_before,
      order,
      status,
    });

    // Build query parameters
    const params: Record<string, string | number> = { limit };

    if (starting_after) params.starting_after = starting_after;
    if (ending_before) params.ending_before = ending_before;
    if (order) params.order = order;

    // Make a direct API call to Coinbase Commerce
    const response = await axios.get(`${COINBASE_API_URL}/charges`, {
      headers: {
        "X-CC-Api-Key": process.env.COINBASE_API_KEY!,
        "X-CC-Version": "2018-03-22",
      },
      params,
    });

    // Check if the response contains data
    if (!response.data || !response.data.data) {
      throw new Error("Coinbase API returned an invalid response");
    }

    let charges = response.data.data;

    console.log("RAW:", charges);

    // If status filter is provided, filter the charges
    if (status) {
      charges = charges.filter((charge: any) => {
        // Find the latest timeline entry
        const timeline = charge.timeline || [];
        if (timeline.length === 0) return false;

        const latestStatus = timeline[timeline.length - 1].status;
        return latestStatus.toUpperCase() === status;
      });
    }

    // Return both the charges and pagination info
    return {
      charges,
      pagination: response.data.pagination || {},
      total: charges.length,
    };
  } catch (error: any) {
    console.error("Error listing Coinbase charges:", error.message);

    // Log detailed error information
    if (error.response) {
      console.error("Coinbase API response status:", error.response.status);
      console.error(
        "Coinbase API response data:",
        JSON.stringify(error.response.data, null, 2)
      );
    }

    throw error;
  }
}

// Function to get all completed charges
export async function getCompletedCharges() {
  try {
    return await listCharges({ status: "COMPLETED", limit: 100 });
  } catch (error) {
    console.error("Error getting completed charges:", error);
    throw error;
  }
}

// export async function getCoinbaseCharges() {
//   try {
//     const { charges } = await listCharges({ limit: 100 })

//     // Get all charge IDs from the response
//     const chargeIds = charges.map((charge: any) => charge.id)

//     // Find matching transactions in our database
//     const transactions = await prisma.coinbaseTransfer.findMany({
//       where: {
//         coinbaseChargeId: {
//           in: chargeIds,
//         },
//       },
//       include: {
//         sender: {
//           select: {
//             id: true,
//             email: true,
//             username: true,
//           },
//         },
//         receiver: {
//           select: {
//             id: true,
//             email: true,
//             username: true,
//           },
//         },
//       },
//     })

//     // Create a map of charge ID to transaction for easy lookup
//     const transactionMap = transactions.reduce(
//       (acc, transaction) => {
//         if (transaction.coinbaseChargeId) {
//           acc[transaction.coinbaseChargeId] = transaction
//         }
//         return acc
//       },
//       {} as Record<string, any>,
//     )

//     // Enrich charges with transaction data
//     const enrichedCharges = charges.map((charge: any) => {
//       const transaction = transactionMap[charge.id] || null
//       return {
//         ...charge,
//         transaction,
//       }
//     })

//     // Enrich charges with additional transaction data from the database
//     const enrichedChargesWithDetails = await Promise.all(
//       enrichedCharges.map(async (charge: any) => {
//         if (charge.transaction) {
//           const user = await prisma.user.findUnique({
//             where: { id: charge.transaction.senderId },
//             select: { email: true },
//           })

//           // if (charge.transaction.status === "COMPLETED") {
//           //   await prisma.coinbaseTransfer.update({
//           //     where: { id: charge.id },
//           //     data: { status: "COMPLETED" },
//           //   })
//           // }

//           return {
//             ...charge,
//             amount: charge.local_price?.amount,
//             description: charge.description,
//             senderId: user?.email || charge.transaction.senderId,
//             status: charge.transaction.status,
//           }
//         }
//         return charge
//       })
//     )
//     console.log('Listing enriched charges only:', enrichedChargesWithDetails)

//     return { charges: enrichedChargesWithDetails }
//   } catch (error) {
//     console.error("Error fetching Coinbase charges:", error)
//     throw error
//   }
// }

export const getCoinbaseCharges = unstable_cache(
  async () => {
    const completedCharges = await prisma.coinbaseTransfer.findMany({
      where: {
        status: "COMPLETED",
      },
      select: {
        amount: true,
        description: true,
        senderId: true,
        status: true,
        createdAt: true,
      },
    });

    const userIds = completedCharges.map((charge) => charge.senderId);
    const users = await prisma.user.findMany({
      where: {
        id: {
          in: userIds,
        },
      },
      select: {
        id: true,
        email: true,
      },
    });

    const userMap = users.reduce((acc, user) => {
      acc[user.id] = user.email;
      return acc;
    }, {} as Record<string, string>);

    completedCharges.forEach((charge) => {
      charge.senderEmail = userMap[charge.senderId];
    });

    return completedCharges;
  },
  [`coinbase-transactions-list`],
  { revalidate: 600, tags: ["coinbase-transactions"] }
);
