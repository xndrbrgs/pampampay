import { type NextRequest, NextResponse } from "next/server"

// Environment variables for Authorize.net
const API_LOGIN_ID = process.env.AUTHORIZE_NET_API_LOGIN_ID!
const TRANSACTION_KEY = process.env.AUTHORIZE_NET_TRANSACTION_KEY!
const ENVIRONMENT = process.env.NODE_ENV === "production" ? "PRODUCTION" : "SANDBOX"

export async function GET(request: NextRequest) {
  try {
    // API endpoint based on environment
    const apiEndpoint =
      ENVIRONMENT === "PRODUCTION"
        ? "https://api.authorize.net/xml/v1/request.api"
        : "https://apitest.authorize.net/xml/v1/request.api"

    // Simple authentication test payload
    const payload = {
      authenticateTestRequest: {
        merchantAuthentication: {
          name: API_LOGIN_ID,
          transactionKey: TRANSACTION_KEY,
        },
      },
    }

    // Make the API request to Authorize.net
    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    // Get the response data
    const result = await response.json()

    // Return the result
    return NextResponse.json({
      status: response.status,
      statusText: response.statusText,
      result,
      environment: ENVIRONMENT,
      apiEndpoint,
      // Don't return the full credentials, just a masked version for security
      credentials: {
        apiLoginId: API_LOGIN_ID ? `${API_LOGIN_ID.substring(0, 3)}...` : "Not set",
        transactionKey: TRANSACTION_KEY ? "Set (masked)" : "Not set",
      },
    })
  } catch (error) {
    console.error("Error testing Authorize.net credentials:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        environment: ENVIRONMENT,
      },
      { status: 500 },
    )
  }
}
