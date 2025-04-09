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

    // Determine the API endpoint based on environment
    const apiEndpoint =
      process.env.NODE_ENV === "production"
        ? "https://api.authorize.net/xml/v1/request.api"
        : "https://apitest.authorize.net/xml/v1/request.api"

    // Create the request payload
    const payload = {
      getHostedPaymentPageRequest: {
        merchantAuthentication: {
          name: apiLoginId,
          transactionKey: transactionKey,
        },
        transactionRequest: {
          transactionType: "authCaptureTransaction",
          amount: amount,
          order: {
            description: description,
            invoiceNumber: `INV-${Date.now()}`,
          },
          customer: {
            email: recipientEmail,
          },
        },
        hostedPaymentSettings: {
          setting: [
            {
              settingName: "hostedPaymentButtonOptions",
              settingValue: JSON.stringify({
                text: "Pay Now",
                cssClass: "btn btn-primary",
              }),
            },
            {
              settingName: "hostedPaymentOrderOptions",
              settingValue: JSON.stringify({
                show: true,
                merchantName: "PamPamPay",
              }),
            },
            {
              settingName: "hostedPaymentReturnOptions",
              settingValue: JSON.stringify({
                showReceipt: false,
                url: `${appUrl}/payment/complete`,
                urlText: "Return to PamPamPay",
                cancelUrl: `${appUrl}/payment/cancel`,
                cancelUrlText: "Cancel Payment",
              }),
            },
            {
              settingName: "hostedPaymentStyleOptions",
              settingValue: JSON.stringify({
                bgColor: "#ffffff",
                frameColor: "#333333",
                frameHeight: "700px",
                frameWidth: "100%",
              }),
            },
            {
              settingName: "hostedPaymentPaymentOptions",
              settingValue: JSON.stringify({
                showCreditCard: true,
                showBankAccount: false,
              }),
            },
            {
              settingName: "hostedPaymentSecurityOptions",
              settingValue: JSON.stringify({
                captcha: false,
              }),
            },
            {
              settingName: "hostedPaymentShippingAddressOptions",
              settingValue: JSON.stringify({
                show: false,
                required: false,
              }),
            },
            {
              settingName: "hostedPaymentBillingAddressOptions",
              settingValue: JSON.stringify({
                show: true,
                required: true,
              }),
            },
          ],
        },
      },
    }

    // Make the API request
    const response = await axios.post(apiEndpoint, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    })

    // Process the response
    if (response.data && response.data.token && response.data.messages && response.data.messages.resultCode === "Ok") {
      return NextResponse.json({
        success: true,
        token: response.data.token,
      })
    } else {
      const errorMessage =
        response.data.messages.message && response.data.messages.message.length > 0
          ? `${response.data.messages.message[0].code}: ${response.data.messages.message[0].text}`
          : "Unknown error occurred"

      return NextResponse.json(
        {
          success: false,
          message: errorMessage,
        },
        { status: 400 },
      )
    }
  } catch (error: any) {
    console.error("Error getting hosted payment page token:", error)
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
