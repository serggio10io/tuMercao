"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { products as initialProducts } from "@/lib/data"
import type { Product } from "@/lib/types"
import { toast } from "@/hooks/use-toast"
import { cloudStorage } from "@/lib/cloud-storage"

interface ProductWithStock extends Product {
  stock: number
  images: string[]
  isVisible: boolean
  createdAt?: number
  updatedAt?: number
}

interface ProductsContextType {
  products: ProductWithStock[]
  visibleProducts: ProductWithStock[]
  isLoading: boolean
  isSyncing: boolean
  addProduct: (product: Omit<ProductWithStock, "id" | "isVisible" | "createdAt" | "updatedAt">) => Promise<void>
  removeProduct: (id: string) => Promise<void>
  updateProduct: (id: string, updates: Partial<ProductWithStock>) => Promise<void>
  updateStock: (id: string, stock: number) => void
  updateProductImages: (id: string, images: string[]) => void
  saveStockChanges: () => Promise<void>
  getStockStatus: (stock: number) => { status: string; color: string }
  toggleProductVisibility: (id: string) => Promise<void>
  syncProducts: () => Promise<void>
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined)

export function ProductsProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<ProductWithStock[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)

  // Initialize products and set up real-time sync
  useEffect(() => {
    let cleanup: (() => void) | null = null

    const initializeProducts = async () => {
      try {
        setIsLoading(true)

        // Load products from storage
        const storedProducts = await cloudStorage.loadProducts()

        if (storedProducts.length > 0) {
          setProducts(storedProducts)
        } else {
          // Initialize with default products if no stored data
          const initialProductsWithStock = initialProducts.map((product) => ({
            ...product,
            stock: Math.floor(Math.random() * 20) + 1,
            images: [product.image],
            isVisible: true,
            createdAt: Date.now() - Math.random() * 86400000, // Random time in last 24h
            updatedAt: Date.now(),
          }))

          setProducts(initialProductsWithStock)
          await cloudStorage.saveProducts(initialProductsWithStock)
        }

        // Start real-time sync
        cleanup = cloudStorage.startPolling((updatedProducts) => {
          setProducts(updatedProducts)
        }, 3000) // Poll every 3 seconds for faster updates
      } catch (error) {
        console.error("Failed to initialize products:", error)
        toast({
          title: "Error de inicialización",
          description: "Se cargaron los productos por defecto",
          variant: "destructive",
        })

        // Fallback to initial products
        const fallbackProducts = initialProducts.map((product) => ({
          ...product,
          stock: Math.floor(Math.random() * 20) + 1,
          images: [product.image],
          isVisible: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }))
        setProducts(fallbackProducts)
      } finally {
        setIsLoading(false)
      }
    }

    initializeProducts()

    return () => {
      cleanup?.()
    }
  }, [])

  // Auto-hide products when stock reaches zero
  useEffect(() => {
    setProducts((prevProducts) =>
      prevProducts.map((product) => ({
        ...product,
        isVisible: product.stock > 0,
      })),
    )
  }, [])

  const visibleProducts = products.filter((product) => product.isVisible && product.stock > 0)

  const syncProducts = useCallback(async () => {
    try {
      setIsSyncing(true)

      // Force a sync
      const success = await cloudStorage.forceSync()

      if (success) {
        const updatedProducts = await cloudStorage.loadProducts()
        setProducts(updatedProducts)

        toast({
          title: "✅ Productos sincronizados",
          description: "Los productos se han actualizado correctamente",
        })
      } else {
        throw new Error("Sync failed")
      }
    } catch (error) {
      console.error("Sync failed:", error)
      toast({
        title: "Error de sincronización",
        description: "Los productos están actualizados localmente",
        variant: "destructive",
      })
    } finally {
      setIsSyncing(false)
    }
  }, [])

  const saveProducts = async (updatedProducts: ProductWithStock[]) => {
    setProducts(updatedProducts)

    try {
      setIsSyncing(true)
      const success = await cloudStorage.saveProducts(updatedProducts)

      if (!success) {
        toast({
          title: "⚠️ Guardado local",
          description: "Los cambios se guardaron correctamente",
          variant: "default",
        })
      }
    } catch (error) {
      console.error("Failed to save products:", error)
      toast({
        title: "Error al guardar",
        description: "Los cambios se mantuvieron localmente",
        variant: "destructive",
      })
    } finally {
      setIsSyncing(false)
    }
  }

  const addProduct = async (productData: Omit<ProductWithStock, "id" | "isVisible" | "createdAt" | "updatedAt">) => {
    const newProduct: ProductWithStock = {
      ...productData,
      id: Date.now().toString(),
      isVisible: productData.stock > 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    const updatedProducts = [...products, newProduct]
    await saveProducts(updatedProducts)

    toast({
      title: "✅ Producto añadido",
      description: "El producto se ha añadido correctamente",
    })
  }

  const updateProduct = async (id: string, updates: Partial<ProductWithStock>) => {
    const updatedProducts = products.map((product) =>
      product.id === id
        ? {
            ...product,
            ...updates,
            updatedAt: Date.now(),
            isVisible: updates.stock !== undefined ? updates.stock > 0 : product.isVisible,
          }
        : product,
    )

    await saveProducts(updatedProducts)

    toast({
      title: "✅ Producto actualizado",
      description: "El producto se ha actualizado correctamente",
    })
  }

  const removeProduct = async (id: string) => {
    const updatedProducts = products.filter((p) => p.id !== id)
    await saveProducts(updatedProducts)

    toast({
      title: "🗑️ Producto eliminado",
      description: "El producto se ha eliminado correctamente",
    })
  }

  const updateStock = (id: string, stock: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, stock, isVisible: stock > 0, updatedAt: Date.now() } : p)),
    )
  }

  const updateProductImages = (id: string, images: string[]) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, images, image: images[0] || p.image, updatedAt: Date.now() } : p)),
    )
  }

  const toggleProductVisibility = async (id: string) => {
    const updatedProducts = products.map((p) =>
      p.id === id ? { ...p, isVisible: !p.isVisible, updatedAt: Date.now() } : p,
    )
    await saveProducts(updatedProducts)
  }

  const saveStockChanges = async () => {
    await saveProducts(products)

    toast({
      title: "✅ Stock actualizado",
      description: "Los cambios de stock se han guardado correctamente",
    })
  }

  const getStockStatus = (stock: number) => {
    if (stock === 0) {
      return { status: "Agotado", color: "text-red-600" }
    } else if (stock <= 2) {
      return { status: `Solo quedan ${stock}`, color: "text-orange-600" }
    } else {
      return { status: "Disponible", color: "text-green-600" }
    }
  }

  return (
    <ProductsContext.Provider
      value={{
        products,
        visibleProducts,
        isLoading,
        isSyncing,
        addProduct,
        removeProduct,
        updateProduct,
        updateStock,
        updateProductImages,
        saveStockChanges,
        getStockStatus,
        toggleProductVisibility,
        syncProducts,
      }}
    >
      {children}
    </ProductsContext.Provider>
  )
}

export function useProducts() {
  const context = useContext(ProductsContext)
  if (context === undefined) {
    throw new Error("useProducts must be used within a ProductsProvider")
  }
  return context
}
