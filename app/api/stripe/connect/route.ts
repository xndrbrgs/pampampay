import prisma from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";

export async function POST(req: Request) {
    const body = await req.text();

    const signature = (await headers()).get("Stripe-Signature") || '';

    let event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_USER_CONNECT_WEBHOOK_OFFICIAL!
        )

    } catch (error) {
        return new Response('Stripe webhook error', { status: 400 });

    }

    switch (event.type) {
        case "account.updated": {
            const account = event.data.object;

            await prisma.user.update({
                where: {
                    connectedAccountId: account.id
                },
                data: {
                    stripeConnectedLinked: account.capabilities?.transfers === "pending" || account.capabilities?.transfers === "inactive" ? false : true
                }
            })

            break;
        }
        default: {
            console.log('unhandled event', event.type);
        }
    }

    return new Response(null, { status: 200 });
}
