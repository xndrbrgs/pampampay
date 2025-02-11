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
            process.env.STRIPE_CONNECT_WEBHOOK_SECRET!
        )

    } catch (error) {
        return new Response('Stripe webhook error', { status: 400 });

    }

    switch (event.type) {
        case "checkout.session.completed": {
            const session = event.data.object;

            await prisma.transfer.update({
                where: {
                    id: session.id
                },
                data: {
                    status: 'COMPLETED',
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

