"use client"

import { useState, useEffect } from "react"
import { useUser } from "../context/UserContext"
import { useRouter } from "next/navigation"
import { getNFTs } from "../utils/nftUtils"
import NFTCard from "../components/NFTCard"

export default function PurchasedNFTsPage() {
  const [purchasedNFTs, setPurchasedNFTs] = useState<any>([])
  const { userRole } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (userRole !== "external") {
      router.push("/dashboard")
    } else {
      fetchPurchasedNFTs()
    }
  }, [userRole, router])

  const fetchPurchasedNFTs = async () => {
    try {
      // In a real application, you would fetch only the NFTs purchased by the current user
      // For this example, we'll just fetch all NFTs and assume they're purchased
      const nfts = await getNFTs()
      setPurchasedNFTs(nfts)
    } catch (error) {
      console.error("Error fetching purchased NFTs:", error)
    }
  }

  if (userRole !== "external") return null

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Your Purchased NFTs</h1>
      {purchasedNFTs.length === 0 ? (
        <p>You haven't purchased any NFTs yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {purchasedNFTs.map((nft:any) => (
            <NFTCard key={nft.tokenId} nft={nft} onBuy={() => {}} />
          ))}
        </div>
      )}
    </div>
  )
}

