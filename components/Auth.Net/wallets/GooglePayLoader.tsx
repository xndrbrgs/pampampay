"use client"

import { useState, useEffect } from "react"
import Script from "next/script"

type GooglePayLoaderProps = {
  onLoad?: () => void
  onError?: (error: Error) => void
}

export function GooglePayLoader({ onLoad, onError }: GooglePayLoaderProps) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error" | "idle">("idle")

  useEffect(() => {
    // If Google Pay is already loaded, call onLoad immediately
    if (typeof window !== "undefined" && window.google && window.google.payments && window.google.payments.api) {
      setStatus("loaded")
      onLoad?.()
    } else {
      setStatus("loading")
    }
  }, [onLoad])

  const handleLoad = () => {
    console.log("Google Pay script loaded successfully")
    setStatus("loaded")
    onLoad?.()
  }

  const handleError = () => {
    console.error("Failed to load Google Pay script")
    setStatus("error")
    onError?.(new Error("Failed to load Google Pay script"))
  }

  return (
    <>
      {status === "loading" && (
        <Script
          src="https://pay.google.com/gp/p/js/pay.js"
          strategy="lazyOnload"
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </>
  )
}
