import { NextResponse } from "next/server"
import * as ApiContracts from "authorizenet/lib/apicontracts"
import * as ApiControllers from "authorizenet/lib/apicontrollers"
import { Constants } from "authorizenet"

// Set a timeout for the Authorize.Net API call
const API_TIMEOUT = 15000 // 15 seconds

export async function POST(request: Request) {
  try {
    // Parse the request body
    let body
    try {
      body = await request.json()
    } catch (parseError) {
      console.error("Error parsing request body:", parseError)
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request format",
        },
        { status: 400 },
      )
    }

    const { dataDescriptor, dataValue, amount } = body

    console.log("Received payment request with:", {
      dataDescriptor: dataDescriptor ? "Present" : "Missing",
      dataValue: dataValue ? "Present" : "Missing",
      amount,
    })

    // Validate required fields
    if (!dataDescriptor || !dataValue || !amount) {
      console.error("Missing required payment information:", {
        dataDescriptor: !dataDescriptor,
        dataValue: !dataValue,
        amount: !amount,
      })
      return NextResponse.json(
        {
          success: false,
          error: "Missing required payment information",
        },
        { status: 400 },
      )
    }

    // Set up the payment data
    const merchantAuthenticationType = new ApiContracts.MerchantAuthenticationType()
    merchantAuthenticationType.setName(process.env.AUTHORIZE_NET_API_LOGIN_ID!)
    merchantAuthenticationType.setTransactionKey(process.env.AUTHORIZE_NET_TRANSACTION_KEY!)

    // Create the payment nonce
    const opaqueData = new ApiContracts.OpaqueDataType()
    opaqueData.setDataDescriptor(dataDescriptor)
    opaqueData.setDataValue(dataValue)

    // Create the payment type
    const paymentType = new ApiContracts.PaymentType()
    paymentType.setOpaqueData(opaqueData)

    // Create the transaction request
    const transactionRequestType = new ApiContracts.TransactionRequestType()
    transactionRequestType.setTransactionType(ApiContracts.TransactionTypeEnum.AUTHCAPTURETRANSACTION)
    transactionRequestType.setPayment(paymentType)
    transactionRequestType.setAmount(amount)

    const createRequest = new ApiContracts.CreateTransactionRequest()
    createRequest.setMerchantAuthentication(merchantAuthenticationType)
    createRequest.setTransactionRequest(transactionRequestType)

    // Create the controller
    const createController = new ApiControllers.CreateTransactionController(createRequest.getJSON())

    // Set the environment
    const environment =
      process.env.AUTHORIZE_ENVIRONMENT! === "production" ? Constants.endpoint.production : Constants.endpoint.sandbox

    createController.setEnvironment(environment)

    // Execute the payment with a timeout
    try {
      const result = await executeWithTimeout(createController, API_TIMEOUT)
      return NextResponse.json(result)
    } catch (apiError) {
      console.error("API execution error:", apiError)
      return NextResponse.json(
        {
          success: false,
          error: "Payment processing failed",
          details: apiError instanceof Error ? apiError.message : String(apiError),
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Server Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Server error occurred",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

// Helper function to execute the payment with a timeout
async function executeWithTimeout(controller: any, timeout: number) {
  return new Promise((resolve, reject) => {
    // Set a timeout to prevent function from hanging
    const timeoutId = setTimeout(() => {
      console.log("Payment processing timed out")
      resolve({ success: false, error: "Payment processing timed out" })
    }, timeout)

    try {
      controller.execute(() => {
        // Clear the timeout since we got a response
        clearTimeout(timeoutId)

        try {
          const response = controller.getResponse()
          const error = controller.getError()

          if (error) {
            console.error("Payment Error:", error)
            resolve({ success: false, error: "Payment processing failed", details: error })
            return
          }

          // Check transaction response
          const result = response.getTransactionResponse()
          if (result && result.getResponseCode() === "1") {
            // Successful transaction
            resolve({
              success: true,
              transactionId: result.getTransId(),
              message: "Transaction approved",
            })
          } else {
            // Failed transaction
            let errorMessage = "Transaction declined"
            try {
              if (result && result.getMessages() && result.getMessages().getMessage()) {
                errorMessage = result.getMessages().getMessage()[0].getText()
              }
            } catch (msgError) {
              console.error("Error getting error message:", msgError)
            }
            resolve({ success: false, error: errorMessage })
          }
        } catch (responseError) {
          console.error("Error processing response:", responseError)
          resolve({
            success: false,
            error: "Error processing payment response",
            details: responseError instanceof Error ? responseError.message : String(responseError),
          })
        }
      })
    } catch (executionError) {
      clearTimeout(timeoutId)
      console.error("Error executing payment:", executionError)
      resolve({
        success: false,
        error: "Error executing payment",
        details: executionError instanceof Error ? executionError.message : String(executionError),
      })
    }
  })
}
