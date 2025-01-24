"use client"

import { useUser } from "../context/UserContext"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function Dashboard() {
  const { userRole } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!userRole) {
      router.push("/")
    }
  }, [userRole, router])

  if (!userRole) return null

  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-4">Welcome, {userRole}!</h1>
      <p className="text-xl">You can now access your role-specific features.</p>
    </div>
  )
}

