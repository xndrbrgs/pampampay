
declare module "authorizenet/lib/apicontracts" {

    export class MerchantAuthenticationType {

        setName(name: string): void;

        setTransactionKey(key: string): void;

    }

    export class LineItemType {
        constructor(obj?: any, ...args: any[]);
        setItemId(p_itemId: any): void;
        itemId: any;
        getItemId(): any;
        setName(p_name: any): void;
        name: any;
        getName(): any;
        setDescription(p_description: any): void;
        description: any;
        getDescription(): any;
        setQuantity(p_quantity: any): void;
        quantity: any;
        getQuantity(): any;
        setUnitPrice(p_unitPrice: any): void;
        unitPrice: any;
        getUnitPrice(): any;
        setTaxable(p_taxable: any): void;
        taxable: any;
        getTaxable(): any;
        setUnitOfMeasure(p_unitOfMeasure: any): void;
        unitOfMeasure: any;
        getUnitOfMeasure(): any;
        setTypeOfSupply(p_typeOfSupply: any): void;
        typeOfSupply: any;
        getTypeOfSupply(): any;
        setTaxRate(p_taxRate: any): void;
        taxRate: any;
        getTaxRate(): any;
        setTaxAmount(p_taxAmount: any): void;
        taxAmount: any;
        getTaxAmount(): any;
        setNationalTax(p_nationalTax: any): void;
        nationalTax: any;
        getNationalTax(): any;
        setLocalTax(p_localTax: any): void;
        localTax: any;
        getLocalTax(): any;
        setVatRate(p_vatRate: any): void;
        vatRate: any;
        getVatRate(): any;
        setAlternateTaxId(p_alternateTaxId: any): void;
        alternateTaxId: any;
        getAlternateTaxId(): any;
        setAlternateTaxType(p_alternateTaxType: any): void;
        alternateTaxType: any;
        getAlternateTaxType(): any;
        setAlternateTaxTypeApplied(p_alternateTaxTypeApplied: any): void;
        alternateTaxTypeApplied: any;
        getAlternateTaxTypeApplied(): any;
        setAlternateTaxRate(p_alternateTaxRate: any): void;
        alternateTaxRate: any;
        getAlternateTaxRate(): any;
        setAlternateTaxAmount(p_alternateTaxAmount: any): void;
        alternateTaxAmount: any;
        getAlternateTaxAmount(): any;
        setTotalAmount(p_totalAmount: any): void;
        totalAmount: any;
        getTotalAmount(): any;
        setCommodityCode(p_commodityCode: any): void;
        commodityCode: any;
        getCommodityCode(): any;
        setProductCode(p_productCode: any): void;
        productCode: any;
        getProductCode(): any;
        setProductSKU(p_productSKU: any): void;
        productSKU: any;
        getProductSKU(): any;
        setDiscountRate(p_discountRate: any): void;
        discountRate: any;
        getDiscountRate(): any;
        setDiscountAmount(p_discountAmount: any): void;
        discountAmount: any;
        getDiscountAmount(): any;
        setTaxIncludedInTotal(p_taxIncludedInTotal: any): void;
        taxIncludedInTotal: any;
        getTaxIncludedInTotal(): any;
        setTaxIsAfterDiscount(p_taxIsAfterDiscount: any): void;
        taxIsAfterDiscount: any;
        getTaxIsAfterDiscount(): any;
    }

    export class ArrayOfLineItem {
        constructor(obj?: any, ...args: any[]);
        setLineItem(p_lineItem: any): void;
        lineItem: any;
        getLineItem(): any;
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
        constructor(request: object);
        setEnvironment(environment: string): void;
        getError(): any;
        constructor(apiRequest: any);
        _request: any;
        _response: any;
        _endpoint: string;
        validateRequest(): void;
        validate(): void;
        getResponse(): any;
        getResultcode(): any;
        getMessagetype(): any;
        beforeExecute(): void;
        setClientId(): void;
        setEnvironment(env: any): void;
        execute(callback: any): void;
        getRequestType(): string;
        getTransactionResponse(): any;
        getResponseCode(): string;

    }

}



declare module "authorizenet/lib/constants" {

    export const endpoint: {

        production: string;

        sandbox: string;

    };

}
