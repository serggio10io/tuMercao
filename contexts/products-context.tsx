"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { products as initialProducts } from "@/lib/data"
import type { Product } from "@/lib/types"
import { toast } from "@/hooks/use-toast"

interface ProductWithStock extends Product {
  stock: number
  images: string[] // Add support for multiple images
  isVisible: boolean // Add visibility flag
}

interface ProductsContextType {
  products: ProductWithStock[]
  visibleProducts: ProductWithStock[] // Only products with stock > 0
  addProduct: (product: Omit<ProductWithStock, "id" | "isVisible">) => void
  removeProduct: (id: string) => void
  updateStock: (id: string, stock: number) => void
  updateProductImages: (id: string, images: string[]) => void
  saveStockChanges: () => void
  getStockStatus: (stock: number) => { status: string; color: string }
  toggleProductVisibility: (id: string) => void
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined)

export function ProductsProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<ProductWithStock[]>([])

  useEffect(() => {
    // Load products from localStorage or use initial data
    const savedProducts = localStorage.getItem("admin_products")
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts))
    } else {
      // Convert initial products adding stock and multiple images support
      const productsWithStock = initialProducts.map((product) => ({
        ...product,
        stock: Math.floor(Math.random() * 20) + 1, // Random stock between 1-20
        images: [product.image], // Convert single image to array
        isVisible: true,
      }))
      setProducts(productsWithStock)
      localStorage.setItem("admin_products", JSON.stringify(productsWithStock))
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

  const addProduct = (productData: Omit<ProductWithStock, "id" | "isVisible">) => {
    const newProduct: ProductWithStock = {
      ...productData,
      id: Date.now().toString(),
      isVisible: productData.stock > 0,
    }
    const updatedProducts = [...products, newProduct]
    setProducts(updatedProducts)
    localStorage.setItem("admin_products", JSON.stringify(updatedProducts))
    toast({
      title: "✅ Producto añadido",
      description: "El producto se ha añadido correctamente",
    })
  }

  const removeProduct = (id: string) => {
    const updatedProducts = products.filter((p) => p.id !== id)
    setProducts(updatedProducts)
    localStorage.setItem("admin_products", JSON.stringify(updatedProducts))
    toast({
      title: "🗑️ Producto eliminado",
      description: "El producto se ha eliminado correctamente",
    })
  }

  const updateStock = (id: string, stock: number) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, stock, isVisible: stock > 0 } : p)))
  }

  const updateProductImages = (id: string, images: string[]) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, images, image: images[0] || p.image } : p)))
    localStorage.setItem("admin_products", JSON.stringify(products))
  }

  const toggleProductVisibility = (id: string) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, isVisible: !p.isVisible } : p)))
  }

  const saveStockChanges = () => {
    localStorage.setItem("admin_products", JSON.stringify(products))
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
        addProduct,
        removeProduct,
        updateStock,
        updateProductImages,
        saveStockChanges,
        getStockStatus,
        toggleProductVisibility,
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
