import { NextRequest, NextResponse } from "next/server";
import { APIContracts, APIControllers } from "authorizenet";

export async function POST(req: NextRequest) {
  try {
    const {
      opaqueData,
      amount,
      recipientId,
      recipientEmail,
      paymentDescription,
    } = await req.json();

    const merchantAuthentication = new APIContracts.MerchantAuthenticationType();
    merchantAuthentication.setName(process.env.AUTHNET_LOGIN_ID || "");
    merchantAuthentication.setTransactionKey(process.env.AUTHNET_TRANSACTION_KEY || "");

    const opaqueDataType = new APIContracts.OpaqueDataType();
    opaqueDataType.setDataDescriptor(opaqueData.dataDescriptor);
    opaqueDataType.setDataValue(opaqueData.dataValue);

    const paymentType = new APIContracts.PaymentType();
    paymentType.setOpaqueData(opaqueDataType);

    const transactionRequestType = new APIContracts.TransactionRequestType();
    transactionRequestType.setTransactionType("authCaptureTransaction");
    transactionRequestType.setAmount(parseFloat(amount));
    transactionRequestType.setPayment(paymentType);
    transactionRequestType.setOrder({
      invoiceNumber: `INV-${Date.now()}`,
      description: paymentDescription,
    });

    const createRequest = new APIContracts.CreateTransactionRequest();
    createRequest.setMerchantAuthentication(merchantAuthentication);
    createRequest.setTransactionRequest(transactionRequestType);

    const ctrl = new APIControllers.CreateTransactionController(createRequest.getJSON());
    await new Promise((resolve) => ctrl.execute(resolve));

    const apiResponse = ctrl.getResponse();
    const response = new APIContracts.CreateTransactionResponse(apiResponse);

    if (
      response &&
      response.getMessages().getResultCode() === APIContracts.MessageTypeEnum.OK
    ) {
      const transactionResponse = response.getTransactionResponse();

      if (
        transactionResponse &&
        transactionResponse.getResponseCode() === "1"
      ) {
        return NextResponse.json(
          {
            success: true,
            transactionId: transactionResponse.getTransId(),
            message: "Payment authorized and captured successfully.",
          },
          { status: 200 }
        );
      } else {
        throw new Error(
          `Transaction failed: ${transactionResponse?.getResponseCode()}`
        );
      }
    } else {
      const errorMessages = response.getMessages().getMessage();
      throw new Error(`Error: ${errorMessages[0].getText()}`);
    }
  } catch (error: any) {
    console.error("Authorize.Net Error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Unknown error" },
      { status: 500 }
    );
  }
}
