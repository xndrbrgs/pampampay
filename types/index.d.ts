/* eslint-disable no-unused-vars */

declare type SearchParamProps = {
    params: { [key: string]: string };
    searchParams: { [key: string]: string | string[] | undefined };
};

// ========================================

declare interface HeaderBoxProps {
    title: string;
    subtext: string;
}

declare interface StripeSessionProps {
    amount: number;
    paymentDescription: string;
    // ssn: string;
    recipientEmail: string;
    recipientId: string;
}