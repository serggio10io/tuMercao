"use client"

import type React from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import type { Product } from "@/lib/types"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/contexts/cart-context"
import { toast } from "@/components/ui/use-toast"

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { dispatch } = useCart()

  const addToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dispatch({ type: "ADD_ITEM", payload: product })
    toast({
      title: "Producto añadido",
      description: `${product.name} se añadió al carrito`,
    })
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
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            priority={false}
          />
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

        <div className="flex justify-between items-center">
          <motion.span
            className="font-montserrat font-bold text-base sm:text-lg lg:text-xl text-primary"
            whileHover={{ scale: 1.1 }}
          >
            {product.price} CUP
          </motion.span>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={addToCart}
              size="sm"
              className="bg-highlight text-secondary hover:bg-highlight/90 font-semibold text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              Añadir
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
