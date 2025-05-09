import type { NextApiRequest, NextApiResponse } from 'next';
import { APIContracts, APIControllers } from 'authorizenet';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end('Method not allowed');

  const { opaqueData, amount } = req.body;

  const merchantAuthentication = new APIContracts.MerchantAuthenticationType();
  merchantAuthentication.setName(process.env.AUTHORIZE_API_LOGIN_ID!);
  merchantAuthentication.setTransactionKey(process.env.AUTHORIZE_TRANSACTION_KEY!);

  const paymentType = new APIContracts.PaymentType();
  const opaqueDataType = new APIContracts.OpaqueDataType();
  opaqueDataType.setDataDescriptor(opaqueData.dataDescriptor);
  opaqueDataType.setDataValue(opaqueData.dataValue);
  paymentType.setOpaqueData(opaqueDataType);

  const transactionRequestType = new APIContracts.TransactionRequestType();
  transactionRequestType.setTransactionType('authCaptureTransaction');
  transactionRequestType.setPayment(paymentType);
  transactionRequestType.setAmount(amount);

  const createRequest = new APIContracts.CreateTransactionRequest();
  createRequest.setMerchantAuthentication(merchantAuthentication);
  createRequest.setTransactionRequest(transactionRequestType);

  const ctrl = new APIControllers.CreateTransactionController(createRequest.getJSON());
  ctrl.setEnvironment('sandbox'); // or 'production'

  ctrl.execute(() => {
    const response = ctrl.getResponse();
    const parsedResponse = new APIContracts.CreateTransactionResponse(response);

    if (
      parsedResponse != null &&
      parsedResponse.getMessages().getResultCode() === APIContracts.MessageTypeEnum.OK
    ) {
      return res.status(200).json({
        transactionId: parsedResponse.getTransactionResponse().getTransId(),
        responseCode: parsedResponse.getTransactionResponse().getResponseCode(),
        message: parsedResponse.getMessages().getMessage()[0].getText(),
      });
    } else {
      const message =
        parsedResponse?.getTransactionResponse()?.getErrors()?.getError()[0].getErrorText() ||
        'Transaction failed';
      return res.status(400).json({ error: message });
    }
  });
}
