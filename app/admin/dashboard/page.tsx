"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAdmin } from "@/contexts/admin-context"
import { useProducts } from "@/contexts/products-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { AddProductModal } from "@/components/admin/add-product-modal"
import { EditProductModal } from "@/components/admin/edit-product-modal"
import { SyncIndicator } from "@/components/admin/sync-indicator"
import { SecurityNotice } from "@/components/admin/security-notice"
import { LogOut, Plus, Trash2, Package, Eye, EyeOff, AlertTriangle, Smartphone, Monitor } from "lucide-react"
import Image from "next/image"

export default function AdminDashboard() {
  const { isAuthenticated, logout, checkSession, isLoading: authLoading } = useAdmin()
  const {
    products,
    visibleProducts,
    isLoading: productsLoading,
    isSyncing,
    removeProduct,
    updateStock,
    saveStockChanges,
    getStockStatus,
    toggleProductVisibility,
  } = useProducts()
  const router = useRouter()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [stockChanges, setStockChanges] = useState<{ [key: string]: number }>({})

  useEffect(() => {
    if (!authLoading) {
      const sessionValid = checkSession()
      if (!sessionValid) {
        router.push("/")
      }
    }
  }, [authLoading, checkSession, router])

  // Show loading while checking authentication or loading products
  if (authLoading || productsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2E86C1] mx-auto"></div>
          <p className="mt-4 text-gray-600">{authLoading ? "Verificando acceso..." : "Cargando productos..."}</p>
        </div>
      </div>
    )
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    router.push("/")
    return null
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const handleStockChange = (productId: string, newStock: number) => {
    setStockChanges((prev) => ({ ...prev, [productId]: newStock }))
    updateStock(productId, newStock)
  }

  const handleSaveStock = async () => {
    await saveStockChanges()
    setStockChanges({})
  }

  const handleEditProduct = (product: any) => {
    setEditingProduct(product)
    setIsEditModalOpen(true)
  }

  const handleCloseEditModal = () => {
    setEditingProduct(null)
    setIsEditModalOpen(false)
  }

  const outOfStockProducts = products.filter((p) => p.stock === 0)
  const lowStockProducts = products.filter((p) => p.stock > 0 && p.stock <= 2)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Panel de Administrador</h1>
              <span className="ml-3 text-sm text-gray-500">tuMercao</span>
            </div>
            <div className="flex items-center gap-4">
              <SyncIndicator />
              <Button onClick={handleLogout} variant="outline" size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Security notice */}
        <SecurityNotice />

        {/* Local sync notice */}
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              <Monitor className="w-5 h-5 text-green-600" />
              <Smartphone className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-green-900">Sincronización Local Activa</h3>
              <p className="text-sm text-green-700">
                Los productos se sincronizan automáticamente entre pestañas del navegador.
                {isSyncing && " Sincronizando ahora..."}
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Package className="w-8 h-8 text-[#2E86C1]" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Productos</p>
                  <p className="text-2xl font-bold text-gray-900">{products.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Eye className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Visibles</p>
                  <p className="text-2xl font-bold text-gray-900">{visibleProducts.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertTriangle className="w-8 h-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Stock Bajo</p>
                  <p className="text-2xl font-bold text-gray-900">{lowStockProducts.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Trash2 className="w-8 h-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Agotados</p>
                  <p className="text-2xl font-bold text-gray-900">{outOfStockProducts.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="products">Gestionar Productos</TabsTrigger>
            <TabsTrigger value="stock">Control de Stock</TabsTrigger>
            <TabsTrigger value="hidden">Productos Ocultos</TabsTrigger>
          </TabsList>

          {/* Gestionar Productos */}
          <TabsContent value="products">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Gestionar Productos Visibles</CardTitle>
                  <Button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-[#2E86C1] hover:bg-[#2574A9]"
                    disabled={isSyncing}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Añadir Producto
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {visibleProducts.map((product) => (
                    <div key={product.id} className="border rounded-lg p-4 relative">
                      <div className="flex gap-2 absolute top-2 right-2">
                        <Button
                          onClick={() => handleEditProduct(product)}
                          variant="outline"
                          size="sm"
                          className="w-8 h-8 p-0"
                          title="Editar producto"
                          disabled={isSyncing}
                        >
                          ✏️
                        </Button>
                        <Button
                          onClick={() => toggleProductVisibility(product.id)}
                          variant="outline"
                          size="sm"
                          className="w-8 h-8 p-0"
                          title="Ocultar producto"
                          disabled={isSyncing}
                        >
                          <EyeOff className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => removeProduct(product.id)}
                          variant="destructive"
                          size="sm"
                          className="w-8 h-8 p-0"
                          disabled={isSyncing}
                        >
                          🗑️
                        </Button>
                      </div>
                      <div className="aspect-square relative mb-3">
                        <Image
                          src={product.images?.[0] || product.image || "/placeholder.svg"}
                          alt={product.name}
                          fill
                          className="object-cover rounded-md"
                        />
                        {product.images && product.images.length > 1 && (
                          <Badge className="absolute bottom-1 right-1 text-xs">+{product.images.length - 1}</Badge>
                        )}
                      </div>
                      <h3 className="font-semibold text-sm mb-2 pr-16">{product.name}</h3>
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">{product.description}</p>
                      <p className="text-lg font-bold text-[#2E86C1]">${product.price} CUP</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">Stock: {product.stock}</span>
                        <Badge
                          variant={product.stock === 0 ? "destructive" : product.stock <= 2 ? "secondary" : "default"}
                          className="text-xs"
                        >
                          {getStockStatus(product.stock).status}
                        </Badge>
                      </div>
                      {product.createdAt && (
                        <p className="text-xs text-gray-400 mt-1">
                          Creado: {new Date(product.createdAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Control de Stock */}
          <TabsContent value="stock">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Control de Stock</CardTitle>
                  <Button
                    onClick={handleSaveStock}
                    className="bg-green-600 hover:bg-green-700"
                    disabled={Object.keys(stockChanges).length === 0 || isSyncing}
                  >
                    {isSyncing ? "Guardando..." : "Guardar Cambios"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-semibold">Producto</th>
                        <th className="text-left p-3 font-semibold">Stock</th>
                        <th className="text-left p-3 font-semibold">Estado</th>
                        <th className="text-left p-3 font-semibold">Visibilidad</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => {
                        const stockStatus = getStockStatus(product.stock)
                        return (
                          <tr key={product.id} className="border-b hover:bg-gray-50">
                            <td className="p-3">
                              <div className="flex items-center">
                                <div className="w-12 h-12 relative mr-3">
                                  <Image
                                    src={product.images?.[0] || product.image || "/placeholder.svg"}
                                    alt={product.name}
                                    fill
                                    className="object-cover rounded"
                                  />
                                </div>
                                <div>
                                  <p className="font-medium">{product.name}</p>
                                  <p className="text-sm text-gray-600">${product.price} CUP</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-3">
                              <Input
                                type="number"
                                min="0"
                                value={product.stock}
                                onChange={(e) => handleStockChange(product.id, Number.parseInt(e.target.value) || 0)}
                                className="w-20"
                                disabled={isSyncing}
                              />
                            </td>
                            <td className="p-3">
                              <span className={`font-medium ${stockStatus.color}`}>{stockStatus.status}</span>
                            </td>
                            <td className="p-3">
                              <Button
                                onClick={() => toggleProductVisibility(product.id)}
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2"
                                disabled={isSyncing}
                              >
                                {product.isVisible ? (
                                  <>
                                    <Eye className="w-4 h-4" />
                                    Visible
                                  </>
                                ) : (
                                  <>
                                    <EyeOff className="w-4 h-4" />
                                    Oculto
                                  </>
                                )}
                              </Button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Productos Ocultos */}
          <TabsContent value="hidden">
            <Card>
              <CardHeader>
                <CardTitle>Productos Ocultos ({products.filter((p) => !p.isVisible).length})</CardTitle>
              </CardHeader>
              <CardContent>
                {products.filter((p) => !p.isVisible).length === 0 ? (
                  <div className="text-center py-12">
                    <EyeOff className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-500 mb-2">No hay productos ocultos</h3>
                    <p className="text-gray-400">Todos los productos están visibles para los usuarios</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products
                      .filter((p) => !p.isVisible)
                      .map((product) => (
                        <div key={product.id} className="border rounded-lg p-4 relative opacity-60">
                          <div className="flex gap-2 absolute top-2 right-2">
                            <Button
                              onClick={() => handleEditProduct(product)}
                              variant="outline"
                              size="sm"
                              className="w-8 h-8 p-0"
                              title="Editar producto"
                              disabled={isSyncing}
                            >
                              ✏️
                            </Button>
                            <Button
                              onClick={() => toggleProductVisibility(product.id)}
                              variant="outline"
                              size="sm"
                              className="w-8 h-8 p-0"
                              title="Mostrar producto"
                              disabled={isSyncing}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => removeProduct(product.id)}
                              variant="destructive"
                              size="sm"
                              className="w-8 h-8 p-0"
                              disabled={isSyncing}
                            >
                              🗑️
                            </Button>
                          </div>
                          <div className="aspect-square relative mb-3">
                            <Image
                              src={product.images?.[0] || product.image || "/placeholder.svg"}
                              alt={product.name}
                              fill
                              className="object-cover rounded-md"
                            />
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <EyeOff className="w-8 h-8 text-white" />
                            </div>
                          </div>
                          <h3 className="font-semibold text-sm mb-2 pr-16">{product.name}</h3>
                          <p className="text-xs text-gray-600 mb-2 line-clamp-2">{product.description}</p>
                          <p className="text-lg font-bold text-[#2E86C1]">${product.price} CUP</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-500">Stock: {product.stock}</span>
                            <Badge variant="secondary" className="text-xs">
                              Oculto
                            </Badge>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <AddProductModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
      <EditProductModal isOpen={isEditModalOpen} onClose={handleCloseEditModal} product={editingProduct} />
    </div>
  )
}
