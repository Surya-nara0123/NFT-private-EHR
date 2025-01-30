"use client"

import { useState, useEffect } from "react"
import { mintNFT } from "../utils/nftUtils"
import { useUser } from "../context/UserContext"
import { useRouter } from "next/navigation"

interface Upload {
  hash: string
  name: string
  date: string
}

export default function MintPage() {
  const [ipfsHash, setIpfsHash] = useState("")
  const [minting, setMinting] = useState(false)
  const [tokenId, setTokenId] = useState("")
  const [uploads, setUploads] = useState<Upload[]>([])
  const [selectedUpload, setSelectedUpload] = useState<Upload | null>(null)
  const { userRole } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (userRole !== "patient") {
      router.push("/dashboard")
    } else {
      const storedUploads = JSON.parse(localStorage.getItem("uploads") || "[]")
      setUploads(storedUploads)
    }
  }, [userRole, router])

  const handleMint = async () => {
    const hashToMint = selectedUpload ? selectedUpload.hash : ipfsHash
    if (!hashToMint) return

    setMinting(true)
    try {
      const result = await mintNFT(hashToMint)
      setTokenId(result)

      // Store the minted NFT in local storage
      const mintedNFTs = JSON.parse(localStorage.getItem("mintedNFTs") || "[]")
      mintedNFTs.push({ tokenId: result, ipfsHash: hashToMint, date: new Date().toISOString() })
      localStorage.setItem("mintedNFTs", JSON.stringify(mintedNFTs))
    } catch (error) {
      console.error("Error minting NFT:", error)
    }
    setMinting(false)
  }

  const handleUploadSelect = (upload: Upload) => {
    setSelectedUpload(upload)
    setIpfsHash("")
  }

  if (userRole !== "patient") return null

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Mint NFT</h1>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Choose an option:</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-2">Option 1: Enter IPFS Hash manually</h3>
            <input
              type="text"
              value={ipfsHash}
              onChange={(e) => {
                setIpfsHash(e.target.value)
                setSelectedUpload(null)
              }}
              placeholder="Enter IPFS Hash"
              className="border p-2 w-full rounded"
            />
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Option 2: Choose from your uploads</h3>
            {uploads.length === 0 ? (
              <p>No uploads available. Please upload a file first.</p>
            ) : (
              <select
                onChange={(e) => {
                  const selected = uploads.find((u) => u.hash === e.target.value)
                  if (selected) handleUploadSelect(selected)
                }}
                value={selectedUpload?.hash || ""}
                className="border p-2 w-full rounded"
              >
                <option value="">Select an upload</option>
                {uploads.map((upload, index) => (
                  <option key={index} value={upload.hash}>
                    {upload.name} ({upload.hash.slice(0, 10)}...)
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={handleMint}
        disabled={(!ipfsHash && !selectedUpload) || minting}
        className="bg-green-500 text-white px-4 py-2 rounded disabled:bg-gray-400 w-full"
      >
        {minting ? "Minting..." : "Mint NFT"}
      </button>

      {tokenId && (
        <div className="mt-4 p-4 bg-green-100 rounded">
          <p className="font-semibold">NFT minted successfully!</p>
          <p>Token ID: {tokenId}</p>
          <p>IPFS Hash: {selectedUpload ? selectedUpload.hash : ipfsHash}</p>
        </div>
      )}
    </div>
  )
}

