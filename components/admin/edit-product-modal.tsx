"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useProducts } from "@/contexts/products-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import ImageUpload from "@/components/admin/image-upload"

interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  stock: number
  images: string[]
  location: string
  contactNumber: string
  sellerName: string
}

interface EditProductModalProps {
  isOpen: boolean
  onClose: () => void
  product: Product | null
}

export function EditProductModal({ isOpen, onClose, product }: EditProductModalProps) {
  const { updateProduct } = useProducts()
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    location: "Camagüey",
    contactNumber: "+58850138",
    sellerName: "tuMercao",
    images: [] as string[],
  })

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        category: product.category,
        stock: product.stock.toString(),
        location: product.location,
        contactNumber: product.contactNumber,
        sellerName: product.sellerName,
        images: product.images || [],
      })
    }
  }, [product])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!product) return

    if (formData.images.length === 0) {
      alert("Por favor añade al menos una imagen del producto")
      return
    }

    await updateProduct(product.id, {
      name: formData.name,
      description: formData.description,
      price: Number.parseFloat(formData.price),
      category: formData.category,
      stock: Number.parseInt(formData.stock),
      location: formData.location,
      contactNumber: formData.contactNumber,
      sellerName: formData.sellerName,
      images: formData.images,
      image: formData.images[0], // First image as main image
    })

    onClose()
  }

  const handleClose = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "",
      stock: "",
      location: "Camagüey",
      contactNumber: "+58850138",
      sellerName: "tuMercao",
      images: [],
    })
    onClose()
  }

  if (!product) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Producto</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="name">Nombre del producto</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Precio (CUP)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData((prev) => ({ ...prev, stock: e.target.value }))}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="category">Categoría</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="alimentos">Alimentos</SelectItem>
                <SelectItem value="carnes">Carnes</SelectItem>
                <SelectItem value="limpieza">Limpieza</SelectItem>
                <SelectItem value="ofertas">Ofertas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <ImageUpload
            images={formData.images}
            onImagesChange={(images) => setFormData((prev) => ({ ...prev, images }))}
            maxImages={5}
          />

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 bg-[#2E86C1] hover:bg-[#2574A9]">
              Guardar Cambios
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
