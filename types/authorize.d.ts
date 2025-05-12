
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

    class OrderType {
        constructor(obj?: any, ...args: any[]);
        setInvoiceNumber(p_invoiceNumber: any): void;
        invoiceNumber: any;
        getInvoiceNumber(): any;
        setDescription(p_description: any): void;
        description: any;
        getDescription(): any;
        setDiscountAmount(p_discountAmount: any): void;
        discountAmount: any;
        getDiscountAmount(): any;
        setTaxIsAfterDiscount(p_taxIsAfterDiscount: any): void;
        taxIsAfterDiscount: any;
        getTaxIsAfterDiscount(): any;
        setTotalTaxTypeCode(p_totalTaxTypeCode: any): void;
        totalTaxTypeCode: any;
        getTotalTaxTypeCode(): any;
        setPurchaserVATRegistrationNumber(p_purchaserVATRegistrationNumber: any): void;
        purchaserVATRegistrationNumber: any;
        getPurchaserVATRegistrationNumber(): any;
        setMerchantVATRegistrationNumber(p_merchantVATRegistrationNumber: any): void;
        merchantVATRegistrationNumber: any;
        getMerchantVATRegistrationNumber(): any;
        setVatInvoiceReferenceNumber(p_vatInvoiceReferenceNumber: any): void;
        vatInvoiceReferenceNumber: any;
        getVatInvoiceReferenceNumber(): any;
        setPurchaserCode(p_purchaserCode: any): void;
        purchaserCode: any;
        getPurchaserCode(): any;
        setSummaryCommodityCode(p_summaryCommodityCode: any): void;
        summaryCommodityCode: any;
        getSummaryCommodityCode(): any;
        setPurchaseOrderDateUTC(p_purchaseOrderDateUTC: any): void;
        purchaseOrderDateUTC: any;
        getPurchaseOrderDateUTC(): any;
        setSupplierOrderReference(p_supplierOrderReference: any): void;
        supplierOrderReference: any;
        getSupplierOrderReference(): any;
        setAuthorizedContactName(p_authorizedContactName: any): void;
        authorizedContactName: any;
        getAuthorizedContactName(): any;
        setCardAcceptorRefNumber(p_cardAcceptorRefNumber: any): void;
        cardAcceptorRefNumber: any;
        getCardAcceptorRefNumber(): any;
        setAmexDataTAA1(p_amexDataTAA1: any): void;
        amexDataTAA1: any;
        getAmexDataTAA1(): any;
        setAmexDataTAA2(p_amexDataTAA2: any): void;
        amexDataTAA2: any;
        getAmexDataTAA2(): any;
        setAmexDataTAA3(p_amexDataTAA3: any): void;
        amexDataTAA3: any;
        getAmexDataTAA3(): any;
        setAmexDataTAA4(p_amexDataTAA4: any): void;
        amexDataTAA4: any;
        getAmexDataTAA4(): any;
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

    export class ANetApiResponse {
        constructor(obj?: any, ...args: any[]);
        getJSON(): {
            ErrorResponse: ANetApiResponse;
        };
        setRefId(p_refId: any): void;
        refId: any;
        getRefId(): any;
        setMessages(p_messages: any): void;
        messages: any;
        getMessages(): any;
        setSessionToken(p_sessionToken: any): void;
        sessionToken: any;
        getSessionToken(): any;
    }

    export class CreateTransactionResponse extends ANetApiResponse {
        setTransactionResponse(p_transactionResponse: any): void;
        transactionResponse: any;
        getTransactionResponse(): any;
        setProfileResponse(p_profileResponse: any): void;
        profileResponse: any;
        getProfileResponse(): any;
    }

    export class GetTransactionDetailsRequest extends ANetApiRequest {
        getJSON(): {
            getTransactionDetailsRequest: GetTransactionDetailsRequest;
        };
        setTransId(p_transId: any): void;
        transId: any;
        getTransId(): any;
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
