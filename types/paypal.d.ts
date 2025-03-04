export interface PayPalButtonsComponentProps {
  createOrder: () => Promise<string>
  onApprove: (data: { orderID: string }) => Promise<void>
  onError: (err: any) => void
  onCancel: () => void
  style?: {
    layout?: "vertical" | "horizontal"
    color?: "gold" | "blue" | "silver" | "white" | "black"
    shape?: "rect" | "pill"
    label?: "paypal" | "checkout" | "buynow" | "pay" | "venmo"
    height?: number
  }
  fundingSource?: string;
}

declare global {
  interface Window {
    paypal?: {
      Buttons: (props: PayPalButtonsComponentProps) => {
        render: (element: HTMLElement | string) => void
      }
      FUNDING: {
        PAYPAL: string
        VENMO: string
      }
    }
  }
}

export interface TransferFormData {
  amount: number
  recipientId: string
  note?: string
}

export interface TransactionRecord {
  id: string
  senderId: string
  recipientId: string
  amount: number
  status: "pending" | "completed" | "failed"
  createdAt: Date
  note?: string
  paymentMethod: "paypal" | "venmo"
}

