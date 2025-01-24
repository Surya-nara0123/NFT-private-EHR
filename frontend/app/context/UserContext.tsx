"use client"

import React, { createContext, useState, useContext, type ReactNode } from "react"

type UserRole = "patient" | "doctor" | null

interface UserContextType {
  userRole: UserRole
  setUserRole: (role: UserRole) => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [userRole, setUserRole] = useState<UserRole>(null)

  return <UserContext.Provider value={{ userRole, setUserRole }}>{children}</UserContext.Provider>
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}

