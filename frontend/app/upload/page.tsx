"use client"

import { useState, useEffect } from "react"
import { uploadToPinata } from "../utils/pinataUtils"
import { useUser } from "../context/UserContext"
import { useRouter } from "next/navigation"

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [ipfsHash, setIpfsHash] = useState("")
  const { userRole } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (userRole !== "patient") {
      router.push("/dashboard")
    }
  }, [userRole, router])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    try {
      const hash = await uploadToPinata(file)
      setIpfsHash(hash)

      // Store the IPFS hash in local storage
      const uploads = JSON.parse(localStorage.getItem("uploads") || "[]")
      uploads.push({ type: "ipfs", hash, name: file.name, date: new Date().toISOString() })
      localStorage.setItem("uploads", JSON.stringify(uploads))
    } catch (error) {
      console.error("Error uploading to Pinata:", error)
    }
    setUploading(false)
  }

  if (userRole !== "patient") return null

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Upload to Pinata IPFS</h1>
      <input type="file" onChange={handleFileChange} className="mb-4" />
      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>
      {ipfsHash && (
        <div className="mt-4">
          <p>IPFS Hash: {ipfsHash}</p>
          <a
            href={`https://gateway.pinata.cloud/ipfs/${ipfsHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            View on IPFS
          </a>
        </div>
      )}
    </div>
  )
}

