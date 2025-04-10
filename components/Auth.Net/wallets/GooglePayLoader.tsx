"use client"

import { useEffect, useState } from "react"

export function GooglePayLoader() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined" || isLoaded) return

    // Check if the script is already loaded
    if (window.google && window.google.payments && window.google.payments.api) {
      setIsLoaded(true)
      return
    }

    // Load the Google Pay API script
    const script = document.createElement("script")
    script.src = "https://pay.google.com/gp/p/js/pay.js"
    script.async = true
    script.onload = () => {
      console.log("Google Pay API script loaded successfully")
      setIsLoaded(true)
    }
    script.onerror = () => {
      console.error("Failed to load Google Pay API script")
    }
    document.body.appendChild(script)

    return () => {
      // Clean up if needed
    }
  }, [isLoaded])

  return null
}
