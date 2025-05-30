"use client"

import { useProducts } from "@/contexts/products-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Wifi } from "lucide-react"

export function SyncIndicator() {
  const { isSyncing, syncProducts } = useProducts()

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        {isSyncing ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
            <Badge variant="secondary" className="text-xs">
              Sincronizando...
            </Badge>
          </>
        ) : (
          <>
            <Wifi className="w-4 h-4 text-green-600" />
            <Badge variant="default" className="text-xs bg-green-100 text-green-800">
              Conectado
            </Badge>
          </>
        )}
      </div>

      <Button
        onClick={syncProducts}
        variant="outline"
        size="sm"
        disabled={isSyncing}
        className="flex items-center gap-2"
      >
        <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
        Sincronizar
      </Button>
    </div>
  )
}
