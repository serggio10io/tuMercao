// Enhanced local storage service with cross-device simulation
class CloudStorageService {
  private readonly STORAGE_KEY = "tumercao_products"
  private readonly SYNC_KEY = "tumercao_sync_timestamp"
  private readonly BROADCAST_CHANNEL = "tumercao_product_sync"

  private cache: any = null
  private lastSync = 0
  private readonly CACHE_DURATION = 30000 // 30 seconds
  private broadcastChannel: BroadcastChannel | null = null

  constructor() {
    // Initialize broadcast channel for same-browser sync
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      try {
        this.broadcastChannel = new BroadcastChannel(this.BROADCAST_CHANNEL)
      } catch (error) {
        console.warn("BroadcastChannel not available:", error)
      }
    }
  }

  async saveProducts(products: any[]): Promise<boolean> {
    try {
      const timestamp = Date.now()
      const data = {
        products,
        lastUpdated: timestamp,
        version: 1,
      }

      // Save to localStorage
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data))
      localStorage.setItem(this.SYNC_KEY, timestamp.toString())

      // Update cache
      this.cache = products
      this.lastSync = timestamp

      // Broadcast update to other tabs
      this.broadcastUpdate(products, timestamp)

      // Simulate cloud storage with a small delay
      await new Promise((resolve) => setTimeout(resolve, 100))

      return true
    } catch (error) {
      console.error("Failed to save products:", error)
      return false
    }
  }

  async loadProducts(): Promise<any[]> {
    try {
      // Check if we have recent cache
      const syncTimestamp = localStorage.getItem(this.SYNC_KEY)
      const currentTime = Date.now()

      if (this.cache && syncTimestamp && currentTime - Number.parseInt(syncTimestamp) < this.CACHE_DURATION) {
        return this.cache
      }

      // Load from localStorage
      const localData = localStorage.getItem(this.STORAGE_KEY)
      if (localData) {
        const data = JSON.parse(localData)
        const products = data.products || data // Handle both formats

        // Update cache
        this.cache = products
        this.lastSync = data.lastUpdated || currentTime

        return products
      }

      return []
    } catch (error) {
      console.error("Failed to load products:", error)
      return []
    }
  }

  private broadcastUpdate(products: any[], timestamp: number) {
    // Broadcast to other tabs using BroadcastChannel
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({
          type: "products_updated",
          products,
          timestamp,
        })
      } catch (error) {
        console.error("Failed to broadcast update:", error)
      }
    }

    // Also trigger storage event for cross-tab communication
    try {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: this.STORAGE_KEY,
          newValue: JSON.stringify({ products, lastUpdated: timestamp }),
          storageArea: localStorage,
        }),
      )
    } catch (error) {
      console.error("Failed to dispatch storage event:", error)
    }
  }

  // Start polling for updates and listening to broadcasts
  startPolling(callback: (products: any[]) => void, interval = 10000) {
    let isPolling = true

    const poll = async () => {
      if (!isPolling) return

      try {
        const products = await this.loadProducts()
        callback(products)
      } catch (error) {
        console.error("Polling error:", error)
      }
    }

    // Initial load
    poll()

    // Set up polling interval (reduced frequency since we're using localStorage)
    const intervalId = setInterval(poll, interval)

    // Set up BroadcastChannel listener
    const handleBroadcast = (event: MessageEvent) => {
      if (event.data.type === "products_updated") {
        this.cache = event.data.products
        this.lastSync = event.data.timestamp
        callback(event.data.products)
      }
    }

    if (this.broadcastChannel) {
      this.broadcastChannel.addEventListener("message", handleBroadcast)
    }

    // Set up storage event listener for cross-tab sync
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === this.STORAGE_KEY && event.newValue) {
        try {
          const data = JSON.parse(event.newValue)
          const products = data.products || data
          this.cache = products
          this.lastSync = data.lastUpdated || Date.now()
          callback(products)
        } catch (error) {
          console.error("Failed to parse storage event:", error)
        }
      }
    }

    if (typeof window !== "undefined") {
      window.addEventListener("storage", handleStorageChange)
    }

    // Return cleanup function
    return () => {
      isPolling = false
      clearInterval(intervalId)

      if (this.broadcastChannel) {
        this.broadcastChannel.removeEventListener("message", handleBroadcast)
      }

      if (typeof window !== "undefined") {
        window.removeEventListener("storage", handleStorageChange)
      }
    }
  }

  // Get sync status
  getSyncStatus(): { isOnline: boolean; lastSync: number } {
    return {
      isOnline: true, // Always online with localStorage
      lastSync: this.lastSync,
    }
  }

  // Force sync (useful for manual sync button)
  async forceSync(): Promise<boolean> {
    try {
      const products = await this.loadProducts()
      this.broadcastUpdate(products, Date.now())
      return true
    } catch (error) {
      console.error("Force sync failed:", error)
      return false
    }
  }
}

export const cloudStorage = new CloudStorageService()
