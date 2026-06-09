'use client'

import { createContext, useContext, useState, useCallback } from 'react'

type SidebarCtx = { isOpen: boolean; toggle: () => void; close: () => void }

const Ctx = createContext<SidebarCtx>({ isOpen: false, toggle: () => {}, close: () => {} })

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const toggle = useCallback(() => setIsOpen(v => !v), [])
  const close = useCallback(() => setIsOpen(false), [])
  return <Ctx.Provider value={{ isOpen, toggle, close }}>{children}</Ctx.Provider>
}

export function useSidebar() {
  return useContext(Ctx)
}
