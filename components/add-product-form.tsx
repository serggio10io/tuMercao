"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "@/hooks/use-toast"
import { Loader2, X, Upload, Plus } from "lucide-react"
import { useProducts } from "@/contexts/products-context"
import { useRealTime } from "@/contexts/real-time-context"
import Image from "next/image"

interface AddProductFormProps {
  onSuccess: () => void
}

export default function AddProductForm({ onSuccess }: AddProductFormProps) {
  const { addProduct } = useProducts()
  const { broadcastProduct } = useRealTime()
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [newImageUrl, setNewImageUrl] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    location: "",
    contactType: "whatsapp",
    contactNumber: "",
    contactUsername: "",
    discount: 0,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newImages = Array.from(e.target.files).map((file) => URL.createObjectURL(file))
      setImages((prev) => [...prev, ...newImages])
    }
  }

  const addImageUrl = () => {
    if (newImageUrl && newImageUrl.trim() !== "") {
      setImageUrls((prev) => [...prev, newImageUrl])
      setNewImageUrl("")
    }
  }

  const removeImage = (index: number, type: "file" | "url") => {
    if (type === "file") {
      setImages((prev) => prev.filter((_, i) => i !== index))
    } else {
      setImageUrls((prev) => prev.filter((_, i) => i !== index))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Combine all images
      const allImages = [...images, ...imageUrls]

      if (allImages.length === 0) {
        toast({
          title: "Error",
          description: "Debes subir al menos una imagen del producto.",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      // Create new product with current date and random ID
      const newProduct = {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        category: formData.category,
        location: formData.location,
        contactType: formData.contactType as "whatsapp" | "telegram",
        contactNumber: formData.contactType === "whatsapp" ? formData.contactNumber : undefined,
        contactUsername: formData.contactType === "telegram" ? formData.contactUsername : undefined,
        image: allImages[0], // Main image
        images: allImages, // All images
        discount: formData.discount,
        publishDate: new Date().toISOString(),
        sellerName: "Usuario de tuMercao",
        sellerAvatar: "/placeholder.svg?height=50&width=50",
        sellerMemberSince: new Date().toISOString(),
        stock: 10, // Default stock
      }

      // Add to products context (which saves to localStorage)
      addProduct(newProduct)

      // Broadcast to all users
      broadcastProduct("add", {
        ...newProduct,
        id: Date.now().toString(), // Add ID for broadcasting
      })

      toast({
        title: "Producto añadido",
        description: "Tu producto ha sido publicado exitosamente.",
      })

      onSuccess()
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un problema al publicar tu producto. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const repartos = [
    "Centro Histórico, Camagüey",
    "Reparto Garrido, Camagüey",
    "Reparto La Vigía, Camagüey",
    "Reparto Julio Antonio Mella, Camagüey",
    "Reparto Florat, Camagüey",
    "Reparto Puerto Príncipe, Camagüey",
    "Reparto Lenin, Camagüey",
    "Reparto Jayamá, Camagüey",
    "Reparto Montecarlo, Camagüey",
    "Reparto Previsora, Camagüey",
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Nombre del producto *</Label>
        <Input
          id="name"
          name="name"
          required
          value={formData.name}
          onChange={handleChange}
          placeholder="Ej: Piña Fresca de Camagüey"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción *</Label>
        <Textarea
          id="description"
          name="description"
          required
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe tu producto, incluye detalles importantes..."
          rows={4}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Precio (CUP) *</Label>
          <Input
            id="price"
            name="price"
            type="number"
            required
            min="1"
            value={formData.price}
            onChange={handleChange}
            placeholder="Ej: 150"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Categoría *</Label>
          <Select required onValueChange={(value) => handleSelectChange("category", value)}>
            <SelectTrigger id="category">
              <SelectValue placeholder="Selecciona una categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="frutas">Frutas y Vegetales</SelectItem>
              <SelectItem value="artesanias">Artesanías</SelectItem>
              <SelectItem value="ropa">Ropa</SelectItem>
              <SelectItem value="electronica">Electrónica</SelectItem>
              <SelectItem value="alimentos">Alimentos</SelectItem>
              <SelectItem value="hogar">Hogar</SelectItem>
              <SelectItem value="servicios">Servicios</SelectItem>
              <SelectItem value="otros">Otros</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Ubicación *</Label>
        <Select required onValueChange={(value) => handleSelectChange("location", value)}>
          <SelectTrigger id="location">
            <SelectValue placeholder="Selecciona tu reparto" />
          </SelectTrigger>
          <SelectContent>
            {repartos.map((reparto) => (
              <SelectItem key={reparto} value={reparto}>
                {reparto}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Método de contacto preferido *</Label>
        <RadioGroup
          defaultValue="whatsapp"
          onValueChange={(value) => handleSelectChange("contactType", value)}
          className="flex flex-col space-y-1"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="whatsapp" id="whatsapp" />
            <Label htmlFor="whatsapp">WhatsApp</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="telegram" id="telegram" />
            <Label htmlFor="telegram">Telegram</Label>
          </div>
        </RadioGroup>
      </div>

      {formData.contactType === "whatsapp" ? (
        <div className="space-y-2">
          <Label htmlFor="contactNumber">Número de WhatsApp *</Label>
          <Input
            id="contactNumber"
            name="contactNumber"
            required
            value={formData.contactNumber}
            onChange={handleChange}
            placeholder="Ej: +5358850138"
          />
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="contactUsername">Usuario de Telegram *</Label>
          <Input
            id="contactUsername"
            name="contactUsername"
            required
            value={formData.contactUsername}
            onChange={handleChange}
            placeholder="Ej: tumercao"
          />
        </div>
      )}

      <div className="space-y-2">
        <Label>Imágenes del producto *</Label>

        {/* Image preview area */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
          {images.map((img, index) => (
            <div key={`file-${index}`} className="relative h-24 bg-gray-100 rounded-md overflow-hidden">
              <Image src={img || "/placeholder.svg"} alt={`Imagen ${index + 1}`} fill className="object-cover" />
              <button
                type="button"
                onClick={() => removeImage(index, "file")}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}

          {imageUrls.map((url, index) => (
            <div key={`url-${index}`} className="relative h-24 bg-gray-100 rounded-md overflow-hidden">
              <Image src={url || "/placeholder.svg"} alt={`Imagen ${index + 1}`} fill className="object-cover" />
              <button
                type="button"
                onClick={() => removeImage(index, "url")}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>

        {/* File upload */}
        <div className="flex flex-col gap-3">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors">
            <Input id="image" type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
            <Label htmlFor="image" className="cursor-pointer flex flex-col items-center">
              <Upload className="h-8 w-8 text-gray-400 mb-2" />
              <span className="text-sm font-medium">Haz clic para subir o arrastra imágenes aquí</span>
              <span className="text-xs text-gray-500 mt-1">PNG, JPG, WebP hasta 5MB</span>
            </Label>
          </div>

          {/* URL input */}
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                type="url"
                placeholder="O añade una imagen por URL"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
              />
            </div>
            <Button type="button" variant="outline" onClick={addImageUrl} disabled={!newImageUrl}>
              <Plus className="h-4 w-4 mr-1" /> Añadir
            </Button>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Sube imágenes claras de tu producto. Puedes subir hasta 5 imágenes.
        </p>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Publicando...
          </>
        ) : (
          "Publicar producto"
        )}
      </Button>
    </form>
  )
}
