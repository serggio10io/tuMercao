import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { CartProvider } from "@/contexts/cart-context"
import { ProductsProvider } from "@/contexts/products-context"
import { AdminProvider } from "@/contexts/admin-context"
import { DeliveryProvider } from "@/contexts/delivery-context"
import { RealTimeProvider } from "@/contexts/real-time-context"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "tuMercao - Mercado Online de Camagüey",
  description: "Encuentra productos frescos y artículos locales en Camagüey",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light">
          <RealTimeProvider>
            <AdminProvider>
              <ProductsProvider>
                <CartProvider>
                  <DeliveryProvider>
                    <div className="flex flex-col min-h-screen">
                      <Header />
                      <main className="flex-grow">{children}</main>
                      <Footer />
                    </div>
                    <Toaster />
                  </DeliveryProvider>
                </CartProvider>
              </ProductsProvider>
            </AdminProvider>
          </RealTimeProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
