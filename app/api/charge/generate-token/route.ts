import type { NextApiRequest, NextApiResponse } from 'next';
import { APIContracts, APIControllers } from 'authorizenet';
import { promisify } from 'util';

const executeController = promisify((ctrl: any, callback: (err: any, response: any) => void) => {
    ctrl.execute(() => {
        const apiResponse = ctrl.getResponse();
        callback(null, apiResponse);
    });
});

const validateEnvVariables = () => {
    const { AUTHORIZE_NET_API_LOGIN_ID, AUTHORIZE_NET_TRANSACTION_KEY } = process.env;
    if (!AUTHORIZE_NET_API_LOGIN_ID || !AUTHORIZE_NET_TRANSACTION_KEY) {
        throw new Error('Missing required environment variables: AUTHORIZE_NET_API_LOGIN_ID or AUTHORIZE_NET_TRANSACTION_KEY');
    }
};

const createMerchantAuthentication = () => {
    const merchantAuthenticationType = new APIContracts.MerchantAuthenticationType();
    merchantAuthenticationType.setName(process.env.AUTHORIZE_NET_API_LOGIN_ID!);
    merchantAuthenticationType.setTransactionKey(process.env.AUTHORIZE_NET_TRANSACTION_KEY!);
    return merchantAuthenticationType;
};

const createTransactionRequest = () => {
    const transactionRequestType = new APIContracts.TransactionRequestType();
    transactionRequestType.setTransactionType('authCaptureTransaction');
    transactionRequestType.setAmount(0.50);
    return transactionRequestType;
};

const createHostedPaymentSettings = () => {
    const setting1 = new APIContracts.SettingType();
    setting1.setSettingName('hostedPaymentButtonOptions');
    setting1.setSettingValue(JSON.stringify({ text: 'Pay Now' }));

    const setting2 = new APIContracts.SettingType();
    setting2.setSettingName('hostedPaymentReturnOptions');
    setting2.setSettingValue(
        JSON.stringify({
            showReceipt: false,
            url: 'https://yoursite.com/thank-you',
            urlText: 'Return',
            cancelUrl: 'https://yoursite.com/cancelled',
            cancelUrlText: 'Cancel',
        })
    );

    const settingsArray = new APIContracts.ArrayOfSetting();
    settingsArray.setSetting([setting1, setting2]);
    return settingsArray;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        validateEnvVariables();

        const merchantAuthentication = createMerchantAuthentication();
        const transactionRequest = createTransactionRequest();
        const hostedPaymentSettings = createHostedPaymentSettings();

        const request = new APIContracts.GetHostedPaymentPageRequest();
        request.setMerchantAuthentication(merchantAuthentication);
        request.setTransactionRequest(transactionRequest);
        request.setHostedPaymentSettings(hostedPaymentSettings);

        const ctrl = new APIControllers.GetHostedPaymentPageController(request.getJSON());
        ctrl.setEnvironment('production');

        const apiResponse = await executeController(ctrl);
        const response = new APIContracts.GetHostedPaymentPageResponse(apiResponse);

        if (response.getMessages().getResultCode() === APIContracts.MessageTypeEnum.OK) {
            const token = response.getToken();
            console.log('✅ Generated Accept Hosted token:', token);
            return res.status(200).json({ token });
        } else {
            const error = response.getMessages().getMessage()[0];
            console.error('❌ Error generating token:', error.getText());
            return res.status(500).json({ error: error.getText() });
        }
    } catch (error: any) {
        console.error('❌ Unexpected error:', error.message);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}