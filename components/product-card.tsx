"use client"

import type React from "react"
import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import type { Product } from "@/lib/types"
import { Plus, Minus, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/contexts/cart-context"
import { useProducts } from "@/contexts/products-context"
import { toast } from "@/hooks/use-toast"

interface ProductCardProps {
  product: Product & { stock?: number; images?: string[] }
}

export default function ProductCard({ product }: ProductCardProps) {
  const { dispatch } = useCart()
  const { getStockStatus } = useProducts()
  const [quantity, setQuantity] = useState(1)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const stock = product.stock ?? 10 // Default stock if not provided
  const images = product.images || [product.image]
  const stockStatus = getStockStatus(stock)

  // Don't render if out of stock
  if (stock === 0) {
    return null
  }

  const addToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (stock < quantity) {
      toast({
        title: "Stock insuficiente",
        description: `Solo quedan ${stock} unidades disponibles`,
        variant: "destructive",
      })
      return
    }

    const productWithQuantity = {
      ...product,
      quantity: quantity,
    }

    dispatch({ type: "ADD_ITEM", payload: productWithQuantity })
    toast({
      title: "Producto añadido",
      description: `${quantity} ${quantity > 1 ? "unidades" : "unidad"} de ${product.name} se añadió al carrito`,
    })

    setQuantity(1)
  }

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <motion.div
      className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 w-full"
      whileHover={{ y: -8, scale: 1.02 }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Link href={`/productos/${product.id}`}>
        <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden group">
          <Image
            src={images[currentImageIndex] || "/placeholder.svg"}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            priority={false}
          />

          {/* Image Navigation */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ←
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                →
              </button>
              <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                {currentImageIndex + 1}/{images.length}
              </div>
            </>
          )}

          {/* Stock Badge */}
          {stock <= 2 && stock > 0 && (
            <Badge variant="destructive" className="absolute top-2 left-2 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              {stock <= 2 ? `Solo ${stock}` : "Pocos"}
            </Badge>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-secondary/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
      </Link>

      <div className="p-3 sm:p-4">
        <Link href={`/productos/${product.id}`}>
          <h3 className="font-montserrat font-semibold text-sm sm:text-base lg:text-lg text-secondary mb-1 line-clamp-1 hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        <p className="text-text/80 text-xs sm:text-sm mb-3 line-clamp-2 h-8 sm:h-10">{product.description}</p>

        {/* Stock Status */}
        <div className="mb-2">
          <span className={`text-xs font-medium ${stockStatus.color}`}>{stockStatus.status}</span>
        </div>

        <div className="flex justify-between items-center">
          <motion.span
            className="font-montserrat font-bold text-base sm:text-lg lg:text-xl text-primary"
            whileHover={{ scale: 1.1 }}
          >
            {product.price} CUP
          </motion.span>

          <div className="flex items-center gap-1 sm:gap-2">
            <div className="flex items-center border rounded-md overflow-hidden">
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setQuantity(Math.max(1, quantity - 1))
                }}
                className="px-1 sm:px-2 py-1 bg-gray-100 hover:bg-gray-200 text-secondary"
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="px-1 sm:px-2 py-1 text-xs sm:text-sm font-medium">{quantity}</span>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setQuantity(Math.min(stock, quantity + 1))
                }}
                className="px-1 sm:px-2 py-1 bg-gray-100 hover:bg-gray-200 text-secondary"
                disabled={quantity >= stock}
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={addToCart}
                size="sm"
                className="bg-highlight text-secondary hover:bg-highlight/90 font-semibold text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                disabled={stock === 0}
              >
                Añadir
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
