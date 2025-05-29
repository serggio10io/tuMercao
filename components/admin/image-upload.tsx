"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { X, Upload, Plus } from "lucide-react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"

interface ImageUploadProps {
  images: string[]
  onImagesChange: (images: string[]) => void
  maxImages?: number
}

export default function ImageUpload({ images, onImagesChange, maxImages = 5 }: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [urlInput, setUrlInput] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleFiles = (files: FileList) => {
    const newImages: string[] = []

    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/") && images.length + newImages.length < maxImages) {
        const reader = new FileReader()
        reader.onload = (e) => {
          if (e.target?.result) {
            newImages.push(e.target.result as string)
            if (newImages.length === Math.min(files.length, maxImages - images.length)) {
              onImagesChange([...images, ...newImages])
            }
          }
        }
        reader.readAsDataURL(file)
      }
    })
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files)
    }
  }

  const addUrlImage = () => {
    if (urlInput && images.length < maxImages) {
      onImagesChange([...images, urlInput])
      setUrlInput("")
    }
  }

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    onImagesChange(newImages)
  }

  const moveImage = (fromIndex: number, toIndex: number) => {
    const newImages = [...images]
    const [movedImage] = newImages.splice(fromIndex, 1)
    newImages.splice(toIndex, 0, movedImage)
    onImagesChange(newImages)
  }

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium">
        Imágenes del producto ({images.length}/{maxImages})
      </Label>

      {/* Image Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <AnimatePresence>
          {images.map((image, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="relative group"
            >
              <Card className="overflow-hidden">
                <div className="relative aspect-square">
                  <Image
                    src={image || "/placeholder.svg"}
                    alt={`Producto ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="flex gap-2">
                      {index > 0 && (
                        <Button size="sm" variant="secondary" onClick={() => moveImage(index, index - 1)}>
                          ←
                        </Button>
                      )}
                      {index < images.length - 1 && (
                        <Button size="sm" variant="secondary" onClick={() => moveImage(index, index + 1)}>
                          →
                        </Button>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute top-2 right-2 w-8 h-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeImage(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                  {index === 0 && (
                    <div className="absolute bottom-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded">
                      Principal
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Add Image Button */}
        {images.length < maxImages && (
          <Card
            className={`border-2 border-dashed cursor-pointer transition-colors ${
              dragActive ? "border-primary bg-primary/10" : "border-gray-300 hover:border-primary"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="aspect-square flex flex-col items-center justify-center p-4 text-center">
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">Arrastra imágenes aquí o haz clic para seleccionar</p>
            </div>
          </Card>
        )}
      </div>

      {/* File Input */}
      <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleFileInput} className="hidden" />

      {/* URL Input */}
      {images.length < maxImages && (
        <div className="space-y-2">
          <Label className="text-sm">O añadir imagen por URL</Label>
          <div className="flex gap-2">
            <Input
              type="url"
              placeholder="https://ejemplo.com/imagen.jpg"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="flex-1"
            />
            <Button
              type="button"
              onClick={addUrlImage}
              disabled={!urlInput || images.length >= maxImages}
              variant="outline"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>• La primera imagen será la imagen principal del producto</p>
        <p>• Puedes reordenar las imágenes usando las flechas</p>
        <p>• Formatos soportados: JPG, PNG, WebP</p>
        <p>• Tamaño máximo recomendado: 2MB por imagen</p>
      </div>
    </div>
  )
}
