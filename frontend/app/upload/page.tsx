"use client"

import { useState, useEffect } from "react"
import { uploadCategorizedDataToIPFS } from "../utils/ipfsUtils"
import { useUser } from "../context/UserContext"
import { useRouter } from "next/navigation"

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [ipfsHashes, setIpfsHashes] = useState<Record<string, string>>({})
  const { userRole } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (userRole !== "patient") {
      router.push("/dashboard")
    }
  }, [userRole, router])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0].type === "application/json") {
      setFile(e.target.files[0])
    } else {
      alert("Please upload a JSON file")
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    try {
      const fileContent = await file.text()
      const jsonContent = JSON.parse(fileContent)

      const hashes = await uploadCategorizedDataToIPFS(jsonContent)
      setIpfsHashes(hashes)

      // Store the IPFS hashes in local storage
      const uploads = JSON.parse(localStorage.getItem("uploads") || "[]")
      Object.entries(hashes).forEach(([category, hash]) => {
        uploads.push({
          type: "ipfs",
          category,
          hash,
          name: `${category}.json`,
          date: new Date().toISOString(),
        })
      })
      localStorage.setItem("uploads", JSON.stringify(uploads))
    } catch (error) {
      console.error("Error uploading to IPFS:", error)
      alert("Error uploading to IPFS")
    }
    setUploading(false)
  }

  if (userRole !== "patient") return null

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Upload Medical Records to IPFS</h1>
      <input type="file" onChange={handleFileChange} className="mb-4" accept="application/json" />
      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>
      {Object.keys(ipfsHashes).length > 0 && (
        <div className="mt-4">
          <h2 className="text-xl font-bold mb-2">IPFS Hashes:</h2>
          <ul>
            {Object.entries(ipfsHashes).map(([category, hash]) => (
              <li key={category} className="mb-2">
                <p>
                  <strong>{category}:</strong> {hash}
                </p>
                <a
                  href={`https://gateway.pinata.cloud/ipfs/${hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  View on IPFS
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

