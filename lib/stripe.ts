import Stripe from "stripe"

export const stripe = new Stripe(process.env.STRIPE_SK_OFFICIAL!, {
    apiVersion: "2025-01-27.acacia",
    typescript: true,
})