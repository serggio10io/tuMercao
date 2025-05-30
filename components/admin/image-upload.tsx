"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { X, Upload, Plus, ArrowUp, ArrowDown } from "lucide-react"
import Image from "next/image"

interface ImageUploadProps {
  images: string[]
  onImagesChange: (images: string[]) => void
  maxImages?: number
}

export default function ImageUpload({ images, onImagesChange, maxImages = 5 }: ImageUploadProps) {
  const [urlInput, setUrlInput] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    Array.from(files).forEach((file) => {
      if (images.length >= maxImages) return

      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        if (result && images.length < maxImages) {
          onImagesChange([...images, result])
        }
      }
      reader.readAsDataURL(file)
    })

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleUrlAdd = () => {
    if (urlInput.trim() && images.length < maxImages) {
      onImagesChange([...images, urlInput.trim()])
      setUrlInput("")
    }
  }

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    onImagesChange(newImages)
  }

  const moveImage = (index: number, direction: "up" | "down") => {
    const newImages = [...images]
    const targetIndex = direction === "up" ? index - 1 : index + 1

    if (targetIndex >= 0 && targetIndex < images.length) {
      ;[newImages[index], newImages[targetIndex]] = [newImages[targetIndex], newImages[index]]
      onImagesChange(newImages)
    }
  }

  return (
    <div className="space-y-4">
      <Label>Imágenes del producto (máximo {maxImages})</Label>

      {/* File Upload */}
      <div className="space-y-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileUpload}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={images.length >= maxImages}
          className="w-full"
        >
          <Upload className="w-4 h-4 mr-2" />
          Subir desde dispositivo
        </Button>
      </div>

      {/* URL Input */}
      <div className="flex gap-2">
        <Input
          type="url"
          placeholder="https://ejemplo.com/imagen.jpg"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          disabled={images.length >= maxImages}
        />
        <Button type="button" onClick={handleUrlAdd} disabled={!urlInput.trim() || images.length >= maxImages}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <Card key={index} className="relative p-2">
              <div className="aspect-square relative mb-2">
                <Image
                  src={image || "/placeholder.svg"}
                  alt={`Imagen ${index + 1}`}
                  fill
                  className="object-cover rounded-md"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-1 right-1 w-6 h-6 p-0"
                  onClick={() => removeImage(index)}
                >
                  <X className="w-3 h-3" />
                </Button>
                {index === 0 && (
                  <div className="absolute bottom-1 left-1 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                    Principal
                  </div>
                )}
              </div>
              <div className="flex gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => moveImage(index, "up")}
                  disabled={index === 0}
                  className="flex-1"
                >
                  <ArrowUp className="w-3 h-3" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => moveImage(index, "down")}
                  disabled={index === images.length - 1}
                  className="flex-1"
                >
                  <ArrowDown className="w-3 h-3" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {images.length === 0 && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No hay imágenes añadidas</p>
          <p className="text-sm text-gray-400">Sube archivos o añade URLs de imágenes</p>
        </div>
      )}
    </div>
  )
}
