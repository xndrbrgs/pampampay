import { NextResponse } from "next/server";
import * as ApiContracts from "authorizenet/lib/apicontracts";
import * as ApiControllers from "authorizenet/lib/apicontrollers";
import { Constants } from "authorizenet";
import { format } from "date-fns";
import { toZonedTime } from 'date-fns-tz';
import { saveAuthorizeNetTransaction } from "@/lib/actions/authorize-net-actions";
import { createOrGetUser } from "@/lib/actions/user.actions";

// Set a timeout for the Authorize.Net API call
const API_TIMEOUT = 15000; // 15 seconds
// Define EST/EDT time zone (automatically adjusts for Daylight Saving Time)
const timeZone = 'America/New_York';
const now = new Date();
const estDate = toZonedTime(now, timeZone);

export async function POST(request: Request) {
  const user = await createOrGetUser();
  const userId = user.id;
  try {
    // Parse the request body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error("Error parsing request body:", parseError);
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request format",
        },
        { status: 400 }
      );
    }

    const { dataDescriptor, dataValue, amount, recipientId, paymentDescription, email } = body;

    console.log("Received payment request with:", {
      dataDescriptor: dataDescriptor ? "Present" : "Missing",
      dataValue: dataValue ? "Present" : "Missing",
      amount,
      email
    });

    // Validate required fields
    if (!dataDescriptor || !dataValue || !amount) {
      console.error("Missing required payment information:", {
        dataDescriptor: !dataDescriptor,
        dataValue: !dataValue,
        amount: !amount,
      });
      return NextResponse.json(
        {
          success: false,
          error: "Missing required payment information",
        },
        { status: 400 }
      );
    }

    // Set up the payment data
    const merchantAuthenticationType =
      new ApiContracts.MerchantAuthenticationType();
    merchantAuthenticationType.setName(process.env.AUTHORIZE_NET_API_LOGIN_ID!);
    merchantAuthenticationType.setTransactionKey(
      process.env.AUTHORIZE_NET_TRANSACTION_KEY!
    );

    // Create the payment nonce
    const opaqueData = new ApiContracts.OpaqueDataType();
    opaqueData.setDataDescriptor(dataDescriptor);
    opaqueData.setDataValue(dataValue);

    // Create the payment type
    const paymentType = new ApiContracts.PaymentType();
    paymentType.setOpaqueData(opaqueData);

    // Create the transaction request
    const transactionRequestType = new ApiContracts.TransactionRequestType();
    transactionRequestType.setTransactionType(
      ApiContracts.TransactionTypeEnum.AUTHCAPTURETRANSACTION
    );
    transactionRequestType.setPayment(paymentType);
    transactionRequestType.setAmount(amount);

    // Add order information
    const orderDetails = new ApiContracts.OrderType();
    const currentDate = format(estDate, 'yyyyMMddhh:mmss');
    orderDetails.setInvoiceNumber(`INV-${currentDate}`);
    orderDetails.setDescription(`Payment for ${paymentDescription}`);
    transactionRequestType.setOrder(orderDetails);

    // Add customer information
    const customerData = new ApiContracts.CustomerDataType();
    customerData.setType(ApiContracts.CustomerTypeEnum.INDIVIDUAL);
    const recipientIdPrefix = recipientId.slice(0, 5);
    customerData.setId(`CUST-${recipientIdPrefix}`);
    customerData.setEmail(email); // You might want to collect this from the user
    transactionRequestType.setCustomer(customerData);

    // Create the main request
    const createRequest = new ApiContracts.CreateTransactionRequest();
    createRequest.setMerchantAuthentication(merchantAuthenticationType);
    createRequest.setTransactionRequest(transactionRequestType);

    // Create the controller
    const createController = new ApiControllers.CreateTransactionController(
      createRequest.getJSON()
    );

    // Set the environment
    const environment =
      process.env.AUTHORIZE_ENVIRONMENT! === "production"
        ? Constants.endpoint.production
        : Constants.endpoint.sandbox;

    createController.setEnvironment(environment);

    // Execute the payment with a timeout
    try {
      const result = await executeWithTimeout(createController, API_TIMEOUT, amount, recipientId, paymentDescription, userId);
      console.log("Payment processing result:", result);
      return NextResponse.json(result);
    } catch (apiError) {
      console.error("API execution error:", apiError);
      return NextResponse.json(
        {
          success: false,
          error: "Payment processing failed",
          details:
            apiError instanceof Error ? apiError.message : String(apiError),
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Server error occurred",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// Helper function to execute the payment with a timeout
async function executeWithTimeout(controller: any, timeout: number, amount: number, recipientId: string, paymentDescription: string, userId: string) {
  return new Promise((resolve, reject) => {
    // Set a timeout to prevent function from hanging
    const timeoutId = setTimeout(() => {
      console.log("Payment processing timed out");
      resolve({ success: false, error: "Payment processing timed out" });
    }, timeout);

    try {
      controller.execute(async () => {
        // Clear the timeout since we got a response
        clearTimeout(timeoutId);

        try {
          const apiResponse = controller.getResponse();
          const error = controller.getError();

          if (error) {
            console.error("Payment Error:", error);
            resolve({
              success: false,
              error: "Payment processing failed",
              details: error,
            });
            return;
          }

          console.log(
            "Full API Response:",
            JSON.stringify(apiResponse, null, 2)
          );

          // Check if we have a valid response
          if (!apiResponse) {
            resolve({
              success: false,
              error: "No response from payment gateway",
            });
            return;
          }

          // Get the transaction response
          const transactionResponse = apiResponse.transactionResponse;

          if (!transactionResponse) {
            resolve({
              success: false,
              error: "Invalid transaction response",
              responseCode: apiResponse.messages?.resultCode,
            });
            return;
          }

          const responseCode = transactionResponse.responseCode;
          console.log("Response Code:", responseCode);

          // Check response code - "1" means approved
          if (responseCode === "1") {
            // Successful transaction
            resolve({
              success: true,
              transactionId: transactionResponse.transId,
              authCode: transactionResponse.authCode,
              message: "Transaction approved",
              avsResultCode: transactionResponse.avsResultCode,
              cvvResultCode: transactionResponse.cvvResultCode,
              accountNumber: transactionResponse.accountNumber,
              accountType: transactionResponse.accountType,
            });
            await saveAuthorizeNetTransaction({
              transactionId: transactionResponse.transId,
              amount: amount,
              id: transactionResponse.transId,
              status: "COMPLETED",
              description: paymentDescription,
              senderId: userId,
              receiverId: recipientId,
              createdAt: new Date(),
            });
          } else {
            // Get detailed error message
            let errorMessage = "Transaction declined";
            let errorCode = "";

            try {
              if (transactionResponse.errors && transactionResponse.errors.length > 0) {
                const error = transactionResponse.errors[0];
                errorCode = error.errorCode;
                errorMessage = error.errorText;
              }
            } catch (msgError) {
              console.error("Error getting error details:", msgError);
            }

            resolve({
              success: false,
              error: errorMessage,
              errorCode: errorCode,
              responseCode: responseCode,
              transactionId: transactionResponse.transId, // Include transaction ID even for declined transactions
            });
          }
        } catch (responseError) {
          console.error("Error processing response:", responseError);
          resolve({
            success: false,
            error: "Error processing payment response",
            details:
              responseError instanceof Error
                ? responseError.message
                : String(responseError),
          });
        }
      });
    } catch (executionError) {
      clearTimeout(timeoutId);
      console.error("Error executing payment:", executionError);
      resolve({
        success: false,
        error: "Error executing payment",
        details:
          executionError instanceof Error
            ? executionError.message
            : String(executionError),
      });
    }
  });
}
