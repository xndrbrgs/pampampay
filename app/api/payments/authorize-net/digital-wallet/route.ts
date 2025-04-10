import { NextResponse } from "next/server"
import axios from "axios"

export async function POST(request: Request) {
    try {
        const { type, paymentData, amount, description, recipientEmail, recipientId } = await request.json()

        // Validate the request
        if (!type || !paymentData || !amount) {
            return NextResponse.json({ success: false, message: "Missing required payment information" }, { status: 400 })
        }

        // Check for API credentials
        const apiLoginId = process.env.AUTHORIZE_NET_API_LOGIN_ID
        const transactionKey = process.env.AUTHORIZE_NET_TRANSACTION_KEY

        if (!apiLoginId || !transactionKey) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Server configuration error: Missing payment processor credentials",
                },
                { status: 500 },
            )
        }

        // Determine the API endpoint based on environment
        // const apiEndpoint =
        //   process.env.NODE_ENV === "production"
        //     ? "https://api.authorize.net/xml/v1/request.api"
        //     : "https://apitest.authorize.net/xml/v1/request.api"
        const apiEndpoint =
            process.env.NODE_ENV === "production"
                ? "https://apitest.authorize.net/xml/v1/request.api"
                : "https://apitest.authorize.net/xml/v1/request.api"

        // Create the request payload based on the wallet type
        let payload

        if (type === "apple-pay") {
            payload = createApplePayPayload(apiLoginId, transactionKey, paymentData, amount, description, recipientEmail)
        } else if (type === "google-pay") {
            payload = createGooglePayPayload(apiLoginId, transactionKey, paymentData, amount, description, recipientEmail)
        } else {
            return NextResponse.json({ success: false, message: "Unsupported digital wallet type" }, { status: 400 })
        }

        // Make the API request to Authorize.net
        const response = await axios.post(apiEndpoint, payload, {
            headers: {
                "Content-Type": "application/json",
            },
        })

        // Process the response
        if (response.data && response.data.transactionResponse && response.data.transactionResponse.responseCode === "1") {
            return NextResponse.json({
                success: true,
                transactionId: response.data.transactionResponse.transId,
                message: "Transaction approved",
            })
        } else {
            const errorMessage =
                response.data.transactionResponse && response.data.transactionResponse.errors
                    ? response.data.transactionResponse.errors[0].errorText
                    : "Payment processing failed"

            return NextResponse.json(
                {
                    success: false,
                    message: errorMessage,
                },
                { status: 400 },
            )
        }
    } catch (error: any) {
        console.error("Digital wallet payment error:", error)
        return NextResponse.json(
            {
                success: false,
                message: error.message || "Payment processing failed",
                details: error.response?.data || error,
            },
            { status: 500 },
        )
    }
}

// Helper function to create Apple Pay payload
function createApplePayPayload(
    apiLoginId: string,
    transactionKey: string,
    paymentData: any,
    amount: number,
    description: string,
    recipientEmail: string,
) {
    return {
        createTransactionRequest: {
            merchantAuthentication: {
                name: apiLoginId,
                transactionKey: transactionKey,
            },
            transactionRequest: {
                transactionType: "authCaptureTransaction",
                amount: amount.toFixed(2),
                payment: {
                    opaqueData: {
                        dataDescriptor: "COMMON.APPLE.INAPP.PAYMENT",
                        dataValue: paymentData.token.paymentData,
                    },
                },
                order: {
                    description: description,
                },
                customer: {
                    email: recipientEmail,
                },
            },
        },
    }
}

// Helper function to create Google Pay payload
function createGooglePayPayload(
    apiLoginId: string,
    transactionKey: string,
    paymentData: any,
    amount: number,
    description: string,
    recipientEmail: string,
) {
    return {
        createTransactionRequest: {
            merchantAuthentication: {
                name: apiLoginId,
                transactionKey: transactionKey,
            },
            transactionRequest: {
                transactionType: "authCaptureTransaction",
                amount: amount.toFixed(2),
                payment: {
                    opaqueData: {
                        dataDescriptor: "COMMON.GOOGLE.INAPP.PAYMENT",
                        dataValue: paymentData.paymentMethodData.tokenizationData.token,
                    },
                },
                order: {
                    description: description,
                },
                customer: {
                    email: recipientEmail,
                },
            },
        },
    }
}
