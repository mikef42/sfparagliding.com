'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image?: string
  slug?: string
  type: 'product' | 'service' | 'gift-card'
  size?: string
  color?: string
  cartItemId?: string
  ushpaId?: string
}

function makeCartItemId(item: { id: string; size?: string; color?: string }): string {
  return [item.id, item.size, item.color].filter(Boolean).join('-')
}

interface CartState {
  items: CartItem[]
  isOpen: boolean
  _hasHydrated: boolean
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void
  removeItem: (cartItemId: string) => void
  updateQuantity: (cartItemId: string, quantity: number) => void
  clearCart: () => void
  toggleCart: () => void
  openCart: () => void
  closeCart: () => void
  getTotal: () => number
  getItemCount: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      _hasHydrated: false,

      addItem: (item, quantity = 1) => {
        const items = get().items
        const cartItemId = makeCartItemId(item)
        const existing = items.find(
          (i) => (i.cartItemId || i.id) === cartItemId,
        )

        if (existing) {
          set({
            items: items.map((i) =>
              (i.cartItemId || i.id) === cartItemId
                ? { ...i, quantity: i.quantity + quantity }
                : i,
            ),
            isOpen: true,
          })
        } else {
          set({
            items: [...items, { ...item, quantity, cartItemId }],
            isOpen: true,
          })
        }
      },

      removeItem: (cartItemId) => {
        set({
          items: get().items.filter(
            (i) => (i.cartItemId || i.id) !== cartItemId,
          ),
        })
      },

      updateQuantity: (cartItemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(cartItemId)
          return
        }
        set({
          items: get().items.map((i) =>
            (i.cartItemId || i.id) === cartItemId ? { ...i, quantity } : i,
          ),
        })
      },

      clearCart: () => set({ items: [] }),
      toggleCart: () => set({ isOpen: !get().isOpen }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      getTotal: () => {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0)
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0)
      },
    }),
    {
      name: 'sfp-cart',
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => () => {
        useCartStore.setState({ _hasHydrated: true })
      },
    },
  ),
)
