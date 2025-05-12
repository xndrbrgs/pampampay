
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

    export class OrderType {
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

    export class CustomerDataType {
        constructor(obj?: any, ...args: any[]);
        setType(p_type: any): void;
        type: any;
        getType(): any;
        setId(p_id: any): void;
        id: any;
        getId(): any;
        setEmail(p_email: any): void;
        email: any;
        getEmail(): any;
        setDriversLicense(p_driversLicense: any): void;
        driversLicense: any;
        getDriversLicense(): any;
        setTaxId(p_taxId: any): void;
        taxId: any;
        getTaxId(): any;
    }
    namespace CustomerTypeEnum {
        const INDIVIDUAL: string;
        const BUSINESS: string;
    }
    export class TransactionRequestType {
        constructor(obj?: any, ...args: any[]);
        setTransactionType(p_transactionType: any): void;
        transactionType: any;
        getTransactionType(): any;
        setAmount(p_amount: any): void;
        amount: any;
        getAmount(): any;
        setCurrencyCode(p_currencyCode: any): void;
        currencyCode: any;
        getCurrencyCode(): any;
        setPayment(p_payment: any): void;
        payment: any;
        getPayment(): any;
        setProfile(p_profile: any): void;
        profile: any;
        getProfile(): any;
        setSolution(p_solution: any): void;
        solution: any;
        getSolution(): any;
        setCallId(p_callId: any): void;
        callId: any;
        getCallId(): any;
        setTerminalNumber(p_terminalNumber: any): void;
        terminalNumber: any;
        getTerminalNumber(): any;
        setAuthCode(p_authCode: any): void;
        authCode: any;
        getAuthCode(): any;
        setRefTransId(p_refTransId: any): void;
        refTransId: any;
        getRefTransId(): any;
        setSplitTenderId(p_splitTenderId: any): void;
        splitTenderId: any;
        getSplitTenderId(): any;
        setOrder(p_order: any): void;
        order: any;
        getOrder(): any;
        setLineItems(p_lineItems: any): void;
        lineItems: any;
        getLineItems(): any;
        setTax(p_tax: any): void;
        tax: any;
        getTax(): any;
        setDuty(p_duty: any): void;
        duty: any;
        getDuty(): any;
        setShipping(p_shipping: any): void;
        shipping: any;
        getShipping(): any;
        setTaxExempt(p_taxExempt: any): void;
        taxExempt: any;
        getTaxExempt(): any;
        setPoNumber(p_poNumber: any): void;
        poNumber: any;
        getPoNumber(): any;
        setCustomer(p_customer: any): void;
        customer: any;
        getCustomer(): any;
        setBillTo(p_billTo: any): void;
        billTo: any;
        getBillTo(): any;
        setShipTo(p_shipTo: any): void;
        shipTo: any;
        getShipTo(): any;
        setCustomerIP(p_customerIP: any): void;
        customerIP: any;
        getCustomerIP(): any;
        setCardholderAuthentication(p_cardholderAuthentication: any): void;
        cardholderAuthentication: any;
        getCardholderAuthentication(): any;
        setRetail(p_retail: any): void;
        retail: any;
        getRetail(): any;
        setEmployeeId(p_employeeId: any): void;
        employeeId: any;
        getEmployeeId(): any;
        setTransactionSettings(p_transactionSettings: any): void;
        transactionSettings: any;
        getTransactionSettings(): any;
        setUserFields(p_userFields: any): void;
        userFields: any;
        getUserFields(): any;
        setSurcharge(p_surcharge: any): void;
        surcharge: any;
        getSurcharge(): any;
        setMerchantDescriptor(p_merchantDescriptor: any): void;
        merchantDescriptor: any;
        getMerchantDescriptor(): any;
        setSubMerchant(p_subMerchant: any): void;
        subMerchant: any;
        getSubMerchant(): any;
        setTip(p_tip: any): void;
        tip: any;
        getTip(): any;
        setProcessingOptions(p_processingOptions: any): void;
        processingOptions: any;
        getProcessingOptions(): any;
        setSubsequentAuthInformation(p_subsequentAuthInformation: any): void;
        subsequentAuthInformation: any;
        getSubsequentAuthInformation(): any;
        setOtherTax(p_otherTax: any): void;
        otherTax: any;
        getOtherTax(): any;
        setShipFrom(p_shipFrom: any): void;
        shipFrom: any;
        getShipFrom(): any;
        setAuthorizationIndicatorType(p_authorizationIndicatorType: any): void;
        authorizationIndicatorType: any;
        getAuthorizationIndicatorType(): any;
    }
    namespace TransactionRequestType {
        class UserFields {
            constructor(obj?: any);
            setUserField(p_userField: string): void;
            userField: string;
            getUserField(): string;
        }
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
