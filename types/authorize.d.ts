
declare module "authorizenet/lib/apicontracts" {

    export class MerchantAuthenticationType {

        setName(name: string): void;

        setTransactionKey(key: string): void;

    }



    export class CreditCardType {

        setCardNumber(cardNumber: string): void;

        setExpirationDate(expirationDate: string): void;

        setCardCode(cardCode: string): void;

    }



    export class PaymentType {
        constructor(obj?: any, ...args: any[]);
        setCreditCard(p_creditCard: any): void;
        creditCard: any;
        getCreditCard(): any;
        setBankAccount(p_bankAccount: any): void;
        bankAccount: any;
        getBankAccount(): any;
        setTrackData(p_trackData: any): void;
        trackData: any;
        getTrackData(): any;
        setEncryptedTrackData(p_encryptedTrackData: any): void;
        encryptedTrackData: any;
        getEncryptedTrackData(): any;
        setPayPal(p_payPal: any): void;
        payPal: any;
        getPayPal(): any;
        setOpaqueData(p_opaqueData: any): void;
        opaqueData: any;
        getOpaqueData(): any;
        setEmv(p_emv: any): void;
        emv: any;
        getEmv(): any;
        setDataSource(p_dataSource: any): void;
        dataSource: any;
        getDataSource(): any;
    }



    export class TransactionRequestType {

        setTransactionType(transactionType: string): void;

        setPayment(payment: PaymentType): void;

        setAmount(amount: number): void;

    }



    export class CreateTransactionRequest {

        setMerchantAuthentication(auth: MerchantAuthenticationType): void;

        setTransactionRequest(request: TransactionRequestType): void;

        getJSON(): object;

    }



    export enum TransactionTypeEnum {

        AUTHCAPTURETRANSACTION = "authCaptureTransaction",

    }

    class OpaqueDataType {
        constructor(obj?: any, ...args: any[]);
        setDataDescriptor(p_dataDescriptor: any): void;
        dataDescriptor: any;
        getDataDescriptor(): any;
        setDataValue(p_dataValue: any): void;
        dataValue: any;
        getDataValue(): any;
        setDataKey(p_dataKey: any): void;
        dataKey: any;
        getDataKey(): any;
        setExpirationTimeStamp(p_expirationTimeStamp: any): void;
        expirationTimeStamp: any;
        getExpirationTimeStamp(): any;
    }

}



declare module "authorizenet/lib/apicontrollers" {

    import { CreateTransactionRequest } from "authorizenet/lib/apicontracts";



    export class CreateTransactionController {

        constructor(request: object);

        setEnvironment(environment: string): void;

        execute(callback: () => void): void;

        getResponse(): any;

        getError(): any;

    }

}



declare module "authorizenet/lib/constants" {

    export const endpoint: {

        production: string;

        sandbox: string;

    };

}
