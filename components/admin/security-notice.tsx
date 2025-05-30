"use client"

import { Shield, Lock, Users } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export function SecurityNotice() {
  return (
    <Card className="mb-6 border-green-200 bg-green-50">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            <Shield className="w-5 h-5 text-green-600" />
            <Lock className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-green-900">Área Segura de Administración</h3>
            <p className="text-sm text-green-700">
              Solo los administradores autenticados pueden crear, editar y eliminar productos. Todos los cambios se
              sincronizan automáticamente en todos los dispositivos.
            </p>
          </div>
          <Users className="w-5 h-5 text-green-600 ml-auto" />
        </div>
      </CardContent>
    </Card>
  )
}
