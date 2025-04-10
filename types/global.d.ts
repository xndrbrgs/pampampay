// Type definitions for Apple Pay and Google Pay

interface Window {
    ApplePaySession?: any
    google?: {
        payments?: {
            api?: {
                PaymentsClient: any
            }
        }
    }
}
