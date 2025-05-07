// Log levels for different types of messages
export enum LogLevel {
    INFO = "INFO",
    WARNING = "WARNING",
    ERROR = "ERROR",
    SUCCESS = "SUCCESS",
    DEBUG = "DEBUG",
  }
  
  // Payment methods for categorizing logs
  export type PaymentMethod = "credit-card" | "google-pay" | "apple-pay" | "general"
  
  // Function to log payment-related messages with consistent formatting
  export function logPayment(method: PaymentMethod, message: string, level: LogLevel = LogLevel.INFO, data?: any) {
    const timestamp = new Date().toISOString()
    const prefix = `[${timestamp}] [PAYMENT:${method.toUpperCase()}] [${level}]`
  
    // Style based on log level
    let style = ""
    switch (level) {
      case LogLevel.INFO:
        style = "color: #3498db" // Blue
        break
      case LogLevel.WARNING:
        style = "color: #f39c12" // Orange
        break
      case LogLevel.ERROR:
        style = "color: #e74c3c; font-weight: bold" // Red, bold
        break
      case LogLevel.SUCCESS:
        style = "color: #2ecc71" // Green
        break
      case LogLevel.DEBUG:
        style = "color: #9b59b6" // Purple
        break
    }
  
    // Log the message with styling
    console.log(`%c${prefix} ${message}`, style)
  
    // Log additional data if provided
    if (data) {
      console.log(`%c${prefix} Additional data:`, style, data)
    }
  }
  
  // Helper functions for specific log levels
  export const logInfo = (method: PaymentMethod, message: string, data?: any) =>
    logPayment(method, message, LogLevel.INFO, data)
  
  export const logWarning = (method: PaymentMethod, message: string, data?: any) =>
    logPayment(method, message, LogLevel.WARNING, data)
  
  export const logError = (method: PaymentMethod, message: string, data?: any) =>
    logPayment(method, message, LogLevel.ERROR, data)
  
  export const logSuccess = (method: PaymentMethod, message: string, data?: any) =>
    logPayment(method, message, LogLevel.SUCCESS, data)
  
  export const logDebug = (method: PaymentMethod, message: string, data?: any) =>
    logPayment(method, message, LogLevel.DEBUG, data)
  