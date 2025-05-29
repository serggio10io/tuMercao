"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { toast } from "@/hooks/use-toast"
import type { Product } from "@/lib/types"

// Create a BroadcastChannel for real-time communication
let productChannel: BroadcastChannel | null = null

// Only create the channel in browser environment
if (typeof window !== "undefined") {
  try {
    productChannel = new BroadcastChannel("product_updates")
  } catch (error) {
    console.error("BroadcastChannel not supported", error)
  }
}

type ProductUpdateType = "add" | "update" | "delete"

interface ProductUpdate {
  type: ProductUpdateType
  product: Product
}

interface RealTimeContextType {
  broadcastProduct: (type: ProductUpdateType, product: Product) => void
}

const RealTimeContext = createContext<RealTimeContextType | undefined>(undefined)

export function RealTimeProvider({ children }: { children: React.ReactNode }) {
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (!productChannel) return

    // Set up listener for product updates
    const handleProductUpdate = (event: MessageEvent) => {
      const { type, product } = event.data as ProductUpdate

      if (type === "add") {
        toast({
          title: "¡Nuevo producto disponible!",
          description: `${product.name} ha sido añadido a la tienda`,
          action: (
            <a href={`/productos/${product.id}`} className="bg-primary text-white px-3 py-1 rounded-md text-xs">
              Ver producto
            </a>
          ),
        })
      }
    }

    productChannel.addEventListener("message", handleProductUpdate)
    setInitialized(true)

    return () => {
      productChannel?.removeEventListener("message", handleProductUpdate)
    }
  }, [])

  const broadcastProduct = (type: ProductUpdateType, product: Product) => {
    if (!productChannel) return

    productChannel.postMessage({ type, product })
  }

  return <RealTimeContext.Provider value={{ broadcastProduct }}>{children}</RealTimeContext.Provider>
}

export function useRealTime() {
  const context = useContext(RealTimeContext)
  if (context === undefined) {
    throw new Error("useRealTime must be used within a RealTimeProvider")
  }
  return context
}
