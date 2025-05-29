"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import AddProductForm from "./add-product-form"

export default function AddProductButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="bg-highlight text-secondary hover:bg-highlight/90 flex items-center gap-2"
      >
        <Plus className="h-4 w-4" />
        <span>Añadir Producto</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Añadir Nuevo Producto</DialogTitle>
          </DialogHeader>
          <AddProductForm onSuccess={() => setIsOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  )
}
