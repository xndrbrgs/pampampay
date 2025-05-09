import type { NextApiRequest, NextApiResponse } from 'next';
import { APIContracts, APIControllers } from 'authorizenet';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        console.warn('⚠️ Method not allowed:', req.method);
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { opaqueData, amount } = req.body;

    console.log('📦 Received payment request:', { amount, opaqueData });

    try {
        const merchantAuthenticationType = new APIContracts.MerchantAuthenticationType();
        merchantAuthenticationType.setName(process.env.AUTHORIZE_API_LOGIN_ID!);
        merchantAuthenticationType.setTransactionKey(process.env.AUTHORIZE_TRANSACTION_KEY!);

        const opaqueDataType = new APIContracts.OpaqueDataType();
        opaqueDataType.setDataDescriptor(opaqueData.dataDescriptor);
        opaqueDataType.setDataValue(opaqueData.dataValue);

        const paymentType = new APIContracts.PaymentType();
        paymentType.setOpaqueData(opaqueDataType);

        const transactionRequestType = new APIContracts.TransactionRequestType();
        transactionRequestType.setTransactionType('authCaptureTransaction');
        transactionRequestType.setPayment(paymentType);
        transactionRequestType.setAmount(amount);

        const createRequest = new APIContracts.CreateTransactionRequest();
        createRequest.setMerchantAuthentication(merchantAuthenticationType);
        createRequest.setTransactionRequest(transactionRequestType);

        console.log('🧾 Creating transaction request...');

        const ctrl = new APIControllers.CreateTransactionController(createRequest.getJSON());
        ctrl.setEnvironment('production');

        await new Promise<void>((resolve, reject) => {
            ctrl.execute(() => {
                const apiResponse = ctrl.getResponse();
                const response = new APIContracts.CreateTransactionResponse(apiResponse);

                if (response.getMessages().getResultCode() === APIContracts.MessageTypeEnum.OK) {
                    const transactionResponse = response.getTransactionResponse();

                    if (transactionResponse.getMessages()) {
                        console.log('✅ Transaction approved:', {
                            id: transactionResponse.getTransId(),
                            message: transactionResponse.getMessages().getMessage()[0].getDescription(),
                        });
                        res.status(200).json({
                            transactionId: transactionResponse.getTransId(),
                            responseCode: transactionResponse.getResponseCode(),
                            message: transactionResponse.getMessages().getMessage()[0].getDescription(),
                        });
                    } else if (transactionResponse.getErrors()) {
                        console.error('❌ Transaction error:', transactionResponse.getErrors().getError()[0]);
                        res.status(500).json({
                            error: transactionResponse.getErrors().getError()[0].getErrorText(),
                        });
                    }
                } else {
                    const error = response.getMessages().getMessage()[0];
                    console.error('🚨 API rejected request:', error.getCode(), error.getText());
                    res.status(500).json({ error: error.getText() });
                }

                resolve();
            });
        });
    } catch (err) {
        console.error('🔥 Unexpected server error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}
