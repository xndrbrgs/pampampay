import { NextResponse } from "next/server"
import axios from "axios"

export async function POST(request: Request) {
  try {
    const { amount, description, recipientEmail, recipientId } = await request.json()

    // Validate the request
    if (!amount) {
      return NextResponse.json({ success: false, message: "Missing required amount" }, { status: 400 })
    }

    // Check for API credentials
    const apiLoginId = process.env.AUTHORIZE_NET_API_LOGIN_ID
    const transactionKey = process.env.AUTHORIZE_NET_TRANSACTION_KEY
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

    if (!apiLoginId || !transactionKey) {
      return NextResponse.json(
        {
          success: false,
          message: "Server configuration error: Missing payment processor credentials",
        },
        { status: 500 },
      )
    }

    console.log("Creating hosted payment page with credentials:", {
      apiLoginId: apiLoginId ? "Present (masked)" : "Missing",
      transactionKey: transactionKey ? "Present (masked)" : "Missing",
      appUrl,
    })

    // Determine the API endpoint based on environment
    const apiEndpoint =
      process.env.NODE_ENV === "production"
        ? "https://api.authorize.net/xml/v1/request.api"
        : "https://apitest.authorize.net/xml/v1/request.api"

    // Create the request payload exactly as specified in the Authorize.net documentation
    const payload = {
      getHostedPaymentPageRequest: {
        merchantAuthentication: {
          name: apiLoginId,
          transactionKey: transactionKey,
        },
        transactionRequest: {
          transactionType: "authCaptureTransaction",
          amount: amount.toString(), // Ensure amount is a string
          order: {
            description: description || "Payment",
          },
          customer: {
            email: recipientEmail || "",
          },
        },
        hostedPaymentSettings: {
          setting: [
            {
              settingName: "hostedPaymentButtonOptions",
              settingValue: JSON.stringify({
                text: "Pay Now",
              }),
            },
            {
              settingName: "hostedPaymentOrderOptions",
              settingValue: JSON.stringify({
                show: true,
                merchantName: "Your Company",
              }),
            },
            {
              settingName: "hostedPaymentReturnOptions",
              settingValue: JSON.stringify({
                showReceipt: false,
                url: `${appUrl}/payment/complete`,
                urlText: "Return to Merchant",
                cancelUrl: `${appUrl}/payment/cancel`,
                cancelUrlText: "Cancel Payment",
              }),
            },
            {
              settingName: "hostedPaymentIFrameCommunicatorUrl",
              settingValue: JSON.stringify({
                url: `${appUrl}/authorize-communicator.html`,
              }),
            },
          ],
        },
      },
    }

    console.log("Sending request to Authorize.net:", JSON.stringify(payload, null, 2))

    // Make the API request
    const response = await axios.post(apiEndpoint, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    })

    console.log("Received response from Authorize.net:", JSON.stringify(response.data, null, 2))

    // Process the response
    if (response.data && response.data.token) {
      console.log("Successfully received token:", response.data.token.substring(0, 10) + "...")
      return NextResponse.json({
        success: true,
        token: response.data.token,
      })
    } else {
      const errorMessage =
        response.data.messages && response.data.messages.message && response.data.messages.message.length > 0
          ? `${response.data.messages.message[0].code}: ${response.data.messages.message[0].text}`
          : "Unknown error occurred"

      console.error("Error in Authorize.net response:", errorMessage)
      return NextResponse.json(
        {
          success: false,
          message: errorMessage,
          fullResponse: response.data,
        },
        { status: 400 },
      )
    }
  } catch (error: any) {
    console.error("Error getting hosted payment page token:", error)

    // Log more detailed error information
    if (error.response) {
      console.error("Error response data:", error.response.data)
      console.error("Error response status:", error.response.status)
      console.error("Error response headers:", error.response.headers)
    }

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to get payment page",
        details: error.response?.data || error,
      },
      { status: 500 },
    )
  }
}
