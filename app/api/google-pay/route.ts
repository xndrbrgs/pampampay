import { NextResponse } from "next/server";
import * as ApiContracts from "authorizenet/lib/apicontracts";
import * as ApiControllers from "authorizenet/lib/apicontrollers";
import { Constants } from "authorizenet";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { saveAuthorizeNetTransaction } from "@/lib/actions/authorize-net-actions";
import { createOrGetUser } from "@/lib/actions/user.actions";

const API_TIMEOUT = 15000;
const timeZone = "America/New_York";
const now = new Date();
const estDate = toZonedTime(now, timeZone);

export async function POST(request: Request) {
  const user = await createOrGetUser();
  const userId = user.id;

  try {
    const body = await request.json();
    const {
      dataDescriptor,
      dataValue,
      amount,
      recipientId,
      paymentDescription,
      email,
    } = body;

    if (!dataDescriptor || !dataValue || !amount) {
      return NextResponse.json(
        { success: false, error: "Missing required payment information" },
        { status: 400 }
      );
    }

    const merchantAuth = new ApiContracts.MerchantAuthenticationType();
    merchantAuth.setName(process.env.AUTHORIZE_NET_API_LOGIN_ID!);
    merchantAuth.setTransactionKey(process.env.AUTHORIZE_NET_TRANSACTION_KEY!);

    const opaqueData = new ApiContracts.OpaqueDataType();
    opaqueData.setDataDescriptor(dataDescriptor);
    opaqueData.setDataValue(dataValue);

    const paymentType = new ApiContracts.PaymentType();
    paymentType.setOpaqueData(opaqueData);

    const lineItem = new ApiContracts.LineItemType();
    lineItem.setItemId("1");
    lineItem.setName("Google Pay Item");
    lineItem.setDescription(`Payment for ${paymentDescription}`);
    lineItem.setQuantity(1);
    lineItem.setUnitPrice(amount);

    const lineItems = new ApiContracts.ArrayOfLineItem();
    lineItems.setLineItem([lineItem]);

    const transactionRequest = new ApiContracts.TransactionRequestType();
    transactionRequest.setTransactionType(
      ApiContracts.TransactionTypeEnum.AUTHCAPTURETRANSACTION
    );
    transactionRequest.setAmount(amount);
    transactionRequest.setPayment(paymentType);
    transactionRequest.setLineItems(lineItems);

    const order = new ApiContracts.OrderType();
    const invoiceNumber = format(estDate, "yyyyMMddhhmm");
    order.setInvoiceNumber(`GPay-${invoiceNumber}`);
    order.setDescription(`Payment for ${paymentDescription}`);
    transactionRequest.setOrder(order);

    const customer = new ApiContracts.CustomerDataType();
    customer.setType(ApiContracts.CustomerTypeEnum.INDIVIDUAL);
    customer.setId(userId);
    customer.setEmail(email);
    transactionRequest.setCustomer(customer);

    const requestObj = new ApiContracts.CreateTransactionRequest();
    requestObj.setMerchantAuthentication(merchantAuth);
    requestObj.setTransactionRequest(transactionRequest);

    const controller = new ApiControllers.CreateTransactionController(
      requestObj.getJSON()
    );

    const environment =
      process.env.AUTHORIZE_ENVIRONMENT === "production"
        ? Constants.endpoint.production
        : Constants.endpoint.sandbox;

    controller.setEnvironment(environment);

    const result = await executeWithTimeout(
      controller,
      API_TIMEOUT,
      amount,
      recipientId,
      paymentDescription,
      userId
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Google Pay Server Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

async function executeWithTimeout(
  controller: any,
  timeout: number,
  amount: number,
  recipientId: string,
  paymentDescription: string,
  userId: string
) {
  return new Promise((resolve) => {
    const timeoutId = setTimeout(() => {
      console.warn("Google Pay transaction timed out.");
      resolve({ success: false, error: "Timeout while processing payment" });
    }, timeout);

    controller.execute(async () => {
      clearTimeout(timeoutId);

      const apiResponse = controller.getResponse();
      const error = controller.getError();

      if (error || !apiResponse) {
        return resolve({
          success: false,
          error: "Payment processing failed",
          details: error || "No response from API",
        });
      }

      const transactionResponse = apiResponse.transactionResponse;

      if (transactionResponse?.responseCode === "1") {
        const savedTransaction = await saveAuthorizeNetTransaction({
          amount,
          id: transactionResponse.transId,
          status: "COMPLETED",
          description: paymentDescription,
          senderId: userId,
          receiverId: recipientId,
          createdAt: new Date(),
        });

        resolve({
          success: true,
          transactionId: transactionResponse.transId,
          authCode: transactionResponse.authCode,
          message: "Google Pay transaction approved",
          details: savedTransaction,
        });
      } else {
        const errorText =
          transactionResponse?.errors?.[0]?.errorText || "Transaction declined";
        const errorCode =
          transactionResponse?.errors?.[0]?.errorCode || "UNKNOWN";

        resolve({
          success: false,
          error: errorText,
          errorCode,
          transactionId: transactionResponse?.transId,
        });
      }
    });
  });
}
