"use client"

import { useState, useEffect } from "react"
import { useUser } from "../context/UserContext"
import { useRouter } from "next/navigation"

interface Upload {
  type: "ipfs"
  hash: string
  name: string
  date: string
}

interface MintedNFT {
  tokenId: string
  ipfsHash: string
  date: string
}

export default function MyUploadsPage() {
  const [uploads, setUploads] = useState<Upload[]>([])
  const [mintedNFTs, setMintedNFTs] = useState<MintedNFT[]>([])
  const { userRole } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (userRole !== "patient") {
      router.push("/dashboard")
    } else {
      const storedUploads = JSON.parse(localStorage.getItem("uploads") || "[]")
      const storedMintedNFTs = JSON.parse(localStorage.getItem("mintedNFTs") || "[]")
      setUploads(storedUploads)
      setMintedNFTs(storedMintedNFTs)
    }
  }, [userRole, router])

  if (userRole !== "patient") return null

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">My Uploads and Minted NFTs</h1>

      <h2 className="text-2xl font-bold mt-6 mb-2">Uploaded IPFS Content</h2>
      {uploads.length === 0 ? (
        <p>No uploads yet.</p>
      ) : (
        <ul className="space-y-2">
          {uploads.map((upload, index) => (
            <li key={index} className="border p-2 rounded">
              <p>
                <strong>File Name:</strong> {upload.name}
              </p>
              <p>
                <strong>IPFS Hash:</strong> {upload.hash}
              </p>
              <p>
                <strong>Upload Date:</strong> {new Date(upload.date).toLocaleString()}
              </p>
              <a
                href={`https://gateway.pinata.cloud/ipfs/${upload.hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                View on IPFS
              </a>
            </li>
          ))}
        </ul>
      )}

      <h2 className="text-2xl font-bold mt-6 mb-2">Minted NFTs</h2>
      {mintedNFTs.length === 0 ? (
        <p>No minted NFTs yet.</p>
      ) : (
        <ul className="space-y-2">
          {mintedNFTs.map((nft, index) => (
            <li key={index} className="border p-2 rounded">
              <p>
                <strong>Token ID:</strong> {nft.tokenId}
              </p>
              <p>
                <strong>IPFS Hash:</strong> {nft.ipfsHash}
              </p>
              <p>
                <strong>Minting Date:</strong> {new Date(nft.date).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

