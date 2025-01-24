"use client"

import { useState, useEffect } from "react"
import { mintNFT } from "../utils/nftUtils"
import { useUser } from "../context/UserContext"
import { useRouter } from "next/navigation"

export default function MintPage() {
  const [ipfsHash, setIpfsHash] = useState("")
  const [minting, setMinting] = useState(false)
  const [tokenId, setTokenId] = useState("")
  const { userRole } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (userRole !== "patient") {
      router.push("/dashboard")
    }
  }, [userRole, router])

  const handleMint = async () => {
    if (!ipfsHash) return

    setMinting(true)
    try {
      const id = await mintNFT(ipfsHash)
      setTokenId(id)

      // Store the minted NFT in local storage
      const mintedNFTs = JSON.parse(localStorage.getItem("mintedNFTs") || "[]")
      mintedNFTs.push({ tokenId: id, ipfsHash, date: new Date().toISOString() })
      localStorage.setItem("mintedNFTs", JSON.stringify(mintedNFTs))
    } catch (error) {
      console.error("Error minting NFT:", error)
    }
    setMinting(false)
  }

  if (userRole !== "patient") return null

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Mint NFT</h1>
      <input
        type="text"
        value={ipfsHash}
        onChange={(e) => setIpfsHash(e.target.value)}
        placeholder="Enter IPFS Hash"
        className="border p-2 mb-4 w-full"
      />
      <button
        onClick={handleMint}
        disabled={!ipfsHash || minting}
        className="bg-green-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
      >
        {minting ? "Minting..." : "Mint NFT"}
      </button>
      {tokenId && (
        <div className="mt-4">
          <p>NFT minted successfully!</p>
          <p>Token ID: {tokenId}</p>
        </div>
      )}
    </div>
  )
}

