"use client"

import { useState } from "react"
import { products } from "@/lib/data"

interface CategoryPageProps {
  params: {
    slug: string
  }
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const categorySlug = params.slug

  // Filtrar productos por categoría
  let categoryProducts = products.filter((product) => product.category === categorySlug)

  // Aplicar filtro de búsqueda si existe
  if (searchQuery) {
    categoryProducts = categoryProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }

  const getCategoryName = (slug: string) => {
    const categoryMap: Record<string, string> = {
      frutas: "Frutas y Vegetales",
      artesanias: "Artesanías",
      ropa: "Ropa",
      electronica: "Electrónica",
      alimentos: "Alimentos",
      carnes: "Carnes",
      limpieza: "Limpieza",
    }
    return categoryMap[slug\
