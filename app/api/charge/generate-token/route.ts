import type { NextApiRequest, NextApiResponse } from 'next';
import { APIContracts, APIControllers } from 'authorizenet';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const merchantAuthenticationType = new APIContracts.MerchantAuthenticationType();
    merchantAuthenticationType.setName(process.env.AUTHORIZE_API_LOGIN_ID!);
    merchantAuthenticationType.setTransactionKey(process.env.AUTHORIZE_TRANSACTION_KEY!);

    const transactionRequestType = new APIContracts.TransactionRequestType();
    transactionRequestType.setTransactionType('authCaptureTransaction');
    transactionRequestType.setAmount(19.99);

    const request = new APIContracts.GetHostedPaymentPageRequest();
    request.setMerchantAuthentication(merchantAuthenticationType);
    request.setTransactionRequest(transactionRequestType);

    const setting1 = new APIContracts.SettingType();
    setting1.setSettingName('hostedPaymentButtonOptions');
    setting1.setSettingValue(JSON.stringify({ text: 'Pay Now' }));

    const setting2 = new APIContracts.SettingType();
    setting2.setSettingName('hostedPaymentReturnOptions');
    setting2.setSettingValue(
        JSON.stringify({
            showReceipt: false,
            url: 'https://yoursite.com/thank-you', // optional
            urlText: 'Return',
            cancelUrl: 'https://yoursite.com/cancelled', // optional
            cancelUrlText: 'Cancel',
        })
    );

    request.setHostedPaymentSettings(new APIContracts.ArrayOfSetting().setSetting([setting1, setting2]));

    const ctrl = new APIControllers.GetHostedPaymentPageController(request.getJSON());
    ctrl.setEnvironment('production');

    ctrl.execute(() => {
        const apiResponse = ctrl.getResponse();
        const response = new APIContracts.GetHostedPaymentPageResponse(apiResponse);

        if (response.getMessages().getResultCode() === APIContracts.MessageTypeEnum.OK) {
            const token = response.getToken();
            console.log('✅ Generated Accept Hosted token:', token);
            res.status(200).json({ token });
        } else {
            const error = response.getMessages().getMessage()[0];
            console.error('❌ Error generating token:', error.getText());
            res.status(500).json({ error: error.getText() });
        }
    });
}
