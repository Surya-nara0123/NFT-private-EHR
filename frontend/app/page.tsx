"use client"

import { useRouter } from "next/navigation"
import { useUser } from "./context/UserContext"

export default function Home() {
  const router = useRouter()
  const { setUserRole } = useUser()

  const handleLogin = (role: "patient" | "doctor" | "external") => {
    setUserRole(role)
    router.push("/dashboard")
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-8">Welcome to NFT EHR Management</h1>
      <div className="space-y-4">
        <button
          onClick={() => handleLogin("patient")}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
        >
          Login as Patient
        </button>
        <button
          onClick={() => handleLogin("doctor")}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded w-full"
        >
          Login as Doctor
        </button>
        <button
          onClick={() => handleLogin("external")}
          className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded w-full"
        >
          Login as External User
        </button>
      </div>
    </div>
  )
}

