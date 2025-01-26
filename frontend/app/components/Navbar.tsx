"use client"

import Link from "next/link"
import { useUser } from "../context/UserContext"

export default function Navbar() {
  const { userRole, setUserRole } = useUser()

  const handleLogout = () => {
    setUserRole(null)
  }

  if (!userRole) return null

  return (
    <nav className="bg-gray-800 text-white p-4">
      <ul className="flex space-x-4">
        <li>
          <Link href="/dashboard" className="hover:text-gray-300">
            Dashboard
          </Link>
        </li>
        {userRole === "patient" && (
          <>
            <li>
              <Link href="/upload" className="hover:text-gray-300">
                Upload
              </Link>
            </li>
            <li>
              <Link href="/mint" className="hover:text-gray-300">
                Mint
              </Link>
            </li>
            <li>
              <Link href="/my-uploads" className="hover:text-gray-300">
                My Uploads
              </Link>
            </li>
          </>
        )}
        {userRole === "doctor" && (
          <li>
            <Link href="/doctor-upload" className="hover:text-gray-300">
              Upload Medical Record
            </Link>
          </li>
        )}
        <li>
          <Link href="/marketplace" className="hover:text-gray-300">
            Marketplace
          </Link>
        </li>
        <li>
          <button onClick={handleLogout} className="hover:text-gray-300">
            Logout
          </button>
        </li>
      </ul>
    </nav>
  )
}

