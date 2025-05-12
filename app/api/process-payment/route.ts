import { NextResponse } from "next/server"
import * as ApiContracts from "authorizenet/lib/apicontracts"
import * as ApiControllers from "authorizenet/lib/apicontrollers"
import { Constants } from "authorizenet"

// Set a timeout for the Authorize.Net API call
const API_TIMEOUT = 10000 // 10 seconds

export async function POST(request: Request) {
  try {
    const body = await request.json()
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
      return NextResponse.json({ error: "Missing required payment information" }, { status: 400 })
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
    const result = await executeWithTimeout(createController, API_TIMEOUT)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Server Error:", error)
    return NextResponse.json({ success: false, error: "Server error occurred" }, { status: 500 })
  }
}

// Helper function to execute the payment with a timeout
async function executeWithTimeout(controller: any, timeout: number) {
  return new Promise((resolve) => {
    // Set a timeout to prevent function from hanging
    const timeoutId = setTimeout(() => {
      console.log("Payment processing timed out")
      resolve({ success: false, error: "Payment processing timed out" })
    }, timeout)

    controller.execute(() => {
      // Clear the timeout since we got a response
      clearTimeout(timeoutId)

      const response = controller.getResponse()
      const error = controller.getError()

      if (error) {
        console.error("Payment Error:", error)
        resolve({ success: false, error: "Payment processing failed" })
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
        const errorMessage = result ? result.getMessages().getMessage()[0].getText() : "Transaction declined"
        resolve({ success: false, error: errorMessage })
      }
    })
  })
}
